// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Rivers Lend: isolated lending markets. Each `Market<C, D>` accepts collateral of type C and lends
/// coins of type D.
///
/// - Suppliers deposit D and receive `Share<C, D>` coins. Shares grow in value as borrowers pay
///   interest.
/// - Borrowers deposit C and borrow D up to `ltv_bps` of their collateral's value. Interest follows
///   the market's utilization and accrues every millisecond.
/// - A position whose debt is above `liq_threshold_bps` of its collateral value can be liquidated by
///   anyone: the liquidator repays up to half of the debt and receives collateral worth the repaid
///   amount plus `liq_bonus_bps`.
///
/// Collateral is valued with a time-weighted average price (TWAP) from the Rivers DEX pool of the
/// same pair, read from the pool's price accumulators. Anyone can record an observation with
/// `observe`; borrowing and liquidation use the average over at least `twap_min_ms` and refuse to
/// act if the newest usable observation is older than `twap_max_age_ms`. A price moved inside one
/// transaction has zero weight in the average.
///
/// Rivers Core holds `LendAdminCap` and creates markets, pauses new borrowing and tunes parameters
/// within fixed bounds. The admin cannot move anyone's funds.
module rivers_dex::lend;

use rivers_dex::pool::{Self, Pool};
use sui::balance::{Self, Balance, Supply};
use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::event;
use sui::table::{Self, Table};

const WAD: u256 = 1_000_000_000_000_000_000;
const YEAR_MS: u256 = 31_536_000_000;
const MAX_OBSERVATIONS: u64 = 48;

const EPaused: u64 = 1;
const EZeroAmount: u64 = 2;
const ENoPosition: u64 = 3;
const EUnhealthy: u64 = 4;
const EHealthy: u64 = 5;
const ENotEnoughLiquidity: u64 = 6;
const EBadParams: u64 = 7;
const EStalePrice: u64 = 8;
const EWrongPool: u64 = 9;
const ETooMuchRepaid: u64 = 10;
const EDebtRemaining: u64 = 11;
const ENotEnoughCollateral: u64 = 12;

public struct LendAdminCap has key, store { id: UID }

/// Supplier shares of a market. Transferable like any coin.
public struct Share<phantom C, phantom D> has drop {}

public struct Position has store, drop {
    collateral: u64,
    /// Debt in units of the borrow index: debt = debt_scaled * borrow_index / WAD.
    debt_scaled: u256,
}

public struct Observation has store, copy, drop {
    ms: u64,
    /// Accumulator of the price of C in D (fixed point, 18 decimals, times ms).
    cumulative: u256,
}

public struct Market<phantom C, phantom D> has key {
    id: UID,
    pool_id: ID,
    /// True when C is the pool's first coin (Pool<C, D>), false for Pool<D, C>.
    c_is_a: bool,
    cash: Balance<D>,
    collateral: Balance<C>,
    shares: Supply<Share<C, D>>,
    total_debt_scaled: u256,
    borrow_index: u256,
    reserves: u64,
    last_accrual_ms: u64,
    positions: Table<address, Position>,
    observations: vector<Observation>,
    // Parameters.
    ltv_bps: u64,
    liq_threshold_bps: u64,
    liq_bonus_bps: u64,
    reserve_factor_bps: u64,
    base_rate_bps: u64,
    slope1_bps: u64,
    slope2_bps: u64,
    kink_bps: u64,
    twap_min_ms: u64,
    twap_max_age_ms: u64,
    paused: bool,
}

public struct MarketCreated has copy, drop { market: ID, pool: ID }

public struct Supplied has copy, drop { market: ID, who: address, amount: u64, shares: u64 }

public struct Withdrawn has copy, drop { market: ID, who: address, amount: u64, shares: u64 }

public struct CollateralChanged has copy, drop { market: ID, who: address, added: bool, amount: u64 }

public struct Borrowed has copy, drop { market: ID, who: address, amount: u64 }

public struct Repaid has copy, drop { market: ID, who: address, payer: address, amount: u64 }

public struct Liquidated has copy, drop {
    market: ID,
    borrower: address,
    liquidator: address,
    repaid: u64,
    collateral_taken: u64,
}

