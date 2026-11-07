// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Rivers indexer. It reads every checkpoint from a Rivers node over gRPC, stores accounts,
// transactions, hourly and daily activity and per-epoch validator rewards in SQLite, and serves
// them as JSON for Rivers Scan.
//
// Environment: RIVERS_RPC (default http://127.0.0.1:9000), RIVERS_INDEXER_PORT (default 9200),
// RIVERS_INDEXER_DB (default ./rivers-indexer.db).

import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { SuiGrpcClient } from '@mysten/sui/grpc';

const RPC = process.env.RIVERS_RPC || 'http://127.0.0.1:9000';
const PORT = Number(process.env.RIVERS_INDEXER_PORT || 9200);
const DB_PATH = process.env.RIVERS_INDEXER_DB || './rivers-indexer.db';
const DEX_CONFIG = process.env.RIVERS_DEX_CONFIG || './dex.json';
const RVRB = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
const SYS0 = '0x0000000000000000000000000000000000000000000000000000000000000000';
// Activity wallets use this gas budget; Scan uses it to label network activity.
const ACTIVITY_BUDGET = '42424242';
const BATCH = 40;
const CONCURRENCY = 8;

const client = new SuiGrpcClient({ network: 'testnet', baseUrl: RPC });
const ledger = client.ledgerService;
const state = client.stateService;

const db = new DatabaseSync(DB_PATH);
db.exec(`
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS tx(digest TEXT PRIMARY KEY, cp INTEGER, ts INTEGER, sender TEXT, kind TEXT, label TEXT,
  ok INTEGER, fee INTEGER, amount INTEGER, recipient TEXT, activity INTEGER);
CREATE INDEX IF NOT EXISTS tx_cp ON tx(cp);
CREATE TABLE IF NOT EXISTS acct_tx(addr TEXT, digest TEXT, cp INTEGER, ts INTEGER, delta INTEGER, PRIMARY KEY(addr, digest));
CREATE INDEX IF NOT EXISTS acct_tx_addr ON acct_tx(addr, cp DESC);
CREATE TABLE IF NOT EXISTS acct(addr TEXT PRIMARY KEY, first_cp INTEGER, first_ts INTEGER, last_ts INTEGER, tx_count INTEGER DEFAULT 0,
  sent INTEGER DEFAULT 0, received INTEGER DEFAULT 0, balance INTEGER DEFAULT 0, bal_at INTEGER DEFAULT 0, activity INTEGER DEFAULT 0);
CREATE INDEX IF NOT EXISTS acct_bal ON acct(balance DESC);
CREATE TABLE IF NOT EXISTS hourly(hour INTEGER PRIMARY KEY, tx_all INTEGER DEFAULT 0, tx_user INTEGER DEFAULT 0, tx_activity INTEGER DEFAULT 0,
  fees INTEGER DEFAULT 0, volume INTEGER DEFAULT 0, new_accts INTEGER DEFAULT 0, active INTEGER DEFAULT 0, checkpoints INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS hour_active(hour INTEGER, addr TEXT, PRIMARY KEY(hour, addr));
CREATE TABLE IF NOT EXISTS day_active(day INTEGER, addr TEXT, PRIMARY KEY(day, addr));
CREATE TABLE IF NOT EXISTS token(coin_type TEXT PRIMARY KEY, first_cp INTEGER, first_ts INTEGER, creator TEXT, digest TEXT,
  name TEXT, symbol TEXT, decimals INTEGER, description TEXT, icon TEXT, regulated INTEGER DEFAULT 0, meta_at INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS tok_bal(coin_type TEXT, addr TEXT, bal INTEGER, PRIMARY KEY(coin_type, addr));
CREATE INDEX IF NOT EXISTS tok_bal_top ON tok_bal(coin_type, bal DESC);
CREATE TABLE IF NOT EXISTS tok_tx(coin_type TEXT, digest TEXT, cp INTEGER, ts INTEGER, sender TEXT, recipient TEXT, amount INTEGER, PRIMARY KEY(coin_type, digest));
CREATE INDEX IF NOT EXISTS tok_tx_cp ON tok_tx(coin_type, cp DESC);
CREATE TABLE IF NOT EXISTS pool(id TEXT PRIMARY KEY, pkg TEXT, type_a TEXT, type_b TEXT, cp INTEGER, ts INTEGER, creator TEXT,
  reserve_a INTEGER, reserve_b INTEGER);
CREATE TABLE IF NOT EXISTS swap(digest TEXT, seq INTEGER, pool TEXT, cp INTEGER, ts INTEGER, a_to_b INTEGER, amount_in INTEGER,
  amount_out INTEGER, reserve_a INTEGER, reserve_b INTEGER, trader TEXT, PRIMARY KEY(digest, seq));
CREATE INDEX IF NOT EXISTS swap_pool ON swap(pool, cp DESC);
CREATE TABLE IF NOT EXISTS liquidity(digest TEXT, seq INTEGER, pool TEXT, cp INTEGER, ts INTEGER, added INTEGER, amount_a INTEGER,
  amount_b INTEGER, lp INTEGER, provider TEXT, PRIMARY KEY(digest, seq));
CREATE TABLE IF NOT EXISTS app_event(digest TEXT, seq INTEGER, cp INTEGER, ts INTEGER, pkg TEXT, module TEXT, name TEXT, sender TEXT,
  json TEXT, PRIMARY KEY(digest, seq));
CREATE INDEX IF NOT EXISTS app_event_name ON app_event(module, name, cp DESC);
CREATE TABLE IF NOT EXISTS shield_note(pkg TEXT, pool TEXT, idx INTEGER, commitment TEXT, encrypted TEXT, cp INTEGER, ts INTEGER,
  PRIMARY KEY(pool, idx));
CREATE TABLE IF NOT EXISTS shield_null(pkg TEXT, pool TEXT, nullifier TEXT, cp INTEGER, PRIMARY KEY(pool, nullifier));
CREATE TABLE IF NOT EXISTS shield_tx(digest TEXT PRIMARY KEY, pkg TEXT, pool TEXT, cp INTEGER, ts INTEGER, deposit INTEGER, withdraw INTEGER);
CREATE TABLE IF NOT EXISTS epoch(epoch INTEGER PRIMARY KEY, start_ts INTEGER, first_cp INTEGER, total_stake INTEGER, rgp INTEGER);
CREATE TABLE IF NOT EXISTS val_epoch(epoch INTEGER, addr TEXT, name TEXT, pool TEXT, stake INTEGER, rewards_pool INTEGER,
  pool_tokens INTEGER, commission INTEGER, PRIMARY KEY(epoch, addr));
`);

