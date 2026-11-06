/* Rivers Scan · live explorer for the Rivers testnet. Reads the chain over gRPC-Web. */
import { SuiGrpcClient } from '@mysten/sui/grpc';

/* ---------- settings ---------- */
const DEF_RPC = 'https://psychic-guide-xvpv4rvg4pjhw54-9000.app.github.dev';
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} } };
const qs = new URLSearchParams(location.search);
const RPC = (qs.get('rpc') || store.get('rvScanRpc') || DEF_RPC).replace(/\/+$/, '');
const FAUCET = (qs.get('faucet') || store.get('rvScanFaucet') || RPC.replace(/-9000\./, '-9123.')).replace(/\/+$/, '');
const client = new SuiGrpcClient({ network: 'testnet', baseUrl: RPC });
const LS = client.ledgerService, SS = client.stateService;

/* ---------- constants ---------- */
const MIST = 1_000_000_000n;
const MAX_SUPPLY = 21_000_000, GENESIS_SUPPLY = 10_000_000, REWARD_FUND = 11_000_000, ERA_EPOCHS = 1825;
const RVRB_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
const GENESIS = [
  ['foundation-1', '0x07a8281075e73de243207fc153ef50b49639b1ad2248a6948c1c24d4deb2c2e2'],
  ['foundation-2', '0x427538b95b648603c6df38147c0a7a6c7faf5a4b84852ea11efb5534bb1a0cdb'],
  ['foundation-3', '0x330dbde1b6613d92f3c1471906c7f1ae586d6efd8f830669ab205b986774c904'],
  ['foundation-4', '0x3796fb0a8e8d56d5364864c3ba2a456bca55c3c7e688c9c6c2ed03041b20cc33'],
  ['foundation-5', '0x4d378d8724487410d9ae5690b34cf01e5da5f2f575a53903eeba461b78e9c044'],
  ['ecosystem-1', '0x79278fc360728f04f0aba3727be8d70c2d4c38cd4abda4a89f6bea001e8c16ba'],
  ['ecosystem-2', '0x80dad1f51ac32fa49279124dfec476793e0d1e2e3a63d5cf63adf17a0723bd2e'],
  ['ecosystem-3', '0x36e753d87ae5852b3635446775ce3324c42b9a6e69adb1cda479677372030264'],
  ['ecosystem-4', '0xf1f7a296b87689504d6093457f0e63d79d0596f253a55a0163b81726d0630b9b'],
  ['community-1', '0x86da6f0bb1b0f3ec8df6a14d5b432dc76741caf8a77d91ff3cba9b394fc179a0'],
  ['community-2', '0xce662b18c4a8d69b16e2a103dba34cc749eb887de7cb250baf0a03a1afdf1a81'],
  ['early-backers-1', '0xb746ef31ec841b20466f8accb154facadc835253a3980922d463a815013cb12f'],
  ['validator-bootstrap-1', '0x6e58dc3e70e7ed4bf493cc48ecf05df156ee7ddd2cebd5683c49090908ac4be1'],
  ['dex-liquidity-1', '0x8ae1a07107be02909783ead89a84b7d17b0a81c03042d8ba0624088cbeb222f3'],
];
const GROUP_LABEL = { foundation: 'Foundation', ecosystem: 'Ecosystem and grants', community: 'Community', 'early-backers': 'Early backers', 'validator-bootstrap': 'Validator bootstrap', 'dex-liquidity': 'DEX liquidity' };
const NAMES = new Map(GENESIS.map(([n, a]) => [a, n]));
const SYS_ADDR = '0x0000000000000000000000000000000000000000000000000000000000000000';

/* ---------- formatting ---------- */
const rv = x => { try { const b = BigInt(x ?? 0); return Number(b / 1000n) / 1e6; } catch { return 0; } };
const rvF = (x, d) => fmt(rv(x), d ?? (Math.abs(rv(x)) < 10 ? 4 : 2));
const tsMs = t => t ? Number(t.seconds) * 1000 + Math.floor((t.nanos || 0) / 1e6) : 0;
const FAUCET_ADDR = '0xdd5c04e0399b0970caa2b060e88a7019b850fd4adecc37de54ed74a085b645bd';
const nameOf = a => NAMES.get(a) || (a === SYS_ADDR ? 'Rivers system' : a === FAUCET_ADDR ? 'Testnet faucet' : null);
const addrLink = (a, k) => a ? '<a class="mono alink" href="#address-' + a + '">' + esc(nameOf(a) || short(a, k || 6)) + '</a>' : '<span class="dim">—</span>';
const cpBtn = v => '<button class="icobtn cpy" data-act="copy" data-v="' + esc(v) + '" aria-label="Copy">' + IC.copy + '</button>';

/* ---------- live state ---------- */
const L = { head: null, chainId: '', server: '', online: null, latency: 0, cps: new Map(), txs: [], seen: new Set(), lowest: 0, sys: null, epochStart: 0, rgp: 0,
  tpsHist: [], intHist: [], lastTotal: null, lastTs: 0, txView: store.get('rvScanTxView') || 'classic', txAll: false, oldest: null, loadingOld: false, gwBal: {}, era: 0 };

function kindOf(tx) {
  const d = tx?.transaction?.kind?.data; const k = d?.oneofKind || '';
  if (k === 'programmableTransaction') {
    const cmds = d.programmableTransaction.commands.map(c => c.command); const mc = cmds.find(c => c.oneofKind === 'moveCall');
    if (tx?.transaction?.sender === SYS_ADDR) return { sys: true, cls: 'system', label: mc ? mc.moveCall.module + '::' + mc.moveCall.function : 'System', type: 'Settlement' };
    if (mc) { const m = mc.moveCall; return { sys: false, cls: 'defi', label: m.module + '::' + m.function, type: 'Contract call' }; }
    if (cmds.some(c => c.oneofKind === 'publish')) return { sys: false, cls: 'defi', label: 'Publish package', type: 'Publish' };
    if (cmds.some(c => c.oneofKind === 'upgrade')) return { sys: false, cls: 'defi', label: 'Upgrade package', type: 'Upgrade' };
    return { sys: false, cls: 'transfer', label: 'Transfer', type: 'Transfer' };
  }
  const SYS = { consensusCommitPrologue: 'Consensus commit', consensusCommitPrologueV2: 'Consensus commit', consensusCommitPrologueV3: 'Consensus commit', consensusCommitPrologueV4: 'Consensus commit',
    randomnessStateUpdate: 'Randomness update', changeEpoch: 'Epoch change', endOfEpoch: 'Epoch change', genesis: 'Genesis', authenticatorStateUpdate: 'Login keys update' };
  return { sys: true, cls: 'system', label: SYS[k] || 'System', type: SYS[k] || 'System' };
}
function txAmount(tx, sender) {
  let out = 0n; for (const b of tx.balanceChanges || []) { if (b.coinType !== RVRB_TYPE) continue; const v = BigInt(b.amount); if (v > 0n && b.address !== sender) out += v; }
  return out;
}
function fee(g) { if (!g) return 0n; return BigInt(g.computationCost || 0) + BigInt(g.storageCost || 0); }
function rebate(g) { return g ? BigInt(g.storageRebate || 0) : 0n; }
function recip(tx, sender) { return (tx.balanceChanges || []).filter(b => b.coinType === RVRB_TYPE && BigInt(b.amount) > 0n && b.address !== sender).map(b => b.address); }

const CP_MASK = { paths: ['sequence_number', 'digest', 'summary.timestamp', 'summary.total_network_transactions', 'summary.epoch', 'summary.epoch_rolling_gas_cost_summary', 'summary.previous_digest',
  'transactions.digest', 'transactions.transaction.sender', 'transactions.transaction.kind', 'transactions.effects.status', 'transactions.effects.gas_used', 'transactions.balance_changes'] };
async function fetchCp(seq) {
  if (L.cps.has(seq)) return L.cps.get(seq);
  const r = (await LS.getCheckpoint({ checkpointId: { oneofKind: 'sequenceNumber', sequenceNumber: BigInt(seq) }, readMask: CP_MASK })).response.checkpoint;
  const ts = tsMs(r.summary.timestamp); const txs = (r.transactions || []).map(t => { const s = t.transaction?.sender; const k = kindOf(t);
    return { d: t.digest, seq, ts, sender: s, ...k, ok: t.effects?.status?.success !== false, fee: fee(t.effects?.gasUsed), amt: txAmount(t, s), to: recip(t, s) }; });
  const cp = { seq, digest: r.digest, ts, total: Number(r.summary.totalNetworkTransactions), epoch: Number(r.summary.epoch), prev: r.summary.previousDigest, txs, user: txs.filter(t => !t.sys).length };
  L.cps.set(seq, cp);
  if (L.cps.size > 600) { const ks = [...L.cps.keys()].sort((a, b) => a - b); for (const k of ks.slice(0, L.cps.size - 600)) L.cps.delete(k); }
  for (const t of txs) if (!L.seen.has(t.d)) { L.seen.add(t.d); L.txs.push(t); }
  L.txs.sort((a, b) => b.seq - a.seq); if (L.txs.length > 3000) { for (const t of L.txs.splice(3000)) L.seen.delete(t.d); }
  if (L.oldest == null || seq < L.oldest) L.oldest = seq;
  return cp;
}
async function inBatches(list, n, fn) { for (let i = 0; i < list.length; i += n) await Promise.all(list.slice(i, i + n).map(x => fn(x).catch(() => null))); }

