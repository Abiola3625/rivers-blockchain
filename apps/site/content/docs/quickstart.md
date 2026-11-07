# Quickstart

This page takes you from nothing to your first transaction in a few minutes.

## 1. Create a wallet

1. Open Rivers Wallet and choose **Create**.
2. Write the twelve recovery words on paper, in order. Anyone with these words controls the wallet.
3. Choose a password. It encrypts the words on this device only. Rivers cannot reset it.

> **Warning:** Rivers will never ask for your recovery words. Type them only into Rivers Wallet's restore screen.

## 2. Get test RVRB

On the portfolio page, press **Test RVRB**. The faucet sends 50 RVRB. Test tokens have no value.

## 3. Send a payment

Press **Send**, paste the receiver's address, enter an amount and confirm. The payment appears in Rivers Scan's live view a moment later.

## 4. Try more

- Swap RVRB for USDs or NGNs on the **Swap** page.
- Stake with a validator on the **Stake** page.
- Shield coins and send them privately on the **Private** page.

## For developers

```bash
npm install @mysten/sui
```

```js
import { SuiGrpcClient } from '@mysten/sui/grpc';

const client = new SuiGrpcClient({ network: 'testnet', baseUrl: 'https://psychic-guide-xvpv4rvg4pjhw54-9000.app.github.dev' });
const { balance } = await client.getBalance({ owner: '0x…' });
console.log(Number(balance.balance) / 1e9, 'RVRB');
```

Continue with the [TypeScript SDK](sdk.html).
