// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Checks a Rivers checkpoint on this device. A checkpoint is final when validators holding more
// than two thirds of the voting power have signed it with BLS12-381 (min-sig: 48-byte signatures
// on G1, 96-byte public keys on G2). This file needs only the checkpoint summary bytes, the
// aggregated signature and the committee, so the node that served them does not have to be
// trusted for the result.
import { bls12_381 } from '@noble/curves/bls12-381.js';

const SIG = bls12_381.shortSignatures;
// The DST of fastcrypto's min-sig scheme.
const DST = 'BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_';

const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (h) => Uint8Array.from(h.match(/../g).map((x) => parseInt(x, 16)));

class Reader {
  constructor(b) { this.b = b; this.i = 0; this.v = new DataView(b.buffer, b.byteOffset, b.byteLength); }
  u8() { if (this.i >= this.b.length) throw new Error('Checkpoint bytes end early.'); return this.b[this.i++]; }
  u16() { const x = this.v.getUint16(this.i, true); this.i += 2; return x; }
  u32() { const x = this.v.getUint32(this.i, true); this.i += 4; return x; }
  u64() { const x = this.v.getBigUint64(this.i, true); this.i += 8; return x; }
  uleb() { let r = 0, s = 0, x; do { x = this.u8(); r += (x & 0x7f) * 2 ** s; s += 7; } while (x & 0x80); return r; }
  bytes(n) { if (this.i + n > this.b.length) throw new Error('Checkpoint bytes end early.'); const r = this.b.subarray(this.i, this.i + n); this.i += n; return r; }
  vecBytes() { return this.bytes(this.uleb()); }
}

// Reads the fields of a BCS CheckpointSummary (crates/sui-types/src/messages_checkpoint.rs) up to
// the next committee. Digests and authority names are serialized as length-prefixed bytes.
export function parseSummary(bytes) {
  const r = new Reader(bytes);
  const s = { epoch: r.u64(), seq: r.u64(), txs: r.u64() };
  r.vecBytes(); // content digest
  if (r.u8()) r.vecBytes(); // previous digest
  for (let i = 0; i < 4; i++) r.u64(); // epoch gas cost summary
  s.timestampMs = Number(r.u64());
  const nc = r.uleb();
  for (let i = 0; i < nc; i++) { r.uleb(); r.vecBytes(); } // checkpoint commitments
  if (r.u8()) {
    const n = r.uleb();
    s.nextCommittee = [];
    for (let i = 0; i < n; i++) {
      const pk = r.vecBytes();
      if (pk.length !== 96) throw new Error('A committee key has the wrong length.');
      s.nextCommittee.push([hex(pk), r.u64().toString()]);
    }
  }
  return s;
}

// Decodes the portable serialization of a Roaring bitmap
// (https://github.com/RoaringBitmap/RoaringFormatSpec), which Sui uses for the signer bitmap.
export function roaring(bytes) {
  const r = new Reader(bytes);
  const cookie = r.u32();
  let n, runs = null;
  if ((cookie & 0xffff) === 12347) {
    n = (cookie >>> 16) + 1;
    runs = r.bytes(Math.ceil(n / 8));
  } else if (cookie === 12346) {
    n = r.u32();
  } else throw new Error('The signer list has an unknown format.');
  const heads = [];
  for (let i = 0; i < n; i++) heads.push([r.u16(), r.u16() + 1]);
  if (!runs || n >= 4) r.bytes(4 * n); // container offsets
  const out = [];
  for (let i = 0; i < n; i++) {
    const [key, card] = heads[i];
    const base = key * 65536;
    if (runs && runs[i >> 3] & (1 << (i & 7))) {
      const k = r.u16();
      for (let j = 0; j < k; j++) { const st = r.u16(), len = r.u16(); for (let x = 0; x <= len; x++) out.push(base + st + x); }
    } else if (card <= 4096) {
      for (let j = 0; j < card; j++) out.push(base + r.u16());
    } else {
      for (let w = 0; w < 1024; w++) {
        const word = r.u64();
        if (!word) continue;
        for (let bit = 0; bit < 64; bit++) if ((word >> BigInt(bit)) & 1n) out.push(base + w * 64 + bit);
      }
    }
  }
  return out;
}

// committee: [[public key hex, weight string], ...] in any order. Sui indexes signers by the
// committee sorted by public key bytes, which is the same as sorting the hex strings.
export function verifyCheckpoint({ summary, signature, bitmap, epoch, committee }) {
  const s = parseSummary(summary);
  if (BigInt(epoch) !== s.epoch) throw new Error('The signature is for another epoch.');
  const members = [...committee].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const total = members.reduce((a, m) => a + BigInt(m[1]), 0n);
  const signers = roaring(bitmap);
  const seen = new Set();
  let weight = 0n;
  const keys = [];
  for (const i of signers) {
    if (i >= members.length || seen.has(i)) throw new Error('The signer list names an unknown validator.');
    seen.add(i);
    weight += BigInt(members[i][1]);
    keys.push(unhex(members[i][0]));
  }
  // Quorum as in Committee::quorum_threshold: 2/3 of the total plus one.
  const quorum = (total * 2n) / 3n + 1n;
  if (weight < quorum) throw new Error('Too few validators signed this checkpoint.');
  // The signed message is the BCS IntentMessage (scope CheckpointSummary = 2, version 0, app
  // Sui = 0) followed by the epoch as a little-endian u64, as in AuthoritySignature::new_secure.
  const msg = new Uint8Array(3 + summary.length + 8);
  msg.set([2, 0, 0]);
  msg.set(summary, 3);
  new DataView(msg.buffer).setBigUint64(3 + summary.length, BigInt(epoch), true);
  // A key or signature that is not a valid curve point fails the same way as a wrong signature.
  let ok = false;
  try {
    ok = SIG.verify(signature, SIG.hash(msg, DST), SIG.aggregatePublicKeys(keys));
  } catch (e) {
    ok = false;
  }
  if (!ok) throw new Error('The validators’ signature does not match.');
  return { ...s, weight: weight.toString(), total: total.toString(), signers: signers.length, members: members.length };
}