async function poll() {
  const t0 = performance.now();
  try {
    const si = (await LS.getServiceInfo({})).response; L.latency = performance.now() - t0; L.online = true;
    L.chainId = si.chainId; L.server = si.server; L.lowest = Number(si.lowestAvailableCheckpoint || 0);
    const h = Number(si.checkpointHeight);
    const from = L.head == null ? Math.max(L.lowest, h - 40) : Math.max(L.head + 1, h - 12);
    const need = []; for (let s = from; s <= h; s++) need.push(s);
    if (need.length) { await inBatches(need, 8, fetchCp); L.head = h; onNewBlocks(need.map(s => L.cps.get(s)).filter(Boolean)); }
  } catch (e) { L.online = false; console.warn(e); }
  renderChrome(); updatePage();
}
async function pollSystem() {
  try {
    const ep = (await LS.getEpoch({ readMask: { paths: ['system_state', 'start', 'reference_gas_price'] } })).response.epoch;
    L.sys = ep.systemState; L.epochStart = Number(ep.systemState.epochStartTimestampMs || tsMs(ep.start)); L.rgp = Number(ep.referenceGasPrice || ep.systemState.referenceGasPrice || 0);
    const ss = L.sys.stakeSubsidy; L.era = Math.floor(Number(ss.distributionCounter) / Number(ss.stakeSubsidyPeriodLength || ERA_EPOCHS));
  } catch (e) { console.warn(e); }
}
function onNewBlocks(cps) {
  cps.sort((a, b) => a.seq - b.seq);
  for (const cp of cps) {
    if (L.lastTotal != null && cp.ts > L.lastTs) { const dt = (cp.ts - L.lastTs) / 1000; L.tpsHist.push((cp.total - L.lastTotal) / dt); L.intHist.push(cp.ts - L.lastTs); }
    L.lastTotal = cp.total; L.lastTs = cp.ts;
  }
  L.tpsHist = L.tpsHist.slice(-120); L.intHist = L.intHist.slice(-120);
  for (const cp of cps) spawnBlock(cp);
}
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
function tpsNow() { const n = L.intHist.slice(-20), t = L.tpsHist.slice(-20); if (!n.length) return 0; const cps = [...L.cps.values()].sort((a, b) => b.seq - a.seq).slice(0, 21); if (cps.length < 2) return 0;
  const a = cps[cps.length - 1], b = cps[0]; return (b.total - a.total) / Math.max(.001, (b.ts - a.ts) / 1000); }
function blockMs() { return avg(L.intHist.slice(-40)); }
function totalStake() { return L.sys ? rv(L.sys.validators.totalStake) : 0; }
function vals() { return L.sys ? L.sys.validators.activeValidators : []; }

/* ---------- shell ---------- */
const NAV = [
  { t: 'Home', h: 'home' },
  { t: 'Blockchain', items: [['txs', 'Transactions', 'Every transfer and contract call', IC.list], ['blocks', 'Blocks', 'Sealed by the validators', IC.cube], ['validators', 'Validators', 'Who secures Rivers', IC.server]] },
  { t: 'RVRB', h: 'rvrb' },
  { t: 'Faucet', h: 'faucet' },
];
let CUR = { page: 'home', arg: '' };
function parse() { const h = decodeURIComponent((location.hash || '#home').slice(1)); const m = h.match(/^(tx|block|address)-(.+)$/); if (m) return { page: m[1], arg: m[2] };
  return { page: ['home', 'txs', 'blocks', 'validators', 'rvrb', 'faucet', 'network'].includes(h) ? h : 'home', arg: '' }; }
const ACTIVE = { tx: 'txs', block: 'blocks', address: 'home' };
function navHtml() { const on = ACTIVE[CUR.page] || CUR.page; return NAV.map(g => { if (!g.items) return '<a href="#' + g.h + '" class="' + (on === g.h ? 'on' : '') + '">' + g.t + '</a>';
  const isOn = g.items.some(i => i[0] === on); return '<div class="dd ' + (isOn ? 'on' : '') + '"><button type="button" aria-haspopup="true">' + g.t + CARET + '</button><div class="menu" role="menu">' + g.items.map(i => '<a href="#' + i[0] + '" role="menuitem"><span class="ico">' + i[3] + '</span><b>' + i[1] + '</b><small>' + i[2] + '</small></a>').join('') + '</div></div>'; }).join(''); }
