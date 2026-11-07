# Transactions

A transaction is a list of commands that run in order and either all succeed or all fail.

## Commands

| Command | Use |
|---|---|
| `splitCoins` | Make new coins of chosen amounts from one coin |
| `mergeCoins` | Combine coins of the same type |
| `transferObjects` | Send objects to an address |
| `moveCall` | Call a public Move function |
| `publish` | Publish a Move package |
| `makeMoveVec` | Build a vector of objects for a Move call |

## Use results of earlier commands

```js
const tx = new Transaction();
// Swap 100 RVRB for USDs, then send the USDs to a friend, in one transaction.
const usds = tx.moveCall({
  target: `${DEX}::pool::swap_a_for_b`,
  typeArguments: ['0x2::sui::SUI', USDS],
  arguments: [tx.object(POOL), tx.splitCoins(tx.gas, [100_000_000_000n])[0], tx.pure.u64(minOut), tx.object('0x6')],
});
tx.transferObjects([usds], FRIEND);
```

`DEX`, `USDS` and `POOL` come from the indexer's [/config](indexer-api.html#config). `0x6` is the shared clock object.

## Coins of other types

`coinWithBalance` finds and merges the sender's coins of a type and splits the exact amount:

```js
import { coinWithBalance } from '@mysten/sui/transactions';
const pay = coinWithBalance({ type: USDS, balance: 25_000_000n }); // 25 USDs
```

## Gas

The SDK estimates the gas budget by simulating the transaction. A transaction that aborts still pays for the computation it used.

## Reading the result

The result contains the transaction digest, its status and, if requested, effects, events and the types of changed objects. A failed Move call reports the module, function and abort code; see [Error codes](errors.html).
