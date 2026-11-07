// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Rivers keeper. Every two minutes it records a price observation in each Rivers Lend market, so the
// time-weighted prices that borrowing and liquidation need stay fresh. Anyone may run a keeper;
// observing changes no balances. It signs with the service setup key.
//
// Environment: RIVERS_RPC, RIVERS_DEX_CONFIG, RIVERS_DEX_KEY.

import { existsSync, readFileSync } from 'node:fs';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

const RPC = process.env.RIVERS_RPC || 'http://127.0.0.1:9000';
const CONFIG = process.env.RIVERS_DEX_CONFIG || './dex.json';
const KEY = process.env.RIVERS_DEX_KEY || './dex-key.txt';
const client = new SuiGrpcClient({ network: 'testnet', baseUrl: RPC });
const log = (...a) => console.log(new Date().toISOString(), ...a);

async function round() {
  if (!existsSync(CONFIG) || !existsSync(KEY)) return;
  const cfg = JSON.parse(readFileSync(CONFIG, 'utf8'));
  if (!cfg.lend || !cfg.package) return;
  const kp = Ed25519Keypair.fromSecretKey(readFileSync(KEY, 'utf8').trim());
  const tx = new Transaction();
  tx.setSender(kp.toSuiAddress());
  const pools = Object.values(cfg.pools || {});
  for (const m of Object.values(cfg.lend)) {
    const p = pools.find((x) => x.id === m.pool);
    if (!p) continue;
    tx.moveCall({ target: cfg.package + '::lend::observe', typeArguments: [m.collateral, m.debt, p.a, p.b], arguments: [tx.object(m.id), tx.object(m.pool), tx.object('0x6')] });
  }
  if (!tx.getData().commands.length) return;
  try {
    const r = await client.signAndExecuteTransaction({ transaction: tx, signer: kp });
    const t = r.Transaction || r.FailedTransaction;
    if (!t.status?.success) log('observe failed', JSON.stringify(t.status?.error));
  } catch (e) {
    log('observe', e.message);
  }
}

log('Rivers keeper started');
round();
setInterval(round, 120000);