function shell() {
  const on = ACTIVE[CUR.page] || CUR.page; const tb = [['home', 'Home', IC.home], ['txs', 'Txns', IC.list], ['blocks', 'Blocks', IC.cube], ['rvrb', 'RVRB', IC.coins]];
  $('root').innerHTML = `<header class="xtop"><div class="xtopin"><a class="logo" href="#home">${logoSvg(34)}<span><b>RIVERS</b><small>SCAN</small></span></a>
   <nav class="xnav" aria-label="Rivers Scan">${navHtml()}</nav>
   <form class="search" id="gs" role="search"><span>${IC.search}</span><label for="gq" class="sr">Search Rivers</label><input id="gq" placeholder="Search by transaction, block number or address" autocomplete="off" spellcheck="false"></form>
   <a class="netpill" href="#network" id="netpill"><i></i><span>Testnet</span></a>${skinBtn()}<button class="icobtn hamb" data-act="mmenu" aria-label="Open menu">${MENU_ICON}</button></div>
   <div class="xtick"><div class="tickin" id="tick"></div></div></header>
  <div id="offline"></div>
  <main class="page" id="page"></main>
  <footer class="xfoot"><div class="xfootin"><div><div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">${logoSvg(28)}<b style="font-family:var(--f-display);letter-spacing:.05em">RIVERS SCAN</b></div><p>The open explorer for the Rivers testnet. Test RVRB has no value.</p></div>
   <div><b>Blockchain</b><a href="#txs">Transactions</a><a href="#blocks">Blocks</a><a href="#validators">Validators</a></div>
   <div><b>RVRB</b><a href="#rvrb">Supply and rewards</a><a href="#faucet">Get test RVRB</a></div>
   <div><b>Developers</b><a href="#network">Network and RPC</a><a href="https://github.com/Abiola3625/rivers-blockchain" target="_blank" rel="noopener">Source code</a></div></div></footer>
  <nav class="tabbar" aria-label="Rivers Scan">${tb.map(t => '<a href="#' + t[0] + '" class="' + (on === t[0] ? 'on' : '') + '">' + t[2] + '<span>' + t[1] + '</span></a>').join('')}<a href="#" data-act="mmenu">${MENU_ICON}<span>Menu</span></a></nav>
  <div class="scrim" id="scrim" hidden></div>
  <aside class="sheet" id="sheet" hidden role="dialog" aria-modal="true" aria-labelledby="shT"><div class="sh"><div><h3 id="shT" style="font-size:1.05rem"></h3><div class="muted" style="font-size:.76rem" id="shS"></div></div><button class="icobtn" id="shX" aria-label="Close">${IC.close}</button></div><div class="sb" id="shB"></div></aside>
  <div class="modal" id="modal" hidden></div><div class="toast" id="toast" hidden role="status"></div>`;
  $('gs').addEventListener('submit', e => { e.preventDefault(); search($('gq').value); });
  $('shX').addEventListener('click', closeSheet); $('scrim').addEventListener('click', closeSheet);
}
function skinBtn() { return '<button class="skin" data-act="skin" aria-label="Switch light or dark">' + (document.body.dataset.skin === 'light' ? IC.moon : IC.sun) + '</button>'; }
function search(q) {
  q = q.trim(); if (!q) return; const n = q.replace(/[,#\s]/g, '');
  if (/^\d+$/.test(n)) { location.hash = 'block-' + n; return; }
  if (/^0x[0-9a-fA-F]{1,64}$/.test(n)) { location.hash = 'address-' + '0x' + n.slice(2).toLowerCase().padStart(64, '0'); return; }
  const gw = GENESIS_ALL().find(g => g[0] === n.toLowerCase()); if (gw) { location.hash = 'address-' + gw[1]; return; }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(n)) { location.hash = 'tx-' + n; return; }
  toast('Enter a transaction digest, a block number or a 0x address.', false);
}
function renderChrome() {
  const t = $('tick'); if (!t) return; const st = L.online === false ? '<span class="live bad">OFFLINE</span>' : L.online ? '<span class="live">LIVE</span>' : '<span class="muted">CONNECTING</span>';
  const ss = L.sys?.stakeSubsidy;
  t.innerHTML = st + tk('BLOCK', L.head != null ? '#' + fmt(L.head) : '—') + tk('TPS', fmt(tpsNow(), 1)) + tk('BLOCK TIME', blockMs() ? fmt(blockMs()) + ' ms' : '—') + tk('EPOCH', L.sys ? L.sys.epoch : '—')
    + tk('VALIDATORS', vals().length || '—') + tk('STAKED', L.sys ? compact(totalStake()) + ' RVRB' : '—') + tk('REWARD FUND', ss ? compact(rv(ss.balance)) + ' RVRB' : '—') + tk('GAS', L.rgp ? fmt(L.rgp) + ' drops' : '—');
  const p = $('netpill'); if (p) p.className = 'netpill ' + (L.online === false ? 'bad' : L.online ? 'ok' : '');
  const o = $('offline'); if (o) o.innerHTML = L.online === false ? '<div class="offbar"><b>The testnet is not answering.</b> It runs in a GitHub Codespace. Open the codespace on GitHub to bring it back, or check the address under <a href="#network">Network</a>.</div>' : '';
}
const tk = (k, v) => '<span>' + k + ' <b>' + v + '</b></span>';

/* ---------- pages ---------- */
function route() {
  CUR = parse(); readPal(); shell();
  const P = PAGES[CUR.page]; $('page').innerHTML = '<div class="g rise" style="gap:18px">' + P.build(CUR.arg) + '</div>';
  document.title = (P.title ? (typeof P.title === 'function' ? P.title(CUR.arg) : P.title) + ' · ' : '') + 'Rivers Scan';
  P.after && P.after(CUR.arg); renderChrome(); updatePage(); window.scrollTo(0, 0);
}
function updatePage() { const P = PAGES[CUR.page]; try { P.update && P.update(CUR.arg); } catch (e) { console.error(e); } }

function txLi(t) { const amt = t.amt > 0n ? rvF(t.amt) + ' RVRB' : t.sys ? '' : '—';
  return '<a class="li click" href="#tx-' + t.d + '"><span class="ty ' + t.cls + '">' + esc(t.type) + '</span><span class="mono trunc">' + short(t.d, 8) + '</span><span class="r">' + amt + '</span>'
    + '<span class="s">' + (t.ok ? '' : 'Failed · ') + 'Block #' + fmt(t.seq) + ' · ' + ago(t.ts) + (t.sys ? '' : ' · from ' + esc(nameOf(t.sender) || short(t.sender, 6))) + (t.cls === 'defi' ? ' · ' + esc(t.label) : '') + '</span></a>'; }
function cpCard(c) { return '<a class="cpc" href="#block-' + c.seq + '" data-n="' + c.seq + '"><div class="meta"><span>BLOCK</span><span>' + ago(c.ts) + '</span></div><div class="n">#' + fmt(c.seq) + '</div><div class="fill"><i style="width:' + Math.min(100, c.txs.length / 6 * 100) + '%"></i></div><div class="meta"><span>' + c.txs.length + ' tx</span><span>' + (c.user ? c.user + ' user' : 'system') + '</span></div></a>'; }
function updConv(el) { if (!el) return; const list = [...L.cps.values()].sort((a, b) => b.seq - a.seq).slice(0, 14); const have = new Set([...el.children].map(x => +x.dataset.n));
  if (!el.children.length) { el.innerHTML = list.map(cpCard).join(''); return; }
  for (const c of list.filter(c => !have.has(c.seq)).reverse()) { el.insertAdjacentHTML('afterbegin', cpCard(c)); const n = el.firstElementChild; n.classList.add('enter'); }
  while (el.children.length > 14) el.lastElementChild.remove();
  [...el.children].forEach(n => { const c = L.cps.get(+n.dataset.n); if (c) n.querySelector('.meta span:last-child').textContent = ago(c.ts); }); }
function userTxs() { return L.txs.filter(t => !t.sys); }
const searched = () => L.head != null && L.oldest != null ? (L.head - L.oldest + 1) : 0;

const PAGES = {};
PAGES.home = {
  build: () => `
  <section class="hero hud"><canvas id="flow" aria-label="Live flow of Rivers blocks and transactions"></canvas>
   <div class="hcopy"><span class="eyebrow">Rivers Testnet · Live network</span><h2>Value that flows <em>freely</em>, sealed in blocks every second</h2><p>Every block below was just produced by the Rivers validators. Search any transaction, block or wallet.</p></div>
   <div class="hstats"><div><span class="cap">Throughput</span><div class="v glowtx" id="hT">—</div><span class="s">transactions / second</span></div><div><span class="cap">Block time</span><div class="v" id="hB">—</div><span class="s">average, last 40 blocks</span></div>
    <div><span class="cap">Latest block</span><div class="v" id="hC">—</div><span class="s" id="hE"></span></div><div><span class="cap">RVRB staked</span><div class="v" id="hS">—</div><span class="s" id="hS2"></span></div><div><span class="cap">Validators</span><div class="v" id="hV">—</div><span class="s">equal voting power</span></div></div></section>
  <div class="g c4 rise">${kpi('k1', 'Total transactions', IC.activity)}${kpi('k2', 'Reward fund left', IC.flame)}${kpi('k3', 'Reward this epoch', IC.stake)}${kpi('k4', 'Gas price', IC.bolt)}</div>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.cube}</span>Live blocks</h2><span class="live" id="convS">Live</span></div><div class="conv" id="conv"></div></section>
  <div class="g c2 ais"><section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.activity}</span>Latest transactions</h2><span class="sub" id="ltS"></span></div><div class="seg"><button data-act="hall" data-v="0" class="${L.txAll ? '' : 'on'}">Users</button><button data-act="hall" data-v="1" class="${L.txAll ? 'on' : ''}">All</button></div></div><div class="list" id="lt"></div><a class="btn wide" href="#txs">View all transactions</a></section>
   <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.bolt}</span>Throughput</h2><span class="sub">transactions per second, last blocks</span></div><span class="b info" id="pk"></span></div><div id="tpsC"></div><div class="kv" id="tpsK"></div>
    <div class="ch" style="margin-top:6px"><div class="ttl"><h2><span class="ico">${IC.clock}</span>Epoch ${'<span id="epN"></span>'}</h2><span class="sub">rewards are paid at the end of every epoch</span></div></div><div class="eprow"><div id="epR"></div><div class="kv" id="epK" style="flex:1"></div></div></section></div>`,
  after() { flowStart(); },
  update() {
    const ss = L.sys?.stakeSubsidy; const head = L.cps.get(L.head);
    set('hT', fmt(tpsNow(), 1)); set('hB', blockMs() ? fmt(blockMs()) + ' ms' : '—'); set('hC', L.head != null ? '#' + fmt(L.head) : '—'); set('hE', L.sys ? 'epoch ' + L.sys.epoch : '');
    set('hS', L.sys ? compact(totalStake()) : '—'); set('hS2', L.sys ? pct(totalStake() / MAX_SUPPLY, 1) + ' of max supply' : ''); set('hV', vals().length || '—');
    set('k1', head ? fmt(head.total) : '—'); set('k1s', 'since genesis, all types');
    set('k2', ss ? compact(rv(ss.balance)) + ' RVRB' : '—'); set('k2s', ss ? pct(rv(ss.balance) / REWARD_FUND, 2) + ' of 11M still to be mined' : '');
    set('k3', ss ? fmt(rv(ss.currentDistributionAmount), 2) : '—'); set('k3s', ss ? 'RVRB to stakers · ' + (perBlock() ? '≈ ' + fmt(perBlock(), 4) + ' per block' : '') : '');
    set('k4', L.rgp ? fmt(L.rgp) + ' drops' : '—'); set('k4s', L.rgp ? 'a transfer costs about ' + fmt(L.rgp * 2 / 1e6, 4) + ' RVRB' : '');
    updConv($('conv')); set('convS', blockMs() ? 'a block every ' + fmt(blockMs()) + ' ms' : 'Live');
    const list = (L.txAll ? L.txs : userTxs()).slice(0, 8); const lt = $('lt'); if (lt) { const h = list.length ? list.map(txLi).join('') : '<div class="empty">No user transactions in the last ' + fmt(searched()) + ' blocks. Send some test RVRB from the <a href="#faucet">faucet</a> and it appears here.</div>'; if (lt._h !== h) { lt.innerHTML = h; lt._h = h; } }
    set('ltS', fmt(userTxs().length) + ' user transactions in the last ' + fmt(searched()) + ' blocks');
    const tc = $('tpsC'); if (tc) tc.innerHTML = spark(L.tpsHist.slice(-60), 'var(--river)', 60).replace('class="spk"', 'class="spk big"');
    set('pk', 'peak ' + fmt(Math.max(0, ...L.tpsHist.slice(-120)), 1));
    const k = $('tpsK'); if (k) k.innerHTML = kvs([['Now', fmt(tpsNow(), 1) + ' tx/s'], ['Blocks seen', fmt(L.cps.size)], ['Response time', fmt(L.latency) + ' ms']]);
    epochBox();
  }
};
function perBlock() { const ss = L.sys?.stakeSubsidy; const ms = blockMs(); if (!ss || !ms || !L.sys) return 0; const blocks = Number(L.sys.parameters.epochDurationMs) / ms; return rv(ss.currentDistributionAmount) / blocks; }
function epochBox() {
  if (!L.sys) return; const dur = Number(L.sys.parameters.epochDurationMs); const f = clamp((Date.now() - L.epochStart) / dur, 0, 1); const left = Math.max(0, L.epochStart + dur - Date.now());
  set('epN', L.sys.epoch); const r = $('epR'); if (r) r.innerHTML = ring(f, 'var(--river)', 112, pct(f, 0), 'done');
  const k = $('epK'); if (k) k.innerHTML = kvs([['Started', new Date(L.epochStart).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })], ['Ends in', dur3(left)], ['Length', dur3(dur)], ['Reward at the end', L.sys ? fmt(rv(L.sys.stakeSubsidy.currentDistributionAmount), 2) + ' RVRB' : '—']]);
}
const dur3 = ms => { const h = Math.floor(ms / 3.6e6), m = Math.floor(ms % 3.6e6 / 6e4); return h >= 24 ? Math.floor(h / 24) + ' d ' + (h % 24) + ' h' : h + ' h ' + m + ' min'; };
const set = (id, v) => { const e = $(id); if (e && e.textContent !== String(v)) e.textContent = v; };
const kvs = rows => rows.map(r => '<div><span>' + r[0] + '</span><span>' + r[1] + '</span></div>').join('');