const getMeta = (k, d) => { const r = db.prepare('SELECT v FROM meta WHERE k=?').get(k); return r ? r.v : d; };
const setMeta = db.prepare('INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v');
const qTx = db.prepare('INSERT OR IGNORE INTO tx VALUES(?,?,?,?,?,?,?,?,?,?,?)');
const qAcctTx = db.prepare('INSERT OR IGNORE INTO acct_tx VALUES(?,?,?,?,?)');
const qAcctNew = db.prepare('INSERT OR IGNORE INTO acct(addr, first_cp, first_ts, last_ts) VALUES(?,?,?,?)');
const qAcctUpd = db.prepare(`UPDATE acct SET last_ts=MAX(last_ts,?), tx_count=tx_count+?, sent=sent+?, received=received+?,
  activity=MAX(activity,?) WHERE addr=?`);
const qHour = db.prepare(`INSERT INTO hourly(hour,tx_all,tx_user,tx_activity,fees,volume,new_accts,checkpoints) VALUES(?,?,?,?,?,?,?,?)
  ON CONFLICT(hour) DO UPDATE SET tx_all=tx_all+excluded.tx_all, tx_user=tx_user+excluded.tx_user, tx_activity=tx_activity+excluded.tx_activity,
  fees=fees+excluded.fees, volume=volume+excluded.volume, new_accts=new_accts+excluded.new_accts, checkpoints=checkpoints+excluded.checkpoints`);
const qHourActive = db.prepare('INSERT OR IGNORE INTO hour_active VALUES(?,?)');
const qDayActive = db.prepare('INSERT OR IGNORE INTO day_active VALUES(?,?)');
const qTokNew = db.prepare('INSERT OR IGNORE INTO token(coin_type, first_cp, first_ts, creator, digest) VALUES(?,?,?,?,?)');
const qTokBal = db.prepare('INSERT INTO tok_bal VALUES(?,?,?) ON CONFLICT(coin_type, addr) DO UPDATE SET bal=bal+excluded.bal');
const qTokTx = db.prepare('INSERT OR IGNORE INTO tok_tx VALUES(?,?,?,?,?,?,?)');
const newTokens = new Set();
const qBal = db.prepare('UPDATE acct SET balance=?, bal_at=? WHERE addr=?');

const toMs = (t) => (t ? Number(t.seconds) * 1000 + Math.floor((t.nanos || 0) / 1e6) : 0);
const HOUR = 3600000, DAY = 86400000;
const dirty = new Set();

function classify(tx) {
  const d = tx.transaction && tx.transaction.kind && tx.transaction.kind.data;
  const k = (d && d.oneofKind) || '';
  const sender = tx.transaction && tx.transaction.sender;
  if (k !== 'programmableTransaction' || sender === SYS0) return { kind: 'system', label: k };
  const cmds = d.programmableTransaction.commands.map((c) => c.command);
  const mc = cmds.find((c) => c.oneofKind === 'moveCall');
  if (mc) return { kind: 'call', label: mc.moveCall.module + '::' + mc.moveCall.function };
  if (cmds.some((c) => c.oneofKind === 'publish')) return { kind: 'publish', label: 'publish' };
  return { kind: 'transfer', label: '' };
}

