// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module rivers_vesting::vesting_tests;

use rivers_vesting::vesting::{Self, Vesting, IssuerCap};
use std::unit_test::assert_eq;
use sui::clock::{Self, Clock};
use sui::coin;
use sui::sui::SUI;
use sui::test_scenario::{Self as ts, Scenario};

const ISSUER: address = @0xF0;
const INVESTOR: address = @0xA1;
const OTHER: address = @0xB2;
const DAY: u64 = 86_400_000;
const RVRB: u64 = 1_000_000_000;

// 100,000 RVRB, 10% at start, 90-day cliff, 360-day total duration.
fun setup(revocable: bool): (Scenario, Clock) {
    let mut sc = ts::begin(ISSUER);
    let mut clock = clock::create_for_testing(sc.ctx());
    clock.set_for_testing(1_000 * DAY);
    let coin = coin::mint_for_testing<SUI>(100_000 * RVRB, sc.ctx());
    let cap = vesting::create(
        coin,
        b"Seed round".to_string(),
        INVESTOR,
        0,
        90 * DAY,
        360 * DAY,
        1_000,
        revocable,
        &clock,
        sc.ctx(),
    );
    transfer::public_transfer(cap, ISSUER);
    sc.next_tx(INVESTOR);
    (sc, clock)
}

#[test]
fun unlocks_on_schedule() {
    let (sc, mut clock) = setup(true);
    let v = sc.take_shared<Vesting<SUI>>();
    assert_eq!(v.vested_amount(&clock), 10_000 * RVRB);

    // Before the cliff only the start amount is unlocked.
    clock.increment_for_testing(89 * DAY);
    assert_eq!(v.vested_amount(&clock), 10_000 * RVRB);

    // At the cliff, 90 of 360 days have accrued: 10,000 + 90,000 * 0.25.
    clock.increment_for_testing(DAY);
    assert_eq!(v.vested_amount(&clock), 32_500 * RVRB);

    // Halfway: 10,000 + 45,000.
    clock.increment_for_testing(90 * DAY);
    assert_eq!(v.vested_amount(&clock), 55_000 * RVRB);

    clock.increment_for_testing(500 * DAY);
    assert_eq!(v.vested_amount(&clock), 100_000 * RVRB);
    ts::return_shared(v);
    clock.destroy_for_testing();
    sc.end();
}

#[test]
fun investor_claims_in_parts() {
    let (mut sc, mut clock) = setup(true);
    let mut v = sc.take_shared<Vesting<SUI>>();
    let c1 = v.claim(&clock, sc.ctx());
    assert_eq!(c1.value(), 10_000 * RVRB);

    clock.increment_for_testing(180 * DAY);
    let c2 = v.claim(&clock, sc.ctx());
    assert_eq!(c2.value(), 45_000 * RVRB);
    assert_eq!(v.claimed(), 55_000 * RVRB);
    assert_eq!(v.locked_balance(), 45_000 * RVRB);

    clock.increment_for_testing(180 * DAY);
    let c3 = v.claim(&clock, sc.ctx());
    assert_eq!(c3.value(), 45_000 * RVRB);
    assert_eq!(v.locked_balance(), 0);

    ts::return_shared(v);
    transfer::public_transfer(c1, INVESTOR);
    transfer::public_transfer(c2, INVESTOR);
    transfer::public_transfer(c3, INVESTOR);
    clock.destroy_for_testing();
    sc.end();
}

#[test, expected_failure(abort_code = vesting::ENotBeneficiary)]
fun stranger_cannot_claim() {
    let (mut sc, clock) = setup(true);
    sc.next_tx(OTHER);
    let mut v = sc.take_shared<Vesting<SUI>>();
    let _c = v.claim(&clock, sc.ctx());
    abort 99
}