PAGES.txs = {
  title: 'Transactions',
  build: () => `
  <div class="g c4 rise">${kpi('t1', 'Transactions per second', IC.bolt)}${kpi('t2', 'User transactions seen', IC.activity)}${kpi('t3', 'Blocks searched', IC.cube)}${kpi('t4', 'Fees paid in view', IC.coins)}</div>
  <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.list}</span>Transactions</h2><span class="sub" id="txS"></span></div>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><div class="seg" role="group" aria-label="View"><button data-act="txv" data-v="classic" class="${L.txView === 'classic' ? 'on' : ''}">Classic</button><button data-act="txv" data-v="live" class="${L.txView === 'live' ? 'on' : ''}">Live view</button></div>
   <div class="seg" role="group" aria-label="Filter"><button data-act="txa" data-v="0" class="${L.txAll ? '' : 'on'}">Users</button><button data-act="txa" data-v="1" class="${L.txAll ? 'on' : ''}">All</button></div></div></div>
   ${L.txView === 'live' ? '<div class="lane" id="lane"></div>' : '<div class="tw"><table><thead><tr><th>Transaction</th><th>Type</th><th>From</th><th>To</th><th class="n">Amount</th><th class="n">Fee</th><th class="n">Block</th><th>Age</th><th>Status</th></tr></thead><tbody id="txT"></tbody></table></div>'}
   <div class="pager"><span id="txP"></span><button class="btn sm" data-act="older" id="olderB">Search 200 older blocks</button></div></section>`,
  update() {
    const list = (L.txAll ? L.txs : userTxs()); const ms = blockMs();
    set('t1', fmt(tpsNow(), 1)); set('t1s', 'all transaction types'); set('t2', fmt(userTxs().length)); set('t2s', 'transfers and contract calls');
    set('t3', fmt(searched())); set('t3s', L.oldest != null ? 'from #' + fmt(L.oldest) + ' to #' + fmt(L.head) : '');
    set('t4', rvF(list.reduce((a, t) => a + (t.fee > 0n ? t.fee : 0n), 0n), 4)); set('t4s', 'RVRB');
    set('txS', fmt(list.length) + ' shown · newest first'); set('txP', L.loadingOld ? 'Searching older blocks…' : 'Rivers Scan reads blocks straight from the chain. Search further back to find older transactions.');
    const b = $('olderB'); if (b) b.disabled = L.loadingOld || (L.oldest != null && L.oldest <= L.lowest);
    if (L.txView === 'live') return updLane(list);
    const tb = $('txT'); if (!tb) return; const rows = list.slice(0, 100).map(t => '<tr><td><a class="mono" href="#tx-' + t.d + '">' + short(t.d, 8) + '</a>' + cpBtn(t.d) + '</td><td><span class="ty ' + t.cls + '">' + esc(t.cls === 'defi' ? t.label : t.type) + '</span></td><td>' + (t.sys ? '<span class="dim">System</span>' : addrLink(t.sender)) + '</td><td>' + (t.to.length ? addrLink(t.to[0]) + (t.to.length > 1 ? ' +' + (t.to.length - 1) : '') : '<span class="dim">—</span>') + '</td><td class="n mono">' + (t.amt > 0n ? rvF(t.amt) : '—') + '</td><td class="n mono">' + (t.fee > 0n ? rvF(t.fee, 6) : '0') + '</td><td class="n"><a class="mono" href="#block-' + t.seq + '">' + fmt(t.seq) + '</a></td><td class="muted">' + ago(t.ts) + '</td><td>' + (t.ok ? '<span class="b ok dot">Success</span>' : '<span class="b bad dot">Failed</span>') + '</td></tr>').join('')
      || '<tr><td colspan="9"><div class="empty">No user transactions in the blocks searched so far. Get test RVRB from the <a href="#faucet">faucet</a>, or search older blocks.</div></td></tr>';
    if (tb._h !== rows) { tb.innerHTML = rows; tb._h = rows; }
  }
};
function updLane(list) {
  const el = $('lane'); if (!el) return; const show = list.slice(0, 40); const have = new Set([...el.children].map(x => x.dataset.d));
  const card = t => '<a class="lcard ' + t.cls + '" href="#tx-' + t.d + '" data-d="' + t.d + '"><span class="pulse"></span><span class="ty ' + t.cls + '">' + esc(t.cls === 'defi' ? t.label : t.type) + '</span><span class="mono">' + short(t.d, 6) + '</span><span class="flowln">' + (t.sys ? '<span class="dim">Rivers system</span>' : esc(nameOf(t.sender) || short(t.sender, 5))) + '<i></i>' + (t.to[0] ? esc(nameOf(t.to[0]) || short(t.to[0], 5)) : 'block #' + fmt(t.seq)) + '</span><b class="mono">' + (t.amt > 0n ? rvF(t.amt) + ' RVRB' : '#' + fmt(t.seq)) + '</b></a>';
  if (!el.children.length) { el.innerHTML = show.map(card).join('') || '<div class="empty">Waiting for transactions…</div>'; return; }
  const fresh = show.filter(t => !have.has(t.d)).reverse(); if (fresh.length && el.firstElementChild?.classList.contains('empty')) el.innerHTML = '';
  for (const t of fresh) { el.insertAdjacentHTML('afterbegin', card(t)); el.firstElementChild.classList.add('enter'); }
  while (el.children.length > 40) el.lastElementChild.remove();
}