const CP_MASK = { paths: ['sequence_number', 'summary.timestamp', 'transactions.digest', 'transactions.transaction.sender',
  'transactions.transaction.kind', 'transactions.transaction.gas_payment.budget', 'transactions.effects.status',
  'transactions.effects.gas_used', 'transactions.balance_changes', 'transactions.events.events.event_type', 'transactions.events.events.json'] };

// Converts a protobuf Value (event JSON) into a plain object.
function plain(v) {
  const k = v && v.kind;
  if (!k) return null;
  switch (k.oneofKind) {
    case 'structValue': return Object.fromEntries(Object.entries(k.structValue.fields || {}).map(([n, x]) => [n, plain(x)]));
    case 'listValue': return (k.listValue.values || []).map(plain);
    case 'nullValue': return null;
    default: return k[k.oneofKind];
  }
}
// Type names in DEX events are bytes of a type name without the 0x prefix.
const typeOf = (b64) => '0x' + Buffer.from(b64, 'base64').toString('utf8');
const qPool = db.prepare('INSERT OR IGNORE INTO pool VALUES(?,?,?,?,?,?,?,?,?)');
const qPoolRes = db.prepare('UPDATE pool SET reserve_a=?, reserve_b=? WHERE id=?');
const qSwap = db.prepare('INSERT OR IGNORE INTO swap VALUES(?,?,?,?,?,?,?,?,?,?,?)');
const qLiq = db.prepare('INSERT OR IGNORE INTO liquidity VALUES(?,?,?,?,?,?,?,?,?,?)');

// Rivers Connect (network) and vesting events are stored as JSON for the Connect and Core interfaces.
const qAppEv = db.prepare('INSERT OR IGNORE INTO app_event VALUES(?,?,?,?,?,?,?,?,?)');
// Staking events of the system package (0x3::validator) feed the Rivers Validator dashboard.
const APP_MODULES = new Set(['network', 'vesting', 'validator']);
// Shielded pool events: the wallet rebuilds the note tree from commitments in index order and
// checks its notes against the nullifiers. Only events of the configured package are served.
const qNote = db.prepare('INSERT OR IGNORE INTO shield_note VALUES(?,?,?,?,?,?,?)');
const qNull = db.prepare('INSERT OR IGNORE INTO shield_null VALUES(?,?,?,?)');
const qShTx = db.prepare('INSERT OR IGNORE INTO shield_tx VALUES(?,?,?,?,?,?,?)');
function storeShield(tx, pkg, name, j, seq, ts) {
  if (name === 'NewCommitment') qNote.run(pkg, j.pool, Number(j.index), String(j.commitment), String(j.encrypted || ''), seq, ts);
  else if (name === 'NewNullifier') qNull.run(pkg, j.pool, String(j.nullifier), seq);
  else if (name === 'Transacted') qShTx.run(tx.digest, pkg, j.pool, seq, ts, BigInt(j.deposit), BigInt(j.withdraw));
}
function storeEvents(tx, seq, ts) {
  const evs = (tx.events && tx.events.events) || [];
  evs.forEach((e, i) => {
    const t = e.eventType || '';
    const parts = t.split('<')[0].split('::');
    if (parts[1] === 'shield') { storeShield(tx, parts[0], parts[2], plain(e.json) || {}, seq, ts); return; }
    if (APP_MODULES.has(parts[1]) && (parts[1] !== 'validator' || /^0x0*3$/.test(parts[0]))) {
      qAppEv.run(tx.digest, i, seq, ts, parts[0], parts[1], parts[2], tx.transaction && tx.transaction.sender, JSON.stringify(plain(e.json) || {}));
      return;
    }
    if (!/::pool::(PoolCreated|Swapped|LiquidityChanged)$/.test(t)) return;
    const pkg = t.split('::')[0], j = plain(e.json) || {};
    if (t.endsWith('::PoolCreated')) qPool.run(j.pool, pkg, typeOf(j.type_a), typeOf(j.type_b), seq, ts, j.creator, BigInt(j.amount_a), BigInt(j.amount_b));
    else if (t.endsWith('::Swapped')) {
      qSwap.run(tx.digest, i, j.pool, seq, ts, j.a_to_b ? 1 : 0, BigInt(j.amount_in), BigInt(j.amount_out), BigInt(j.reserve_a), BigInt(j.reserve_b), j.trader);
      qPoolRes.run(BigInt(j.reserve_a), BigInt(j.reserve_b), j.pool);
    } else {
      qLiq.run(tx.digest, i, j.pool, seq, ts, j.added ? 1 : 0, BigInt(j.amount_a), BigInt(j.amount_b), BigInt(j.lp), j.provider);
      qPoolRes.run(BigInt(j.reserve_a), BigInt(j.reserve_b), j.pool);
    }
  });
}

