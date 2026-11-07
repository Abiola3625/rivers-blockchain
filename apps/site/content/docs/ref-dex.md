# DEX reference

Module `rivers_dex::pool`. A `Pool<A, B>` is a shared object holding reserves of `A` and `B`. One pool exists per ordered pair, recorded in the shared `Registry`.

## Functions

### create_pool

```move
public fun create_pool<A, B>(registry: &mut Registry, a: Coin<A>, b: Coin<B>, clock: &Clock, ctx: &mut TxContext): Coin<LP<A, B>>
```

Creates and shares a pool with the two coins as the first liquidity. Returns the LP coins. Aborts with `ESameType` if `A` and `B` are the same and `EPoolExists` if the pair already has a pool.

### add_liquidity

```move
public fun add_liquidity<A, B>(pool: &mut Pool<A, B>, a: Coin<A>, b: Coin<B>, min_lp: u64, clock: &Clock, ctx: &mut TxContext): (Coin<LP<A, B>>, Coin<A>, Coin<B>)
```

Adds liquidity in the pool's current ratio and returns the LP coins and any unused part of each coin. Aborts with `ESlippage` if fewer than `min_lp` LP coins would be minted.

### remove_liquidity

```move
public fun remove_liquidity<A, B>(pool: &mut Pool<A, B>, lp: Coin<LP<A, B>>, min_a: u64, min_b: u64, clock: &Clock, ctx: &mut TxContext): (Coin<A>, Coin<B>)
```

Burns LP coins and returns the share of both reserves.

### swap_a_for_b, swap_b_for_a

```move
public fun swap_a_for_b<A, B>(pool: &mut Pool<A, B>, a: Coin<A>, min_out: u64, clock: &Clock, ctx: &mut TxContext): Coin<B>
public fun swap_b_for_a<A, B>(pool: &mut Pool<A, B>, b: Coin<B>, min_out: u64, clock: &Clock, ctx: &mut TxContext): Coin<A>
```

Swaps the whole input coin. Aborts with `ESlippage` if the output is below `min_out`.

### amount_out

```move
public fun amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64, fee_bps: u64): u64
```

The output of a swap for given reserves, the same formula the pool uses.

### cumulative_prices

```move
public fun cumulative_prices<A, B>(pool: &Pool<A, B>, clock: &Clock): (u256, u256)
```

Running totals of the price of `A` in `B` and of `B` in `A`, each multiplied by milliseconds and scaled by `price_scale()` (10^18), as of now. Read twice and divide the difference by the time between readings to get an average price.

### Views

| Function | Returns |
|---|---|
| `reserves(pool)` | `(u64, u64)` reserves of A and B |
| `lp_supply(pool)` | LP coins in existence |
| `fee_bps(pool)` | Swap fee, 30 |
| `price_scale()` | 10^18 |

## Events

| Event | Fields |
|---|---|
| `PoolCreated` | `pool`, `type_a`, `type_b`, `amount_a`, `amount_b`, `creator` |
| `Swapped` | `pool`, `a_to_b`, `amount_in`, `amount_out`, `reserve_a`, `reserve_b`, `trader` |
| `LiquidityChanged` | `pool`, `added`, `amount_a`, `amount_b`, `lp`, `reserve_a`, `reserve_b`, `provider` |

## Abort codes

| Code | Name | Meaning |
|---|---|---|
| 1 | `EZeroAmount` | An amount is zero |
| 2 | `EPoolExists` | The pair already has a pool |
| 3 | `ESlippage` | The result is below the minimum you set |
| 4 | `ESameType` | Both coins are the same type |
| 5 | `ENotEnoughLiquidity` | The pool cannot pay this amount |
