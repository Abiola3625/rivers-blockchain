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

## How your keys are stored

The wallet derives an Ed25519 key from your twelve words. It encrypts the words with a key made from your password (PBKDF2 with 250,000 rounds) and stores the result with AES-GCM in this browser only. When the wallet locks, the key is removed from memory.

## Automatic lock

The wallet locks after 15 minutes without activity by default. Change it to 5 minutes, 60 minutes or never on the Security page.

## Restore on another device

Choose **Restore**, type the twelve words and set a new password. Balances, stake, positions and private notes all come back, because they live on chain and your private address comes from the same key.

## Remove from a browser

Security → **Remove from this browser** deletes the encrypted wallet from that browser. Only the twelve words can bring it back.