async function fetchCp(seq) {
  for (let i = 0; ; i++) {
    try {
      return (await ledger.getCheckpoint({ checkpointId: { oneofKind: 'sequenceNumber', sequenceNumber: BigInt(seq) }, readMask: CP_MASK })).response.checkpoint;
    } catch (e) {
      if (i >= 4) throw e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

function seeAccount(addr, cp, ts) {
  const r = qAcctNew.run(addr, cp, ts, ts);
  dirty.add(addr);
  return r.changes > 0;
}

function storeCheckpoint(cp) {
  const seq = Number(cp.sequenceNumber);
  const ts = toMs(cp.summary && cp.summary.timestamp);
  const hour = Math.floor(ts / HOUR) * HOUR, day = Math.floor(ts / DAY) * DAY;
  let all = 0, user = 0, act = 0, fees = 0n, volume = 0n, fresh = 0;
  for (const tx of cp.transactions || []) {
    all++;
    const { kind, label } = classify(tx);
    if (kind === 'system') continue;
    user++;
    const sender = tx.transaction.sender;
    const activity = String(tx.transaction.gasPayment && tx.transaction.gasPayment.budget) === ACTIVITY_BUDGET ? 1 : 0;
    act += activity;
    const g = (tx.effects && tx.effects.gasUsed) || {};
    const fee = BigInt(g.computationCost || 0) + BigInt(g.storageCost || 0) - BigInt(g.storageRebate || 0);
    fees += fee;
    const deltas = new Map();
    const tok = new Map();
    for (const b of tx.balanceChanges || []) {
      if (b.coinType !== RVRB) {
        const m = tok.get(b.coinType) || new Map();
        m.set(b.address, (m.get(b.address) || 0n) + BigInt(b.amount));
        tok.set(b.coinType, m);
        continue;
      }
      deltas.set(b.address, (deltas.get(b.address) || 0n) + BigInt(b.amount));
    }
    deltas.set(sender, deltas.get(sender) || 0n);
    let amount = 0n, recipient = null;
    for (const [a, v] of deltas) if (a !== sender && v > 0n) { amount += v; recipient = recipient || a; }
    volume += amount;
    storeEvents(tx, seq, ts);
    const ok = tx.effects && tx.effects.status && tx.effects.status.success === false ? 0 : 1;
    qTx.run(tx.digest, seq, ts, sender, kind, label, ok, fee, amount, recipient, activity);
    for (const [a, v] of deltas) {
      if (seeAccount(a, seq, ts)) fresh++;
      qAcctTx.run(a, tx.digest, seq, ts, v);
      const isSender = a === sender;
      qAcctUpd.run(ts, isSender ? 1 : 0, isSender && amount > 0n ? amount : 0n, !isSender && v > 0n ? v : 0n, activity, a);
    }
    for (const [ct, m] of tok) {
      if (qTokNew.run(ct, seq, ts, sender, tx.digest).changes) newTokens.add(ct);
      let moved = 0n, to = null;
      for (const [a, v] of m) {
        qTokBal.run(ct, a, v);
        seeAccount(a, seq, ts);
        qAcctTx.run(a, tx.digest, seq, ts, 0n);
        if (a !== sender && v > 0n) { moved += v; to = to || a; }
      }
      // Without a recipient the transaction changed the supply: a positive sum is a mint, a negative sum a burn.
      if (!to) for (const v of m.values()) moved += v;
      qTokTx.run(ct, tx.digest, seq, ts, sender, to, moved);
    }
    qHourActive.run(hour, sender);
    qDayActive.run(day, sender);
  }
  qHour.run(hour, all, user, act, fees, volume, fresh, 1);
}

// Genesis coins are created without balance changes, so their owners are read from object owners.
async function seedGenesis() {
  if (getMeta('genesis_seeded')) return;
  const cp = (await ledger.getCheckpoint({ checkpointId: { oneofKind: 'sequenceNumber', sequenceNumber: 0n },
    readMask: { paths: ['summary.timestamp', 'transactions.effects.changed_objects.object_type', 'transactions.effects.changed_objects.output_owner'] } })).response.checkpoint;
  const ts = toMs(cp.summary && cp.summary.timestamp);
  for (const t of cp.transactions || []) for (const o of (t.effects && t.effects.changedObjects) || []) {
    const ty = o.objectType || '', ow = o.outputOwner && o.outputOwner.address;
    if (ow && ((ty.includes('coin::Coin<') && ty.includes('::sui::SUI>')) || ty.includes('StakedSui'))) seeAccount(ow, 0, ts);
  }
  setMeta.run('genesis_seeded', '1');
}

let latest = 0, next = Number(getMeta('next_cp', '0')), syncing = false;

async function sync() {
  if (syncing) return;
  syncing = true;
  try {
    const info = (await ledger.getServiceInfo({})).response;
    latest = Number(info.checkpointHeight || 0);
    const lowest = Number(info.lowestAvailableCheckpoint || 0);
    if (next < lowest) next = lowest;
    while (next <= latest) {
      const end = Math.min(latest, next + BATCH - 1);
      const seqs = [];
      for (let s = next; s <= end; s++) seqs.push(s);
      const cps = new Array(seqs.length);
      let i = 0;
      await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (i < seqs.length) { const k = i++; cps[k] = await fetchCp(seqs[k]); }
      }));
      db.exec('BEGIN');
      try {
        for (const cp of cps) storeCheckpoint(cp);
        setMeta.run('next_cp', String(end + 1));
        db.exec('COMMIT');
      } catch (e) { db.exec('ROLLBACK'); throw e; }
      next = end + 1;
    }
  } catch (e) {
    console.error('sync', e.message);
  }
  syncing = false;
}

