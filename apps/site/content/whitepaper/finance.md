# Exchange and lending

Two Move packages give Rivers its core financial tools: **Rivers DEX**, a constant-product exchange, and **Rivers Lend**, isolated lending markets that read prices from the exchange.

## Rivers DEX

### Pools

A pool `Pool<A, B>` holds reserves of two coin types. One pool exists per ordered pair, recorded in a shared registry. Liquidity providers deposit both coins and receive `LP<A, B>` coins that represent their share of the reserves.

### Pricing

Swaps follow the constant-product rule. For an input `x` against reserves `R_in` and `R_out`, with a fee of `f` basis points:

```text
x' = x × (10,000 − f)
out = (x' × R_out) / (R_in × 10,000 + x')
```

The fee is **30 basis points (0.30%)** and stays in the pool, so it accrues to liquidity providers. Every swap takes a minimum output that the trader sets, and the transaction fails if the result would be lower. This protects traders against price movement between signing and execution.

### Time-weighted prices

Each pool keeps two running totals, one per direction, of price multiplied by time:

```text
cumulative_A += (R_B × 10^18 / R_A) × milliseconds since the last update
```

The totals are updated before every change to the reserves, using the reserves as they were **before** the change. Anyone can read them with `cumulative_prices`. The average price between two readings is the difference of the totals divided by the time between them. A price that is pushed by a large trade inside one transaction is held for zero time and therefore has no weight in the average.

## Rivers Lend

### Isolated markets

Each market `Market<C, D>` accepts one collateral coin `C` and lends one coin `D`. Markets do not share collateral or liquidity, so a problem in one market cannot spread to another.

### Suppliers

Suppliers deposit `D` and receive `Share<C, D>` coins. A share's value is the market's supplied value divided by the number of shares:

```text
supplied value = cash + total debt − protocol reserves
```

As borrowers pay interest, the supplied value grows and each share is worth more. A supplier can withdraw at any time, up to the cash that is not lent out.

### Borrowers

Borrowers deposit `C` as collateral and borrow `D`. A position may borrow up to the **loan-to-value** limit of its collateral's value. If the debt grows above the **liquidation threshold**, anyone can repay up to half the debt and take collateral worth the repaid amount plus a **liquidation bonus**.

| Setting | Default | Bounds enforced on chain |
|---|---|---|
| Loan-to-value | 60% | above 0, below the threshold |
| Liquidation threshold | 75% | at most 95% |
| Liquidation bonus | 5% | at most 20%, and threshold × (1 + bonus) < 1 |
| Reserve factor | 10% | at most 50% |
| Price window | at least 10 minutes | at least 1 minute |
| Oldest usable price | 1 hour | at most 24 hours |

The bound `threshold × (1 + bonus) < 1` guarantees that every liquidation leaves a position better collateralized than before.

### Interest

The borrow rate follows the market's **utilization**, the share of supplied value that is lent out:

```text
utilization = debt / (cash − reserves + debt)
rate = base + slope₁ × u / kink                         when u ≤ kink
rate = base + slope₁ + slope₂ × (u − kink) / (1 − kink)  when u > kink
```

with defaults `base = 2%`, `slope₁ = 8%`, `slope₂ = 100%` and `kink = 80%` a year. Above the kink the rate rises steeply, which pulls utilization back down and keeps cash available for withdrawals. Interest accrues every millisecond through a borrow index; the reserve factor sends 10% of interest to protocol reserves.

### Prices

Collateral is valued with the time-weighted price of the market's own pool. A market records an observation of the pool's running total at most once a minute and keeps the latest 48. A keeper records observations every two minutes, and the wallet records one with every borrow. Borrowing uses the newest observation that is at least the price window old, and refuses to act if that observation is older than the oldest usable price.

### Pausing

The administrator can pause new borrowing in a market. Repaying, supplying, withdrawing supply and liquidation keep working, so no one's funds are frozen.
