# Bridge to Ethereum

The bridge will let assets move between Rivers and Ethereum. It is in development; the first target is the Ethereum Sepolia test network.

## Design

The Sui codebase includes a **native bridge**: a Move package on the chain, Solidity contracts on Ethereum, and a bridge node that validators run next to their validator. Rivers builds on this design rather than relying on a separate company to hold bridged funds.

- The bridge **committee** is the Rivers validator set. Each validator registers a secp256k1 bridge key on Rivers; the committee forms at the next epoch change, weighted by stake.
- **Ethereum to Rivers.** A user locks ETH in the bridge vault on Ethereum. The bridge nodes observe the deposit, sign an approval, and submit it to Rivers, where the bridged token is minted to the recipient once signatures from enough stake are present.
- **Rivers to Ethereum.** A user sends the bridged token to the bridge on Rivers, which burns it and records the transfer. The committee signs, and the ETH is released from the vault on Ethereum against those signatures.

## Safety controls

| Control | Purpose |
|---|---|
| Stake-weighted signatures | A transfer needs signatures from validators holding more than half of the bridge committee's stake on Ethereum, and the committee threshold on Rivers |
| Transfer limits | Each route has a limit per 24 hours in US dollars, enforced on both chains |
| Emergency pause | The committee can pause the bridge with signed messages on both chains |
| Replay protection | Each message carries a sequence number; each chain records the numbers it has processed |
| Blocklist | The committee can block a compromised member's key |

## Status

The release build now includes the bridge node and its command-line tool. The bridge contracts have been compiled and deployed to a local Ethereum test chain, and Rivers validators have registered bridge keys on a local Rivers network. The next steps are deployment to Sepolia, starting the bridge nodes on the testnet validators, registering bridged ETH on Rivers, and the Cross-chain page in Rivers Wallet.
