// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// USDs: testnet stablecoin with 6 decimals. It has no backing and no value. The treasury sits in
/// a shared faucet that gives 1,000 USDs per address per epoch.
module rivers_dex::usds;

use std::string;
use sui::coin;
use sui::coin_registry;
use rivers_dex::test_faucet;

public struct USDS has drop {}

fun init(otw: USDS, ctx: &mut TxContext) {
    let (builder, mut cap) = coin_registry::new_currency_with_otw(
        otw,
        6,
        string::utf8(b"USDs"),
        string::utf8(b"Rivers Test Dollar"),
        string::utf8(b"Testnet stablecoin for Rivers DEX. It has no backing and no value."),
        string::utf8(b""),
        ctx,
    );
    // The publisher receives 2,000,000 to seed Rivers DEX pools.
    transfer::public_transfer(coin::mint(&mut cap, 2000000000000, ctx), ctx.sender());
    let metadata_cap = builder.finalize(ctx);
    transfer::public_transfer(metadata_cap, ctx.sender());
    test_faucet::share(cap, 1000000000, ctx);
}
