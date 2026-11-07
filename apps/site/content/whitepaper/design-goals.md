# Design goals

Every design decision in Rivers is measured against six goals.

## Security first

Funds must be safe even when parts of the system fail. In practice this means:

- users hold their own keys, and no service operated by Rivers can sign for them;
- every administrative power is a separate on-chain capability object, granted to a known address and visible to everyone;
- settings that affect user funds are checked against fixed bounds in the contract, so even an administrator cannot set an unsafe value;
- pausing a product never freezes withdrawals.

## Speed

Payments should feel instant. Rivers inherits Sui's design, in which transactions that touch unrelated objects execute in parallel and finality comes from a single consensus commit.

## Flexibility

Rivers supports many assets and many kinds of users: RVRB, stablecoins, tokens launched by anyone, and institutional payments, all through the same object model and the same transaction format.

## Modularity

Each product is an independent Move package and an independent website. A fault in one product does not reach another product's contracts or another site's keys. Packages communicate only through public functions and typed objects.

## Scalability

Throughput grows with parallel execution rather than with a faster single thread. Storage is paid for up front and most of the fee is returned when the data is deleted, so the state does not grow without cost.

## Openness

Anyone with enough stake can run a validator, anyone can delegate, anyone can read the ledger, and all source code is public.