PAGES.blocks = {
  title: 'Blocks',
  build: () => `<div class="g c4 rise">${kpi('b1', 'Latest block', IC.cube)}${kpi('b2', 'Block time', IC.clock)}${kpi('b3', 'Blocks per day', IC.activity)}${kpi('b4', 'Reward per block', IC.flame)}</div>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.cube}</span>Live blocks</h2><span class="live">Live</span></div><div class="conv" id="conv"></div></section>
  <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.list}</span>Latest blocks</h2><span class="sub">newest first</span></div></div><div class="tw"><table><thead><tr><th>Block</th><th>Digest</th><th>Age</th><th class="n">Transactions</th><th class="n">User</th><th class="n">Epoch</th><th class="n">Total transactions</th></tr></thead><tbody id="bT"></tbody></table></div></section>`,
  update() { const ms = blockMs(); set('b1', L.head != null ? '#' + fmt(L.head) : '—'); set('b2', ms ? fmt(ms) + ' ms' : '—'); set('b2s', 'average of the last 40');
    set('b3', ms ? compact(864e5 / ms) : '—'); set('b4', perBlock() ? fmt(perBlock(), 4) : '—'); set('b4s', 'RVRB, from the epoch reward at today’s block rate'); updConv($('conv'));
    const rows = [...L.cps.values()].sort((a, b) => b.seq - a.seq).slice(0, 40).map(c => '<tr><td><a class="mono" href="#block-' + c.seq + '">#' + fmt(c.seq) + '</a></td><td class="mono muted">' + short(c.digest, 8) + '</td><td class="muted">' + ago(c.ts) + '</td><td class="n">' + c.txs.length + '</td><td class="n">' + (c.user || '<span class="dim">0</span>') + '</td><td class="n">' + c.epoch + '</td><td class="n mono">' + fmt(c.total) + '</td></tr>').join('');
    const tb = $('bT'); if (tb && tb._h !== rows) { tb.innerHTML = rows; tb._h = rows; } }
};

PAGES.block = {
  title: a => 'Block #' + a,
  build: a => `<section class="card hud"><div class="ch"><div class="ttl"><span class="eyebrow">Block</span><h2 class="bigh mono">#${fmt(+a)}</h2></div><div class="btns"><a class="btn sm" href="#block-${+a - 1}">Previous</a><a class="btn sm" href="#block-${+a + 1}">Next</a></div></div><div id="bd"><div class="empty">Loading block…</div></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.list}</span>Transactions in this block</h2></div><div class="list" id="bdt"></div></section>`,
  async after(a) { const n = +a; try { const c = await fetchCp(n); if (CUR.page !== 'block' || +CUR.arg !== n) return;
      $('bd').innerHTML = '<div class="kv">' + kvs([['Status', '<span class="b ok dot">Final</span>'], ['Time', new Date(c.ts).toLocaleString('en-GB') + ' · ' + ago(c.ts)], ['Digest', '<span class="mono">' + short(c.digest, 10) + '</span>' + cpBtn(c.digest)], ['Previous block digest', '<span class="mono">' + (c.prev ? short(c.prev, 10) : '—') + '</span>'], ['Epoch', c.epoch], ['Transactions', c.txs.length + ' (' + c.user + ' from users)'], ['Total transactions on Rivers', fmt(c.total)]]) + '</div>';
      $('bdt').innerHTML = c.txs.map(txLi).join('') || '<div class="empty">Empty block.</div>';
    } catch (e) { $('bd').innerHTML = '<div class="empty">Block #' + fmt(n) + ' was not found. ' + (L.head != null && n > L.head ? 'It has not been produced yet; the latest block is #' + fmt(L.head) + '.' : 'This node may not keep blocks that old.') + '</div>'; $('bdt').innerHTML = ''; } }
};

const TX_MASK = { paths: ['digest', 'transaction.sender', 'transaction.kind', 'transaction.gas_payment', 'effects.status', 'effects.gas_used', 'effects.changed_objects', 'checkpoint', 'timestamp', 'balance_changes', 'events'] };
PAGES.tx = {
  title: a => 'Transaction ' + short(a, 6),
  build: a => `<section class="card hud"><div class="ch"><div class="ttl"><span class="eyebrow">Transaction</span><h2 class="bigh mono trunc">${short(a, 10)} ${cpBtn(a)}</h2></div><span id="txSt"></span></div><div id="txFlow" class="txflow"></div><div class="kv" id="txKv"><div class="empty">Loading transaction…</div></div></section>
   <div class="g c2 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.coins}</span>Balance changes</h2></div><div id="txBc"></div></section><section class="card"><div class="ch"><h2><span class="ico">${IC.code}</span>What it did</h2></div><div id="txCmd"></div></section></div>`,
  async after(a) {
    try { const tx = (await LS.getTransaction({ digest: a, readMask: TX_MASK })).response.transaction; if (CUR.page !== 'tx' || CUR.arg !== a) return;
      const s = tx.transaction?.sender; const k = kindOf(tx); const ok = tx.effects?.status?.success !== false; const g = tx.effects?.gasUsed; const f = fee(g); const amt = txAmount(tx, s); const to = recip(tx, s); const t = tsMs(tx.timestamp);
      $('txSt').innerHTML = ok ? '<span class="b ok dot">Success</span>' : '<span class="b bad dot">Failed</span>';
      $('txFlow').innerHTML = flowSvg(k.sys ? null : s, to, amt, k, Number(tx.checkpoint ?? 0));
      $('txKv').innerHTML = kvs([['Type', '<span class="ty ' + k.cls + '">' + esc(k.cls === 'defi' ? k.label : k.type) + '</span>'], ['Block', tx.checkpoint != null ? '<a class="mono" href="#block-' + tx.checkpoint + '">#' + fmt(Number(tx.checkpoint)) + '</a>' : '—'], ['Time', t ? new Date(t).toLocaleString('en-GB') + ' · ' + ago(t) : '—'],
        ['From', k.sys ? 'Rivers system' : addrLink(s, 8)], ['Amount sent', amt > 0n ? rvF(amt) + ' RVRB' : '—'], ['Network fee', rvF(f, 6) + ' RVRB'], ['Storage refund', rvF(rebate(g), 6) + ' RVRB back to the sender'], ['Gas budget', tx.transaction?.gasPayment ? rvF(tx.transaction.gasPayment.budget, 6) + ' RVRB at ' + fmt(Number(tx.transaction.gasPayment.price)) + ' drops' : '—'],
        ['Objects changed', fmt((tx.effects?.changedObjects || []).length)], ['Digest', '<span class="mono">' + short(a, 10) + '</span>' + cpBtn(a)]]) + (ok ? '' : '<div><span>Error</span><span class="mono" style="color:var(--bad)">' + esc(JSON.stringify(tx.effects?.status?.error || {}).slice(0, 160)) + '</span></div>');
      const bc = (tx.balanceChanges || []); $('txBc').innerHTML = bc.length ? '<div class="list">' + bc.map(b => { const v = BigInt(b.amount); return '<div class="li"><span>' + identicon(b.address, 26) + '</span><span>' + addrLink(b.address, 8) + '</span><span class="r" style="color:' + (v < 0n ? 'var(--bad)' : 'var(--ok)') + '">' + (v > 0n ? '+' : '') + rvF(v, 6) + ' ' + (b.coinType === RVRB_TYPE ? 'RVRB' : esc(b.coinType.split('::').pop())) + '</span></div>'; }).join('') + '</div>' : '<div class="empty">No balances changed.</div>';
      const d = tx.transaction?.kind?.data; let cmds = '';
      if (d?.oneofKind === 'programmableTransaction') cmds = d.programmableTransaction.commands.map((c, i) => { const x = c.command; const m = x.oneofKind === 'moveCall' ? x.moveCall : null;
        const what = { splitCoins: 'Split a coin', transferObjects: 'Send to an address', mergeCoins: 'Merge coins', moveCall: 'Call ' + (m ? m.module + '::' + m.function : ''), publish: 'Publish a package', makeMoveVector: 'Build a list', upgrade: 'Upgrade a package' }[x.oneofKind] || x.oneofKind;
        return '<div class="li"><span class="tag">' + (i + 1) + '</span><span>' + esc(what) + (m ? '<br><span class="mono dim" style="font-size:.7rem">' + short(m.package, 6) + '</span>' : '') + '</span><span></span></div>'; }).join('');
      else cmds = '<div class="li"><span class="tag">1</span><span>' + esc(k.label) + ' (run by the network itself)</span><span></span></div>';
      $('txCmd').innerHTML = '<div class="list">' + cmds + '</div>';
    } catch (e) { $('txKv').innerHTML = '<div class="empty">This transaction was not found on the Rivers testnet. Check the digest and try again.</div>'; }
  }
};
function flowSvg(from, to, amt, k, blk) {
  const W = 640, H = 150; const left = from ? esc(nameOf(from) || short(from, 5)) : 'Rivers system'; const right = to.length ? esc(nameOf(to[0]) || short(to[0], 5)) + (to.length > 1 ? ' +' + (to.length - 1) : '') : 'Block #' + fmt(blk);
  const mid = amt > 0n ? rvF(amt) + ' RVRB' : esc(k.cls === 'defi' ? k.label : k.type);
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + left + ' to ' + right + '"><defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stop-color="var(--deep)"/><stop offset="1" stop-color="var(--river)"/></linearGradient></defs>'
    + '<path d="M120 75 C 250 20, 390 130, 520 75" fill="none" stroke="url(#fg)" stroke-width="3" stroke-dasharray="6 8" class="dash"/>'
    + [0, 1, 2].map(i => '<circle r="5" fill="var(--river)"><animateMotion dur="2.4s" begin="' + (i * .8) + 's" repeatCount="indefinite" path="M120 75 C 250 20, 390 130, 520 75"/></circle>').join('')
    + node(70, left, from ? 'Sender' : 'Network') + node(570, right, to.length ? 'Receiver' : 'Sealed in') + '<rect x="250" y="56" width="140" height="36" rx="18" fill="var(--card2)" stroke="var(--hair3)"/><text x="320" y="79" text-anchor="middle" class="ftx">' + mid + '</text></svg>';
}
const node = (x, t, cap) => '<circle cx="' + x + '" cy="75" r="40" fill="var(--sunk)" stroke="var(--river)" stroke-opacity=".5"/><circle cx="' + x + '" cy="75" r="46" fill="none" stroke="var(--river)" stroke-opacity=".2"><animate attributeName="r" values="42;52;42" dur="3s" repeatCount="indefinite"/></circle><text x="' + x + '" y="72" text-anchor="middle" class="fcap">' + cap + '</text><text x="' + x + '" y="90" text-anchor="middle" class="ftx">' + t + '</text>';

