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
import { DatabaseSync } from 'node:sqlite';
import { SuiGrpcClient } from '@mysten/sui/grpc';

const RPC = process.env.RIVERS_RPC || 'http://127.0.0.1:9000';
const PORT = Number(process.env.RIVERS_INDEXER_PORT || 9200);
const DB_PATH = process.env.RIVERS_INDEXER_DB || './rivers-indexer.db';
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
  'transactions.effects.gas_used', 'transactions.balance_changes'] };

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
    for (const b of tx.balanceChanges || []) {
      if (b.coinType !== RVRB) continue;
      deltas.set(b.address, (deltas.get(b.address) || 0n) + BigInt(b.amount));
    }
    deltas.set(sender, deltas.get(sender) || 0n);
    let amount = 0n, recipient = null;
    for (const [a, v] of deltas) if (a !== sender && v > 0n) { amount += v; recipient = recipient || a; }
    volume += amount;
    const ok = tx.effects && tx.effects.status && tx.effects.status.success === false ? 0 : 1;
    qTx.run(tx.digest, seq, ts, sender, kind, label, ok, fee, amount, recipient, activity);
    for (const [a, v] of deltas) {
      if (seeAccount(a, seq, ts)) fresh++;
      qAcctTx.run(a, tx.digest, seq, ts, v);
      const isSender = a === sender;
      qAcctUpd.run(ts, isSender ? 1 : 0, isSender && amount > 0n ? amount : 0n, !isSender && v > 0n ? v : 0n, activity, a);
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

const routes = {
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

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  let out, code = 200;
  try {
    const m = u.pathname.match(/^\/account\/([^/]+)(?:\/(txs|daily))?$/);
    if (m) { const a = norm(m[1]); out = a ? account(a, u.searchParams, m[2]) : (code = 400, { error: 'Invalid address' }); }
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
  setInterval(rollupActive, 60000);
  sync();
}
loop();
