// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Coin<SUI> is RVRB, the native token of the Rivers blockchain. It pays for gas and secures the network through staking.
/// The type keeps the name SUI so that Sui tooling and the Move framework stay compatible.
/// It has 9 decimals, and the smallest unit (10^-9) is called a "drop" in Rivers interfaces ("mist" in code).
module sui::sui;

use sui::balance::Balance;
use sui::coin;

const EAlreadyMinted: u64 = 0;
/// Sender is not @0x0 the system address.
const ENotSystemAddress: u64 = 1;

#[allow(unused_const)]
/// The amount of Mist per Sui token based on the fact that mist is
/// 10^-9 of a Sui token
const MIST_PER_SUI: u64 = 1_000_000_000;

#[allow(unused_const)]
/// The maximum supply of RVRB in whole tokens (21 million).
/// 10 million exist at genesis and 11 million are paid out as staking rewards over 50 years.
const TOTAL_SUPPLY_SUI: u64 = 21_000_000;

/// The maximum supply of RVRB denominated in Mist (21 million * 10^9)
const TOTAL_SUPPLY_MIST: u64 = 21_000_000_000_000_000;

/// Name of the coin
public struct SUI has drop {}

#[allow(unused_function, deprecated_usage)]
/// Register the `SUI` Coin to acquire its `Supply`.
/// This should be called only once during genesis creation.
fun new(ctx: &mut TxContext): Balance<SUI> {
    assert!(ctx.sender() == @0x0, ENotSystemAddress);
    assert!(ctx.epoch() == 0, EAlreadyMinted);

    let (treasury, metadata) = coin::create_currency(
        SUI {},
        9,
        b"RVRB",
        b"Rivers",
        b"Native token of the Rivers blockchain",
        option::none(),
        ctx,
    );
    transfer::public_freeze_object(metadata);
    let mut supply = treasury.treasury_into_supply();
    let total_sui = supply.increase_supply(TOTAL_SUPPLY_MIST);
    let _ = supply.destroy_supply();
    total_sui
}

#[allow(lint(public_entry))]
public entry fun transfer(c: coin::Coin<SUI>, recipient: address) {
    transfer::public_transfer(c, recipient)
}
