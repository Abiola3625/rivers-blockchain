/* ===================== RIVERS CONNECT (live) =====================
   The portal for banks and payment firms admitted to Rivers Connect. A payment is one transaction:
   the coin moves from the sending institution to the receiving one, and the ISO 20022 reference and
   purpose code are recorded on chain. Rivers Core admits institutions and sets their limits. */
const CN={n:null,me:null,pays:[],at:0,filter:'all',coin:null};
async function cnLoad(){try{CN.n=await rvNet();CN.me=CN.n&&WAL.addr?CN.n.inst[WAL.addr]||null:null;}catch(e){console.warn(e);}
 if(IDX.ok&&WAL.addr){try{CN.pays=await idxGet('/events?module=network&name=Payment&addr='+WAL.addr+'&limit=300');}catch(e){}}
 CN.at=Date.now();if(CUR.app==='institutions')VIEWS.institutions.update(CUR.sub);}
setInterval(()=>{if(WAL.kp)cnLoad();},15000);
function rvWho(){return CN.me?CN.me.name:'Not admitted';}
function rvBadge(){return CN.me?'<span class="b '+(CN.me.active?'ok':'warn')+' dot">'+(CN.me.active?'Admitted':'Suspended')+'</span>':'';}
/* Event coin types are bytes of the type name without 0x, delivered as base64. */
const cnType=b=>{try{return ntype('0x'+atob(b));}catch(e){return RV_T;}};
const CNP={SUPP:'Supplier payment',TRAD:'Trade settlement',SALA:'Salary',INTC:'Intra-company',TREA:'Treasury',TAXS:'Tax payment',LOAN:'Loan'};
const cnName=a=>CN.n&&CN.n.inst[a]?CN.n.inst[a].name:short(a,4);
const cnCoins=()=>{const l=[];if(dReady()){l.push(ntype(DEX.cfg.coins.NGNs),ntype(DEX.cfg.coins.USDs));}l.push(RV_T);WAL.toks.forEach(t=>{const c=ntype(t.ct);if(!l.includes(c)&&!/::pool::LP</.test(c))l.push(c);});return l;};
const cnBal=t=>{t=ntype(t);if(t===RV_T)return WAL.bal;const x=WAL.toks.find(k=>ntype(k.ct)===t);return x?stNum(x.raw,x.m.decimals):0;};
function cnHead(){const m=CN.me;return '<div class="ch"><div class="who" style="display:flex;gap:12px;align-items:center">'+identicon(WAL.addr,44)+'<div><div style="font-weight:800;font-size:1.02rem">'+esc(m.name)+'</div><div class="muted" style="font-size:.78rem">'+esc(m.city)+', '+esc(m.country)+' · Tier '+m.tier+' · '+(m.active?'Active':'Suspended')+'</div></div></div><div class="btns">'+(CN.n.paused?'<span class="b warn dot">Payments paused by Rivers</span>':'<span class="b ok dot">Payments open</span>')+'</div></div>';}
function cnIso(){const m=CN.me;const to=$('pyTo')&&$('pyTo').value;const t=CN.n&&CN.n.inst[to];const amt=$('pyA')?$('pyA').value:'';const coin=$('pyC')?$('pyC').value:'';const ref=$('pyRef')?$('pyRef').value:'';const pp=$('pyP')?$('pyP').value:'';
 const now=new Date().toISOString();const cur=coin?dSym(coin):'';
 return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
 <FIToFICstmrCdtTrf>
  <GrpHdr><MsgId>${esc(ref)}</MsgId><CreDtTm>${now}</CreDtTm><NbOfTxs>1</NbOfTxs><SttlmInf><SttlmMtd>CLRG</SttlmMtd><ClrSys><Prtry>RIVERS</Prtry></ClrSys></SttlmInf></GrpHdr>
  <CdtTrfTxInf>
   <PmtId><EndToEndId>${esc(ref)}</EndToEndId></PmtId>
   <IntrBkSttlmAmt Ccy="${esc(cur)}">${esc(amt)}</IntrBkSttlmAmt>
   <InstgAgt><FinInstnId><Nm>${esc(m.name)}</Nm><Othr><Id>${WAL.addr}</Id></Othr></FinInstnId></InstgAgt>
   <InstdAgt><FinInstnId><Nm>${esc(t?t.name:'')}</Nm><Othr><Id>${esc(to||'')}</Id></Othr></FinInstnId></InstdAgt>
   <Purp><Cd>${esc(pp)}</Cd></Purp>
  </CdtTrfTxInf>
 </FIToFICstmrCdtTrf>
</Document>`;}
const ISUBS=[['overview','Overview',IC.home],['payments','Payments',IC.list],['liquidity','Liquidity',IC.coins],['compliance','Compliance',IC.shield],['developers','Developers',IC.code]];
VIEWS.institutions={subs:ISUBS,
 build(sub){
  if(sub==='developers'){if(!RVC)rvConfig().then(()=>{if(CUR.sub==='developers')route();});return cnDev();}
  if(!WAL.kp)return rvGate('Rivers Connect','Rivers Connect is for banks and payment firms admitted to the Rivers network. Sign in with your institution wallet.','Create an institution wallet');
  if(!CN.loaded){CN.loaded=true;cnLoad().then(route);return '<div class="empty">Checking your institution…</div>';}
  if(!RVC||!RVC.connect)return lvSoonPage('Rivers Connect','Rivers Connect is not published on this testnet yet. Rivers Core publishes it during the service setup.');
  if(!CN.me)return `<section class="card hud gate">${logoSvg(56)}<h2>Not admitted yet</h2><p class="fg2">This wallet is not an admitted institution. Send this address to the Rivers team. Rivers Core admits it on chain with your legal name, location and limits.</p><div class="mono" style="word-break:break-all;font-size:.82rem">${WAL.addr}</div><div class="btns"><button class="btn pri" data-act="copy" data-v="${WAL.addr}">Copy address</button><button class="btn" data-act="cnre">Check again</button></div></section>`;
  const h='<section class="card">'+cnHead()+'</section>';
  if(sub==='overview')return h+`
  <div class="g c6" id="iK"></div>
  <div class="g c21 ais"><div class="card hud"><div class="ch"><div class="ttl"><h2>Counterparties</h2><span class="sub">Admitted institutions and your payments with each</span></div><span class="live">Live</span></div><div class="tw"><table><thead><tr><th>Institution</th><th>Location</th><th class="n">You sent</th><th class="n">You received</th><th>Status</th></tr></thead><tbody id="iConn"></tbody></table></div></div>
   <div class="card"><div class="ch"><h2>Settlement</h2></div><div class="kv" id="iSpeedKv"></div></div></div>
  <div class="card"><div class="ch"><h2>Recent payments</h2><a class="btn sm" href="#institutions-payments">All payments</a></div><div class="list" id="iRecent"></div></div>`;
  if(sub==='payments')return h+`
  <div class="g c12 ais"><div class="card hud"><div class="ch"><h2>New payment</h2><span class="b info">pacs.008</span></div>
    <div class="fld"><label for="pyTo">Beneficiary institution</label><select class="in" id="pyTo">${Object.entries(CN.n.inst).filter(([a,i])=>a!==WAL.addr&&i.active).map(([a,i])=>'<option value="'+a+'">'+esc(i.name)+' · '+esc(i.city)+'</option>').join('')||'<option value="">No other active institution yet</option>'}</select></div>
    <div class="amt"><div class="top"><span>Amount</span><span id="pyBal"></span></div><div class="mid"><input id="pyA" inputmode="decimal" placeholder="0.00" aria-label="Amount"><select id="pyC" aria-label="Currency">${cnCoins().map(t=>'<option value="'+t+'">'+esc(dSym(t))+'</option>').join('')}</select></div><div class="bot"><span id="pyUsd"></span><span id="pyLim"></span></div></div>
    <div class="r2"><div class="fld"><label for="pyRef">Reference</label><input class="in" id="pyRef" maxlength="35" placeholder="INV-20481"></div><div class="fld"><label for="pyP">Purpose</label><select class="in" id="pyP">${Object.entries(CNP).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')}</select></div></div>
    <div class="ctl soon" data-soon="Private settlement"><span class="n">Private settlement</span><label class="sw"><input type="checkbox" disabled aria-label="Private settlement"><i></i></label><span class="d">Only a zero-knowledge proof goes on the public chain</span></div>
    <div id="pyErr"></div><button class="btn pri wide" data-act="cnpay">Review payment</button>
    <div class="fld"><span class="cap">Message your core banking system sends</span><pre id="pyIso" style="max-height:240px"></pre></div>
    <div class="fld"><span class="cap">What the public chain records</span><pre id="pyChain"></pre></div>
    <details><summary class="cap" style="cursor:pointer">Batch payments (CSV)</summary><p class="rvnote">One payment per line: institution address, amount, reference, purpose. All lines settle in one transaction, in the currency chosen above.</p><textarea class="in mono" id="pyCsv" rows="5" placeholder="0x…,250000,SAL-NOV-01,SALA"></textarea><button class="btn sm" data-act="cnbatch">Send batch</button></details></div>
   <div class="card"><div class="ch"><h2>Payments</h2><div class="seg">${[['all','All'],['out','Sent'],['in','Received']].map(f=>'<button data-act="cnf" data-v="'+f[0]+'" class="'+(CN.filter===f[0]?'on':'')+'">'+f[1]+'</button>').join('')}</div></div>
    <div class="tw tall"><table><thead><tr><th>Payment</th><th>Direction</th><th>Counterparty</th><th class="n">Amount</th><th>Purpose</th><th class="n">Time</th></tr></thead><tbody id="pyT"></tbody></table></div></div></div>`;
  if(sub==='liquidity')return h+`
  <div class="g c4" id="lqK"></div>
  <div class="g c2 ais"><div class="card"><div class="ch"><h2>Settlement accounts</h2><span class="sub">Balances held by your institution wallet</span></div><div class="list" id="lqAcc"></div></div>
   <div class="card hud"><div class="ch"><h2>Convert</h2><span class="sub">Through Rivers DEX pools</span></div>
    <div class="r2"><div class="fld"><label for="cvF">From</label><select class="in" id="cvF">${cnCoins().map(t=>'<option value="'+t+'">'+esc(dSym(t))+'</option>').join('')}</select></div><div class="fld"><label for="cvT">To</label><select class="in" id="cvT">${cnCoins().map((t,i)=>'<option value="'+t+'"'+(i===1?' selected':'')+'>'+esc(dSym(t))+'</option>').join('')}</select></div></div>
    <div class="amt"><div class="top"><span>Amount</span><span id="cvBal"></span></div><div class="mid"><input id="cvA" inputmode="decimal" placeholder="0.00" aria-label="Amount to convert"></div></div>
    <div class="kv" id="cvKv"></div><div id="cvErr"></div><button class="btn pri wide" data-act="cncv">Convert</button></div></div>`;
  if(sub==='compliance')return h+`
  <div class="g c4" id="cpl"></div>
  <div class="g c2 ais"><div class="card"><div class="ch"><h2>Controls on your institution</h2><span class="sub">Set by Rivers Core and enforced on chain</span></div><div class="kv" id="cpL"></div></div>
   <div class="card"><div class="ch"><h2>What the chain checks on every payment</h2></div><div class="list">${['Both institutions are admitted and active','The amount is within your single-payment limit','Institutional payments are not paused','The reference is at most 35 characters and the purpose is a 4-letter ISO code'].map(x=>'<div class="li"><span class="b ok dot">Checked</span><span style="font-size:.84rem">'+x+'</span></div>').join('')}</div></div></div>
  <div class="card soon" data-soon="Regulator view keys"><div class="ch"><div class="ttl"><h2>Regulator view keys</h2><span class="sub">Let supervisors read your private payments. Opens with private settlement.</span></div></div><div class="empty">—</div></div>`;
  return '';},
 after(sub){if(!WAL.kp||!CN.me)return;cnLoad();
  if(sub==='payments')['pyTo','pyA','pyC','pyRef','pyP'].forEach(i=>$(i).addEventListener('input',()=>VIEWS.institutions.update('payments')));
  if(sub==='liquidity')['cvF','cvT','cvA'].forEach(i=>$(i).addEventListener('input',()=>VIEWS.institutions.update('liquidity')));},
 update(sub){if(!WAL.kp||!CN.me||!CN.n)return;if(!$({overview:'iK',payments:'pyT',liquidity:'lqK',compliance:'cpl'}[sub]||'page'))return;const m=CN.me;const P=CN.pays;
  if(sub==='overview'){const out=P.filter(p=>p.json.from===WAL.addr),inn=P.filter(p=>p.json.to===WAL.addr);
   $('iK').innerHTML=stat('Status',m.active?'Active':'Suspended',CN.n.paused?'network paused':'payments open')+stat('Payments sent',fmt(Number(m.sent)),'since admission')+stat('Payments received',fmt(Number(m.received)),'since admission')+stat('Single-payment limit',Number(m.payment_limit)?compact(Number(m.payment_limit)):'None','base units')+stat('Institutions',fmt(Object.keys(CN.n.inst).length),'on Rivers Connect')+stat('Network payments',fmt(CN.n.payments),'all institutions');
   $('iConn').innerHTML=Object.entries(CN.n.inst).filter(([a])=>a!==WAL.addr).map(([a,i])=>'<tr><td><b>'+esc(i.name)+'</b><div class="mono muted" style="font-size:.68rem">'+short(a,6)+'</div></td><td>'+esc(i.city)+', '+esc(i.country)+'</td><td class="n">'+out.filter(p=>p.json.to===a).length+'</td><td class="n">'+inn.filter(p=>p.json.from===a).length+'</td><td><span class="b '+(i.active?'ok':'warn')+' dot">'+(i.active?'Active':'Suspended')+'</span></td></tr>').join('')||'<tr><td colspan="5"><div class="empty">No other institution yet.</div></td></tr>';
   $('iSpeedKv').innerHTML=[['Final in',fmt(S.fin)+' ms, one block'],['Settlement','Gross, one payment per transaction'],['Network fee','About '+fmt(0.0021*(LV.rgp/1000),4)+' RVRB per payment'],['Joined',new Date(Number(m.joined_ms)).toLocaleDateString()]].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');
   $('iRecent').innerHTML=cnRows(P.slice(0,8),true)||'<div class="empty">No payments yet. <a href="#institutions-payments">Send the first one.</a></div>';}
  if(sub==='payments'){const c=$('pyC').value;set2('pyBal','Balance '+fmt(cnBal(c),4)+' '+dSym(c));const pr=dReady()?dPrice(c):null;const a=+$('pyA').value||0;set2('pyUsd',a&&pr!=null?'≈ '+usdF(a*pr):'');set2('pyLim',Number(m.payment_limit)?'Limit '+compact(stNum(String(m.payment_limit),dDec(c)))+' '+dSym(c):'No single-payment limit');
   $('pyIso').textContent=cnIso();$('pyChain').textContent='Payment #'+(CN.n.payments+1)+'\nfrom '+WAL.addr+'\nto   '+($('pyTo').value||'—')+'\namount '+(a||0)+' '+dSym(c)+'\nreference '+($('pyRef').value||'—')+'  purpose '+$('pyP').value;
   const f=CN.filter;const rows=P.filter(p=>f==='all'||(f==='out'&&p.json.from===WAL.addr)||(f==='in'&&p.json.to===WAL.addr));const h=rows.map(p=>{const j=p.json;const out=j.from===WAL.addr;const t=cnType(j.coin_type);
    return '<tr class="click" data-act="tx" data-id="'+p.digest+'"><td><b>'+esc(j.reference||'—')+'</b><div class="muted mono" style="font-size:.68rem">#'+j.number+'</div></td><td><span class="b '+(out?'warn':'ok')+'">'+(out?'Sent':'Received')+'</span></td><td>'+esc(cnName(out?j.to:j.from))+'</td><td class="n">'+fmt(stNum(String(j.amount),dDec(t)),2)+' '+esc(dSym(t))+'</td><td>'+esc(CNP[j.purpose]||j.purpose)+'</td><td class="n">'+ago(p.ts)+'</td></tr>';}).join('')||'<tr><td colspan="6"><div class="empty">'+(IDX.ok?'No payments yet.':'Payment history needs the Rivers indexer.')+'</div></td></tr>';const tb=$('pyT');if(tb._h!==h){tb.innerHTML=h;tb._h=h;}}
  if(sub==='liquidity'){const coins=cnCoins();$('lqK').innerHTML=coins.slice(0,4).map(t=>stat(dSym(t),fmt(cnBal(t),2),(dReady()&&dPrice(t)!=null?usdF(cnBal(t)*dPrice(t)):'balance'))).join('');
   $('lqAcc').innerHTML=coins.map(t=>'<div class="li">'+(t===RV_T?tokIcon('RVRB',30):stIco(dSym(t),30))+'<span><b>'+esc(dSym(t))+'</b><br><span class="muted" style="font-size:.72rem">'+(dReady()&&dPrice(t)!=null?usdF(dPrice(t))+' each':'')+'</span></span><span class="r">'+fmt(cnBal(t),4)+'</span></div>').join('');
   const f=$('cvF').value,t=$('cvT').value,a=+$('cvA').value||0;set2('cvBal','Balance '+fmt(cnBal(f),4));const q=dReady()&&f!==t?dQuote(f,t,a):null;$('cvKv').innerHTML=f===t?'<div><span>Choose two different currencies</span><span></span></div>':[['You receive about',q?fmt(q.out,4)+' '+dSym(t):'—'],['Route',q?[f].concat(q.route.map(x=>x[2])).map(dSym).join(' → '):dReady()?'No pool connects these':'Rivers DEX is not set up'],['Price impact',q?pct(q.impact,2):'—']].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');}
  if(sub==='compliance'){$('cpl').innerHTML=stat('Status',m.active?'Active':'Suspended','set by Rivers Core')+stat('Single-payment limit',Number(m.payment_limit)?compact(Number(m.payment_limit)):'None','base units')+stat('Network',CN.n.paused?'Paused':'Open','institutional payments')+stat('Tier',String(m.tier),'admission level');
   $('cpL').innerHTML=[['Legal name',esc(m.name)],['Location',esc(m.city)+', '+esc(m.country)],['Admitted',new Date(Number(m.joined_ms)).toLocaleDateString()],['Wallet',short(WAL.addr,8)],['Registry',RVC.connect?short(RVC.connect.network,6):'—']].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');}}};
function cnRows(list){return list.map(p=>{const j=p.json;const out=j.from===WAL.addr;const t=cnType(j.coin_type);return '<div class="li click" data-act="tx" data-id="'+p.digest+'"><span class="ty '+(out?'bank':'transfer')+'">'+(out?'Sent':'Received')+'</span><span>'+esc(cnName(out?j.to:j.from))+'<br><span class="muted" style="font-size:.72rem">'+esc(j.reference||'')+' · '+esc(CNP[j.purpose]||j.purpose)+'</span></span><span class="r">'+fmt(stNum(String(j.amount),dDec(t)),2)+' '+esc(dSym(t))+'</span><span class="s">'+ago(p.ts)+'</span></div>';}).join('');}
function cnDev(){const c=RVC&&RVC.connect;const pkg=c?c.package:'<connect package>',net=c?c.network:'<network object>';return `<div class="g c2 ais"><div class="card"><div class="ch"><h2><span class="ico">${IC.code}</span>Endpoints</h2></div><div class="kv">
 <div><span>Chain RPC (gRPC and gRPC-Web)</span><span class="mono" style="font-size:.74rem">${esc(LV_RPC)}</span></div><div><span>Indexer (JSON)</span><span class="mono" style="font-size:.74rem">${esc(LV_IDX)}</span></div>
 <div><span>Your payments</span><span class="mono" style="font-size:.74rem">GET /events?module=network&amp;name=Payment&amp;addr=…</span></div><div><span>Connect package</span><span class="mono" style="font-size:.74rem">${esc(short(pkg,8))}</span></div><div><span>Registry object</span><span class="mono" style="font-size:.74rem">${esc(short(net,8))}</span></div></div></div>
 <div class="card hud"><div class="ch"><h2>Send a payment from your systems</h2><span class="sub">TypeScript, @mysten/sui</span></div><pre style="font-size:.74rem">import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction, coinWithBalance } from '@mysten/sui/transactions';

const client = new SuiGrpcClient({ network: 'testnet', baseUrl: '${esc(LV_RPC)}' });
const tx = new Transaction();
tx.moveCall({
  target: '${esc(pkg)}::network::pay',
  typeArguments: [NGNS_COIN_TYPE],
  arguments: [
    tx.object('${esc(net)}'),
    coinWithBalance({ type: NGNS_COIN_TYPE, balance: 250_000_000000n }),
    tx.pure.address(BENEFICIARY_INSTITUTION),
    tx.pure.string('INV-20481'),   // ISO 20022 EndToEndId, at most 35 characters
    tx.pure.string('SUPP'),        // ISO 20022 purpose code
  ],
});
await client.signAndExecuteTransaction({ transaction: tx, signer: institutionKeypair });</pre></div></div>
 <div class="card"><div class="ch"><h2>ISO 20022 mapping</h2></div><div class="tw"><table><thead><tr><th>pacs.008 field</th><th>Rivers</th></tr></thead><tbody>${[['GrpHdr/MsgId, PmtId/EndToEndId','reference (35 characters)'],['IntrBkSttlmAmt and Ccy','amount and coin type of the coin sent'],['InstgAgt','sending institution wallet (transaction sender)'],['InstdAgt','receiving institution wallet (to)'],['Purp/Cd','purpose (4-letter code)'],['SttlmInf/ClrSys','RIVERS; final when the block is final'],['Settlement confirmation','Payment event: number, from, to, amount, reference, purpose']].map(r=>'<tr><td class="mono" style="font-size:.76rem">'+r[0]+'</td><td>'+r[1]+'</td></tr>').join('')}</tbody></table></div></div>`;}
function cnPayTx(tx,coinType,to,amount,ref,purpose,coin){const c=RVC.connect;tx.moveCall({target:c.package+'::network::pay',typeArguments:[coinType],arguments:[tx.object(c.network),coin||coinWithBalance({type:coinType,balance:amount}),tx.pure.address(to),tx.pure.string(ref),tx.pure.string(purpose)]});}
Object.assign(LACT,{
 cnre(){CN.loaded=false;route();},
 cnf(el){CN.filter=el.dataset.v;$$('[data-act=cnf]').forEach(b=>b.classList.toggle('on',b===el));VIEWS.institutions.update('payments');},
 cnpay(){const e=$('pyErr');e.innerHTML='';const to=$('pyTo').value;const c=$('pyC').value;const amt=stUnits($('pyA').value,dDec(c));const ref=$('pyRef').value.trim();const pp=$('pyP').value;
  if(!to)return e.innerHTML='<div class="errbox">Choose a beneficiary institution.</div>';if(!amt||amt<=0n)return e.innerHTML='<div class="errbox">Enter an amount.</div>';if(!ref)return e.innerHTML='<div class="errbox">Enter a reference.</div>';if(Number(amt)/Math.pow(10,dDec(c))>cnBal(c))return e.innerHTML='<div class="errbox">The amount is more than your balance.</div>';
  const lim=BigInt(CN.me.payment_limit||0);if(lim&&amt>lim)return e.innerHTML='<div class="errbox">The amount is above your single-payment limit.</div>';
  confirmBox('Send '+$('pyA').value+' '+dSym(c)+'?','<div class="kv"><div><span>To</span><span>'+esc(cnName(to))+'</span></div><div><span>Reference</span><span>'+esc(ref)+'</span></div><div><span>Purpose</span><span>'+esc(CNP[pp])+'</span></div></div>','Send payment',false,async()=>{const tx=new Transaction();cnPayTx(tx,c,to,amt,ref,pp);
   try{await rvSign(tx,'Payment '+ref+' settled.');$('pyA').value='';setTimeout(cnLoad,2500);}catch(err){e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';}});},
 cnbatch(){const e=$('pyErr');e.innerHTML='';const c=$('pyC').value;const lines=$('pyCsv').value.split('\n').map(l=>l.trim()).filter(Boolean);if(!lines.length)return e.innerHTML='<div class="errbox">Add at least one line.</div>';
  const rows=[];for(const [i,l] of lines.entries()){const [a,amt,ref,pp]=l.split(',').map(x=>(x||'').trim());const to=lvNorm(a);const u=stUnits(amt,dDec(c));if(!to||!CN.n.inst[to])return e.innerHTML='<div class="errbox">Line '+(i+1)+': not an admitted institution.</div>';if(!u||u<=0n)return e.innerHTML='<div class="errbox">Line '+(i+1)+': check the amount.</div>';if(!ref||ref.length>35)return e.innerHTML='<div class="errbox">Line '+(i+1)+': the reference must be 1 to 35 characters.</div>';if(!CNP[pp])return e.innerHTML='<div class="errbox">Line '+(i+1)+': the purpose must be one of '+Object.keys(CNP).join(', ')+'.</div>';rows.push([to,u,ref,pp]);}
  if(rows.length>200)return e.innerHTML='<div class="errbox">Send at most 200 payments per batch.</div>';const tot=rows.reduce((a,r)=>a+r[1],0n);
  confirmBox('Send '+rows.length+' payments?','<p class="fg2">Total '+fmt(Number(tot)/Math.pow(10,dDec(c)),2)+' '+dSym(c)+', settled together in one transaction.</p>','Send batch',false,async()=>{const tx=new Transaction();const parts=tx.splitCoins(coinWithBalance({type:c,balance:tot}),rows.map(r=>r[1]));rows.forEach((r,i)=>cnPayTx(tx,c,r[0],r[1],r[2],r[3],parts[i]));
   try{await rvSign(tx,rows.length+' payments settled.');$('pyCsv').value='';setTimeout(cnLoad,2500);}catch(err){e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';}});},
 async cncv(){const e=$('cvErr');e.innerHTML='';const f=$('cvF').value,t=$('cvT').value,a=+$('cvA').value||0;const q=dReady()&&f!==t?dQuote(f,t,a):null;if(!q)return e.innerHTML='<div class="errbox">No route for this conversion.</div>';if(a>cnBal(f))return e.innerHTML='<div class="errbox">The amount is more than your balance.</div>';
  const ain=stUnits(String(a),dDec(f));const min=BigInt(Math.floor(q.out*0.995*Math.pow(10,dDec(t))));try{await rvSign(dSwapTx(q.route,ain,min),'Converted '+a+' '+dSym(f)+' to about '+fmt(q.out,2)+' '+dSym(t)+'.');$('cvA').value='';}catch(err){e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';}},
});
(function(){const rc=renderChrome;renderChrome=function(){rc();const b=$('rbox');if(b&&RV_APP==='institutions'){b.innerHTML='<div class="row"><span class="muted">Network</span><b class="'+(CN.n&&!CN.n.paused?'up':'down')+'">'+(CN.n?CN.n.paused?'Paused':'Open':'—')+'</b></div><div class="row"><span class="muted">Final in</span><span class="mono">'+fmt(S.fin)+' ms</span></div><div class="row"><span class="muted">Your status</span><span class="mono">'+(CN.me?CN.me.active?'Active':'Suspended':'—')+'</span></div>';}};})();
(function(){const ws=walSet;walSet=function(kp){CN.n=null;CN.me=null;CN.loaded=false;ws(kp);};})();
