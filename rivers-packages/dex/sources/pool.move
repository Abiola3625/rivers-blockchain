// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Rivers DEX: constant-product pools for any two coin types. Each pool keeps reserves of both
/// coins and issues `LP<A, B>` coins to liquidity providers. A swap pays a fee of `fee_bps` that
/// stays in the pool, so it is earned by liquidity providers in proportion to their LP coins.
module rivers_dex::pool;

use std::type_name;
use sui::balance::{Self, Balance, Supply};
use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::event;
use sui::table::{Self, Table};

/// LP coins are locked forever on pool creation so that the pool can never be emptied completely.
const MINIMUM_LIQUIDITY: u64 = 1000;
const FEE_BPS: u64 = 30;
const BPS: u128 = 10000;
/// Prices in the accumulators are fixed point with 18 decimals.
const PRICE_SCALE: u256 = 1_000_000_000_000_000_000;

const EZeroAmount: u64 = 1;
const EPoolExists: u64 = 2;
const ESlippage: u64 = 3;
const ESameType: u64 = 4;
const ENotEnoughLiquidity: u64 = 5;

public struct LP<phantom A, phantom B> has drop {}

public struct Pool<phantom A, phantom B> has key {
    id: UID,
    reserve_a: Balance<A>,
    reserve_b: Balance<B>,
    lp_supply: Supply<LP<A, B>>,
    locked_lp: Balance<LP<A, B>>,
    fee_bps: u64,
    /// Time-weighted price accumulators, as in Uniswap V2. Each one grows by the price before a
    /// change multiplied by the milliseconds that price held. A price pushed within one transaction
    /// holds for zero time, so it does not move the time-weighted average. `price_a_cumulative` is
    /// the price of A in B, `price_b_cumulative` the price of B in A.
    price_a_cumulative: u256,
    price_b_cumulative: u256,
    last_update_ms: u64,
}

/// Lists every pool once. The key is the two type names joined in creation order.
public struct Registry has key {
    id: UID,
    pools: Table<vector<u8>, ID>,
}

public struct PoolCreated has copy, drop {
    pool: ID,
    type_a: vector<u8>,
    type_b: vector<u8>,
    amount_a: u64,
    amount_b: u64,
    creator: address,
}

public struct Swapped has copy, drop {
    pool: ID,
    a_to_b: bool,
    amount_in: u64,
    amount_out: u64,
    reserve_a: u64,
    reserve_b: u64,
    trader: address,
}

public struct LiquidityChanged has copy, drop {
    pool: ID,
    added: bool,
    amount_a: u64,
    amount_b: u64,
    lp: u64,
    reserve_a: u64,
    reserve_b: u64,
    provider: address,
}

fun init(ctx: &mut TxContext) {
    transfer::share_object(Registry { id: object::new(ctx), pools: table::new(ctx) });
}

fun key<A, B>(): vector<u8> {
    let mut k = type_name::with_defining_ids<A>().into_string().into_bytes();
    k.append(b"/");
    k.append(type_name::with_defining_ids<B>().into_string().into_bytes());
    k
}

fun sqrt(x: u128): u128 {
    if (x == 0) return 0;
    let mut z = x;
    let mut y = (x + 1) / 2;
    while (y < z) {
        z = y;
        y = (x / y + y) / 2;
    };
    z
}

