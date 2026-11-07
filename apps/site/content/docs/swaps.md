# Swaps and pools

## Swap

1. Open **Swap**.
2. Choose the coin you pay and the coin you receive.
3. Enter an amount. The page shows the expected amount, the 0.30% pool fee and the route.
4. Confirm. The swap includes the smallest amount you accept.

If the price moves so far that you would receive less, the swap fails and only the network fee is spent.

## How prices are set

Each pool holds two coins. The price is the ratio of the reserves, and every swap moves it. Large swaps against small pools move the price more. See the [pricing formula](../whitepaper/finance.html#pricing).

## Provide liquidity

1. Open **Pools** and choose a pool.
2. Enter the amounts of both coins. The page keeps them in the pool's current ratio.
3. Confirm. You receive LP coins for your share.

You earn the 0.30% fee on every swap in proportion to your share. When prices change, the mix of coins you can withdraw changes too, and you may end with less value than if you had held the coins.

## Remove liquidity

Choose **Remove** and the share to withdraw. You receive both coins in the pool's current ratio.

## Testnet pools

The testnet starts with three pools: RVRB/USDs, RVRB/NGNs and USDs/NGNs. Tokens launched with Token Studio can open their own pool against USDs.
