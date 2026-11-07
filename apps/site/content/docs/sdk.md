# TypeScript SDK

Rivers works with the Sui TypeScript SDK, `@mysten/sui`. The Rivers websites use version 2.

## Install

```bash
npm install @mysten/sui
```

## Connect

Rivers nodes speak gRPC. In the browser the SDK uses gRPC-Web automatically.

```js
import { SuiGrpcClient } from '@mysten/sui/grpc';

export const client = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://psychic-guide-xvpv4rvg4pjhw54-9000.app.github.dev',
});
```

## Keys

```js
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const keypair = Ed25519Keypair.deriveKeypair('twelve recovery words …');
console.log(keypair.toSuiAddress());
```

Never put a real recovery phrase in source code.

## Get test RVRB

```js
await fetch('https://psychic-guide-xvpv4rvg4pjhw54-9123.app.github.dev/v2/gas', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ FixedAmountRequest: { recipient: keypair.toSuiAddress() } }),
});
```

## Send RVRB

```js
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [1_000_000_000n]); // 1 RVRB
tx.transferObjects([coin], '0xRECEIVER');

const result = await client.signAndExecuteTransaction({ transaction: tx, signer: keypair, include: { effects: true } });
const done = result.Transaction || result.FailedTransaction;
console.log(done.status.success, done.digest);
```

## Units

| Coin | Decimals | 1 unit in base units |
|---|---|---|
| RVRB | 9 | 1,000,000,000 drops |
| USDs | 6 | 1,000,000 |
| NGNs | 6 | 1,000,000 |

Use `BigInt` for amounts: balances can exceed the safe range of JavaScript numbers.
