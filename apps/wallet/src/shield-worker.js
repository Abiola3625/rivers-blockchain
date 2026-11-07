// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Rivers Wallet shielded payments worker. It holds the shielded keys, finds the wallet's notes by
// decrypting the pool's encrypted notes from the indexer, rebuilds the note tree and makes the
// Groth16 proof. Proving takes several seconds, so it runs here and not on the page.
// The page sends { id, op, ... } and receives { id, ok, result | error }.
import { keysFromSeed, parseAddress, Tree, buildInput, encryptNote, decryptNote, randomField, nullifier, commitment, proofToArkworks } from '../../../rivers-packages/shield/js/shield.mjs';

importScripts('snarkjs.min.js');

let keys = null, indexer = '';
const pools = {};  // pool id -> { tree, count, mine: [{ amount, blinding, index, nullifier }] }

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function get(path) {
  const r = await fetch(indexer + path, { cache: 'no-store' });
  if (!r.ok) throw new Error('The indexer did not answer (' + r.status + ').');
  return r.json();
}

async function scan(pool) {
  const p = pools[pool] || (pools[pool] = { tree: new Tree(), count: 0, mine: [] });
  for (;;) {
    const rows = await get('/shield/notes?pool=' + pool + '&from=' + p.count + '&limit=5000');
    for (const n of rows) {
      // Notes must arrive in tree order with no gaps, or the rebuilt root would be wrong.
      if (n.i !== p.count) throw new Error('The indexer is missing shielded notes. Try again in a moment.');
      const c = BigInt(n.c);
      p.tree.insert(c);
      const d = n.e ? decryptNote(b64(n.e), keys) : null;
      // A note counts as ours only if its commitment matches what we decrypted.
      if (d && d.amount > 0n && commitment(d) === c) {
        p.mine.push({ amount: d.amount, blinding: d.blinding, index: n.i, nullifier: nullifier(d, n.i, keys.priv).toString() });
      }
      p.count++;
    }
    if (rows.length < 5000) break;
  }
  const spent = new Set(await get('/shield/nullifiers?pool=' + pool));
  const unspent = p.mine.filter((n) => !spent.has(n.nullifier));
  return { notes: unspent.map((n) => ({ amount: n.amount.toString(), index: n.index })), balance: unspent.reduce((a, n) => a + n.amount, 0n).toString(), size: p.count };
}

// Picks one or two unspent notes that cover `amount`, preferring a single note.
async function pick(pool, amount) {
  await scan(pool);
  const p = pools[pool];
  const spent = new Set(await get('/shield/nullifiers?pool=' + pool));
  const free = p.mine.filter((n) => !spent.has(n.nullifier)).sort((a, b) => (a.amount < b.amount ? 1 : -1));
  const one = free.filter((n) => n.amount >= amount).pop();
  if (one) return [one];
  if (free.length >= 2 && free[0].amount + free[1].amount >= amount) return [free[0], free[1]];
  const total = free.reduce((a, n) => a + n.amount, 0n);
  if (total >= amount) throw new Error('Your shielded balance is split across many notes. Send yourself your two largest notes first to combine them.');
  throw new Error('Not enough shielded balance.');
}

async function prove({ pool, kind, amount, to, recipient }) {
  amount = BigInt(amount);
  if (amount <= 0n) throw new Error('Enter an amount above zero.');
  const self = (a) => ({ amount: a, pub: keys.pub, blinding: randomField() });
  let inputs = [], outputs, encTo, deposit = 0n, withdraw = 0n;
  if (kind === 'shield') {
    await scan(pool);
    outputs = [self(amount), self(0n)];
    encTo = [keys.encPub, keys.encPub];
    deposit = amount;
  } else {
    inputs = await pick(pool, amount);
    const change = inputs.reduce((a, n) => a + n.amount, 0n) - amount;
    if (kind === 'send') {
      const r = parseAddress(to);
      outputs = [{ amount, pub: r.pub, blinding: randomField() }, self(change)];
      encTo = [r.encPub, keys.encPub];
      recipient = '0x0';
    } else {
      outputs = [self(change), self(0n)];
      encTo = [keys.encPub, keys.encPub];
      withdraw = amount;
    }
  }
  const enc1 = encryptNote(outputs[0], encTo[0]), enc2 = encryptNote(outputs[1], encTo[1]);
  const b = await buildInput({ poolId: pool, tree: pools[pool].tree, keys, inputs: inputs.map((n) => ({ amount: n.amount, blinding: n.blinding, index: n.index })), outputs, deposit, withdraw, recipient, enc1, enc2 });
  const { proof } = await globalThis.snarkjs.groth16.fullProve(b.input, 'shield.wasm', 'shield.zkey', undefined, undefined, { singleThread: true });
  return {
    proof: Array.from(proofToArkworks(proof)), root: b.root.toString(), nullifiers: b.nullifiers.map(String), commitments: b.commitments.map(String),
    enc1: Array.from(enc1), enc2: Array.from(enc2), deposit: deposit.toString(), withdraw: withdraw.toString(), recipient,
  };
}

onmessage = async (e) => {
  const { id, op } = e.data;
  try {
    let result;
    if (op === 'init') {
      keys = await keysFromSeed(new TextEncoder().encode(e.data.seed));
      indexer = e.data.indexer.replace(/\/+$/, '');
      for (const k of Object.keys(pools)) delete pools[k];
      result = { address: keys.address };
    } else if (!keys) throw new Error('The wallet is locked.');
    else if (op === 'scan') result = await scan(e.data.pool);
    else if (op === 'prove') result = await prove(e.data);
    else throw new Error('Unknown request.');
    postMessage({ id, ok: true, result });
  } catch (err) {
    postMessage({ id, ok: false, error: err.message || String(err) });
  }
};
