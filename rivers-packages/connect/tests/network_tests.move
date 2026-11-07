// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module rivers_connect::network_tests;

use rivers_connect::network::{Self, Network, OperatorCap};
use sui::coin::{Self, Coin};
use sui::test_scenario as ts;

public struct NGN has drop {}

const OP: address = @0xC0;
const BANK_A: address = @0xA1;
const BANK_B: address = @0xB2;

fun setup(): ts::Scenario {
    let mut s = ts::begin(OP);
    network::init_for_testing(s.ctx());
    s.next_tx(OP);
    let cap = s.take_from_sender<OperatorCap>();
    let mut net = s.take_shared<Network>();
    network::register(&cap, &mut net, BANK_A, b"Bank A".to_string(), b"Lagos".to_string(), b"Nigeria".to_string(), 1, 1000, s.ctx());
    network::register(&cap, &mut net, BANK_B, b"Bank B".to_string(), b"Abuja".to_string(), b"Nigeria".to_string(), 1, 0, s.ctx());
    ts::return_shared(net);
    s.return_to_sender(cap);
    s
}

#[test]
fun pays_between_members() {
    let mut s = setup();
    s.next_tx(BANK_A);
    let mut net = s.take_shared<Network>();
    network::pay(&mut net, coin::mint_for_testing<NGN>(700, s.ctx()), BANK_B, b"INV-1".to_string(), b"SUPP".to_string(), s.ctx());
    assert!(network::payment_count(&net) == 1);
    ts::return_shared(net);
    s.next_tx(BANK_B);
    let c = s.take_from_sender<Coin<NGN>>();
    assert!(c.value() == 700);
    coin::burn_for_testing(c);
    s.end();
}

#[test, expected_failure(abort_code = network::EOverLimit)]
fun limit_applies() {
    let mut s = setup();
    s.next_tx(BANK_A);
    let mut net = s.take_shared<Network>();
    network::pay(&mut net, coin::mint_for_testing<NGN>(1001, s.ctx()), BANK_B, b"INV-2".to_string(), b"SUPP".to_string(), s.ctx());
    ts::return_shared(net);
    s.end();
}

#[test, expected_failure(abort_code = network::ESuspended)]
fun suspended_cannot_receive() {
    let mut s = setup();
    s.next_tx(OP);
    let cap = s.take_from_sender<OperatorCap>();
    let mut net = s.take_shared<Network>();
    network::set_active(&cap, &mut net, BANK_B, false);
    s.return_to_sender(cap);
    ts::return_shared(net);
    s.next_tx(BANK_A);
    let mut net = s.take_shared<Network>();
    network::pay(&mut net, coin::mint_for_testing<NGN>(5, s.ctx()), BANK_B, b"INV-3".to_string(), b"SUPP".to_string(), s.ctx());
    ts::return_shared(net);
    s.end();
}

#[test, expected_failure(abort_code = network::EPaused)]
fun pause_stops_payments() {
    let mut s = setup();
    s.next_tx(OP);
    let cap = s.take_from_sender<OperatorCap>();
    let mut net = s.take_shared<Network>();
    network::set_paused(&cap, &mut net, true);
    s.return_to_sender(cap);
    ts::return_shared(net);
    s.next_tx(BANK_A);
    let mut net = s.take_shared<Network>();
    network::pay(&mut net, coin::mint_for_testing<NGN>(5, s.ctx()), BANK_B, b"INV-4".to_string(), b"SUPP".to_string(), s.ctx());
    ts::return_shared(net);
    s.end();
}

#[test, expected_failure(abort_code = network::ENotRegistered)]
fun outsiders_cannot_pay() {
    let mut s = setup();
    s.next_tx(@0xEE);
    let mut net = s.take_shared<Network>();
    network::pay(&mut net, coin::mint_for_testing<NGN>(5, s.ctx()), BANK_B, b"X".to_string(), b"SUPP".to_string(), s.ctx());
    ts::return_shared(net);
    s.end();
}
