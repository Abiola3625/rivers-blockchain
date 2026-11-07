// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module rivers_dex::pool_tests;

use rivers_dex::pool::{Self, Pool, Registry, LP};
use sui::coin::{Self, Coin};
use sui::clock::{Self, Clock};
use sui::test_scenario as ts;

public struct X has drop {}
public struct Y has drop {}

const ALICE: address = @0xA;
const BOB: address = @0xB;

fun setup(): ts::Scenario {
    let mut s = ts::begin(ALICE);
    pool::init_for_testing(s.ctx());
    s.next_tx(ALICE);
    let mut reg = s.take_shared<Registry>();
    let clk = clock::create_for_testing(s.ctx());
    let lp = pool::create_pool(&mut reg, coin::mint_for_testing<X>(1_000_000, s.ctx()), coin::mint_for_testing<Y>(4_000_000, s.ctx()), &clk, s.ctx());
    clk.share_for_testing();
    assert!(lp.value() == 2_000_000 - 1000);
    transfer::public_transfer(lp, ALICE);
    ts::return_shared(reg);
    s.next_tx(BOB);
    s
}

#[test]
fun swap_both_ways() {
    let mut s = setup();
    let mut p = s.take_shared<Pool<X, Y>>();
    let clk = s.take_shared<Clock>();
    let out = pool::swap_a_for_b(&mut p, coin::mint_for_testing<X>(10_000, s.ctx()), 0, &clk, s.ctx());
    // 10,000 X at 1:4 minus the 0.3% fee and price impact.
    assert!(out.value() == pool::amount_out(10_000, 1_000_000, 4_000_000, 30));
    assert!(out.value() > 39_000 && out.value() < 39_880);
    let back = pool::swap_b_for_a(&mut p, out, 0, &clk, s.ctx());
    assert!(back.value() < 10_000);
    let (ra, rb) = pool::reserves(&p);
    assert!((ra as u128) * (rb as u128) >= 1_000_000u128 * 4_000_000u128);
    coin::burn_for_testing(back);
    ts::return_shared(p);
    ts::return_shared(clk);
    s.end();
}

#[test]
fun add_and_remove_liquidity() {
    let mut s = setup();
    let mut p = s.take_shared<Pool<X, Y>>();
    let clk = s.take_shared<Clock>();
    let (lp, ra, rb) = pool::add_liquidity(&mut p, coin::mint_for_testing<X>(100_000, s.ctx()), coin::mint_for_testing<Y>(500_000, s.ctx()), 0, &clk, s.ctx());
    assert!(lp.value() == 200_000);
    assert!(ra.value() == 0 && rb.value() == 100_000);
    let (a, b) = pool::remove_liquidity(&mut p, lp, 0, 0, &clk, s.ctx());
    assert!(a.value() == 100_000 && b.value() == 400_000);
    coin::burn_for_testing(ra); coin::burn_for_testing(rb); coin::burn_for_testing(a); coin::burn_for_testing(b);
    ts::return_shared(p);
    ts::return_shared(clk);
    s.end();
}

#[test, expected_failure(abort_code = pool::ESlippage)]
fun swap_respects_minimum() {
    let mut s = setup();
    let mut p = s.take_shared<Pool<X, Y>>();
    let clk = s.take_shared<Clock>();
    let out = pool::swap_a_for_b(&mut p, coin::mint_for_testing<X>(10_000, s.ctx()), 40_000, &clk, s.ctx());
    coin::burn_for_testing(out);
    ts::return_shared(p);
    ts::return_shared(clk);
    s.end();
}

#[test, expected_failure(abort_code = pool::EPoolExists)]
fun no_duplicate_pool() {
    let mut s = setup();
    let mut reg = s.take_shared<Registry>();
    let clk = s.take_shared<Clock>();
    let lp: Coin<LP<Y, X>> = pool::create_pool(&mut reg, coin::mint_for_testing<Y>(5_000, s.ctx()), coin::mint_for_testing<X>(5_000, s.ctx()), &clk, s.ctx());
    ts::return_shared(clk);
    coin::burn_for_testing(lp);
    ts::return_shared(reg);
    s.end();
}