fun init(ctx: &mut TxContext) {
    transfer::public_transfer(LendAdminCap { id: object::new(ctx) }, ctx.sender());
}

// ---------------------------------------------------------------- administration

fun check_params(
    ltv: u64, liq: u64, bonus: u64, rf: u64, base: u64, s1: u64, s2: u64, kink: u64, tmin: u64, tmax: u64,
) {
    assert!(ltv > 0 && ltv < liq && liq <= 9500, EBadParams);
    // Liquidation must leave the position better collateralized, so the bonus is bounded by the gap.
    assert!(bonus <= 2000 && (liq as u128) * (10000 + (bonus as u128)) < 10000 * 10000, EBadParams);
    assert!(rf <= 5000 && base <= 2000 && s1 <= 5000 && s2 <= 50000, EBadParams);
    assert!(kink > 0 && kink < 10000, EBadParams);
    assert!(tmin >= 60_000 && tmax > tmin && tmax <= 86_400_000, EBadParams);
}

/// Creates a market for collateral C and loans of D, valued by `pool`. The pool must hold C and D.
public fun create_market_ab<C, D>(
    _: &LendAdminCap,
    pool: &Pool<C, D>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let (a, _) = pool::cumulative_prices(pool, clock);
    share_market<C, D>(object::id(pool), true, a, clock, ctx);
}

/// Same as `create_market_ab` for a pool ordered the other way, Pool<D, C>.
public fun create_market_ba<C, D>(
    _: &LendAdminCap,
    pool: &Pool<D, C>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let (_, b) = pool::cumulative_prices(pool, clock);
    share_market<C, D>(object::id(pool), false, b, clock, ctx);
}

fun share_market<C, D>(pool_id: ID, c_is_a: bool, cumulative: u256, clock: &Clock, ctx: &mut TxContext) {
    let now = clock.timestamp_ms();
    let market = Market<C, D> {
        id: object::new(ctx),
        pool_id,
        c_is_a,
        cash: balance::zero(),
        collateral: balance::zero(),
        shares: balance::create_supply(Share<C, D> {}),
        total_debt_scaled: 0,
        borrow_index: WAD,
        reserves: 0,
        last_accrual_ms: now,
        positions: table::new(ctx),
        observations: vector[Observation { ms: now, cumulative }],
        ltv_bps: 6000,
        liq_threshold_bps: 7500,
        liq_bonus_bps: 500,
        reserve_factor_bps: 1000,
        base_rate_bps: 200,
        slope1_bps: 800,
        slope2_bps: 10000,
        kink_bps: 8000,
        twap_min_ms: 600_000,
        twap_max_age_ms: 3_600_000,
        paused: false,
    };
    event::emit(MarketCreated { market: object::id(&market), pool: pool_id });
    transfer::share_object(market);
}

public fun set_params<C, D>(
    _: &LendAdminCap,
    m: &mut Market<C, D>,
    ltv: u64, liq: u64, bonus: u64, rf: u64, base: u64, s1: u64, s2: u64, kink: u64, tmin: u64, tmax: u64,
    clock: &Clock,
) {
    check_params(ltv, liq, bonus, rf, base, s1, s2, kink, tmin, tmax);
    accrue(m, clock);
    m.ltv_bps = ltv;
    m.liq_threshold_bps = liq;
    m.liq_bonus_bps = bonus;
    m.reserve_factor_bps = rf;
    m.base_rate_bps = base;
    m.slope1_bps = s1;
    m.slope2_bps = s2;
    m.kink_bps = kink;
    m.twap_min_ms = tmin;
    m.twap_max_age_ms = tmax;
}

/// Pausing stops new borrowing and collateral withdrawal only. Repaying, supplying, withdrawing
/// supply and liquidation keep working, so nobody's funds are frozen.
public fun set_paused<C, D>(_: &LendAdminCap, m: &mut Market<C, D>, paused: bool) { m.paused = paused; }

/// Sends the protocol's share of interest to the admin.
public fun take_reserves<C, D>(_: &LendAdminCap, m: &mut Market<C, D>, clock: &Clock, ctx: &mut TxContext): Coin<D> {
    accrue(m, clock);
    let amount = std::u64::min(m.reserves, m.cash.value());
    m.reserves = m.reserves - amount;
    coin::take(&mut m.cash, amount, ctx)
}

