# Rivers Shield

Shielded payments for Rivers. Coins enter a shielded pool, move inside it as private notes, and
leave it to any public address. The chain checks a Groth16 zero-knowledge proof for every action.

| Path | What it is |
|---|---|
| `circuits/transaction.circom` | The circuit: 2 notes in, 2 notes out, Merkle tree depth 20, Poseidon hashes |
| `sources/shield.move` | The pool: proof check, nullifiers, note tree, deposits and withdrawals |
| `js/shield.mjs` | Keys, notes, encryption, the tree and the arkworks encoding, shared by tests and the wallet |
| `keys/` | Testnet circuit (`transaction.wasm`), proving key (`transaction.zkey`) and verifying key (`vk.json`) |
| `tests/shield_tests.move` | Tests with real proofs |
| `js/test-vectors.mjs` | Makes the proofs used by the tests |

The testnet proving key was made by one party. It must not be used on mainnet; see `../AUDIT.md`,
finding S-1.

## How a note works

- A note is `Poseidon(amount, owner public key, blinding)`. The owner public key is
  `Poseidon(private key)`.
- Spending a note publishes its nullifier, `Poseidon(commitment, index, Poseidon(private key,
  commitment, index))`, so it can be spent once.
- Each new note is encrypted to its owner (X25519 and XSalsa20-Poly1305) and stored in the
  `NewCommitment` event. Owners find their notes by trying to decrypt.
- A private address is `rvz1` followed by the owner public key and the encryption public key in
  hex. Both keys come from the wallet key, so the 12 recovery words restore shielded notes.

## Build and test

```bash
rivers move test -e testnet
```

To change the circuit:

```bash
npm install circom2 snarkjs circomlib
npx circom2 circuits/transaction.circom --r1cs --wasm -o build -l node_modules
npx snarkjs powersoftau new bn128 15 pot_0.ptau
npx snarkjs powersoftau contribute pot_0.ptau pot_1.ptau --name="contributor"
npx snarkjs powersoftau prepare phase2 pot_1.ptau pot_final.ptau
npx snarkjs groth16 setup build/transaction.r1cs pot_final.ptau t_0.zkey
npx snarkjs zkey contribute t_0.zkey transaction.zkey --name="contributor"
npx snarkjs zkey export verificationkey transaction.zkey vk.json
```

Then copy the three files into `keys/`, update `rivers-testnet/indexer/shield-vk.json`, and make new
test proofs with `js/test-vectors.mjs`.
