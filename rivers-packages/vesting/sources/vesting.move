// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Token vesting for Rivers investors, team members and grant recipients.
///
/// An issuer locks coins of any type (RVRB or a Token Studio token) in a shared `Vesting` object.
/// The coins unlock on a schedule:
/// - an optional amount unlocks at the start (`immediate_bps` of the total),
/// - nothing more unlocks before the cliff,
/// - the rest unlocks linearly from the start until `start + duration`,
///   so at the cliff the beneficiary receives everything accrued since the start.
///
/// The beneficiary claims unlocked coins at any time. The issuer holds an `IssuerCap` and can
/// revoke a revocable schedule: the unlocked part stays claimable by the beneficiary and the locked
/// part returns to the issuer.
module rivers_vesting::vesting;

use std::string::String;
use sui::balance::Balance;
use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::event;

const BPS: u64 = 10_000;

const ENotBeneficiary: u64 = 0;
const ENotRevocable: u64 = 1;
const EWrongSchedule: u64 = 2;
const EZeroAmount: u64 = 3;
const EInvalidSchedule: u64 = 4;
const ENothingToClaim: u64 = 5;
const EAlreadyRevoked: u64 = 6;
const ELengthMismatch: u64 = 7;
const EAmountMismatch: u64 = 8;

/// Gives its owner the right to revoke one schedule.
public struct IssuerCap has key, store {
    id: UID,
    schedule: ID,
}

public struct Vesting<phantom T> has key {
    id: UID,
    label: String,
    issuer: address,
    beneficiary: address,
    balance: Balance<T>,
    total: u64,
    claimed: u64,
    immediate_bps: u64,
    start_ms: u64,
    cliff_ms: u64,
    duration_ms: u64,
    revocable: bool,
    revoked: bool,
}

public struct VestingCreated has copy, drop {
    schedule: ID,
    label: String,
    issuer: address,
    beneficiary: address,
    total: u64,
    immediate_bps: u64,
    start_ms: u64,
    cliff_ms: u64,
    duration_ms: u64,
    revocable: bool,
}

public struct VestingClaimed has copy, drop {
    schedule: ID,
    beneficiary: address,
    amount: u64,
    claimed: u64,
}

public struct VestingRevoked has copy, drop {
    schedule: ID,
    returned: u64,
    kept_for_beneficiary: u64,
}

public struct BeneficiaryChanged has copy, drop {
    schedule: ID,
    from: address,
    to: address,
}

/// Locks `coin` in a new schedule and returns the cap that can revoke it.
/// `start_ms` of 0 means the current time. `cliff_ms` and `duration_ms` count from the start.
public fun create<T>(
    coin: Coin<T>,
    label: String,
    beneficiary: address,
    start_ms: u64,
    cliff_ms: u64,
    duration_ms: u64,
    immediate_bps: u64,
    revocable: bool,
    clock: &Clock,
    ctx: &mut TxContext,
): IssuerCap {
    let total = coin.value();
    assert!(total > 0, EZeroAmount);
    assert!(duration_ms > 0 && cliff_ms <= duration_ms && immediate_bps <= BPS, EInvalidSchedule);
    let start_ms = if (start_ms == 0) clock.timestamp_ms() else start_ms;

    let vesting = Vesting<T> {
        id: object::new(ctx),
        label,
        issuer: ctx.sender(),
        beneficiary,
        balance: coin.into_balance(),
        total,
        claimed: 0,
        immediate_bps,
        start_ms,
        cliff_ms,
        duration_ms,
        revocable,
        revoked: false,
    };
    let schedule = object::id(&vesting);
    event::emit(VestingCreated {
        schedule,
        label,
        issuer: ctx.sender(),
        beneficiary,
        total,
        immediate_bps,
        start_ms,
        cliff_ms,
        duration_ms,
        revocable,
    });
    transfer::share_object(vesting);
    IssuerCap { id: object::new(ctx), schedule }
}

/// Creates one schedule and sends its cap to the sender.
entry fun issue<T>(
    coin: Coin<T>,
    label: String,
    beneficiary: address,
    start_ms: u64,
    cliff_ms: u64,
    duration_ms: u64,
    immediate_bps: u64,
    revocable: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let cap = create(
        coin,
        label,
        beneficiary,
        start_ms,
        cliff_ms,
        duration_ms,
        immediate_bps,
        revocable,
        clock,
        ctx,
    );
    transfer::public_transfer(cap, ctx.sender());
}