public fun create_pool<A, B>(
    registry: &mut Registry,
    a: Coin<A>,
    b: Coin<B>,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<LP<A, B>> {
    assert!(type_name::with_defining_ids<A>() != type_name::with_defining_ids<B>(), ESameType);
    assert!(!registry.pools.contains(key<A, B>()) && !registry.pools.contains(key<B, A>()), EPoolExists);
    let (amount_a, amount_b) = (a.value(), b.value());
    assert!(amount_a > 0 && amount_b > 0, EZeroAmount);
    let lp_total = (sqrt((amount_a as u128) * (amount_b as u128)) as u64);
    assert!(lp_total > MINIMUM_LIQUIDITY, ENotEnoughLiquidity);
    let mut lp_supply = balance::create_supply(LP<A, B> {});
    let mut minted = lp_supply.increase_supply(lp_total);
    let locked_lp = minted.split(MINIMUM_LIQUIDITY);
    let pool = Pool<A, B> {
        id: object::new(ctx),
        reserve_a: a.into_balance(),
        reserve_b: b.into_balance(),
        lp_supply,
        locked_lp,
        fee_bps: FEE_BPS,
        price_a_cumulative: 0,
        price_b_cumulative: 0,
        last_update_ms: clock.timestamp_ms(),
    };
    let id = object::id(&pool);
    registry.pools.add(key<A, B>(), id);
    event::emit(PoolCreated {
        pool: id,
        type_a: type_name::with_defining_ids<A>().into_string().into_bytes(),
        type_b: type_name::with_defining_ids<B>().into_string().into_bytes(),
        amount_a,
        amount_b,
        creator: ctx.sender(),
    });
    transfer::share_object(pool);
    coin::from_balance(minted, ctx)
}

/// Adds liquidity at the current price. The part of either coin that does not match the price is
/// returned.
public fun add_liquidity<A, B>(
    pool: &mut Pool<A, B>,
    mut a: Coin<A>,
    mut b: Coin<B>,
    min_lp: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): (Coin<LP<A, B>>, Coin<A>, Coin<B>) {
    accrue(pool, clock);
    let (ra, rb) = (pool.reserve_a.value() as u128, pool.reserve_b.value() as u128);
    let (va, vb) = (a.value() as u128, b.value() as u128);
    assert!(va > 0 && vb > 0, EZeroAmount);
    // Use the largest amounts that keep the reserve ratio.
    let (use_a, use_b) = if (va * rb <= vb * ra) { (va, va * rb / ra) } else { (vb * ra / rb, vb) };
    let supply = pool.lp_supply.supply_value() as u128;
    let lp_a = use_a * supply / ra;
    let lp_b = use_b * supply / rb;
    let lp = (if (lp_a < lp_b) lp_a else lp_b) as u64;
    assert!(lp > 0 && lp >= min_lp, ESlippage);
    pool.reserve_a.join(a.split(use_a as u64, ctx).into_balance());
    pool.reserve_b.join(b.split(use_b as u64, ctx).into_balance());
    event::emit(LiquidityChanged {
        pool: object::id(pool),
        added: true,
        amount_a: use_a as u64,
        amount_b: use_b as u64,
        lp,
        reserve_a: pool.reserve_a.value(),
        reserve_b: pool.reserve_b.value(),
        provider: ctx.sender(),
    });
    (coin::from_balance(pool.lp_supply.increase_supply(lp), ctx), a, b)
}

public fun remove_liquidity<A, B>(
    pool: &mut Pool<A, B>,
    lp: Coin<LP<A, B>>,
    min_a: u64,
    min_b: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): (Coin<A>, Coin<B>) {
    accrue(pool, clock);
    let amount = lp.value() as u128;
    assert!(amount > 0, EZeroAmount);
    let supply = pool.lp_supply.supply_value() as u128;
    let out_a = ((pool.reserve_a.value() as u128) * amount / supply) as u64;
    let out_b = ((pool.reserve_b.value() as u128) * amount / supply) as u64;
    assert!(out_a >= min_a && out_b >= min_b, ESlippage);
    pool.lp_supply.decrease_supply(lp.into_balance());
    let ca = coin::take(&mut pool.reserve_a, out_a, ctx);
    let cb = coin::take(&mut pool.reserve_b, out_b, ctx);
    event::emit(LiquidityChanged {
        pool: object::id(pool),
        added: false,
        amount_a: out_a,
        amount_b: out_b,
        lp: amount as u64,
        reserve_a: pool.reserve_a.value(),
        reserve_b: pool.reserve_b.value(),
        provider: ctx.sender(),
    });
    (ca, cb)
}

/// Output of a swap of `amount_in` into a pool with reserves `reserve_in` and `reserve_out`.
public fun amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64, fee_bps: u64): u64 {
    let x = (amount_in as u128) * (BPS - (fee_bps as u128));
    ((x * (reserve_out as u128)) / ((reserve_in as u128) * BPS + x)) as u64
}

