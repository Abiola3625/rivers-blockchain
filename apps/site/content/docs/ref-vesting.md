# Vesting reference

Module `rivers_vesting::vesting`. A `Vesting<T>` is a shared object that locks coins for one beneficiary. The issuer receives an `IssuerCap` for the schedule.

## Schedule

```text
immediate = total × immediate_bps / 10,000
before start:                 0
from start until the cliff:   immediate
after the cliff:              immediate + (total − immediate) × elapsed / duration
after start + duration:       total
```

`cliff_ms` and `duration_ms` are measured from `start_ms`. A `start_ms` of 0 means now.

## Create

```move
public fun create<T>(coin: Coin<T>, label: String, beneficiary: address, start_ms: u64, cliff_ms: u64, duration_ms: u64, immediate_bps: u64, revocable: bool, clock: &Clock, ctx: &mut TxContext): IssuerCap
entry fun issue<T>(/* same arguments */)       // sends the IssuerCap to the sender
entry fun issue_many<T>(/* one schedule per beneficiary, same terms */)
```

## Beneficiary

```move
public fun claim<T>(self: &mut Vesting<T>, clock: &Clock, ctx: &mut TxContext): Coin<T>
entry fun claim_to_sender<T>(self: &mut Vesting<T>, clock: &Clock, ctx: &mut TxContext)
entry fun change_beneficiary<T>(self: &mut Vesting<T>, to: address, ctx: &TxContext)
```

## Issuer

```move
public fun revoke<T>(self: &mut Vesting<T>, cap: &IssuerCap, clock: &Clock, ctx: &mut TxContext): Coin<T>
entry fun revoke_to_sender<T>(/* … */)
```

Revoking returns the locked part to the issuer. What had unlocked stays claimable by the beneficiary.

## Views

`vested_amount`, `claimable`, `beneficiary`, `issuer`, `total`, `claimed`, `locked_balance`, `is_revoked`, `cap_schedule`.

## Events

`VestingCreated`, `VestingClaimed`, `VestingRevoked`, `BeneficiaryChanged`.

## Abort codes

| Code | Name | Meaning |
|---|---|---|
| 0 | `ENotBeneficiary` | Only the beneficiary may do this |
| 1 | `ENotRevocable` | The schedule cannot be revoked |
| 2 | `EWrongSchedule` | The capability belongs to another schedule |
| 3 | `EZeroAmount` | Amount is zero |
| 4 | `EInvalidSchedule` | Duration is zero, the cliff is after the end, or the immediate share is above 100% |
| 5 | `ENothingToClaim` | Nothing is unlocked yet |
| 6 | `EAlreadyRevoked` | Already revoked |
| 7 | `ELengthMismatch` | Lists of different lengths in `issue_many` |
| 8 | `EAmountMismatch` | The coin does not equal the sum of amounts |