PAGES.address = {
  title: a => nameOf(a) || 'Address ' + short(a, 6),
  build: a => { const nm = nameOf(a); return `<section class="card hud acard"><div class="ahead">${identicon(a, 64)}<div style="min-width:0"><span class="eyebrow">${nm ? 'Genesis wallet · ' + esc(GROUP_LABEL[nm.replace(/-\d+$/, '')] || '') : 'Address'}</span><h2 class="bigh">${esc(nm || 'Wallet')}</h2><div class="mono addr">${esc(a)} ${cpBtn(a)}</div></div></div>
   <div class="g c3" style="margin-top:6px"><div class="box"><span class="cap">RVRB balance</span><div class="mono bigv" id="aB">—</div><span class="muted" id="aB2"></span></div><div class="box"><span class="cap">Coins and objects</span><div class="mono bigv" id="aO">—</div><span class="muted">owned right now</span></div><div class="box"><span class="cap">Test RVRB</span><div><a class="btn pri sm" href="#faucet" data-act="fa" data-a="${a}">Get 50 test RVRB</a></div><span class="muted">free from the faucet</span></div></div></section>
   <div class="g c2 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.coins}</span>Balances</h2></div><div id="aBal"><div class="empty">Loading…</div></div></section><section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.activity}</span>Recent activity</h2><span class="sub">transactions that last touched this wallet's coins and objects</span></div></div><div class="list" id="aTx"><div class="empty">Loading…</div></div></section></div>`; },
  async after(a) {
    try { const [bals, objs] = await Promise.all([SS.listBalances({ owner: a }), SS.listOwnedObjects({ owner: a, pageSize: 100, readMask: { paths: ['object_id', 'object_type', 'previous_transaction', 'version'] } })]);
      if (CUR.page !== 'address' || CUR.arg !== a) return; const bl = bals.response.balances || []; const r = bl.find(b => b.coinType === RVRB_TYPE);
      $('aB').textContent = r ? rvF(r.balance, 4) : '0'; $('aB2').textContent = 'RVRB' + (r ? ' · ' + pct(rv(r.balance) / MAX_SUPPLY, 4) + ' of max supply' : '');
      const ob = objs.response.objects || []; $('aO').textContent = fmt(ob.length) + (objs.response.nextPageToken ? '+' : '');
      $('aBal').innerHTML = bl.length ? '<div class="list">' + bl.map(b => '<div class="li"><span class="tk rv">' + (b.coinType === RVRB_TYPE ? 'R' : '•') + '</span><span><b>' + (b.coinType === RVRB_TYPE ? 'RVRB' : esc(b.coinType.split('::').pop())) + '</b><br><span class="dim" style="font-size:.72rem">' + (b.coinType === RVRB_TYPE ? 'Native token' : esc(short(b.coinType, 8))) + '</span></span><span class="r">' + rvF(b.balance, 4) + '</span></div>').join('') + '</div>' : '<div class="empty">This address holds nothing yet.</div>';
      const digs = [...new Set(ob.map(o => o.previousTransaction).filter(Boolean))].slice(0, 25);
      const local = L.txs.filter(t => t.sender === a || t.to.includes(a)).map(t => t.d); for (const d of local) if (!digs.includes(d)) digs.push(d);
      if (!digs.length) { $('aTx').innerHTML = '<div class="empty">No activity yet.</div>'; return; }
      const got = (await LS.batchGetTransactions({ digests: digs.slice(0, 40), readMask: { paths: ['digest', 'transaction.sender', 'transaction.kind', 'effects.status', 'effects.gas_used', 'checkpoint', 'timestamp', 'balance_changes'] } })).response.transactions || [];
      const rows = got.map(g => g.result?.oneofKind === 'transaction' ? g.result.transaction : null).filter(Boolean).map(tx => { const s = tx.transaction?.sender; const k = kindOf(tx);
        const mine = (tx.balanceChanges || []).filter(b => b.address === a && b.coinType === RVRB_TYPE).reduce((x, b) => x + BigInt(b.amount), 0n);
        return { d: tx.digest, seq: Number(tx.checkpoint ?? 0), ts: tsMs(tx.timestamp), k, s, mine, ok: tx.effects?.status?.success !== false }; }).sort((x, y) => y.seq - x.seq);
      if (CUR.page !== 'address' || CUR.arg !== a) return;
      $('aTx').innerHTML = rows.map(t => '<a class="li click" href="#tx-' + t.d + '"><span class="ty ' + t.k.cls + '">' + esc(t.k.sys ? t.k.type : t.s === a ? 'Sent' : 'Received') + '</span><span class="mono trunc">' + short(t.d, 8) + '</span><span class="r" style="color:' + (t.mine < 0n ? 'var(--bad)' : t.mine > 0n ? 'var(--ok)' : 'var(--muted)') + '">' + (t.mine > 0n ? '+' : '') + (t.mine !== 0n ? rvF(t.mine, 4) + ' RVRB' : '—') + '</span><span class="s">Block #' + fmt(t.seq) + ' · ' + (t.ts ? ago(t.ts) : '') + (t.k.cls === 'defi' ? ' · ' + esc(t.k.label) : '') + '</span></a>').join('') || '<div class="empty">No activity yet.</div>';
    } catch (e) { console.warn(e); $('aBal').innerHTML = '<div class="empty">Could not read this address. Check that it is a full 0x address.</div>'; $('aTx').innerHTML = ''; }
  }
};

PAGES.validators = {
  title: 'Validators',
  build: () => `<div class="g c4 rise">${kpi('v1', 'Active validators', IC.server)}${kpi('v2', 'Total stake', IC.stake)}${kpi('v3', 'Minimum to join', IC.key)}${kpi('v4', 'Reference gas price', IC.bolt)}</div>
   <div class="g c21 ais"><section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.server}</span>Validator set</h2><span class="sub">epoch <span id="vE"></span></span></div></div><div class="tw"><table><thead><tr><th>Validator</th><th>Address</th><th class="n">Stake</th><th class="n">Voting power</th><th class="n">Commission</th><th class="n">Gas price</th><th class="n">Next epoch stake</th></tr></thead><tbody id="vT"></tbody></table></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.grid}</span>Stake share</h2></div><div class="donut" id="vD"></div><div class="ch" style="margin-top:6px"><h2><span class="ico">${IC.clock}</span>Epoch</h2></div><div class="eprow"><div id="epR"></div><div class="kv" id="epK" style="flex:1"></div></div></section></div>`,
  update() { if (!L.sys) return; const v = vals(); const tot = totalStake(); const P = L.sys.parameters;
    set('v1', v.length); set('v1s', 'max ' + P.maxValidatorCount); set('v2', compact(tot) + ' RVRB'); set('v2s', pct(tot / MAX_SUPPLY, 1) + ' of max supply'); set('v3', fmt(rv(P.minValidatorJoiningStake)) + ' RVRB'); set('v3s', 'removed below ' + fmt(rv(P.validatorVeryLowStakeThreshold)) + ' RVRB');
    set('v4', fmt(L.rgp) + ' drops'); set('v4s', '1 RVRB = 1,000,000,000 drops'); set('vE', L.sys.epoch);
    const rows = v.map(x => '<tr><td><div style="display:flex;gap:10px;align-items:center">' + identicon(x.address, 28) + '<b>' + esc(x.name) + '</b></div></td><td>' + addrLink(x.address) + '</td><td class="n mono">' + fmt(rv(x.stakingPool.suiBalance)) + '</td><td class="n mono">' + pct(Number(x.votingPower) / 10000, 2) + '</td><td class="n mono">' + pct(Number(x.commissionRate) / 10000, 2) + '</td><td class="n mono">' + fmt(Number(x.gasPrice)) + '</td><td class="n mono">' + fmt(rv(x.nextEpochStake)) + '</td></tr>').join('');
    const tb = $('vT'); if (tb && tb._h !== rows) { tb.innerHTML = rows; tb._h = rows; }
    const cols = ['var(--river)', 'var(--deep)', 'var(--violet)', 'var(--mint)', 'var(--gold)', 'var(--pearl)']; const parts = v.map((x, i) => [x.name, rv(x.stakingPool.suiBalance), cols[i % cols.length]]);
    const d = $('vD'); const h = donut(parts, compact(tot), 'STAKED') + legend(parts, compact); if (d && d._h !== h) { d.innerHTML = h; d._h = h; } epochBox(); }
};

