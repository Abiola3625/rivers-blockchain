# Lend reference

Module `rivers_dex::lend`. A `Market<C, D>` is a shared object that accepts collateral `C` and lends `D`, valued by one DEX pool of the same pair.

## Types

| Type | Description |
|---|---|
| `Market<C, D>` | The market: cash, collateral, positions, parameters, price observations |
| `Share<C, D>` | Supplier share coin, used as `Coin<Share<C, D>>` |
| `LendAdminCap` | Administrator capability |

## Supplier functions

```move
public fun supply<C, D>(m: &mut Market<C, D>, c: Coin<D>, clock: &Clock, ctx: &mut TxContext): Coin<Share<C, D>>
public fun withdraw<C, D>(m: &mut Market<C, D>, s: Coin<Share<C, D>>, clock: &Clock, ctx: &mut TxContext): Coin<D>
```

## Borrower functions

```move
public fun deposit_collateral<C, D>(m: &mut Market<C, D>, c: Coin<C>, ctx: &TxContext)
public fun borrow<C, D, A, B>(m: &mut Market<C, D>, pool: &Pool<A, B>, amount: u64, clock: &Clock, ctx: &mut TxContext): Coin<D>
public fun repay<C, D>(m: &mut Market<C, D>, borrower: address, c: Coin<D>, clock: &Clock, ctx: &mut TxContext): Coin<D>
public fun withdraw_collateral<C, D, A, B>(m: &mut Market<C, D>, pool: &Pool<A, B>, amount: u64, clock: &Clock, ctx: &mut TxContext): Coin<C>
public fun close_position<C, D>(m: &mut Market<C, D>, ctx: &TxContext)
```

`A` and `B` are the type arguments of the market's pool, in the pool's order. `repay` returns any part of the coin above the debt. Anyone may repay for any borrower.

## Liquidation

```move
public fun liquidate<C, D, A, B>(m: &mut Market<C, D>, pool: &Pool<A, B>, borrower: address, c: Coin<D>, clock: &Clock, ctx: &mut TxContext): (Coin<C>, Coin<D>)
```

Repays up to half of an unhealthy position's debt and returns the seized collateral and the unused part of `c`.

## Prices

```move
public fun observe<C, D, A, B>(m: &mut Market<C, D>, pool: &Pool<A, B>, clock: &Clock)
public fun twap<C, D, A, B>(m: &Market<C, D>, pool: &Pool<A, B>, clock: &Clock): u256
```

`observe` records the pool's price total, at most once a minute. `twap` returns the price of one base unit of `C` in base units of `D`, scaled by 10^18.

## Views

| Function | Returns |
|---|---|
| `position(m, who)` | `(collateral, debt)` |
| `utilization_bps(m)` | Share of supplied value lent out |
| `borrow_rate_bps(m)` | Yearly borrow rate at current utilization |
| `supplied_value(m)` | Cash plus debt minus reserves |

## Administration

```move
public fun create_market_ab<C, D>(cap: &LendAdminCap, pool: &Pool<C, D>, clock: &Clock, ctx: &mut TxContext)
public fun create_market_ba<C, D>(cap: &LendAdminCap, pool: &Pool<D, C>, clock: &Clock, ctx: &mut TxContext)
public fun set_params<C, D>(cap: &LendAdminCap, m: &mut Market<C, D>, ltv: u64, liq: u64, bonus: u64, rf: u64, base: u64, s1: u64, s2: u64, kink: u64, tmin: u64, tmax: u64, clock: &Clock)
public fun set_paused<C, D>(cap: &LendAdminCap, m: &mut Market<C, D>, paused: bool)
public fun take_reserves<C, D>(cap: &LendAdminCap, m: &mut Market<C, D>, clock: &Clock, ctx: &mut TxContext): Coin<D>
```

Parameters are in basis points (rates) and milliseconds (price window and age), and are checked against the bounds in the [whitepaper](../whitepaper/finance.html#borrowers).

## Events

`MarketCreated`, `Supplied`, `Withdrawn`, `CollateralChanged`, `Borrowed`, `Repaid`, `Liquidated`.

## Abort codes

| Code | Name | Meaning |
|---|---|---|
| 1 | `EPaused` | Borrowing is paused |
| 2 | `EZeroAmount` | An amount is zero |
| 3 | `ENoPosition` | No position for this address |
| 4 | `EUnhealthy` | Above the borrowing limit |
| 5 | `EHealthy` | The position is healthy and cannot be liquidated |
| 6 | `ENotEnoughLiquidity` | The market does not hold enough coins |
| 7 | `EBadParams` | A setting is outside its bounds |
| 8 | `EStalePrice` | The average price is missing or too old |
| 9 | `EWrongPool` | The pool is not the market's pool |
| 10 | `ETooMuchRepaid` | The repayment is larger than the debt |
| 11 | `EDebtRemaining` | The position still has debt or collateral |
| 12 | `ENotEnoughCollateral` | Not that much collateral in the position |
