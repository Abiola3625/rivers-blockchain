// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module rivers_dex::lend_tests;

use rivers_dex::lend::{Self, Market, LendAdminCap, Share};
use rivers_dex::pool::{Self, Pool, Registry};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::test_scenario::{Self as ts, Scenario};

public struct X has drop {}
public struct Y has drop {}

const ADMIN: address = @0xAD;
const SUPPLIER: address = @0x5A;
const BORROWER: address = @0xB0;
const LIQUIDATOR: address = @0x11;
const MIN: u64 = 60_000;

/// Pool with 1 X = 4 Y, a market for X collateral and Y loans, 1,000,000 Y supplied, and price
/// observations so that the time-weighted price is usable.
fun setup(): (Scenario, Clock) {
    let mut s = ts::begin(ADMIN);
    pool::init_for_testing(s.ctx());
    lend::init_for_testing(s.ctx());
    let mut clk = clock::create_for_testing(s.ctx());
    clk.set_for_testing(1_000_000);
    s.next_tx(ADMIN);
    let mut reg = s.take_shared<Registry>();
    let lp = pool::create_pool(&mut reg, coin::mint_for_testing<X>(1_000_000_000, s.ctx()), coin::mint_for_testing<Y>(4_000_000_000, s.ctx()), &clk, s.ctx());
    transfer::public_transfer(lp, ADMIN);
    ts::return_shared(reg);
    s.next_tx(ADMIN);
    let cap = s.take_from_sender<LendAdminCap>();
    let p = s.take_shared<Pool<X, Y>>();
    lend::create_market_ab<X, Y>(&cap, &p, &clk, s.ctx());
    s.return_to_sender(cap);
    ts::return_shared(p);
    s.next_tx(SUPPLIER);
    let mut m = s.take_shared<Market<X, Y>>();
    let sh = lend::supply(&mut m, coin::mint_for_testing<Y>(1_000_000, s.ctx()), &clk, s.ctx());
    transfer::public_transfer(sh, SUPPLIER);
    ts::return_shared(m);
    observe_for(&mut s, &mut clk, 12);
    (s, clk)
}

/// Lets `minutes` pass, recording an observation every minute.
fun observe_for(s: &mut Scenario, clk: &mut Clock, minutes: u64) {
    let mut i = 0;
    while (i < minutes) {
        clk.increment_for_testing(MIN);
        s.next_tx(ADMIN);
        let mut m = s.take_shared<Market<X, Y>>();
        let p = s.take_shared<Pool<X, Y>>();
        lend::observe(&mut m, &p, clk);
        ts::return_shared(m);
        ts::return_shared(p);
        i = i + 1;
    };
}

fun borrow_as(s: &mut Scenario, clk: &Clock, collateral: u64, amount: u64) {
    s.next_tx(BORROWER);
    let mut m = s.take_shared<Market<X, Y>>();
    let p = s.take_shared<Pool<X, Y>>();
    if (collateral > 0) lend::deposit_collateral(&mut m, coin::mint_for_testing<X>(collateral, s.ctx()), s.ctx());
    let c = lend::borrow(&mut m, &p, amount, clk, s.ctx());
    transfer::public_transfer(c, BORROWER);
    ts::return_shared(m);
    ts::return_shared(p);
}

#[test]
fun twap_matches_the_pool_price() {
    let (mut s, clk) = setup();
    s.next_tx(ADMIN);
    let m = s.take_shared<Market<X, Y>>();
    let p = s.take_shared<Pool<X, Y>>();
    assert!(lend::twap(&m, &p, &clk) == 4 * pool::price_scale());
    ts::return_shared(m);
    ts::return_shared(p);
    clk.destroy_for_testing();
    s.end();
}

#[test]
fun borrow_within_ltv_and_repay_with_interest() {
    let (mut s, mut clk) = setup();
    // 100,000 X is worth 400,000 Y; 60% LTV allows 240,000 Y.
    borrow_as(&mut s, &clk, 100_000, 200_000);
    clk.increment_for_testing(31_536_000_000);
    s.next_tx(BORROWER);
    let mut m = s.take_shared<Market<X, Y>>();
    let (col, _) = lend::position(&m, BORROWER);
    assert!(col == 100_000);
    // 20% utilization: 2% + 8% * 20/80 = 4% a year, so the debt is about 208,000.
    let change = lend::repay(&mut m, BORROWER, coin::mint_for_testing<Y>(300_000, s.ctx()), &clk, s.ctx());
    assert!(change.value() >= 91_990 && change.value() <= 92_000);
    coin::burn_for_testing(change);
    let (_, debt2) = lend::position(&m, BORROWER);
    assert!(debt2 == 0);
    ts::return_shared(m);
    // The supplier gets back more than it supplied.
    s.next_tx(SUPPLIER);
    let mut m = s.take_shared<Market<X, Y>>();
    let sh = s.take_from_sender<Coin<Share<X, Y>>>();
    let out = lend::withdraw(&mut m, sh, &clk, s.ctx());
    assert!(out.value() > 1_000_000);
    coin::burn_for_testing(out);
    ts::return_shared(m);
    clk.destroy_for_testing();
    s.end();
}

#[test, expected_failure(abort_code = lend::EUnhealthy)]
fun cannot_borrow_above_ltv() {
    let (mut s, clk) = setup();
    borrow_as(&mut s, &clk, 100_000, 240_001);
    clk.destroy_for_testing();
    s.end();
}