// ---------------------------------------------------------------- interest

fun debt_total<C, D>(m: &Market<C, D>): u256 { m.total_debt_scaled * m.borrow_index / WAD }

/// Utilization in basis points: debt / (cash - reserves + debt).
public fun utilization_bps<C, D>(m: &Market<C, D>): u64 {
    let debt = debt_total(m);
    let cash = (m.cash.value() as u256) - std::u256::min(m.reserves as u256, m.cash.value() as u256);
    if (debt == 0) return 0;
    ((debt * 10000 / (cash + debt)) as u64)
}

/// Yearly borrow rate in basis points at the current utilization.
public fun borrow_rate_bps<C, D>(m: &Market<C, D>): u64 {
    let u = utilization_bps(m);
    if (u <= m.kink_bps) {
        m.base_rate_bps + m.slope1_bps * u / m.kink_bps
    } else {
        m.base_rate_bps + m.slope1_bps + m.slope2_bps * (u - m.kink_bps) / (10000 - m.kink_bps)
    }
}

fun accrue<C, D>(m: &mut Market<C, D>, clock: &Clock) {
    let now = clock.timestamp_ms();
    if (now <= m.last_accrual_ms) return;
    let elapsed = (now - m.last_accrual_ms) as u256;
    m.last_accrual_ms = now;
    if (m.total_debt_scaled == 0) return;
    let debt_before = debt_total(m);
    let rate = (borrow_rate_bps(m) as u256);
    // Simple interest for the elapsed time, compounded at every accrual.
    m.borrow_index = m.borrow_index + m.borrow_index * rate * elapsed / (10000 * YEAR_MS);
    let interest = debt_total(m) - debt_before;
    let to_reserves = interest * (m.reserve_factor_bps as u256) / 10000;
    m.reserves = m.reserves + (to_reserves as u64);
}

// ---------------------------------------------------------------- price

/// Records the pool's price accumulator. At most one observation per minute; old ones roll off.
public fun observe<C, D, A, B>(m: &mut Market<C, D>, pool: &Pool<A, B>, clock: &Clock) {
    assert!(object::id(pool) == m.pool_id, EWrongPool);
    let now = clock.timestamp_ms();
    let last = m.observations[m.observations.length() - 1];
    if (now < last.ms + 60_000) return;
    let (a, b) = pool::cumulative_prices(pool, clock);
    m.observations.push_back(Observation { ms: now, cumulative: if (m.c_is_a) a else b });
    if (m.observations.length() > MAX_OBSERVATIONS) { m.observations.remove(0); };
}

/// Time-weighted price of one base unit of C in base units of D, with 18 decimals. Uses the newest
/// observation that is at least `twap_min_ms` old, and refuses it when older than `twap_max_age_ms`.
public fun twap<C, D, A, B>(m: &Market<C, D>, pool: &Pool<A, B>, clock: &Clock): u256 {
    assert!(object::id(pool) == m.pool_id, EWrongPool);
    let now = clock.timestamp_ms();
    let (a, b) = pool::cumulative_prices(pool, clock);
    let current = if (m.c_is_a) a else b;
    let mut i = m.observations.length();
    while (i > 0) {
        i = i - 1;
        let o = m.observations[i];
        if (now >= o.ms + m.twap_min_ms) {
            assert!(now <= o.ms + m.twap_max_age_ms, EStalePrice);
            return (current - o.cumulative) / ((now - o.ms) as u256)
        };
    };
    abort EStalePrice
}

fun value_in_d(collateral: u64, price: u256): u256 { (collateral as u256) * price / pool::price_scale() }

// ---------------------------------------------------------------- suppliers

public fun supply<C, D>(m: &mut Market<C, D>, c: Coin<D>, clock: &Clock, ctx: &mut TxContext): Coin<Share<C, D>> {
    accrue(m, clock);
    let amount = c.value();
    assert!(amount > 0, EZeroAmount);
    let total = supplied_value(m);
    let supply = m.shares.supply_value();
    let minted = if (supply == 0 || total == 0) amount else ((amount as u256) * (supply as u256) / total) as u64;
    assert!(minted > 0, EZeroAmount);
    m.cash.join(c.into_balance());
    event::emit(Supplied { market: object::id(m), who: ctx.sender(), amount, shares: minted });
    coin::from_balance(m.shares.increase_supply(minted), ctx)
}

