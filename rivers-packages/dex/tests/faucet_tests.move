// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module rivers_dex::faucet_tests;

use rivers_dex::test_faucet;
use sui::coin;
use sui::test_scenario as ts;

public struct Z has drop {}

#[test, expected_failure(abort_code = test_faucet::EAlreadyClaimed)]
fun one_claim_per_epoch() {
    let mut s = ts::begin(@0xA);
    let mut f = test_faucet::new_for_testing(coin::create_treasury_cap_for_testing<Z>(s.ctx()), 50, s.ctx());
    let c1 = test_faucet::claim(&mut f, s.ctx());
    assert!(c1.value() == 50);
    coin::burn_for_testing(c1);
    let c2 = test_faucet::claim(&mut f, s.ctx());
    coin::burn_for_testing(c2);
    test_faucet::share_for_testing(f);
    s.end();
}
