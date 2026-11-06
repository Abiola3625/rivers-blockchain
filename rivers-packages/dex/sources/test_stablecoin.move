// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Shared faucet for a testnet stablecoin. Anyone can claim a fixed amount once per epoch per address.
/// Testnet stablecoins have no backing and no value.
module rivers_dex::test_faucet;

use sui::coin::{Self, Coin, TreasuryCap};
use sui::table::{Self, Table};

const EAlreadyClaimed: u64 = 1;

public struct Faucet<phantom T> has key {
    id: UID,
    cap: TreasuryCap<T>,
    amount: u64,
    last_claim: Table<address, u64>,
}

public(package) fun share<T>(cap: TreasuryCap<T>, amount: u64, ctx: &mut TxContext) {
    transfer::share_object(Faucet { id: object::new(ctx), cap, amount, last_claim: table::new(ctx) });
}

public fun claim<T>(faucet: &mut Faucet<T>, ctx: &mut TxContext): Coin<T> {
    let who = ctx.sender();
    let epoch = ctx.epoch();
    if (faucet.last_claim.contains(who)) {
        let last = faucet.last_claim.borrow_mut(who);
        assert!(*last < epoch, EAlreadyClaimed);
        *last = epoch;
    } else {
        faucet.last_claim.add(who, epoch);
    };
    coin::mint(&mut faucet.cap, faucet.amount, ctx)
}

public fun amount<T>(faucet: &Faucet<T>): u64 { faucet.amount }

#[test_only]
public fun new_for_testing<T>(cap: TreasuryCap<T>, amount: u64, ctx: &mut TxContext): Faucet<T> {
    Faucet { id: object::new(ctx), cap, amount, last_claim: table::new(ctx) }
}

#[test_only]
public fun share_for_testing<T>(f: Faucet<T>) { transfer::share_object(f) }

public fun total_supply<T>(faucet: &Faucet<T>): u64 { faucet.cap.total_supply() }