/// Creates one schedule per beneficiary with the same terms, in one transaction.
/// `coin` must hold exactly the sum of `amounts`.
entry fun issue_many<T>(
    mut coin: Coin<T>,
    label: String,
    beneficiaries: vector<address>,
    amounts: vector<u64>,
    start_ms: u64,
    cliff_ms: u64,
    duration_ms: u64,
    immediate_bps: u64,
    revocable: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let n = beneficiaries.length();
    assert!(n > 0 && n == amounts.length(), ELengthMismatch);
    let mut sum = 0;
    amounts.do_ref!(|a| sum = sum + *a);
    assert!(sum == coin.value(), EAmountMismatch);

    let mut i = 0;
    while (i < n) {
        let part = coin.split(amounts[i], ctx);
        let cap = create(
            part,
            label,
            beneficiaries[i],
            start_ms,
            cliff_ms,
            duration_ms,
            immediate_bps,
            revocable,
            clock,
            ctx,
        );
        transfer::public_transfer(cap, ctx.sender());
        i = i + 1;
    };
    coin.destroy_zero();
}

/// Sends every unlocked coin that has not been claimed to the beneficiary.
public fun claim<T>(self: &mut Vesting<T>, clock: &Clock, ctx: &mut TxContext): Coin<T> {
    assert!(ctx.sender() == self.beneficiary, ENotBeneficiary);
    let amount = claimable(self, clock);
    assert!(amount > 0, ENothingToClaim);
    self.claimed = self.claimed + amount;
    event::emit(VestingClaimed {
        schedule: object::id(self),
        beneficiary: self.beneficiary,
        amount,
        claimed: self.claimed,
    });
    coin::take(&mut self.balance, amount, ctx)
}

entry fun claim_to_sender<T>(self: &mut Vesting<T>, clock: &Clock, ctx: &mut TxContext) {
    let coin = claim(self, clock, ctx);
    transfer::public_transfer(coin, ctx.sender());
}

/// Stops a revocable schedule. The locked part returns to the caller. The part that has
/// already unlocked stays in the schedule for the beneficiary to claim.
public fun revoke<T>(
    self: &mut Vesting<T>,
    cap: &IssuerCap,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<T> {
    assert!(cap.schedule == object::id(self), EWrongSchedule);
    assert!(self.revocable, ENotRevocable);
    assert!(!self.revoked, EAlreadyRevoked);
    let unlocked = vested_amount(self, clock);
    let returned = self.total - unlocked;
    self.total = unlocked;
    self.revoked = true;
    event::emit(VestingRevoked {
        schedule: object::id(self),
        returned,
        kept_for_beneficiary: unlocked - self.claimed,
    });
    coin::take(&mut self.balance, returned, ctx)
}

entry fun revoke_to_sender<T>(
    self: &mut Vesting<T>,
    cap: &IssuerCap,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let coin = revoke(self, cap, clock, ctx);
    transfer::public_transfer(coin, ctx.sender());
}

/// Lets the beneficiary move the schedule to a new address, for example a new wallet.
entry fun change_beneficiary<T>(self: &mut Vesting<T>, to: address, ctx: &TxContext) {
    assert!(ctx.sender() == self.beneficiary, ENotBeneficiary);
    event::emit(BeneficiaryChanged { schedule: object::id(self), from: self.beneficiary, to });
    self.beneficiary = to;
}

/// The amount unlocked so far, claimed or not.
public fun vested_amount<T>(self: &Vesting<T>, clock: &Clock): u64 {
    if (self.revoked) return self.total;
    let now = clock.timestamp_ms();
    if (now < self.start_ms) return 0;
    let elapsed = now - self.start_ms;
    let immediate = mul_div(self.total, self.immediate_bps, BPS);
    if (elapsed >= self.duration_ms) return self.total;
    if (elapsed < self.cliff_ms) return immediate;
    immediate + mul_div(self.total - immediate, elapsed, self.duration_ms)
}

public fun claimable<T>(self: &Vesting<T>, clock: &Clock): u64 {
    vested_amount(self, clock) - self.claimed
}

public fun beneficiary<T>(self: &Vesting<T>): address { self.beneficiary }

public fun issuer<T>(self: &Vesting<T>): address { self.issuer }

public fun total<T>(self: &Vesting<T>): u64 { self.total }

public fun claimed<T>(self: &Vesting<T>): u64 { self.claimed }

public fun locked_balance<T>(self: &Vesting<T>): u64 { self.balance.value() }

public fun is_revoked<T>(self: &Vesting<T>): bool { self.revoked }

public fun cap_schedule(cap: &IssuerCap): ID { cap.schedule }

fun mul_div(a: u64, b: u64, c: u64): u64 {
    ((a as u128) * (b as u128) / (c as u128)) as u64
}
