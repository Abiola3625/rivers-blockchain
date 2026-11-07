// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Rivers Connect: the registry of institutions (banks and payment firms) that settle on Rivers.
/// Rivers Core holds `OperatorCap` and admits, limits, suspends or removes institutions, and can
/// pause all institutional payments. Payments move any coin between two active institutions and
/// record the ISO 20022 reference and purpose code in a `Payment` event.
module rivers_connect::network;

use std::string::String;
use std::type_name;
use sui::coin::Coin;
use sui::event;
use sui::table::{Self, Table};

const ENotRegistered: u64 = 1;
const ESuspended: u64 = 2;
const EOverLimit: u64 = 3;
const EPaused: u64 = 4;
const EAlreadyRegistered: u64 = 5;
const EZeroAmount: u64 = 6;
const EFieldTooLong: u64 = 7;

public struct OperatorCap has key, store { id: UID }

public struct Institution has store, copy, drop {
    name: String,
    city: String,
    country: String,
    tier: u8,
    /// Largest single payment in base units of any coin. Zero means no limit.
    payment_limit: u64,
    active: bool,
    joined_ms: u64,
    sent: u64,
    received: u64,
}

public struct Network has key {
    id: UID,
    institutions: Table<address, Institution>,
    members: vector<address>,
    paused: bool,
    payments: u64,
}

public struct InstitutionChanged has copy, drop {
    institution: address,
    name: String,
    action: String,
    active: bool,
    payment_limit: u64,
}

public struct PausedChanged has copy, drop { paused: bool }

public struct Payment has copy, drop {
    number: u64,
    from: address,
    to: address,
    coin_type: vector<u8>,
    amount: u64,
    reference: String,
    purpose: String,
}

fun init(ctx: &mut TxContext) {
    transfer::share_object(Network {
        id: object::new(ctx),
        institutions: table::new(ctx),
        members: vector[],
        paused: false,
        payments: 0,
    });
    transfer::public_transfer(OperatorCap { id: object::new(ctx) }, ctx.sender());
}

public fun register(
    _: &OperatorCap,
    net: &mut Network,
    institution: address,
    name: String,
    city: String,
    country: String,
    tier: u8,
    payment_limit: u64,
    ctx: &TxContext,
) {
    assert!(!net.institutions.contains(institution), EAlreadyRegistered);
    assert!(name.length() <= 80 && city.length() <= 60 && country.length() <= 60, EFieldTooLong);
    net.institutions.add(institution, Institution {
        name, city, country, tier, payment_limit, active: true, joined_ms: ctx.epoch_timestamp_ms(), sent: 0, received: 0,
    });
    net.members.push_back(institution);
    emit_change(net, institution, b"registered".to_string());
}

public fun set_limit(_: &OperatorCap, net: &mut Network, institution: address, payment_limit: u64) {
    assert!(net.institutions.contains(institution), ENotRegistered);
    net.institutions.borrow_mut(institution).payment_limit = payment_limit;
    emit_change(net, institution, b"limit changed".to_string());
}

public fun set_active(_: &OperatorCap, net: &mut Network, institution: address, active: bool) {
    assert!(net.institutions.contains(institution), ENotRegistered);
    net.institutions.borrow_mut(institution).active = active;
    emit_change(net, institution, if (active) b"reactivated".to_string() else b"suspended".to_string());
}

public fun remove(_: &OperatorCap, net: &mut Network, institution: address) {
    assert!(net.institutions.contains(institution), ENotRegistered);
    emit_change(net, institution, b"removed".to_string());
    net.institutions.remove(institution);
    let (found, i) = net.members.index_of(&institution);
    if (found) { net.members.swap_remove(i); };
}

public fun set_paused(_: &OperatorCap, net: &mut Network, paused: bool) {
    net.paused = paused;
    event::emit(PausedChanged { paused });
}

/// Sends `payment` from the sender institution to the `to` institution.
public fun pay<T>(
    net: &mut Network,
    payment: Coin<T>,
    to: address,
    reference: String,
    purpose: String,
    ctx: &TxContext,
) {
    assert!(!net.paused, EPaused);
    let from = ctx.sender();
    let amount = payment.value();
    assert!(amount > 0, EZeroAmount);
    assert!(reference.length() <= 35 && purpose.length() <= 4, EFieldTooLong);
    assert!(net.institutions.contains(from) && net.institutions.contains(to), ENotRegistered);
    let sender = net.institutions.borrow_mut(from);
    assert!(sender.active, ESuspended);
    assert!(sender.payment_limit == 0 || amount <= sender.payment_limit, EOverLimit);
    sender.sent = sender.sent + 1;
    let receiver = net.institutions.borrow_mut(to);
    assert!(receiver.active, ESuspended);
    receiver.received = receiver.received + 1;
    net.payments = net.payments + 1;
    event::emit(Payment {
        number: net.payments,
        from,
        to,
        coin_type: type_name::with_defining_ids<T>().into_string().into_bytes(),
        amount,
        reference,
        purpose,
    });
    transfer::public_transfer(payment, to);
}

fun emit_change(net: &Network, institution: address, action: String) {
    let i = net.institutions.borrow(institution);
    event::emit(InstitutionChanged { institution, name: i.name, action, active: i.active, payment_limit: i.payment_limit });
}

public fun is_active(net: &Network, institution: address): bool {
    net.institutions.contains(institution) && net.institutions.borrow(institution).active
}

public fun institution(net: &Network, institution: address): Institution { *net.institutions.borrow(institution) }

public fun members(net: &Network): vector<address> { net.members }

public fun paused(net: &Network): bool { net.paused }

public fun payment_count(net: &Network): u64 { net.payments }

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) { init(ctx) }
