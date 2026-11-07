# Shield reference

Module `rivers_shield::shield`. A `Pool<T>` is a shared object that holds coins of type `T` owned through private notes.

## transact

```move
public fun transact<T>(
    pool: &mut Pool<T>,
    proof: vector<u8>,          // Groth16 proof, arkworks compressed (128 bytes)
    root: u256,                 // a recent tree root
    nullifiers: vector<u256>,   // exactly 2
    commitments: vector<u256>,  // exactly 2
    deposit: Coin<T>,           // zero coin unless shielding
    withdraw: u64,              // zero unless unshielding
    recipient: address,         // receiver of `withdraw`
    encrypted1: vector<u8>,     // encrypted output note 1, at most 512 bytes
    encrypted2: vector<u8>,     // encrypted output note 2, at most 512 bytes
    ctx: &mut TxContext,
)
```

A transaction either deposits or withdraws, never both. The public inputs of the proof are, in order:

| # | Input |
|---|---|
| 1 | `root` |
| 2 | public amount: `deposit − withdraw` in the BN254 scalar field |
| 3 | external data hash |
| 4–5 | the two nullifiers |
| 6–7 | the two output commitments |

## External data hash

```text
sha256(pool id ‖ recipient ‖ deposit (u64 LE) ‖ withdraw (u64 LE)
       ‖ len(enc1) (u32 LE) ‖ enc1 ‖ len(enc2) (u32 LE) ‖ enc2)
read as a big-endian integer, modulo the BN254 scalar field
```

The contract computes it; `ext_data_hash(pool, recipient, deposit, withdraw, &enc1, &enc2)` is public for tools that need the same value.

## Note format

| Value | Definition |
|---|---|
| Public key | `Poseidon(private_key)` |
| Commitment | `Poseidon(amount, public_key, blinding)` |
| Nullifier | `Poseidon(commitment, index, Poseidon(private_key, commitment, index))` |
| Encrypted note | ephemeral X25519 key (32) ‖ nonce (24) ‖ box(amount ‖ blinding) (80) |
| Private address | `rvz1` ‖ hex(public key, 32 bytes) ‖ hex(encryption key, 32 bytes) |

The JavaScript implementation is `rivers-packages/shield/js/shield.mjs`; the circuit is `rivers-packages/shield/circuits/transaction.circom`.

## Views

| Function | Returns |
|---|---|
| `current_root(pool)` | The newest root |
| `is_known_root(pool, root)` | Whether `root` is among the last 100 |
| `is_spent(pool, nullifier)` | Whether the nullifier was used |
| `size(pool)` | Number of notes in the tree |
| `value(pool)` | Coins held by the pool |

## Administration

```move
public fun create_pool<T>(cap: &ShieldAdminCap, vk: vector<u8>, max_deposit: u64, ctx: &mut TxContext)
public fun set_deposits_paused<T>(cap: &ShieldAdminCap, pool: &mut Pool<T>, paused: bool)
public fun set_max_deposit<T>(cap: &ShieldAdminCap, pool: &mut Pool<T>, max_deposit: u64)
```

Pausing stops deposits and private sends; withdrawals always work.

## Events

| Event | Fields |
|---|---|
| `NewCommitment` | `pool`, `commitment`, `index`, `encrypted` |
| `NewNullifier` | `pool`, `nullifier` |
| `Transacted` | `pool`, `deposit`, `withdraw`, `recipient`, `root` |

## Abort codes

| Code | Name | Meaning |
|---|---|---|
| 1 | `EBadProof` | The proof does not verify |
| 2 | `EUnknownRoot` | The root is not among the last 100 |
| 3 | `ENullifierSpent` | A note was already spent |
| 4 | `EBadInput` | Wrong lengths, values above the field, equal nullifiers, or deposit and withdrawal together |
| 5 | `ETreeFull` | The pool's tree is full |
| 6 | `EDepositTooLarge` | Above the pool's deposit limit |
| 7 | `ENotEnoughInPool` | The pool does not hold that much |
| 8 | `EPaused` | Deposits and private sends are paused |
