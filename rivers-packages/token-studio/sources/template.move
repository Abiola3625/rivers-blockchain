// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Token Studio template. Rivers Scan copies this compiled module, renames `template` and `TEMPLATE`
/// to the token's symbol, replaces the constants below with the creator's choices and publishes it.
/// The constant values are placeholders that the patcher looks up by value, so each one is unique.
module template::template;

use std::string;
use sui::coin::{Self, Coin, TreasuryCap};
use sui::coin_registry;

public struct TEMPLATE has drop {}

/// Holds the treasury of a mintable token. The creator mints with `AdminCap`; anyone burns their own
/// tokens when burning is allowed.
public struct Controls has key {
    id: UID,
    cap: TreasuryCap<TEMPLATE>,
    max_supply: u64,
    burnable: bool,
}

public struct AdminCap has key, store { id: UID }

const DECIMALS: u8 = 9;
const SYMBOL: vector<u8> = b"TMPLSYMB";
const NAME: vector<u8> = b"Token Studio template name";
const DESCRIPTION: vector<u8> = b"Token Studio template description";
const INITIAL_SUPPLY: u64 = 1000000000000000001;
/// Zero means no maximum.
const MAX_SUPPLY: u64 = 1000000000000000002;
/// Bit 0: mintable. Bit 1: burnable. Bit 2: regulated (pause and freeze).
const FLAGS: u8 = 200;

const EMaxSupply: u64 = 1;
const ENotBurnable: u64 = 2;

fun init(otw: TEMPLATE, ctx: &mut TxContext) {
    let sender = ctx.sender();
    let (mut builder, mut cap) = coin_registry::new_currency_with_otw(
        otw,
        DECIMALS,
        string::utf8(SYMBOL),
        string::utf8(NAME),
        string::utf8(DESCRIPTION),
        string::utf8(b""),
        ctx,
    );
    if (FLAGS & 4 != 0) {
        let deny_cap = builder.make_regulated(true, ctx);
        transfer::public_transfer(deny_cap, sender);
    };
    if (INITIAL_SUPPLY > 0) {
        transfer::public_transfer(coin::mint(&mut cap, INITIAL_SUPPLY, ctx), sender);
    };
    let mintable = FLAGS & 1 != 0;
    let burnable = FLAGS & 2 != 0;
    if (!mintable && !burnable) {
        builder.make_supply_fixed(cap);
    } else if (!mintable) {
        builder.make_supply_burn_only(cap);
    } else {
        transfer::share_object(Controls { id: object::new(ctx), cap, max_supply: MAX_SUPPLY, burnable });
        transfer::public_transfer(AdminCap { id: object::new(ctx) }, sender);
    };
    let metadata_cap = builder.finalize(ctx);
    transfer::public_transfer(metadata_cap, sender);
}

public fun mint(
    controls: &mut Controls,
    _: &AdminCap,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    let max = controls.max_supply;
    assert!(max == 0 || controls.cap.total_supply() + amount <= max, EMaxSupply);
    transfer::public_transfer(coin::mint(&mut controls.cap, amount, ctx), recipient);
}

public fun burn(controls: &mut Controls, c: Coin<TEMPLATE>) {
    assert!(controls.burnable, ENotBurnable);
    coin::burn(&mut controls.cap, c);
}

public fun total_supply(controls: &Controls): u64 { controls.cap.total_supply() }

public fun max_supply(controls: &Controls): u64 { controls.max_supply }