#[test]
fun revoke_returns_locked_part() {
    let (mut sc, mut clock) = setup(true);
    clock.increment_for_testing(180 * DAY);
    sc.next_tx(ISSUER);
    let mut v = sc.take_shared<Vesting<SUI>>();
    let cap = sc.take_from_sender<IssuerCap>();
    let back = v.revoke(&cap, &clock, sc.ctx());
    assert_eq!(back.value(), 45_000 * RVRB);
    assert!(v.is_revoked());

    // The investor keeps the 55,000 that had unlocked, and nothing more unlocks.
    clock.increment_for_testing(500 * DAY);
    assert_eq!(v.claimable(&clock), 55_000 * RVRB);
    ts::return_shared(v);

    sc.next_tx(INVESTOR);
    let mut v = sc.take_shared<Vesting<SUI>>();
    let c = v.claim(&clock, sc.ctx());
    assert_eq!(c.value(), 55_000 * RVRB);
    assert_eq!(v.locked_balance(), 0);

    ts::return_shared(v);
    transfer::public_transfer(cap, ISSUER);
    transfer::public_transfer(back, ISSUER);
    transfer::public_transfer(c, INVESTOR);
    clock.destroy_for_testing();
    sc.end();
}

#[test, expected_failure(abort_code = vesting::ENotRevocable)]
fun fixed_schedule_cannot_be_revoked() {
    let (mut sc, clock) = setup(false);
    sc.next_tx(ISSUER);
    let mut v = sc.take_shared<Vesting<SUI>>();
    let cap = sc.take_from_sender<IssuerCap>();
    let _back = v.revoke(&cap, &clock, sc.ctx());
    abort 99
}

#[test]
fun beneficiary_moves_to_new_wallet() {
    let (mut sc, clock) = setup(true);
    let mut v = sc.take_shared<Vesting<SUI>>();
    vesting::change_beneficiary(&mut v, OTHER, sc.ctx());
    assert_eq!(v.beneficiary(), OTHER);
    ts::return_shared(v);

    sc.next_tx(OTHER);
    let mut v = sc.take_shared<Vesting<SUI>>();
    let c = v.claim(&clock, sc.ctx());
    assert_eq!(c.value(), 10_000 * RVRB);
    ts::return_shared(v);
    transfer::public_transfer(c, OTHER);
    clock.destroy_for_testing();
    sc.end();
}

#[test, expected_failure(abort_code = vesting::EInvalidSchedule)]
fun cliff_longer_than_duration_fails() {
    let mut sc = ts::begin(ISSUER);
    let clock = clock::create_for_testing(sc.ctx());
    let coin = coin::mint_for_testing<SUI>(RVRB, sc.ctx());
    let _cap = vesting::create(
        coin,
        b"Bad".to_string(),
        INVESTOR,
        0,
        400 * DAY,
        360 * DAY,
        0,
        true,
        &clock,
        sc.ctx(),
    );
    abort 99
}

#[test]
fun before_start_nothing_unlocks() {
    let mut sc = ts::begin(ISSUER);
    let mut clock = clock::create_for_testing(sc.ctx());
    clock.set_for_testing(DAY);
    let coin = coin::mint_for_testing<SUI>(1_000 * RVRB, sc.ctx());
    let cap = vesting::create(
        coin,
        b"Future".to_string(),
        INVESTOR,
        30 * DAY,
        0,
        10 * DAY,
        5_000,
        true,
        &clock,
        sc.ctx(),
    );
    sc.next_tx(INVESTOR);
    let v = sc.take_shared<Vesting<SUI>>();
    assert_eq!(v.vested_amount(&clock), 0);
    clock.set_for_testing(30 * DAY);
    assert_eq!(v.vested_amount(&clock), 500 * RVRB);
    clock.set_for_testing(35 * DAY);
    assert_eq!(v.vested_amount(&clock), 750 * RVRB);
    ts::return_shared(v);
    transfer::public_transfer(cap, ISSUER);
    clock.destroy_for_testing();
    sc.end();
}