function GENESIS_ALL() { return GENESIS; }
PAGES.rvrb = {
  title: 'RVRB',
  build: () => `<section class="card hud"><div class="tokhead"><span class="tk rv big">R</span><div><span class="eyebrow">Native token</span><h2 class="bigh">RVRB · Rivers</h2><p class="fg2" style="max-width:62ch">RVRB pays for every transaction and secures Rivers through staking. 21 million will ever exist: 10 million at genesis, and 11 million paid to stakers over 50 years, halving every 5 years.</p></div></div></section>
   <div class="g c4 rise">${kpi('r1', 'Maximum supply', IC.coins)}${kpi('r2', 'Mined so far', IC.flame)}${kpi('r3', 'Still to be mined', IC.lock)}${kpi('r4', 'Next halving', IC.clock)}</div>
   <div class="g c2 ais"><section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.grid}</span>Where RVRB is now</h2><span class="sub">live from the chain</span></div></div><div class="donut" id="rD"></div></section>
    <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.flame}</span>Halving schedule</h2><span class="sub">RVRB paid to stakers in each 5-year era</span></div><span class="b info" id="rEra"></span></div><div id="rH"></div><div class="kv" id="rK"></div></section></div>
   <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.users}</span>Genesis wallets</h2><span class="sub">the 10,000,000 RVRB created at genesis, with live balances</span></div><button class="btn sm" data-act="gwr">Refresh</button></div><div class="tw"><table><thead><tr><th>Wallet</th><th>Group</th><th>Address</th><th class="n">At genesis</th><th class="n">Now</th></tr></thead><tbody id="gT"></tbody></table></div></section>`,
  after() { loadGw(); },
  update() { const ss = L.sys?.stakeSubsidy; if (!ss) return; const left = rv(ss.balance), mined = REWARD_FUND - left, per = rv(ss.currentDistributionAmount), cnt = Number(ss.distributionCounter), plen = Number(ss.stakeSubsidyPeriodLength);
    set('r1', '21,000,000'); set('r1s', 'fixed forever, enforced by the chain'); set('r2', fmt(mined, 2)); set('r2s', 'paid to stakers in ' + fmt(cnt) + ' epochs'); set('r3', compact(left)); set('r3s', pct(left / REWARD_FUND, 3) + ' of the reward fund');
    const nextE = (Math.floor(cnt / plen) + 1) * plen; const days = nextE - cnt; set('r4', 'Epoch ' + fmt(nextE)); set('r4s', 'in about ' + fmt(days) + ' days (' + (days / 365).toFixed(1) + ' years)');
    const eras = []; let e1 = per * plen; for (let i = 0; i < 10; i++) eras.push(e1 / 2 ** i);
    const hh = bars(eras, eras.map((_, i) => 'E' + (i + 1)), 'var(--river)', 110); const rh = $('rH'); if (rh && rh._h !== hh) { rh.innerHTML = hh; rh._h = hh; }
    set('rEra', 'Now in era ' + (L.era + 1));
    const k = $('rK'); if (k) k.innerHTML = kvs([['Reward per epoch now', fmt(per, 4) + ' RVRB'], ['About per block', perBlock() ? fmt(perBlock(), 6) + ' RVRB' : '—'], ['Epoch length', L.sys ? dur3(Number(L.sys.parameters.epochDurationMs)) : '—'], ['Halving', 'every ' + fmt(plen) + ' epochs, rewards cut by ' + (ss.stakeSubsidyDecreaseRate / 100) + '%']]);
    const staked = totalStake(); const gw = Object.values(L.gwBal).reduce((a, b) => a + b, 0); const other = Math.max(0, MAX_SUPPLY - left - staked - gw);
    const parts = [['Staked with validators', staked, 'var(--river)'], ['Genesis wallets', gw, 'var(--deep)'], ['Other holders', other, 'var(--violet)'], ['Not yet mined', left, 'var(--hair3)']];
    const d = $('rD'); const h = donut(parts, '21M', 'MAX SUPPLY') + legend(parts, compact); if (d && d._h !== h) { d.innerHTML = h; d._h = h; }
    const rows = GENESIS_ALL().map(([n, a]) => { const g = n.replace(/-\d+$/, ''); const at = { foundation: 400000, ecosystem: 1000000, community: 1000000, 'early-backers': 1000000, 'validator-bootstrap': 600000, 'dex-liquidity': 400000 }[g];
      return '<tr><td><a href="#address-' + a + '"><b>' + n + '</b></a></td><td class="muted">' + GROUP_LABEL[g] + '</td><td class="mono"><a href="#address-' + a + '">' + short(a, 6) + '</a></td><td class="n mono">' + fmt(at) + '</td><td class="n mono">' + (L.gwBal[a] != null ? fmt(L.gwBal[a], 2) : '…') + '</td></tr>'; }).join('');
    const tb = $('gT'); if (tb && tb._h !== rows) { tb.innerHTML = rows; tb._h = rows; } }
};
async function loadGw() { await inBatches(GENESIS_ALL(), 6, async ([n, a]) => { const b = (await SS.getBalance({ owner: a, coinType: RVRB_TYPE })).response.balance; L.gwBal[a] = rv(b?.balance ?? 0); }); updatePage(); }