async function refreshBalances() {
  const list = [...dirty].slice(0, 400);
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < list.length) {
      const a = list[i++];
      try {
        const b = (await state.getBalance({ owner: a, coinType: RVRB })).response.balance;
        qBal.run(BigInt((b && b.balance) || 0), Date.now(), a);
        dirty.delete(a);
      } catch (e) { /* retried on the next round */ }
    }
  }));
}

// Token names, symbols and decimals come from the coin registry through GetCoinInfo.
async function refreshTokens() {
  const list = [...newTokens, ...db.prepare('SELECT coin_type FROM token WHERE meta_at<?').all(Date.now() - 3600000).map((r) => r.coin_type)].slice(0, 50);
  for (const ct of new Set(list)) {
    try {
      const r = (await state.getCoinInfo({ coinType: ct })).response;
      const m = r.metadata || {};
      db.prepare('UPDATE token SET name=?, symbol=?, decimals=?, description=?, icon=?, regulated=?, meta_at=? WHERE coin_type=?')
        .run(m.name || '', m.symbol || ct.split('::').pop(), Number(m.decimals || 0), m.description || '', m.iconUrl || '', r.regulatedMetadata ? 1 : 0, Date.now(), ct);
      newTokens.delete(ct);
    } catch (e) { /* the registry entry may not be finalized yet */ }
  }
}

const EP_MASK = { paths: ['epoch', 'first_checkpoint', 'start', 'reference_gas_price', 'system_state.validators.total_stake',
  'system_state.validators.active_validators.address', 'system_state.validators.active_validators.name',
  'system_state.validators.active_validators.commission_rate', 'system_state.validators.active_validators.staking_pool'] };

function storeEpoch(e) {
  const n = Number(e.epoch), vs = (e.systemState && e.systemState.validators) || {};
  db.prepare('INSERT OR REPLACE INTO epoch VALUES(?,?,?,?,?)').run(n, toMs(e.start), Number(e.firstCheckpoint || 0), BigInt(vs.totalStake || 0), Number(e.referenceGasPrice || 0));
  const q = db.prepare('INSERT OR REPLACE INTO val_epoch VALUES(?,?,?,?,?,?,?,?)');
  for (const v of vs.activeValidators || []) {
    const p = v.stakingPool || {};
    q.run(n, v.address, v.name || '', p.id || '', BigInt(p.suiBalance || 0), BigInt(p.rewardsPool || 0), BigInt(p.poolTokenBalance || 0), Number(v.commissionRate || 0));
  }
}

async function syncEpochs() {
  try {
    const cur = (await ledger.getEpoch({ readMask: EP_MASK })).response.epoch;
    const now = Number(cur.epoch);
    const have = db.prepare('SELECT epoch FROM epoch').all().map((r) => r.epoch);
    for (let n = 0; n < now; n++) {
      if (have.includes(n)) continue;
      try { storeEpoch((await ledger.getEpoch({ epoch: BigInt(n), readMask: EP_MASK })).response.epoch); } catch (e) { /* epoch pruned */ }
    }
    storeEpoch(cur);
  } catch (e) {
    console.error('epochs', e.message);
  }
}

// Hourly active counts come from hour_active, which is pruned after two days to keep the file small.
function rollupActive() {
  db.exec(`UPDATE hourly SET active=(SELECT COUNT(*) FROM hour_active h WHERE h.hour=hourly.hour)
    WHERE hour IN (SELECT DISTINCT hour FROM hour_active)`);
  const cut = Date.now() - 2 * DAY;
  db.prepare('DELETE FROM hour_active WHERE hour<?').run(cut);
}

// ---------------------------------------------------------------- HTTP API
const norm = (a) => { a = String(a || '').toLowerCase(); if (!/^0x[0-9a-f]{1,64}$/.test(a)) return null; return '0x' + a.slice(2).padStart(64, '0'); };

