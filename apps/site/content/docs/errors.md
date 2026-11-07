# Error codes

When a Move function aborts, the transaction fails with the module, the function and an abort code. The transaction still pays for the computation it used.

| Package | Codes |
|---|---|
| DEX `pool` | [1–5](ref-dex.html#abort-codes) |
| Lend `lend` | [1–12](ref-lend.html#abort-codes) |
| Shield `shield` | [1–8](ref-shield.html#abort-codes) |
| Connect `network` | [1–7](ref-connect.html#abort-codes) |
| Vesting `vesting` | [0–8](ref-vesting.html#abort-codes) |
| Faucet `test_faucet` | already claimed this epoch |

## Common framework errors

| Error | Meaning |
|---|---|
| `InsufficientGas` | The gas budget or the gas coin is too small |
| `InsufficientCoinBalance` | A coin is smaller than the amount split from it |
| Object version mismatch | The object changed since it was read; fetch it again and retry |
| `MoveAbort` in `0x2::balance` | A balance would go below zero |

## Reading an abort in TypeScript

```js
const done = result.Transaction || result.FailedTransaction;
if (!done.status.success) console.log(done.status.error); // includes module, function and code
```

Rivers apps translate these codes into plain messages for users.
