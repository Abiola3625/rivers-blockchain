# Security

This chapter describes how Rivers protects users, the threats it considers, and how its code is reviewed.

## Keys

- **Users** create a wallet from twelve recovery words. Rivers Wallet encrypts the words on the device with a key derived from the user's password (PBKDF2 with 250,000 rounds) and AES-GCM. The wallet locks itself after a period without activity. Keys never leave the device.
- **Validators** hold separate protocol, network, worker and account keys, and a bridge key once the bridge is live.
- **Genesis wallets** for a public network are created by their owners on their own devices.

## Capabilities

Every administrative power is a separate on-chain object, held by a known address:

| Capability | Allows |
|---|---|
| Connect operator capability | Admitting, limiting, suspending and removing institutions; pausing institutional payments |
| Lend admin capability | Creating markets, pausing borrowing, changing risk settings within bounds, collecting reserves |
| Shield admin capability | Pausing shielded deposits, setting deposit limits |
| Vesting issuer capability | Revoking one revocable vesting schedule |
| Package upgrade capabilities | Publishing upgrades of a package |

No capability allows moving a user's coins.

## Threat model

| Threat | Mitigation |
|---|---|
| Stolen phone | Keys are encrypted with the password; the wallet locks itself |
| Malicious website imitating Rivers | Each product is its own site; users should check the address; the wallet never asks for recovery words except to restore |
| Price manipulation against lending | Time-weighted prices over at least 10 minutes; stale prices stop borrowing |
| Double spending a shielded note | Nullifiers recorded on chain |
| Changing a proof's recipient or amounts | External data hash computed by the contract |
| Administrator error | Bounded settings; pausing never freezes withdrawals |
| Compromised administrator key | Recommended: multi-signature wallet and a delay on risk changes before mainnet |
| Validator collusion | Byzantine fault tolerance up to one third of voting power; 10% cap per validator |

## Separate sites

Each product is its own website with its own address and a strict content security policy. A wallet stored by one site cannot be read by another. The administration interface is not linked from any public site, and it can do nothing without the administrator's key.

## Reviews and audits

The Rivers packages have automated tests that try to break each safety property — 15 for the exchange and lending, 9 for shielded payments using real proofs, 8 for vesting and 5 for Connect — and an internal security review published in the repository as `rivers-packages/AUDIT.md`. The review lists open findings and their status. An external audit is planned before mainnet.