function rewardsFor(addr) {
  const rows = db.prepare('SELECT epoch, name, commission, stake/1e9 stake, rewards_pool/1e9 rewards_pool, pool_tokens/1e9 pool_tokens FROM val_epoch WHERE addr=? ORDER BY epoch').all(addr);
  return rows.map((r, i) => {
    const n = rows[i + 1];
    const rate = r.pool_tokens ? r.stake / r.pool_tokens : 1;
    const nrate = n && n.pool_tokens ? n.stake / n.pool_tokens : null;
    return { epoch: r.epoch, stake: r.stake, rewards: n ? Math.max(0, n.rewards_pool - r.rewards_pool) : null,
      apy: nrate ? (Math.pow(nrate / rate, 365) - 1) * 100 : null, commission: r.commission / 100, name: r.name };
  });
}

const TOK_COLS = `t.coin_type coinType, t.name, t.symbol, t.decimals, t.description, t.icon, t.regulated, t.creator, t.first_cp firstCp, t.first_ts firstTs, t.digest,
  (SELECT COUNT(*) FROM tok_bal b WHERE b.coin_type=t.coin_type AND b.bal>0) holders,
  (SELECT CAST(SUM(bal) AS TEXT) FROM tok_bal b WHERE b.coin_type=t.coin_type) supply,
  (SELECT COUNT(*) FROM tok_tx x WHERE x.coin_type=t.coin_type) transfers`;
// Supplies are returned as strings in base units because they can exceed 2^53.
function token(ct, q, sub) {
  if (sub === 'holders') {
    const limit = Math.min(500, Number(q.get('limit') || 100));
    return db.prepare('SELECT addr, CAST(bal AS TEXT) balance FROM tok_bal WHERE coin_type=? AND bal>0 ORDER BY bal DESC LIMIT ?').all(ct, limit);
  }
  if (sub === 'txs') {
    const limit = Math.min(200, Number(q.get('limit') || 50));
    return db.prepare('SELECT digest, cp, ts, sender, recipient, CAST(amount AS TEXT) amount FROM tok_tx WHERE coin_type=? ORDER BY cp DESC LIMIT ?').all(ct, limit);
  }
  return db.prepare(`SELECT ${TOK_COLS} FROM token t WHERE t.coin_type=?`).get(ct) || { error: 'Unknown token' };
}

function shieldPkg() { const c = dexConfig(); return (c && c.shield && c.shield.package) || ''; }
function dexConfig() {
  try { return existsSync(DEX_CONFIG) ? JSON.parse(readFileSync(DEX_CONFIG, 'utf8')) : null; } catch (e) { return null; }
}
// Amounts are strings in base units because reserves can exceed 2^53.
const POOL_COLS = `p.id, p.type_a typeA, p.type_b typeB, p.cp, p.ts, p.creator, CAST(p.reserve_a AS TEXT) reserveA, CAST(p.reserve_b AS TEXT) reserveB,
  (SELECT COUNT(*) FROM swap s WHERE s.pool=p.id AND s.ts>=?) swaps24h,
  (SELECT CAST(COALESCE(SUM(CASE WHEN a_to_b=1 THEN amount_in ELSE amount_out END),0) AS TEXT) FROM swap s WHERE s.pool=p.id AND s.ts>=?) volumeA24h,
  (SELECT CAST(COALESCE(SUM(CASE WHEN a_to_b=0 THEN amount_in ELSE amount_out END),0) AS TEXT) FROM swap s WHERE s.pool=p.id AND s.ts>=?) volumeB24h,
  (SELECT COUNT(*) FROM swap s WHERE s.pool=p.id) swaps`;
function pools() {
  const c = dexConfig();
  const since = Date.now() - DAY;
  const rows = db.prepare(`SELECT ${POOL_COLS}, p.pkg FROM pool p ORDER BY p.cp`).all(since, since, since);
  return c && c.package ? rows.filter((r) => r.pkg === c.package) : rows;
}

