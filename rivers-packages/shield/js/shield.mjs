// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Rivers shielded payments for wallets: keys, notes, encryption, the Merkle tree, proofs and the
// conversion of Groth16 keys and proofs to the arkworks format that the Move verifier reads.
// The commitment, nullifier and hashing rules must match circuits/transaction.circom and
// sources/shield.move.

import { poseidon1, poseidon2, poseidon3 } from 'poseidon-lite';
import nacl from 'tweetnacl';

export const FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const FQ = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
export const LEVELS = 20;

const enc = new TextEncoder();
async function sha256(bytes) { return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)); }
const beToBig = (b) => b.reduce((x, v) => (x << 8n) | BigInt(v), 0n);
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (h) => Uint8Array.from(h.match(/../g).map((x) => parseInt(x, 16)));
const toBytes32 = (x) => { const o = new Uint8Array(32); for (let i = 31; i >= 0; i--) { o[i] = Number(x & 255n); x >>= 8n; } return o; };
const le = (x, n) => { const o = new Uint8Array(n); for (let i = 0; i < n; i++) { o[i] = Number(x & 255n); x >>= 8n; } return o; };
export const randomField = () => beToBig(crypto.getRandomValues(new Uint8Array(31)));

/* ---------- keys ---------- */
// Shielded keys come from the wallet's secret, so the 12 recovery words restore shielded notes too.
export async function keysFromSeed(seed) {
  const priv = beToBig(await sha256(cat(enc.encode('rivers-shield-spend-v1'), seed))) % FIELD;
  const encSecret = await sha256(cat(enc.encode('rivers-shield-view-v1'), seed));
  const box = nacl.box.keyPair.fromSecretKey(encSecret);
  const pub = poseidon1([priv]);
  return { priv, pub, encSecret: box.secretKey, encPub: box.publicKey, address: 'rvz1' + hex(toBytes32(pub)) + hex(box.publicKey) };
}
export function parseAddress(a) {
  if (!/^rvz1[0-9a-f]{128}$/.test(a)) throw new Error('Not a Rivers shielded address.');
  return { pub: beToBig(unhex(a.slice(4, 68))), encPub: unhex(a.slice(68)) };
}

/* ---------- notes ---------- */
export const commitment = (n) => poseidon3([n.amount, n.pub, n.blinding]);
export function nullifier(n, index, priv) {
  const c = commitment(n);
  return poseidon3([c, BigInt(index), poseidon3([priv, c, BigInt(index)])]);
}
// Encrypted note: ephemeral public key (32) | nonce (24) | box(amount 32 | blinding 32).
export function encryptNote(n, encPub) {
  const eph = nacl.box.keyPair();
  const nonce = nacl.randomBytes(24);
  const box = nacl.box(cat(toBytes32(n.amount), toBytes32(n.blinding)), nonce, encPub, eph.secretKey);
  return cat(eph.publicKey, nonce, box);
}
export function decryptNote(bytes, keys) {
  if (bytes.length !== 32 + 24 + 64 + 16) return null;
  const m = nacl.box.open(bytes.slice(56), bytes.slice(32, 56), bytes.slice(0, 32), keys.encSecret);
  if (!m) return null;
  return { amount: beToBig(m.slice(0, 32)), blinding: beToBig(m.slice(32, 64)), pub: keys.pub };
}

/* ---------- Merkle tree (same rules as shield.move) ---------- */
export class Tree {
  constructor(levels = LEVELS) {
    this.levels = levels;
    this.zeros = [0n];
    for (let i = 1; i <= levels; i++) this.zeros.push(poseidon2([this.zeros[i - 1], this.zeros[i - 1]]));
    this.layers = [[]];
  }
  insert(leaf) { this.layers[0].push(leaf); this._dirty = true; }
  _build() {
    if (!this._dirty && this.layers.length > this.levels) return;
    let cur = this.layers[0];
    this.layers = [cur];
    for (let l = 0; l < this.levels; l++) {
      const next = [];
      for (let i = 0; i < cur.length; i += 2) next.push(poseidon2([cur[i], i + 1 < cur.length ? cur[i + 1] : this.zeros[l]]));
      this.layers.push(next);
      cur = next;
    }
    this._dirty = false;
  }
  root() { this._build(); const top = this.layers[this.levels]; return top.length ? top[0] : this.zeros[this.levels]; }
  path(index) {
    this._build();
    const els = [];
    let i = index;
    for (let l = 0; l < this.levels; l++) { const s = i ^ 1; els.push(s < this.layers[l].length ? this.layers[l][s] : this.zeros[l]); i >>= 1; }
    return els;
  }
}