#[test, expected_failure(abort_code = lend::EUnhealthy)]
fun price_pushed_in_one_transaction_does_not_count() {
    let (mut s, clk) = setup();
    // Push the X price up with a large swap, then borrow against it in the same moment.
    s.next_tx(BORROWER);
    let mut p = s.take_shared<Pool<X, Y>>();
    let out = pool::swap_b_for_a(&mut p, coin::mint_for_testing<Y>(4_000_000_000, s.ctx()), 0, &clk, s.ctx());
    coin::burn_for_testing(out);
    ts::return_shared(p);
    // The spot price of X is now about 16 Y, but the average still says 4 Y.
    borrow_as(&mut s, &clk, 100_000, 300_000);
    clk.destroy_for_testing();
    s.end();
}

#[test, expected_failure(abort_code = lend::EStalePrice)]
fun stale_price_blocks_borrowing() {
    let (mut s, mut clk) = setup();
    clk.increment_for_testing(2 * 3_600_000);
    borrow_as(&mut s, &clk, 100_000, 1_000);
    clk.destroy_for_testing();
    s.end();
}

#[test, expected_failure(abort_code = lend::EPaused)]
fun pause_stops_new_borrowing() {
    let (mut s, clk) = setup();
    s.next_tx(ADMIN);
    let cap = s.take_from_sender<LendAdminCap>();
    let mut m = s.take_shared<Market<X, Y>>();
    lend::set_paused(&cap, &mut m, true);
    s.return_to_sender(cap);
    ts::return_shared(m);
    borrow_as(&mut s, &clk, 100_000, 1_000);
    clk.destroy_for_testing();
    s.end();
}

#[test]
fun liquidation_after_price_falls() {
    let (mut s, mut clk) = setup();
    borrow_as(&mut s, &clk, 100_000, 230_000);
    // The X price falls to about 2.5 Y and stays there.
    s.next_tx(LIQUIDATOR);
    let mut p = s.take_shared<Pool<X, Y>>();
    let out = pool::swap_a_for_b(&mut p, coin::mint_for_testing<X>(270_000_000, s.ctx()), 0, &clk, s.ctx());
    coin::burn_for_testing(out);
    ts::return_shared(p);
    observe_for(&mut s, &mut clk, 40);
    s.next_tx(LIQUIDATOR);
    let mut m = s.take_shared<Market<X, Y>>();
    let p = s.take_shared<Pool<X, Y>>();
    let (_, debt) = lend::position(&m, BORROWER);
    let (seized, change) = lend::liquidate(&mut m, &p, BORROWER, coin::mint_for_testing<Y>(debt, s.ctx()), &clk, s.ctx());
    // Half the debt was repaid; the rest of the coin came back.
    assert!(change.value() >= debt / 2 - 1);
    assert!(seized.value() > 0);
    let (col, debt2) = lend::position(&m, BORROWER);
    assert!(col == 100_000 - seized.value());
    assert!(debt2 <= debt - debt / 2 + debt / 1000);
    coin::burn_for_testing(seized);
    coin::burn_for_testing(change);
    ts::return_shared(m);
    ts::return_shared(p);
    clk.destroy_for_testing();
    s.end();
}

#[test, expected_failure(abort_code = lend::EHealthy)]
fun healthy_position_cannot_be_liquidated() {
    let (mut s, clk) = setup();
    borrow_as(&mut s, &clk, 100_000, 200_000);
    s.next_tx(LIQUIDATOR);
    let mut m = s.take_shared<Market<X, Y>>();
    let p = s.take_shared<Pool<X, Y>>();
    let (a, b) = lend::liquidate(&mut m, &p, BORROWER, coin::mint_for_testing<Y>(10_000, s.ctx()), &clk, s.ctx());
    coin::burn_for_testing(a);
    coin::burn_for_testing(b);
    ts::return_shared(m);
    ts::return_shared(p);
    clk.destroy_for_testing();
    s.end();
}

#[test, expected_failure(abort_code = lend::EUnhealthy)]
fun collateral_cannot_leave_while_needed() {
    let (mut s, clk) = setup();
    borrow_as(&mut s, &clk, 100_000, 200_000);
    s.next_tx(BORROWER);
    let mut m = s.take_shared<Market<X, Y>>();
    let p = s.take_shared<Pool<X, Y>>();
    let c = lend::withdraw_collateral(&mut m, &p, 20_000, &clk, s.ctx());
    coin::burn_for_testing(c);
    ts::return_shared(m);
    ts::return_shared(p);
    clk.destroy_for_testing();
    s.end();
}

#[test, expected_failure(abort_code = lend::ENotEnoughLiquidity)]
fun suppliers_cannot_take_lent_coins() {
    let (mut s, clk) = setup();
    borrow_as(&mut s, &clk, 300_000, 700_000);
    s.next_tx(SUPPLIER);
    let mut m = s.take_shared<Market<X, Y>>();
    let sh = s.take_from_sender<Coin<Share<X, Y>>>();
    let out = lend::withdraw(&mut m, sh, &clk, s.ctx());
    coin::burn_for_testing(out);
    ts::return_shared(m);
    clk.destroy_for_testing();
    s.end();
}