const routes = {
  '/config': () => ({ dex: dexConfig() }),
  // Events of one module and name, newest first. `addr` keeps events that mention the address.
  '/events': (q) => {
    const c = dexConfig() || {};
    const module = q.get('module'), name = q.get('name');
    const pkg = module === 'network' ? c.connect && c.connect.package : module === 'vesting' ? c.vesting && c.vesting.package : null;
    if (!APP_MODULES.has(module)) return [];
    const limit = Math.min(500, Number(q.get('limit') || 100));
    const a = q.get('addr') ? norm(q.get('addr')) : null;
    const rows = db.prepare(`SELECT digest, cp, ts, pkg, name, sender, json FROM app_event WHERE module=? ${name ? 'AND name=?' : ''} ${pkg ? 'AND pkg=?' : ''}
      ${a ? 'AND (sender=? OR json LIKE ?)' : ''} ORDER BY cp DESC, seq DESC LIMIT ?`).all(...[module, name, pkg].filter(Boolean), ...(a ? [a, '%' + a + '%'] : []), limit);
    return rows.map((r) => ({ ...r, json: JSON.parse(r.json) }));
  },
  '/dex/pools': () => pools(),
  // Notes of one shielded pool in tree order, from index `from`. `encrypted` is base64.
  '/shield/notes': (q) => {
    const pkg = shieldPkg();
    return db.prepare('SELECT idx i, commitment c, encrypted e FROM shield_note WHERE pool=? AND pkg=? AND idx>=? ORDER BY idx LIMIT ?')
      .all(q.get('pool') || '', pkg, Number(q.get('from') || 0), Math.min(10000, Number(q.get('limit') || 5000)));
  },
  '/shield/nullifiers': (q) => db.prepare('SELECT nullifier FROM shield_null WHERE pool=? AND pkg=? AND cp>=? ORDER BY cp')
    .all(q.get('pool') || '', shieldPkg(), Number(q.get('since') || 0)).map((r) => r.nullifier),
  // Totals per shielded pool. Amounts are strings in base units.
  '/shield/stats': () => db.prepare(`SELECT pool, COUNT(*) txs, CAST(SUM(deposit) AS TEXT) deposited, CAST(SUM(withdraw) AS TEXT) withdrawn,
      SUM(deposit>0) deposits, SUM(withdraw>0) withdrawals, SUM(deposit=0 AND withdraw=0) privateSends, MAX(ts) lastTs,
      (SELECT COUNT(*) FROM shield_note n WHERE n.pool=t.pool) notes
      FROM shield_tx t WHERE pkg=? GROUP BY pool`).all(shieldPkg()),
  '/tokens': () => db.prepare(`SELECT ${TOK_COLS} FROM token t ORDER BY holders DESC, t.first_cp`).all(),
  '/account-tokens': (q) => {
    const a = norm(q.get('addr'));
    return a ? db.prepare(`SELECT ${TOK_COLS}, CAST(b.bal AS TEXT) balance FROM tok_bal b JOIN token t ON t.coin_type=b.coin_type WHERE b.addr=? AND b.bal>0`).all(a) : [];
  },
  '/status': () => ({ checkpoint: next - 1, latest, synced: next > latest, rpc: RPC,
    accounts: db.prepare('SELECT COUNT(*) c FROM acct').get().c, transactions: db.prepare('SELECT COUNT(*) c FROM tx').get().c }),
  '/summary': () => {
    const now = Date.now();
    const h24 = db.prepare('SELECT SUM(tx_all) a, SUM(tx_user) u, SUM(tx_activity) w, SUM(fees)/1e9 f, SUM(volume)/1e9 v, SUM(new_accts) n FROM hourly WHERE hour>=?').get(now - DAY);
    const act24 = db.prepare('SELECT COUNT(DISTINCT addr) c FROM hour_active WHERE hour>=?').get(now - DAY).c;
    const tot = db.prepare('SELECT COUNT(*) c, SUM(CASE WHEN balance>0 THEN 1 ELSE 0 END) h FROM acct').get();
    return { accounts: tot.c, holders: tot.h || 0, active24h: act24, new24h: h24.n || 0, tx24h: h24.a || 0, userTx24h: h24.u || 0,
      activityTx24h: h24.w || 0, fees24h: h24.f || 0, volume24h: h24.v || 0, checkpoint: next - 1, synced: next > latest };
  },
  '/stats/hourly': (q) => {
    const hours = Math.min(24 * 90, Number(q.get('hours') || 168));
    return db.prepare('SELECT hour, tx_all txAll, tx_user txUser, tx_activity txActivity, fees/1e9 fees, volume/1e9 volume, new_accts newAccounts, active, checkpoints FROM hourly WHERE hour>=? ORDER BY hour')
      .all(Date.now() - hours * HOUR);
  },
  '/stats/daily': (q) => {
    const days = Math.min(400, Number(q.get('days') || 30));
    const rows = db.prepare(`SELECT (hour/${DAY})*${DAY} day, SUM(tx_all) txAll, SUM(tx_user) txUser, SUM(tx_activity) txActivity, SUM(fees)/1e9 fees,
      SUM(volume)/1e9 volume, SUM(new_accts) newAccounts FROM hourly WHERE hour>=? GROUP BY day ORDER BY day`).all(Date.now() - days * DAY);
    const act = db.prepare('SELECT COUNT(*) c FROM day_active WHERE day=?');
    return rows.map((r) => ({ ...r, active: act.get(r.day).c }));
  },
  '/holders': (q) => {
    const limit = Math.min(500, Number(q.get('limit') || 100)), offset = Number(q.get('offset') || 0);
    const t = db.prepare('SELECT COUNT(*) c, SUM(balance)/1e9 s FROM acct WHERE balance>0').get();
    const rows = db.prepare('SELECT addr, balance/1e9 balance, tx_count txCount, first_ts firstTs, last_ts lastTs, activity FROM acct WHERE balance>0 ORDER BY balance DESC LIMIT ? OFFSET ?').all(limit, offset);
    return { total: t.c, held: t.s || 0, rows };
  },
  '/validators/rewards': () => {
    const addrs = db.prepare('SELECT DISTINCT addr FROM val_epoch').all().map((r) => r.addr);
    return Object.fromEntries(addrs.map((a) => [a, rewardsFor(a)]));
  },
};