/* ---------- external data hash (same bytes as shield::ext_data_hash) ---------- */
export async function extDataHash(poolId, recipient, deposit, withdraw, enc1, enc2) {
  const addr = (a) => unhex(a.replace(/^0x/, '').padStart(64, '0'));
  const b = cat(addr(poolId), addr(recipient), le(BigInt(deposit), 8), le(BigInt(withdraw), 8), le(BigInt(enc1.length), 4), enc1, le(BigInt(enc2.length), 4), enc2);
  return beToBig(await sha256(b)) % FIELD;
}
export const publicAmount = (deposit, withdraw) => (BigInt(deposit) - BigInt(withdraw) + FIELD) % FIELD;

/* ---------- building a transaction ---------- */
// inputs: up to 2 notes {amount, blinding, index}; outputs: 2 notes {amount, pub, blinding}.
// Missing inputs are padded with zero-amount notes owned by the sender.
export async function buildInput({ poolId, tree, keys, inputs, outputs, deposit, withdraw, recipient, enc1, enc2 }) {
  const ins = inputs.slice();
  while (ins.length < 2) ins.push({ amount: 0n, blinding: randomField(), index: 0, pad: true });
  const inNull = ins.map((n) => nullifier({ amount: n.amount, pub: keys.pub, blinding: n.blinding }, n.index, keys.priv));
  const sumIn = ins.reduce((a, n) => a + n.amount, 0n), sumOut = outputs.reduce((a, n) => a + n.amount, 0n);
  if (sumIn + BigInt(deposit) - BigInt(withdraw) !== sumOut) throw new Error('Amounts do not balance.');
  const ext = await extDataHash(poolId, recipient, deposit, withdraw, enc1, enc2);
  const root = tree.root();
  return {
    input: {
      root: root.toString(), publicAmount: publicAmount(deposit, withdraw).toString(), extDataHash: ext.toString(),
      inputNullifier: inNull.map(String), outputCommitment: outputs.map((o) => commitment(o).toString()),
      inAmount: ins.map((n) => n.amount.toString()), inPrivateKey: ins.map(() => keys.priv.toString()), inBlinding: ins.map((n) => n.blinding.toString()),
      inPathIndices: ins.map((n) => String(n.index)), inPathElements: ins.map((n) => (n.pad ? tree.zeros.slice(0, LEVELS) : tree.path(n.index)).map(String)),
      outAmount: outputs.map((o) => o.amount.toString()), outPubkey: outputs.map((o) => o.pub.toString()), outBlinding: outputs.map((o) => o.blinding.toString()),
    },
    root, nullifiers: inNull, commitments: outputs.map(commitment),
  };
}

/* ---------- arkworks encoding for sui::groth16 ---------- */
const neg = (y) => (y === 0n ? 0n : FQ - y);
function g1(p) {
  const x = BigInt(p[0]), y = BigInt(p[1]);
  const o = le(x, 32);
  if (y > neg(y)) o[31] |= 0x80;
  return o;
}
function g2(p) {
  const x0 = BigInt(p[0][0]), x1 = BigInt(p[0][1]), y0 = BigInt(p[1][0]), y1 = BigInt(p[1][1]);
  const o = cat(le(x0, 32), le(x1, 32));
  // Fp2 elements are ordered by c1, then c0.
  const n0 = neg(y0), n1 = neg(y1);
  const greater = y1 > n1 || (y1 === n1 && y0 > n0);
  if (greater) o[63] |= 0x80;
  return o;
}
export function vkToArkworks(vk) {
  const ic = vk.IC.map(g1);
  return cat(g1(vk.vk_alpha_1), g2(vk.vk_beta_2), g2(vk.vk_gamma_2), g2(vk.vk_delta_2), le(BigInt(ic.length), 8), ...ic);
}
export const proofToArkworks = (p) => cat(g1(p.pi_a), g2(p.pi_b), g1(p.pi_c));
export { hex, unhex };
