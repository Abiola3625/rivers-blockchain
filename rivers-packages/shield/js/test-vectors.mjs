// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Generates real proofs for a deposit, a private send and a withdrawal, and writes the Move test.
import { readFileSync, writeFileSync } from 'node:fs';
import * as snarkjs from 'snarkjs';
// Usage, from a folder with the compiled circuit (build/transaction_js/transaction.wasm), the proving
// key (transaction.zkey) and vk.json, with snarkjs installed:
//   node test-vectors.mjs <pool id printed by a test, without 0x>
// Copy the written shield_tests.move to ../tests/.
import { keysFromSeed, Tree, buildInput, encryptNote, decryptNote, randomField, proofToArkworks, vkToArkworks, hex } from './shield.mjs';

const POOL = '0x' + process.argv[2];
const vk = JSON.parse(readFileSync('vk.json'));
const alice = await keysFromSeed(new TextEncoder().encode('alice test seed'));
const bob = await keysFromSeed(new TextEncoder().encode('bob test seed'));
const tree = new Tree();
const WASM = 'build/transaction_js/transaction.wasm', ZKEY = 'transaction.zkey';
const steps = [];

async function step(name, keys, inputs, outputs, ownersEnc, deposit, withdraw, recipient) {
  const enc1 = encryptNote(outputs[0], ownersEnc[0]), enc2 = encryptNote(outputs[1], ownersEnc[1]);
  const b = await buildInput({ poolId: POOL, tree, keys, inputs, outputs, deposit, withdraw, recipient, enc1, enc2 });
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(b.input, WASM, ZKEY);
  if (!(await snarkjs.groth16.verify(vk, publicSignals, proof))) throw new Error(name + ': proof does not verify off chain');
  const idx = outputs.map(() => { const i = tree.layers[0].length; return i; });
  b.commitments.forEach((c, k) => tree.insert(c));
  steps.push({ name, proof: hex(proofToArkworks(proof)), root: b.root, nullifiers: b.nullifiers, commitments: b.commitments, enc1: hex(enc1), enc2: hex(enc2), deposit, withdraw, recipient, rootAfter: tree.root() });
  return idx;
}
const note = (amount, k) => ({ amount: BigInt(amount), pub: k.pub, blinding: randomField() });

// 1. Alice shields 1,000.
const a1 = note(600, alice), a2 = note(400, alice);
await step('deposit', alice, [], [a1, a2], [alice.encPub, alice.encPub], 1000, 0, '0xa11ce');
// 2. Alice sends 700 to Bob privately, keeping 300.
const b1 = note(700, bob), a3 = note(300, alice);
await step('send', alice, [{ ...a1, index: 0 }, { ...a2, index: 1 }], [b1, a3], [bob.encPub, alice.encPub], 0, 0, '0x0');
// Bob finds his note by decrypting.
const found = decryptNote(Uint8Array.from(Buffer.from(steps[1].enc1, 'hex')), bob);
if (!found || found.amount !== 700n) throw new Error('Bob could not decrypt his note');
// 3. Bob unshields 500 to 0xb0b and keeps 200.
const b2 = note(200, bob), b3 = note(0, bob);
await step('withdraw', bob, [{ ...b1, index: 2 }], [b2, b3], [bob.encPub, bob.encPub], 0, 500, '0xb0b');

const vkHex = hex(vkToArkworks(vk));
const v = (x) => x.toString();
const vec = (a) => 'vector[' + a.map(v).join(', ') + ']';
let out = readFileSync(new URL('tests-head.move.txt', import.meta.url), 'utf8').replace('{{VK}}', vkHex);
steps.forEach((s) => {
  out += `
fun ${s.name}_call(s: &mut Scenario, p: &mut Pool<T>, recipient: address) {
    let coin = coin::mint_for_testing<T>(${s.deposit}, s.ctx());
    shield::transact(p, x"${s.proof}", ${v(s.root)}, ${vec(s.nullifiers)}, ${vec(s.commitments)}, coin, ${s.withdraw}, recipient, x"${s.enc1}", x"${s.enc2}", s.ctx());
}
const ${s.name.toUpperCase()}_ROOT_AFTER: u256 = ${v(s.rootAfter)};
`;
});
writeFileSync('shield_tests.move', out);
console.log('ok', steps.map((s) => s.name + ' root ' + String(s.root).slice(0, 10)));
process.exit(0);
