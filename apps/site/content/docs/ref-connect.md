# Connect reference

Module `rivers_connect::network`. The shared `Network` object holds the member table; the `OperatorCap` administers it.

## pay

```move
public fun pay<T>(net: &mut Network, payment: Coin<T>, to: address, reference: String, purpose: String, ctx: &TxContext)
```

Sends `payment` from the sender institution to the institution at `to`. `reference` is at most 35 characters, `purpose` at most 4.

## Operator functions

```move
public fun register(cap: &OperatorCap, net: &mut Network, institution: address, name: String, city: String, country: String, tier: u8, payment_limit: u64, ctx: &TxContext)
public fun set_limit(cap: &OperatorCap, net: &mut Network, institution: address, payment_limit: u64)
public fun set_active(cap: &OperatorCap, net: &mut Network, institution: address, active: bool)
public fun remove(cap: &OperatorCap, net: &mut Network, institution: address)
public fun set_paused(cap: &OperatorCap, net: &mut Network, paused: bool)
```

A `payment_limit` of 0 means no limit. Name is at most 80 characters, city and country at most 60.

## Views

| Function | Returns |
|---|---|
| `is_active(net, address)` | Member and active |
| `institution(net, address)` | The member record |
| `members(net)` | All member addresses |
| `paused(net)` | Whether payments are paused |
| `payment_count(net)` | Payments so far |

## Events

| Event | Fields |
|---|---|
| `Payment` | `number`, `from`, `to`, `coin_type`, `amount`, `reference`, `purpose` |
| `InstitutionChanged` | `institution`, `name`, `action`, `active`, `payment_limit` |
| `PausedChanged` | `paused` |

## Abort codes

| Code | Name | Meaning |
|---|---|---|
| 1 | `ENotRegistered` | Sender or receiver is not a member |
| 2 | `ESuspended` | Sender or receiver is suspended |
| 3 | `EOverLimit` | Above the sender's payment limit |
| 4 | `EPaused` | Payments are paused |
| 5 | `EAlreadyRegistered` | Already a member |
| 6 | `EZeroAmount` | Amount is zero |
| 7 | `EFieldTooLong` | A text field is too long |
