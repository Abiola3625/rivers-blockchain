# Shielded payments

Public ledgers show every amount and every counterparty. Rivers **shielded payments** let a person move value without showing the amount, the sender or the receiver, while the chain still checks that every payment is valid.

## Model

Each shielded pool `Pool<T>` holds coins of one type. Inside the pool, ownership is recorded as **notes**. A note is a commitment:

```text
commitment = Poseidon(amount, owner_public_key, blinding)
owner_public_key = Poseidon(owner_private_key)
```

Commitments are stored as leaves of an append-only Merkle tree of depth 20 (about one million notes per pool), built with the Poseidon hash on the BN254 curve.

A single operation, `transact`, can:

- **shield**: take a public deposit and create notes;
- **send privately**: spend notes and create new notes for someone else, with no public amount;
- **unshield**: spend notes and pay coins to a public address.

## The proof

Every `transact` carries a **Groth16** zero-knowledge proof of a circuit with two inputs and two outputs. The proof shows, without revealing which notes are spent:

1. each spent note with a non-zero amount is in the tree under a recent root;
2. the spender knows the private key of each spent note;
3. each published **nullifier** is derived from its note and its position;
4. the two nullifiers differ;
5. every amount fits in 248 bits, so sums cannot wrap around the field;
6. inputs plus the public amount equal outputs.

The nullifier is

```text
nullifier = Poseidon(commitment, index, Poseidon(private_key, commitment, index))
```

so only the owner can compute it, and each note has exactly one nullifier. The contract stores every nullifier it sees and rejects a second spend.

## Binding the proof

The public inputs include an **external data hash**: a SHA-256 hash of the pool's id, the recipient, the deposit, the withdrawal and both encrypted notes, reduced into the field. The contract computes this hash itself. A proof therefore cannot be replayed in another pool, sent to another recipient, or used with other amounts or other notes.

## Finding your notes

Each new note is encrypted to its owner with X25519 and XSalsa20-Poly1305 and stored in the `NewCommitment` event. The wallet tries to decrypt every note in the pool; the ones it can open belong to its owner. A private address has the form `rvz1…` and contains the owner's note key and encryption key. Both keys are derived from the wallet key, so the twelve recovery words also restore shielded notes.

## Verification on chain

The chain checks proofs with the native Groth16 verifier of the Sui framework over BN254. The verifying key is fixed when a pool is created and cannot be changed.

## What remains public

| Action | Visible on the ledger |
|---|---|
| Shield | the amount and the depositing address |
| Private send | that a transaction was made, and the address that paid its fee |
| Unshield | the amount and the receiving address |

The fee payer is a known limitation: until a relayer or sponsored transactions are added, observers can see which public address submitted a private send, though not what it sent or to whom.

## Trusted setup

Groth16 needs a one-time setup that produces the proving and verifying keys. Whoever knows the setup's secret randomness could forge proofs. The **testnet** keys come from a setup with one contributor and must not be used for real value. Mainnet requires a public ceremony with many independent contributors; such a setup is secure if any one of them destroys their secret.

## Controls

The administrator can pause deposits and private sends, and set a maximum deposit per pool. Withdrawals cannot be paused, so shielded funds can never be frozen.