/// Returns D for shares. Rounds down, so a withdrawal never takes more than its share.
public fun withdraw<C, D>(m: &mut Market<C, D>, s: Coin<Share<C, D>>, clock: &Clock, ctx: &mut TxContext): Coin<D> {
    accrue(m, clock);
    let shares = s.value();
    assert!(shares > 0, EZeroAmount);
    let amount = ((shares as u256) * supplied_value(m) / (m.shares.supply_value() as u256)) as u64;
    assert!(amount + m.reserves <= m.cash.value(), ENotEnoughLiquidity);
    m.shares.decrease_supply(s.into_balance());
    event::emit(Withdrawn { market: object::id(m), who: ctx.sender(), amount, shares });
    coin::take(&mut m.cash, amount, ctx)
}

/// Value owed to suppliers: cash plus debt, minus the protocol's reserves.
public fun supplied_value<C, D>(m: &Market<C, D>): u256 {
    (m.cash.value() as u256) + debt_total(m) - (m.reserves as u256)
}

// ---------------------------------------------------------------- borrowers

public fun deposit_collateral<C, D>(m: &mut Market<C, D>, c: Coin<C>, ctx: &TxContext) {
    let who = ctx.sender();
    let amount = c.value();
    assert!(amount > 0, EZeroAmount);
    if (!m.positions.contains(who)) m.positions.add(who, Position { collateral: 0, debt_scaled: 0 });
    let p = m.positions.borrow_mut(who);
    p.collateral = p.collateral + amount;
    m.collateral.join(c.into_balance());
    event::emit(CollateralChanged { market: object::id(m), who, added: true, amount });
}

