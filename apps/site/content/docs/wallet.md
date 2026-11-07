# Rivers Wallet

Rivers Wallet is a self-custody wallet that runs in the browser. Your keys stay on your device.

## Pages

| Page | What you can do |
|---|---|
| Home | See balances in RVRB and naira, send, receive, get test RVRB, claim vesting |
| Swap | Exchange RVRB, USDs, NGNs and launched tokens through Rivers DEX |
| Create token | Launch a token with Token Studio |
| Stake | Delegate RVRB to a validator and follow rewards |
| Pools | Add and remove liquidity and earn the 0.30% swap fee |
| Activity | Every transaction of this wallet, filtered by sent, received or contract call |
| Security | Show recovery words, change password, set the automatic lock |
| Lend | Supply to earn interest, or borrow against collateral |
| Private | Shield, send privately and unshield |
| Chain check | Check on your own phone or computer that the newest checkpoint is final. No wallet needed |

## Chain check

The Chain check page confirms on your device that the chain is real and final, without trusting the node that serves the data. It works on phones, needs no wallet and no command line, and uses about 1 MB of data the first time and a few kilobytes after that.

The check does three things:

1. It downloads the newest checkpoint and the validators' combined BLS signature.
2. It confirms that validators holding more than two thirds of the voting power signed that checkpoint. On a mid-range phone this takes well under a second.
3. When the validator set changes at the end of an epoch, it reads the last checkpoint of that epoch. The outgoing validators sign it and it names the next validators, so the device follows each change with signatures only.

The home page shows **Chain verified on this device** when the latest check passed.

> **Important:** The first check trusts the validator set that the node reports. Compare the checkpoint number once with Rivers Scan or a second node. Balances and history on the other pages still come from the node: a dishonest node can hold back new data, but it cannot make a false checkpoint pass the check.

If the device has been offline for longer than the node keeps history, the page says so and offers **Start again from now**, which trusts the current validator set again.

The checker is `apps/wallet/src/chain-check.js`. It runs in a web worker and uses `@noble/curves` for BLS12-381.

## How your keys are stored

The wallet derives an Ed25519 key from your twelve words. It encrypts the words with a key made from your password (PBKDF2 with 250,000 rounds) and stores the result with AES-GCM in this browser only. When the wallet locks, the key is removed from memory.

## Automatic lock

The wallet locks after 15 minutes without activity by default. Change it to 5 minutes, 60 minutes or never on the Security page.

## Restore on another device

Choose **Restore**, type the twelve words and set a new password. Balances, stake, positions and private notes all come back, because they live on chain and your private address comes from the same key.

## Remove from a browser

Security → **Remove from this browser** deletes the encrypted wallet from that browser. Only the twelve words can bring it back.