public fun swap_a_for_b<A, B>(
    pool: &mut Pool<A, B>,
    a: Coin<A>,
    min_out: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<B> {
    accrue(pool, clock);
    let amount_in = a.value();
    assert!(amount_in > 0, EZeroAmount);
    let out = amount_out(amount_in, pool.reserve_a.value(), pool.reserve_b.value(), pool.fee_bps);
    assert!(out > 0 && out >= min_out, ESlippage);
    assert!(out < pool.reserve_b.value(), ENotEnoughLiquidity);
    pool.reserve_a.join(a.into_balance());
    let c = coin::take(&mut pool.reserve_b, out, ctx);
    emit_swap(pool, true, amount_in, out, ctx);
    c
}

public fun swap_b_for_a<A, B>(
    pool: &mut Pool<A, B>,
    b: Coin<B>,
    min_out: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<A> {
    accrue(pool, clock);
    let amount_in = b.value();
    assert!(amount_in > 0, EZeroAmount);
    let out = amount_out(amount_in, pool.reserve_b.value(), pool.reserve_a.value(), pool.fee_bps);
    assert!(out > 0 && out >= min_out, ESlippage);
    assert!(out < pool.reserve_a.value(), ENotEnoughLiquidity);
    pool.reserve_b.join(b.into_balance());
    let c = coin::take(&mut pool.reserve_a, out, ctx);
    emit_swap(pool, false, amount_in, out, ctx);
    c
}

fun emit_swap<A, B>(pool: &Pool<A, B>, a_to_b: bool, amount_in: u64, amount_out: u64, ctx: &TxContext) {
    event::emit(Swapped {
        pool: object::id(pool),
        a_to_b,
        amount_in,
        amount_out,
        reserve_a: pool.reserve_a.value(),
        reserve_b: pool.reserve_b.value(),
        trader: ctx.sender(),
    });
}

/// Adds the current prices, weighted by the time since the last change, to the accumulators.
/// Called before every change to the reserves.
fun accrue<A, B>(pool: &mut Pool<A, B>, clock: &Clock) {
    let (a, b) = cumulative_prices(pool, clock);
    pool.price_a_cumulative = a;
    pool.price_b_cumulative = b;
    pool.last_update_ms = clock.timestamp_ms();
}

/// The accumulators as they would be now, without changing the pool. Two readings taken some time
/// apart give the time-weighted average price over that time: (later - earlier) / elapsed ms.
public fun cumulative_prices<A, B>(pool: &Pool<A, B>, clock: &Clock): (u256, u256) {
    let now = clock.timestamp_ms();
    let elapsed = if (now > pool.last_update_ms) (now - pool.last_update_ms) as u256 else 0;
    let ra = pool.reserve_a.value() as u256;
    let rb = pool.reserve_b.value() as u256;
    if (elapsed == 0 || ra == 0 || rb == 0) return (pool.price_a_cumulative, pool.price_b_cumulative);
    (
        pool.price_a_cumulative + rb * PRICE_SCALE / ra * elapsed,
        pool.price_b_cumulative + ra * PRICE_SCALE / rb * elapsed,
    )
}

public fun price_scale(): u256 { PRICE_SCALE }

public fun reserves<A, B>(pool: &Pool<A, B>): (u64, u64) {
    (pool.reserve_a.value(), pool.reserve_b.value())
}

public fun lp_supply<A, B>(pool: &Pool<A, B>): u64 { pool.lp_supply.supply_value() }

public fun fee_bps<A, B>(pool: &Pool<A, B>): u64 { pool.fee_bps }

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) { init(ctx) }