public fun borrow<C, D, A, B>(
    m: &mut Market<C, D>,
    pool: &Pool<A, B>,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<D> {
    assert!(!m.paused, EPaused);
    assert!(amount > 0, EZeroAmount);
    accrue(m, clock);
    assert!(amount + m.reserves <= m.cash.value(), ENotEnoughLiquidity);
    let price = twap(m, pool, clock);
    let who = ctx.sender();
    assert!(m.positions.contains(who), ENoPosition);
    // Round the new debt up so that rounding never favors the borrower.
    let added = ((amount as u256) * WAD + m.borrow_index - 1) / m.borrow_index;
    let index = m.borrow_index;
    let ltv = m.ltv_bps;
    let p = m.positions.borrow_mut(who);
    p.debt_scaled = p.debt_scaled + added;
    let debt = p.debt_scaled * index / WAD;
    assert!(debt * 10000 <= value_in_d(p.collateral, price) * (ltv as u256), EUnhealthy);
    m.total_debt_scaled = m.total_debt_scaled + added;
    event::emit(Borrowed { market: object::id(m), who, amount });
    coin::take(&mut m.cash, amount, ctx)
}

/// Repays `c` toward `borrower`'s debt. Anything above the debt is returned.
public fun repay<C, D>(
    m: &mut Market<C, D>,
    borrower: address,
    mut c: Coin<D>,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<D> {
    accrue(m, clock);
    assert!(m.positions.contains(borrower), ENoPosition);
    let index = m.borrow_index;
    let p = m.positions.borrow_mut(borrower);
    // Round the debt up so that it cannot be cleared for less than it is.
    let debt = ((p.debt_scaled * index + WAD - 1) / WAD) as u64;
    let pay = std::u64::min(debt, c.value());
    assert!(pay > 0, EZeroAmount);
    let removed = if (pay == debt) p.debt_scaled else std::u256::min(p.debt_scaled, (pay as u256) * WAD / index);
    p.debt_scaled = p.debt_scaled - removed;
    m.total_debt_scaled = m.total_debt_scaled - std::u256::min(removed, m.total_debt_scaled);
    m.cash.join(c.split(pay, ctx).into_balance());
    event::emit(Repaid { market: object::id(m), who: borrower, payer: ctx.sender(), amount: pay });
    c
}

public fun withdraw_collateral<C, D, A, B>(
    m: &mut Market<C, D>,
    pool: &Pool<A, B>,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<C> {
    assert!(amount > 0, EZeroAmount);
    accrue(m, clock);
    let who = ctx.sender();
    assert!(m.positions.contains(who), ENoPosition);
    let index = m.borrow_index;
    let ltv = m.ltv_bps;
    let has_debt = m.positions.borrow(who).debt_scaled > 0;
    // Without debt, collateral can always leave, even when paused or without a fresh price.
    let price = if (has_debt) { assert!(!m.paused, EPaused); twap(m, pool, clock) } else 0;
    let p = m.positions.borrow_mut(who);
    assert!(amount <= p.collateral, ENotEnoughCollateral);
    p.collateral = p.collateral - amount;
    if (has_debt) {
        let debt = p.debt_scaled * index / WAD;
        assert!(debt * 10000 <= value_in_d(p.collateral, price) * (ltv as u256), EUnhealthy);
    };
    event::emit(CollateralChanged { market: object::id(m), who, added: false, amount });
    coin::take(&mut m.collateral, amount, ctx)
}

/// Removes an empty position.
public fun close_position<C, D>(m: &mut Market<C, D>, ctx: &TxContext) {
    let who = ctx.sender();
    assert!(m.positions.contains(who), ENoPosition);
    let p = m.positions.borrow(who);
    assert!(p.debt_scaled == 0 && p.collateral == 0, EDebtRemaining);
    m.positions.remove(who);
}

/// Repays up to half of an unhealthy position's debt and takes collateral worth the repaid amount
/// plus the liquidation bonus. Any part of `c` that is not used is returned.
public fun liquidate<C, D, A, B>(
    m: &mut Market<C, D>,
    pool: &Pool<A, B>,
    borrower: address,
    mut c: Coin<D>,
    clock: &Clock,
    ctx: &mut TxContext,
): (Coin<C>, Coin<D>) {
    accrue(m, clock);
    let price = twap(m, pool, clock);
    assert!(m.positions.contains(borrower), ENoPosition);
    let index = m.borrow_index;
    let liq = m.liq_threshold_bps;
    let bonus = m.liq_bonus_bps;
    let p = m.positions.borrow_mut(borrower);
    let debt = p.debt_scaled * index / WAD;
    let value = value_in_d(p.collateral, price);
    assert!(debt * 10000 > value * (liq as u256), EHealthy);
    let max_repay = std::u256::max(debt / 2, 1);
    let pay = std::u256::min(max_repay, c.value() as u256);
    assert!(pay > 0, EZeroAmount);
    assert!(pay <= debt, ETooMuchRepaid);
    // Collateral = repaid value plus bonus, converted at the time-weighted price, capped at what
    // the position holds.
    let seize_value = pay * (10000 + (bonus as u256)) / 10000;
    let mut seize = seize_value * pool::price_scale() / price;
    if (seize > (p.collateral as u256)) seize = p.collateral as u256;
    let removed = std::u256::min(p.debt_scaled, pay * WAD / index);
    p.debt_scaled = p.debt_scaled - removed;
    p.collateral = p.collateral - (seize as u64);
    m.total_debt_scaled = m.total_debt_scaled - std::u256::min(removed, m.total_debt_scaled);
    m.cash.join(c.split(pay as u64, ctx).into_balance());
    event::emit(Liquidated {
        market: object::id(m),
        borrower,
        liquidator: ctx.sender(),
        repaid: pay as u64,
        collateral_taken: seize as u64,
    });
    (coin::take(&mut m.collateral, seize as u64, ctx), c)
}

// ---------------------------------------------------------------- views

public fun position<C, D>(m: &Market<C, D>, who: address): (u64, u64) {
    if (!m.positions.contains(who)) return (0, 0);
    let p = m.positions.borrow(who);
    (p.collateral, ((p.debt_scaled * m.borrow_index + WAD - 1) / WAD) as u64)
}

public fun cash<C, D>(m: &Market<C, D>): u64 { m.cash.value() }

public fun total_debt<C, D>(m: &Market<C, D>): u64 { debt_total(m) as u64 }

public fun share_supply<C, D>(m: &Market<C, D>): u64 { m.shares.supply_value() }

public fun is_paused<C, D>(m: &Market<C, D>): bool { m.paused }

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) { init(ctx) }
