// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Sets up Rivers DEX on a testnet once: publishes rivers-packages/dex, registers the USDs and NGNs
// test stablecoins and creates the first pools at the starting prices below. The result is written to
// $RIVERS_DEX_CONFIG (dex.json), which the indexer serves to Rivers Scan. Running it again resumes
// from the last finished step.
//
// Environment: RIVERS_RPC, RIVERS_FAUCET, RIVERS_DEX_CONFIG, RIVERS_DEX_KEY,
// RIVERS_PRICE_RVRB_USDS (USDs per RVRB, default 1), RIVERS_PRICE_USDS_NGNS (NGNs per USDs, default 1500).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction, coinWithBalance } from '@mysten/sui/transactions';
import bytecode from './dex-bytecode.json' with { type: 'json' };

const RPC = process.env.RIVERS_RPC || 'http://127.0.0.1:9000';
const FAUCET = process.env.RIVERS_FAUCET || 'http://127.0.0.1:9123';
const CONFIG = process.env.RIVERS_DEX_CONFIG || './dex.json';
const KEY = process.env.RIVERS_DEX_KEY || './dex-key.txt';
const P_RVRB = Number(process.env.RIVERS_PRICE_RVRB_USDS || 1);
const P_NGN = Number(process.env.RIVERS_PRICE_USDS_NGNS || 1500);
const RVRB = '0x2::sui::SUI';
// RVRB placed in pools. The publisher collects it from the faucet, 50 RVRB per request.
const SEED_RVRB_USDS = 1000, SEED_RVRB_NGNS = 200, SEED_USDS_NGNS = 100000;

const client = new SuiGrpcClient({ network: 'testnet', baseUrl: RPC });
const cfg = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
const save = () => writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString(), ...a);

let kp;
if (existsSync(KEY)) kp = Ed25519Keypair.fromSecretKey(readFileSync(KEY, 'utf8').trim());
else { kp = new Ed25519Keypair(); writeFileSync(KEY, kp.getSecretKey(), { mode: 0o600 }); }
const me = kp.toSuiAddress();
cfg.publisher = me;

const balance = async (t) => Number((await client.stateService.getBalance({ owner: me, coinType: t })).response.balance?.balance || 0);

async function exec(tx, what) {
  tx.setSender(me);
  for (let i = 0; i < 5; i++) {
    try {
      const r = await client.signAndExecuteTransaction({ transaction: tx, signer: kp, include: { effects: true, objectTypes: true } });
      const t = r.Transaction || r.FailedTransaction;
      if (r.FailedTransaction || !t.status?.success) throw new Error(JSON.stringify(t.status?.error || 'failed'));
      log(what, t.digest);
      await sleep(1500);
      return t;
    } catch (e) {
      log(what, 'retry', e.message);
      await sleep(3000);
    }
  }
  throw new Error(what + ' failed');
}

async function fund(rvrb) {
  while ((await balance(RVRB)) / 1e9 < rvrb) {
    const r = await fetch(FAUCET + '/v2/gas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ FixedAmountRequest: { recipient: me } }) });
    if (!r.ok) { log('faucet', r.status); await sleep(5000); }
    await sleep(400);
  }
}

async function main() {
  log('Rivers DEX setup as', me);
  if (!cfg.package) {
    await fund(SEED_RVRB_USDS + SEED_RVRB_NGNS + 30);
    const tx = new Transaction();
    const [up] = tx.publish({ modules: bytecode.modules, dependencies: bytecode.dependencies });
    tx.transferObjects([up], me);
    const t = await exec(tx, 'publish');
    const ty = t.objectTypes;
    const find = (s) => Object.keys(ty).find((k) => ty[k].includes(s));
    cfg.package = Object.keys(ty).find((k) => ty[k] === 'package');
    cfg.registry = find('::pool::Registry');
    cfg.coins = { USDs: cfg.package + '::usds::USDS', NGNs: cfg.package + '::ngns::NGNS' };
    cfg.faucets = { USDs: find('::test_faucet::Faucet<' + cfg.coins.USDs), NGNs: find('::test_faucet::Faucet<' + cfg.coins.NGNs) };
    cfg.currencies = { USDs: find('::coin_registry::Currency<' + cfg.coins.USDs), NGNs: find('::coin_registry::Currency<' + cfg.coins.NGNs) };
    cfg.publishDigest = t.digest;
    save();
  }
  if (!cfg.registered) {
    const tx = new Transaction();
    for (const s of ['USDs', 'NGNs']) tx.moveCall({ target: '0x2::coin_registry::finalize_registration', typeArguments: [cfg.coins[s]], arguments: [tx.object('0xc'), tx.object(cfg.currencies[s])] });
    await exec(tx, 'register stablecoins');
    cfg.registered = true;
    save();
  }
  cfg.startPrices = { RVRB_USDs: P_RVRB, USDs_NGNs: P_NGN };
  cfg.pools = cfg.pools || {};
  const pools = [
    ['RVRB/USDs', RVRB, cfg.coins.USDs, SEED_RVRB_USDS * 1e9, SEED_RVRB_USDS * P_RVRB * 1e6],
    ['RVRB/NGNs', RVRB, cfg.coins.NGNs, SEED_RVRB_NGNS * 1e9, SEED_RVRB_NGNS * P_RVRB * P_NGN * 1e6],
    ['USDs/NGNs', cfg.coins.USDs, cfg.coins.NGNs, SEED_USDS_NGNS * 1e6, SEED_USDS_NGNS * P_NGN * 1e6],
  ];
  for (const [name, a, b, amtA, amtB] of pools) {
    if (cfg.pools[name]) continue;
    if (a === RVRB) await fund(amtA / 1e9 + 5);
    const tx = new Transaction();
    const coinOf = (type, amt) => coinWithBalance({ type, balance: BigInt(Math.round(amt)) });
    const lp = tx.moveCall({ target: cfg.package + '::pool::create_pool', typeArguments: [a, b], arguments: [tx.object(cfg.registry), coinOf(a, amtA), coinOf(b, amtB)] });
    tx.transferObjects([lp], me);
    const t = await exec(tx, 'create pool ' + name);
    const ty = t.objectTypes;
    cfg.pools[name] = { id: Object.keys(ty).find((k) => ty[k].includes('::pool::Pool<')), a, b };
    save();
  }
  cfg.ready = true;
  save();
  log('Rivers DEX ready', JSON.stringify(cfg.pools));
}

main().catch((e) => { console.error(e); process.exit(1); });