function account(addr, q, sub) {
  if (sub === 'txs') {
    const limit = Math.min(200, Number(q.get('limit') || 50)), before = Number(q.get('before') || 9e15);
    return db.prepare(`SELECT a.digest, a.cp, a.ts, a.delta/1e9 delta, t.sender, t.kind, t.label, t.ok, t.fee/1e9 fee, t.amount/1e9 amount, t.recipient, t.activity
      FROM acct_tx a JOIN tx t ON t.digest=a.digest WHERE a.addr=? AND a.cp<? ORDER BY a.cp DESC LIMIT ?`).all(addr, before, limit);
  }
  if (sub === 'daily') {
    return db.prepare(`SELECT (ts/${DAY})*${DAY} day, COUNT(*) txs, SUM(delta)/1e9 net FROM acct_tx WHERE addr=? AND ts>=? GROUP BY day ORDER BY day`)
      .all(addr, Date.now() - 120 * DAY);
  }
  const r = db.prepare('SELECT addr, first_cp, first_ts, last_ts, tx_count, sent/1e9 sent, received/1e9 received, balance/1e9 balance, activity FROM acct WHERE addr=?').get(addr);
  if (!r) return { addr, known: false };
  const rw = rewardsFor(addr);
  const total = db.prepare('SELECT COUNT(*) c FROM acct_tx WHERE addr=?').get(addr).c;
  const rank = db.prepare('SELECT COUNT(*) c FROM acct WHERE balance/1e9>?').get(r.balance).c + 1;
  return { addr, known: true, firstCp: r.first_cp, firstTs: r.first_ts, lastTs: r.last_ts, txCount: r.tx_count, total, sent: r.sent,
    received: r.received, balance: r.balance, rank, activity: !!r.activity, rewards: rw.length ? rw : undefined };
}

// The genesis file lets new validators and full nodes join. RIVERS_NETWORK_DIR is the network's config folder.
const NETWORK_DIR = process.env.RIVERS_NETWORK_DIR || '';
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/network/genesis.blob' && NETWORK_DIR && existsSync(NETWORK_DIR + '/genesis.blob')) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(readFileSync(NETWORK_DIR + '/genesis.blob'));
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  let out, code = 200;
  try {
    const pm = u.pathname.match(/^\/dex\/pool\/(0x[0-9a-f]+)\/swaps$/);
    const tm = u.pathname.match(/^\/token\/([^/]+)(?:\/(holders|txs))?$/);
    const m = u.pathname.match(/^\/account\/([^/]+)(?:\/(txs|daily))?$/);
    if (pm) out = db.prepare(`SELECT digest, cp, ts, a_to_b aToB, CAST(amount_in AS TEXT) amountIn, CAST(amount_out AS TEXT) amountOut,
      CAST(reserve_a AS TEXT) reserveA, CAST(reserve_b AS TEXT) reserveB, trader FROM swap WHERE pool=? ORDER BY cp DESC, seq DESC LIMIT ?`).all(pm[1], Math.min(500, Number(u.searchParams.get('limit') || 50)));
    else if (tm) out = token(decodeURIComponent(tm[1]), u.searchParams, tm[2]);
    else if (m) { const a = norm(m[1]); out = a ? account(a, u.searchParams, m[2]) : (code = 400, { error: 'Invalid address' }); }
    else if (routes[u.pathname]) out = routes[u.pathname](u.searchParams);
    else { code = 404; out = { error: 'Not found' }; }
  } catch (e) { code = 500; out = { error: e.message }; }
  res.writeHead(code);
  res.end(JSON.stringify(out));
}).listen(PORT, '0.0.0.0', () => console.log(`Rivers indexer on port ${PORT}, reading ${RPC}`));

async function loop() {
  try { await seedGenesis(); } catch (e) { console.error('genesis', e.message); }
  await syncEpochs();
  setInterval(sync, 1000);
  setInterval(refreshBalances, 5000);
  setInterval(syncEpochs, 60000);
  setInterval(refreshTokens, 4000);
  setInterval(rollupActive, 60000);
  sync();
}
loop();
