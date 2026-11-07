# Test stablecoins

The testnet has two stablecoins for building and testing. They have **no backing and no value**.

| Coin | Type | Decimals | Faucet amount |
|---|---|---|---|
| USDs | `<dex package>::usds::USDS` | 6 | 1,000 USDs |
| NGNs | `<dex package>::ngns::NGNS` | 6 | 1,500,000 NGNs |

## Faucet

Module `rivers_dex::test_faucet`. Each coin has a shared `Faucet<T>`. An address can claim once per epoch.

```move
public fun claim<T>(faucet: &mut Faucet<T>, ctx: &mut TxContext): Coin<T>
```

```js
const c = tx.moveCall({ target: `${DEX}::test_faucet::claim`, typeArguments: [USDS], arguments: [tx.object(USDS_FAUCET)] });
tx.transferObjects([c], me);
```

The faucet addresses are in [/config](indexer-api.html#config) under `faucets`.

## Pools and markets

The testnet setup creates the pools RVRB/USDs, RVRB/NGNs and USDs/NGNs, and the lending markets "RVRB→USDs" (RVRB collateral, USDs loans) and "USDs→RVRB".
