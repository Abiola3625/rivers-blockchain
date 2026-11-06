// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// NGNs: testnet stablecoin with 6 decimals. It has no backing and no value. The treasury sits in
/// a shared faucet that gives 1,500,000 NGNs per address per epoch.
module rivers_dex::ngns;

use std::string;
use sui::coin;
use sui::coin_registry;
use rivers_dex::test_faucet;

public struct NGNS has drop {}

fun init(otw: NGNS, ctx: &mut TxContext) {
    let (builder, mut cap) = coin_registry::new_currency_with_otw(
        otw,
        6,
        string::utf8(b"NGNs"),
        string::utf8(b"Rivers Test Naira"),
        string::utf8(b"Testnet stablecoin for Rivers DEX. It has no backing and no value."),
        string::utf8(b""),
        ctx,
    );
    // The publisher receives 3,000,000,000 to seed Rivers DEX pools.
    transfer::public_transfer(coin::mint(&mut cap, 3000000000000000, ctx), ctx.sender());
    let metadata_cap = builder.finalize(ctx);
    transfer::public_transfer(metadata_cap, ctx.sender());
    test_faucet::share(cap, 1500000000000, ctx);
}