PAGES.faucet = {
  title: 'Faucet',
  build: () => `<div class="g c21 ais"><section class="card hud"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.droplet}</span>Get test RVRB</h2><span class="sub">50 RVRB per request, sent as 5 coins of 10 RVRB</span></div></div>
    <div class="fld"><label for="fA">Your Rivers wallet address</label><input class="in mono" id="fA" placeholder="0x…" autocomplete="off" spellcheck="false" value="${esc(qs.get('addr') || store.get('rvScanLastAddr') || '')}"></div>
    <button class="btn pri wide" data-act="faucet" id="fGo">Send me 50 test RVRB</button><div id="fR"></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.shield}</span>Good to know</h2></div><div class="list">${[['Test RVRB has no value', 'It exists only on the testnet, which will be reset before mainnet.'], ['Use it to try everything', 'Send, stake, create tokens and test contracts without risk.'], ['Fair use', 'Ask again when you run out. Please do not drain the faucet.']].map(x => '<div class="li"><span class="chk ok">✓</span><span><b style="font-size:.84rem">' + x[0] + '</b><br><span class="muted" style="font-size:.76rem">' + x[1] + '</span></span><span></span></div>').join('')}</div></section></div>`,
};
async function doFaucet() {
  const a0 = $('fA').value.trim(); const a = /^0x[0-9a-fA-F]{1,64}$/.test(a0) ? '0x' + a0.slice(2).toLowerCase().padStart(64, '0') : null;
  if (!a) return toast('Enter a 0x wallet address.', false); store.set('rvScanLastAddr', a); const b = $('fGo'); b.disabled = true; b.textContent = 'Sending…';
  try { const r = await fetch(FAUCET + '/v2/gas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ FixedAmountRequest: { recipient: a } }) }); const j = await r.json();
    if (j.status !== 'Success' || !j.coins_sent?.length) throw new Error(j.error || JSON.stringify(j.status));
    const d = j.coins_sent[0].transferTxDigest; const tot = j.coins_sent.reduce((x, c) => x + c.amount, 0) / 1e9;
    $('fR').innerHTML = '<div class="okbox"><b>' + fmt(tot) + ' test RVRB sent.</b><div class="kv">' + kvs([['To', addrLink(a, 8)], ['Transaction', '<a class="mono" href="#tx-' + d + '">' + short(d, 8) + '</a>']]) + '</div></div>'; toast(fmt(tot) + ' test RVRB is on its way.');
  } catch (e) { $('fR').innerHTML = '<div class="errbox">The faucet did not answer. It runs next to the testnet; if the testnet is online, try again in a minute.</div>'; }
  b.disabled = false; b.textContent = 'Send me 50 test RVRB';
}

PAGES.network = {
  title: 'Network',
  build: () => `<div class="g c2 ais"><section class="card hud"><div class="ch"><h2><span class="ico">${IC.globe}</span>Rivers testnet</h2><span id="nS"></span></div><div class="kv" id="nK"></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.sliders}</span>Connection</h2></div>
    <div class="fld"><label for="nR">RPC address</label><input class="in mono" id="nR" value="${esc(RPC)}" spellcheck="false"></div><div class="fld"><label for="nF">Faucet address</label><input class="in mono" id="nF" value="${esc(FAUCET)}" spellcheck="false"></div>
    <div class="btns"><button class="btn pri" data-act="nsave">Save and reconnect</button><button class="btn" data-act="nreset">Use the default</button></div>
    <p class="muted" style="font-size:.76rem">Changes apply to this browser only.</p></section></div>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.code}</span>Connect your app</h2><span class="sub">TypeScript, with the Sui SDK</span></div><pre class="code"><code>import { SuiGrpcClient } from '@mysten/sui/grpc';

const rivers = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: '${esc(RPC)}',
});
const { balance } = await rivers.getBalance({ owner: '0x…' });
// balance.balance is in drops: 1 RVRB = 1,000,000,000 drops</code></pre></section>`,
  update() { const st = $('nS'); if (st) st.innerHTML = L.online ? '<span class="b ok dot">Online</span>' : L.online === false ? '<span class="b bad dot">Offline</span>' : '<span class="b">Connecting</span>';
    const k = $('nK'); if (k) k.innerHTML = kvs([['Chain ID', '<span class="mono">' + esc(short(L.chainId || '—', 8)) + '</span>' + (L.chainId ? cpBtn(L.chainId) : '')], ['Latest block', L.head != null ? '#' + fmt(L.head) : '—'], ['Oldest block kept', '#' + fmt(L.lowest)], ['Epoch', L.sys ? L.sys.epoch : '—'], ['Protocol version', L.sys ? L.sys.protocolVersion : '—'], ['Node', esc(L.server || '—')], ['Response time', L.latency ? fmt(L.latency) + ' ms' : '—']]); }
};

/* ---------- hero flow canvas ---------- */
let FL = null;
function flowStart() { const cv = $('flow'); if (!cv) return; const fit = () => { const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = r.width * dpr; cv.height = r.height * dpr; cv._w = r.width; cv._h = r.height; cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit(); FL = { cv, parts: [], blocks: [], fit }; for (const c of [...L.cps.values()].sort((a, b) => a.seq - b.seq).slice(-8)) spawnBlock(c, true); }
function spawnBlock(c, quiet) { if (!FL || !$('flow')) return; const W = FL.cv._w, H = FL.cv._h; const lanes = 7;
  for (const t of c.txs) FL.parts.push({ x: -20 - Math.random() * 120, y: H * (.12 + .7 * ((hashCode(t.d) % lanes) / lanes)) + (Math.random() - .5) * 18, v: 90 + Math.random() * 120, r: t.sys ? 2 : 4.5, user: !t.sys, a: quiet ? .4 : 1 });
  FL.blocks.push({ x: W * .82, y: H * .42, seq: c.seq, born: performance.now(), n: c.txs.length }); if (FL.blocks.length > 6) FL.blocks.shift(); if (FL.parts.length > 400) FL.parts.splice(0, FL.parts.length - 400); }
let lastF = performance.now();
function frame(now) { const dt = Math.min(.05, (now - lastF) / 1000); lastF = now;
  if (FL && $('flow') && FL.cv.isConnected) { const c = FL.cv.getContext('2d'), W = FL.cv._w, H = FL.cv._h; c.clearRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { c.beginPath(); for (let x = 0; x <= W; x += 16) { const y = H * (.18 + i * .12) + Math.sin(x / 120 + now / 1400 + i) * 14; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = C.grid; c.lineWidth = 1.2; c.stroke(); }
    const bx = W * .82; for (const p of FL.parts) { p.x += p.v * dt; p.y += Math.sin(p.x / 60) * .3; if (p.x > bx) { p.y += (H * .42 - p.y) * .12; p.a -= dt * 1.6; } }
    FL.parts = FL.parts.filter(p => p.a > 0 && p.x < W + 20);
    const fadeX = W < 700 ? W * .15 : W * .45; for (const p of FL.parts) { c.globalAlpha = Math.max(0, Math.min(1, p.a, .12 + .88 * Math.max(0, p.x / fadeX))); c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fillStyle = p.user ? C.tok : C.acc; c.shadowColor = C.acc; c.shadowBlur = p.user ? 14 : 6; c.fill(); }
    c.shadowBlur = 0; c.globalAlpha = 1;
    FL.blocks.forEach((b, i) => { const age = (now - b.born) / 1000; const x = bx + age * 90, s = 34; const al = Math.max(0, 1 - age / 1.6); const last = i === FL.blocks.length - 1; if (al <= 0) return; c.globalAlpha = al; c.strokeStyle = C.acc; c.lineWidth = 1.5; c.fillStyle = C.light ? 'rgba(0,135,81,.10)' : 'rgba(31,229,140,.10)';
      c.beginPath(); c.roundRect ? c.roundRect(x - s / 2, b.y - s / 2, s, s, 7) : c.rect(x - s / 2, b.y - s / 2, s, s); c.fill(); c.stroke(); if (last) { c.fillStyle = C.fg; c.font = '11px JetBrains Mono, monospace'; c.textAlign = 'center'; c.fillText('#' + b.seq, x, b.y + s / 2 + 16); } });
    c.globalAlpha = 1; }
  requestAnimationFrame(frame); }

/* ---------- sheet, toast, menu ---------- */
function mmenu() { openSheet('Rivers Scan', '<div class="mmenu">' + NAV.map(g => g.items ? '<div class="grp"><span class="cap">' + g.t + '</span>' + g.items.map(i => '<a href="#' + i[0] + '" data-act="closesh"><span class="ico">' + i[3] + '</span>' + i[1] + '</a>').join('') + '</div>' : '<a href="#' + g.h + '" data-act="closesh"><span class="ico">' + ({ home: IC.home, rvrb: IC.coins, faucet: IC.droplet })[g.h] + '</span>' + g.t + '</a>').join('') + '<a href="#network" data-act="closesh"><span class="ico">' + IC.globe + '</span>Network</a></div>'); }
const ACTS = {
  copy: el => copyText(el.dataset.v), skin() { document.body.dataset.skin = document.body.dataset.skin === 'light' ? 'dark' : 'light'; store.set('rvScanSkin', document.body.dataset.skin); route(); },
  mmenu, closesh: () => closeSheet(), hall(el) { L.txAll = el.dataset.v === '1'; route(); }, txa(el) { L.txAll = el.dataset.v === '1'; route(); },
  txv(el) { L.txView = el.dataset.v; store.set('rvScanTxView', L.txView); route(); }, faucet: doFaucet, fa(el) { store.set('rvScanLastAddr', el.dataset.a); },
  gwr() { L.gwBal = {}; updatePage(); loadGw(); },
  async older() { if (L.loadingOld || L.oldest == null) return; L.loadingOld = true; updatePage(); const end = L.oldest - 1, start = Math.max(L.lowest, end - 199); const list = []; for (let s = end; s >= start; s--) list.push(s);
    await inBatches(list, 10, fetchCp); L.loadingOld = false; updatePage(); },
  nsave() { store.set('rvScanRpc', $('nR').value.trim() || null); store.set('rvScanFaucet', $('nF').value.trim() || null); location.search = ''; },
  nreset() { store.set('rvScanRpc', null); store.set('rvScanFaucet', null); location.search = ''; },
};
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; const f = ACTS[el.dataset.act]; if (f) { if (el.tagName === 'BUTTON' || el.getAttribute('href') === '#') e.preventDefault(); f(el, e); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); if (e.key === '/' && $('gq') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('gq').focus(); } });

/* ---------- boot ---------- */
(async function boot() {
  document.body.dataset.skin = store.get('rvScanSkin') || 'dark';
  document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
  window.addEventListener('hashchange', route); let lw = innerWidth; window.addEventListener('resize', () => { if (Math.abs(innerWidth - lw) > 40) { lw = innerWidth; if (FL) FL.fit(); } });
  route(); await Promise.all([poll(), pollSystem()]); updatePage();
  setInterval(poll, 1500); setInterval(pollSystem, 15000); setInterval(() => { renderChrome(); if (CUR.page === 'home' || CUR.page === 'validators') epochBox(); }, 5000);
  requestAnimationFrame(frame);
})();
