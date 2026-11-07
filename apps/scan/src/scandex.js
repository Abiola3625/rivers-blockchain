/* ===================== RIVERS DEX (swap, pools, prices, test stablecoins) =====================
   Pools are rivers_dex::pool::Pool<A, B> objects. The indexer serves the DEX configuration and pool
   reserves. All prices are testnet prices with no real value. */
const DEX={cfg:null,pools:[],at:0,slip:0.005,from:null,to:null,amt:'',busy:false};
const D_FEE=0.003;
function dIsDex(ct){if(/::pool::LP<|::lend::Share</.test(ct||''))return true;const c=DEX.cfg&&DEX.cfg.coins;return !!(c&&(ntype(ct)===ntype(c.USDs)||ntype(ct)===ntype(c.NGNs)));}
const ntype=t=>{if(!t)return t;const m=String(t).match(/^0x([0-9a-f]+)(::.*)$/i);return m?'0x'+m[1].toLowerCase().padStart(64,'0')+m[2]:t;};
const RV_T=ntype('0x2::sui::SUI');
const dSym=t=>ntype(t)===RV_T?'RVRB':stSym(t);
const dDec=t=>ntype(t)===RV_T?9:((ST.meta[t]||{}).decimals||0);
const dReady=()=>!!(DEX.cfg&&DEX.cfg.ready&&DEX.pools.length);
async function dexPoll(){if(!IDX.ok)return;try{const c=(await idxGet('/config')).dex;DEX.cfg=c;if(!c||!c.ready)return;
  DEX.pools=(await idxGet('/dex/pools')).map(p=>({...p,typeA:ntype(p.typeA),typeB:ntype(p.typeB)}));DEX.at=Date.now();
  for(const p of DEX.pools){if(p.typeA!==RV_T)await stMeta(p.typeA);if(p.typeB!==RV_T)await stMeta(p.typeB);}
  if(CUR&&['swap','pools','overview','tokens','token'].includes(CUR.sub)){const was=document.querySelector('.soon[data-dex]');if(was||CUR.sub==='swap'||CUR.sub==='pools')route();else dexFill();}}catch(e){console.warn(e);}}
setInterval(dexPoll,15000);setTimeout(dexPoll,3000);
const dRes=(p,t)=>stNum(t===p.typeA?p.reserveA:p.reserveB,dDec(t));
function dPrice(t){t=ntype(t);const U=DEX.cfg&&ntype(DEX.cfg.coins.USDs);if(!U)return null;if(t===U)return 1;
  const direct=DEX.pools.find(p=>(p.typeA===t&&p.typeB===U)||(p.typeB===t&&p.typeA===U));if(direct)return dRes(direct,U)/dRes(direct,t);
  const viaR=DEX.pools.find(p=>(p.typeA===t&&p.typeB===RV_T)||(p.typeB===t&&p.typeA===RV_T));const pr=t===RV_T?null:dPrice(RV_T);if(viaR&&pr)return dRes(viaR,RV_T)/dRes(viaR,t)*pr;
  for(const p of DEX.pools){const o=p.typeA===t?p.typeB:p.typeB===t?p.typeA:null;if(o&&o!==RV_T){const po=o===U?1:null;if(po)return dRes(p,o)/dRes(p,t)*po;}}return null;}
const dTvl=p=>{const a=dPrice(p.typeA),b=dPrice(p.typeB);return (a!=null?dRes(p,p.typeA)*a:0)+(b!=null?dRes(p,p.typeB)*b:0);};
const dVol=p=>{const a=dPrice(p.typeA);return a!=null?stNum(p.volumeA24h,dDec(p.typeA))*a:0;};
const dTokens=()=>{const s=new Set();DEX.pools.forEach(p=>{s.add(p.typeA);s.add(p.typeB);});return [RV_T,...[...s].filter(t=>t!==RV_T)];};
const usdF=v=>v==null?'—':v===0?'0 USDs':(v>=1000?fmt(v,0):v>=1?fmt(v,2):fmt(v,v>=0.01?4:6))+' USDs';
function dOut(amtIn,rin,rout){const x=amtIn*(1-D_FEE);return x*rout/(rin+x);}
function dRoute(f,t){f=ntype(f);t=ntype(t);if(f===t)return null;const pd=(x,y)=>DEX.pools.find(p=>(p.typeA===x&&p.typeB===y)||(p.typeA===y&&p.typeB===x));
  const d=pd(f,t);if(d)return [[d,f,t]];for(const m of dTokens()){if(m===f||m===t)continue;const a=pd(f,m),b=pd(m,t);if(a&&b)return [[a,f,m],[b,m,t]];}return null;}
function dQuote(f,t,amt){const r=dRoute(f,t);if(!r||!(amt>0))return null;let a=amt,spot=amt;for(const [p,x,y] of r){const rin=dRes(p,x),rout=dRes(p,y);spot=spot*rout/rin;a=dOut(a,rin,rout);}return {out:a,route:r,impact:Math.max(0,1-a/(spot*Math.pow(1-D_FEE,r.length)))};}

/* ---------- navigation ---------- */
VIEWS.explorer.subs.push(['swap','Swap',IC.swap],['pools','Pools',IC.droplet]);
SCAN_NAV.forEach(g=>{if(g.t==='Tokens'&&g.items&&!g.items.find(i=>i[0]==='swap'))g.items.splice(2,0,['swap','Swap','Trade on Rivers DEX',IC.swap],['pools','Pools','Liquidity and volume',IC.droplet]);});
function dSoonPage(t){return lvSoonPage(t,IDX.ok?'Rivers DEX is being set up on this testnet. This page opens when the first pools are live.':'Rivers DEX needs the Rivers indexer, which is not reachable right now.');}
const dOpts=(sel)=>dTokens().map(t=>'<option value="'+t+'"'+(t===sel?' selected':'')+'>'+esc(dSym(t))+'</option>').join('');
EXX.swap={build(){if(!dReady())return dSoonPage('Swap');const U=ntype(DEX.cfg.coins.USDs);DEX.from=DEX.from||RV_T;DEX.to=DEX.to||U;
  return `<div class="g c21 ais"><section class="card hud" style="max-width:560px;width:100%;justify-self:center"><div class="ch"><h2><span class="ico">${IC.swap}</span>Swap</h2><div class="seg">${[.001,.005,.01].map(s=>'<button data-act="dslip" data-v="'+s+'" class="'+(DEX.slip===s?'on':'')+'">'+(s*100).toFixed(1)+'%</button>').join('')}</div></div>
   <div class="amt"><div class="top"><span>You pay</span><span id="swBalF"></span></div><div class="mid"><input id="swAmt" inputmode="decimal" value="${esc(DEX.amt)}" placeholder="0.0" aria-label="Amount to pay"><select id="swF" aria-label="Token to pay">${dOpts(DEX.from)}</select></div><div class="bot"><span id="swUsdF"></span><button class="maxb" data-act="dmax">MAX</button></div></div>
   <button class="flip" data-act="dflip" aria-label="Swap direction">${IC.swap}</button>
   <div class="amt"><div class="top"><span>You receive</span><span id="swBalT"></span></div><div class="mid"><input id="swOut" readonly aria-label="Amount received"><select id="swT" aria-label="Token to receive">${dOpts(DEX.to)}</select></div><div class="bot"><span id="swUsdT"></span><span></span></div></div>
   <div class="kv" id="swKv"></div><div id="swErr"></div><button class="btn pri wide" data-act="dswap" id="swGo">Swap</button><p class="muted" style="font-size:.74rem">Testnet tokens and prices have no real value.</p></section>
   <div class="g" style="align-content:start"><section class="card"><div class="ch"><h2><span class="ico">${IC.activity}</span>Markets</h2><span class="sub">Rivers DEX · fee 0.30%</span></div><div class="list" id="swMk"></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.droplet}</span>Test stablecoins</h2><span class="sub">Once per address per epoch</span></div><p class="muted" style="font-size:.8rem">USDs and NGNs are testnet stablecoins with no backing and no value. Claim some to try swaps and pools.</p><div class="btns"><button class="btn sm" data-act="dclaim" data-v="USDs">Claim 1,000 USDs</button><button class="btn sm" data-act="dclaim" data-v="NGNs">Claim 1,500,000 NGNs</button></div></section></div></div>`;},
 after(){if(!dReady())return;const up=()=>{DEX.amt=$('swAmt').value;DEX.from=$('swF').value;DEX.to=$('swT').value;dSwapFill();};['swAmt','swF','swT'].forEach(id=>$(id).addEventListener('input',up));dSwapFill();dWalBals();},
 update(){if(!dReady())return;const m=$('swMk');if(m){const h=DEX.pools.map(p=>{const pa=dRes(p,p.typeB)/dRes(p,p.typeA);return '<div class="li"><span class="tag">'+esc(dSym(p.typeA))+'</span><span><b>'+esc(dSym(p.typeA))+' / '+esc(dSym(p.typeB))+'</b><br><span class="muted" style="font-size:.72rem">1 '+esc(dSym(p.typeA))+' = '+fmt(pa,pa<1?6:4)+' '+esc(dSym(p.typeB))+'</span></span><span class="r">'+usdF(dTvl(p))+'<div class="muted" style="font-size:.7rem">liquidity</div></span></div>';}).join('');if(m._h!==h){m.innerHTML=h;m._h=h;}}}};
const DW={bal:{},at:0};
async function dWalBals(){if(!WAL.addr)return;try{const lb=(await SSv.listBalances({owner:WAL.addr})).response.balances||[];DW.bal={};lb.forEach(b=>DW.bal[ntype(b.coinType)]=String(b.balance));DW.at=Date.now();if(CUR.sub==='swap')dSwapFill();if(CUR.sub==='pools')EXX.pools.update();}catch(e){}}
const dBal=t=>stNum(DW.bal[ntype(t)]||0,dDec(t));
function dSwapFill(){const f=DEX.from,t=DEX.to,a=+DEX.amt||0;const q=f===t?null:dQuote(f,t,a);
 $('swOut').value=q?fmt(q.out,Math.min(6,dDec(t))).replace(/,/g,''):'';const pf=dPrice(f),pt=dPrice(t);$('swUsdF').textContent=a&&pf!=null?'≈ '+usdF(a*pf):'';$('swUsdT').textContent=q&&pt!=null?'≈ '+usdF(q.out*pt):'';
 $('swBalF').textContent=WAL.addr?'Balance '+fmt(dBal(f),4):'';$('swBalT').textContent=WAL.addr?'Balance '+fmt(dBal(t),4):'';
 const r=dRoute(f,t);const rate=r?dQuote(f,t,Math.pow(10,-Math.min(4,dDec(f)))):null;
 $('swKv').innerHTML=f===t?'<div><span>Choose two different tokens</span><span></span></div>':!r?'<div><span>Route</span><span>No pool connects these tokens</span></div>':
  '<div><span>Rate</span><span>1 '+esc(dSym(f))+' ≈ '+fmt(dRes(r[0][0],r[0][2])/dRes(r[0][0],r[0][1])*(r[1]?dRes(r[1][0],r[1][2])/dRes(r[1][0],r[1][1]):1),6)+' '+esc(dSym(t))+'</span></div><div><span>Route</span><span>'+[f].concat(r.map(x=>x[2])).map(x=>esc(dSym(x))).join(' → ')+'</span></div><div><span>Price impact</span><span>'+(q?pct(q.impact,2):'—')+'</span></div><div><span>Minimum received</span><span>'+(q?fmt(q.out*(1-DEX.slip),Math.min(6,dDec(t)))+' '+esc(dSym(t)):'—')+'</span></div><div><span>Pool fee</span><span>0.30% per hop</span></div>';
 const g=$('swGo');if(!WAL.kp){g.textContent='Unlock wallet to swap';g.dataset.act='wconnect';g.disabled=false;return;}g.dataset.act='dswap';
 const over=a>dBal(f)-(f===RV_T?0.05:0);g.disabled=!q||!a||over;g.textContent=!a?'Enter an amount':over?'Not enough '+dSym(f):!q?'No route':'Swap';}
function dSwapTx(route,amtIn,minOut){const tx=new Transaction();let c=coinWithBalance({type:route[0][1],balance:amtIn});route.forEach(([p,x,y],i)=>{const last=i===route.length-1;const fn=x===p.typeA?'swap_a_for_b':'swap_b_for_a';
  c=tx.moveCall({target:DEX.cfg.package+'::pool::'+fn,typeArguments:[p.typeA,p.typeB],arguments:[tx.object(p.id),c,tx.pure.u64(last?minOut:0n),tx.object('0x6')]});});tx.transferObjects([c],WAL.addr);return tx;}
async function dExec(tx,msg,errId){if(DEX.busy)return false;DEX.busy=true;const e=$(errId);if(e)e.innerHTML='';let ok=false;try{tx.setSender(WAL.addr);const r=await lvClient.signAndExecuteTransaction({transaction:tx,signer:WAL.kp,include:{effects:true}});const t=r.Transaction||r.FailedTransaction;
  if(r.FailedTransaction||!t.status||!t.status.success){const er=JSON.stringify(t.status&&t.status.error||'');throw new Error(/abort_code[^0-9]*3\b|ESlippage|MoveAbort.*, 3\)/.test(er)?'The price moved more than your slippage limit. Try again.':/EAlreadyClaimed|, 1\)/.test(er)&&/faucet/.test(er)?'You already claimed this epoch. Try again tomorrow.':'The transaction failed. '+er.slice(0,120));}
  toast(msg);ok=true;setTimeout(()=>{dWalBals();walRefresh();dexPoll();},1500);}catch(err){if(e)e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';else toast(err.message,false);}DEX.busy=false;return ok;}
Object.assign(LACT,{
 dslip(el){DEX.slip=+el.dataset.v;$$('[data-act=dslip]').forEach(b=>b.classList.toggle('on',b===el));dSwapFill();},
 dflip(){const f=DEX.from;DEX.from=DEX.to;DEX.to=f;$('swF').value=DEX.from;$('swT').value=DEX.to;dSwapFill();},
 dmax(){const f=DEX.from;const v=Math.max(0,dBal(f)-(f===RV_T?0.05:0));DEX.amt=String(+v.toFixed(Math.min(6,dDec(f))));$('swAmt').value=DEX.amt;dSwapFill();},
 async dswap(){const f=DEX.from,t=DEX.to;const q=dQuote(f,t,+DEX.amt||0);if(!q)return;const ain=stUnits(DEX.amt,dDec(f));if(!ain)return;const min=BigInt(Math.floor(q.out*(1-DEX.slip)*Math.pow(10,dDec(t))));
  const g=$('swGo');g.disabled=true;g.textContent='Signing…';const ok=await dExec(dSwapTx(q.route,ain,min),'Swapped '+DEX.amt+' '+dSym(f)+' for about '+fmt(q.out,4)+' '+dSym(t)+'.','swErr');if(ok){DEX.amt='';$('swAmt').value='';}dSwapFill();},
 dclaim(el){if(!WAL.kp)return walSheet();const s=el.dataset.v;const ct=ntype(DEX.cfg.coins[s]);const tx=new Transaction();const c=tx.moveCall({target:DEX.cfg.package+'::test_faucet::claim',typeArguments:[ct],arguments:[tx.object(DEX.cfg.faucets[s])]});tx.transferObjects([c],WAL.addr);dExec(tx,'Test '+s+' received.',null);},
});

/* ---------- pools ---------- */
EXX.pools={build(){if(!dReady())return dSoonPage('Pools');return `<div class="g c4 rise">${kpi('pk1','Total value locked',IC.lock)}${kpi('pk2','Volume 24h',IC.activity)}${kpi('pk3','Fees to providers 24h',IC.coins)}${kpi('pk4','Pools',IC.droplet)}</div>
  <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.droplet}</span>Liquidity pools</h2><span class="sub">Constant-product pools · fee 0.30% to liquidity providers · values at testnet prices</span></div><a class="btn sm pri" href="#explorer-swap">Swap</a></div>
   <div class="tw"><table><thead><tr><th>Pool</th><th class="n">Reserves</th><th class="n">Value</th><th class="n">Volume 24h</th><th class="n">Swaps</th><th class="n">Price</th><th class="n">Your share</th><th></th></tr></thead><tbody id="plT"></tbody></table></div></section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.activity}</span>Recent swaps</h2><span class="sub">All pools</span></div><div class="list" id="plS"><div class="empty">Loading…</div></div></section>`;},
 after(){if(!dReady())return;dWalBals();dLpBals();dRecent();},
 update(){if(!dReady())return;let tvl=0,vol=0;DEX.pools.forEach(p=>{tvl+=dTvl(p);vol+=dVol(p);});
  set2('pk1',usdF(tvl));set2('pk1s','Testnet prices');set2('pk2',usdF(vol));set2('pk2s',fmt(DEX.pools.reduce((a,p)=>a+p.swaps24h,0))+' swaps');set2('pk3',usdF(vol*D_FEE));set2('pk3s','0.30% of volume');set2('pk4',fmt(DEX.pools.length));set2('pk4s','Open to anyone');
  const tb=$('plT');if(!tb)return;const h=DEX.pools.map(p=>{const sh=DLP[p.id];const pr=dRes(p,p.typeB)/dRes(p,p.typeA);return '<tr><td><div style="display:flex;gap:6px;align-items:center">'+stIco(dSym(p.typeA),26)+stIco(dSym(p.typeB),26)+'<b style="margin-left:4px">'+esc(dSym(p.typeA))+' / '+esc(dSym(p.typeB))+'</b></div></td><td class="n">'+compact(dRes(p,p.typeA))+' / '+compact(dRes(p,p.typeB))+'</td><td class="n">'+usdF(dTvl(p))+'</td><td class="n">'+usdF(dVol(p))+'</td><td class="n">'+fmt(p.swaps)+'</td><td class="n">'+fmt(pr,pr<1?6:4)+'</td><td class="n">'+(sh&&sh.share?pct(sh.share,3):'—')+'</td><td><div class="btns"><button class="btn xs" data-act="dlpadd" data-id="'+p.id+'">Add</button><button class="btn xs" data-act="dlprem" data-id="'+p.id+'"'+(sh&&sh.raw>0n?'':' disabled')+'>Remove</button></div></td></tr>';}).join('');if(tb._h!==h){tb.innerHTML=h;tb._h=h;}}};
const DLP={};
const lpType=p=>DEX.cfg.package+'::pool::LP<'+p.typeA+', '+p.typeB+'>';
async function dLpBals(){if(!WAL.addr)return;await Promise.all(DEX.pools.map(async p=>{try{const b=(await SSv.getBalance({owner:WAL.addr,coinType:lpType(p)})).response.balance;const raw=BigInt(b&&b.balance||0);
  const o=(await LSv.getObject({objectId:p.id,readMask:{paths:['json']}})).response.object;const f=o.json&&o.json.kind&&o.json.kind.structValue?o.json.kind.structValue.fields:{};const sup=f.lp_supply&&plainV(f.lp_supply);const total=BigInt((sup&&(sup.value||sup))||0);
  DLP[p.id]={raw,share:total>0n?Number(raw)/Number(total):0,total};}catch(e){}}));if(CUR.sub==='pools')EXX.pools.update();}
function plainV(v){const k=v&&v.kind;if(!k)return null;if(k.oneofKind==='structValue')return Object.fromEntries(Object.entries(k.structValue.fields||{}).map(([n,x])=>[n,plainV(x)]));if(k.oneofKind==='listValue')return (k.listValue.values||[]).map(plainV);return k[k.oneofKind];}
async function dRecent(){try{const all=(await Promise.all(DEX.pools.map(p=>idxGet('/dex/pool/'+p.id+'/swaps?limit=15').then(r=>r.map(s=>({...s,p})))))).flat().sort((a,b)=>b.cp-a.cp).slice(0,20);const el=$('plS');if(!el)return;
  el.innerHTML=all.map(s=>{const fi=s.aToB?s.p.typeA:s.p.typeB,fo=s.aToB?s.p.typeB:s.p.typeA;return '<div class="li click" data-act="tx" data-id="'+s.digest+'"><span class="ty defi">Swap</span><span>'+fmt(stNum(s.amountIn,dDec(fi)),4)+' '+esc(dSym(fi))+' → '+fmt(stNum(s.amountOut,dDec(fo)),4)+' '+esc(dSym(fo))+'</span><span class="r">'+lvAddr(s.trader,4)+'</span><span class="s">Block #'+fmt(s.cp)+' · '+ago(s.ts)+'</span></div>';}).join('')||'<div class="empty">No swaps yet. <a href="#explorer-swap">Make the first one.</a></div>';}catch(e){}}
function dLpSheet(p,mode){if(!WAL.kp)return walSheet();const A=dSym(p.typeA),B=dSym(p.typeB);
 if(mode==='add')openSheet('Add liquidity','<div class="fld"><label for="lA">'+esc(A)+'</label><input class="in mono" id="lA" inputmode="decimal"><span class="muted" style="font-size:.72rem">Balance '+fmt(dBal(p.typeA),4)+'</span></div><div class="fld"><label for="lB">'+esc(B)+'</label><input class="in mono" id="lB" inputmode="decimal"><span class="muted" style="font-size:.72rem">Balance '+fmt(dBal(p.typeB),4)+'</span></div><p class="muted" style="font-size:.76rem">Amounts follow the pool price. Any extra is returned to you.</p><div id="lErr"></div><button class="btn pri wide" data-act="dlpgo" data-id="'+p.id+'" data-m="add">Add liquidity</button>',A+' / '+B);
 else{const s=DLP[p.id]||{raw:0n};openSheet('Remove liquidity','<div class="fld"><label for="lP">Share of your position to remove (%)</label><input class="in mono" id="lP" inputmode="numeric" value="100"></div><div class="kv"><div><span>Your pool share</span><span>'+pct(s.share||0,3)+'</span></div><div><span>You receive about</span><span>'+fmt(dRes(p,p.typeA)*(s.share||0),4)+' '+esc(A)+' + '+fmt(dRes(p,p.typeB)*(s.share||0),4)+' '+esc(B)+'</span></div></div><div id="lErr"></div><button class="btn pri wide" data-act="dlpgo" data-id="'+p.id+'" data-m="rem">Remove liquidity</button>',A+' / '+B);}
 const a=$('lA'),b=$('lB');if(a&&b){const r=dRes(p,p.typeB)/dRes(p,p.typeA);a.addEventListener('input',()=>{b.value=a.value?String(+(+a.value*r).toFixed(Math.min(6,dDec(p.typeB)))):'';});b.addEventListener('input',()=>{a.value=b.value?String(+(+b.value/r).toFixed(Math.min(6,dDec(p.typeA)))):'';});}}
Object.assign(LACT,{
 dlpadd(el){dLpSheet(DEX.pools.find(p=>p.id===el.dataset.id),'add');},dlprem(el){dLpSheet(DEX.pools.find(p=>p.id===el.dataset.id),'rem');},
 async dlpgo(el){const p=DEX.pools.find(x=>x.id===el.dataset.id);const tx=new Transaction();
  if(el.dataset.m==='add'){const a=stUnits(Number($('lA').value).toFixed(dDec(p.typeA)),dDec(p.typeA)),b=stUnits(Number($('lB').value).toFixed(dDec(p.typeB)),dDec(p.typeB));if(!a||!b)return $('lErr').innerHTML='<div class="errbox">Enter both amounts.</div>';
   const [lp,ra,rb]=tx.moveCall({target:DEX.cfg.package+'::pool::add_liquidity',typeArguments:[p.typeA,p.typeB],arguments:[tx.object(p.id),coinWithBalance({type:p.typeA,balance:a}),coinWithBalance({type:p.typeB,balance:b}),tx.pure.u64(0),tx.object('0x6')]});tx.transferObjects([lp,ra,rb],WAL.addr);
   if(await dExec(tx,'Liquidity added.','lErr'))closeSheet();}
  else{const s=DLP[p.id];const pc=Math.min(100,Math.max(0,+$('lP').value||0));if(!s||!pc)return;const amt=s.raw*BigInt(Math.round(pc*100))/10000n;if(amt<=0n)return;
   const [ca,cb]=tx.moveCall({target:DEX.cfg.package+'::pool::remove_liquidity',typeArguments:[p.typeA,p.typeB],arguments:[tx.object(p.id),coinWithBalance({type:lpType(p),balance:amt}),tx.pure.u64(0),tx.pure.u64(0),tx.object('0x6')]});tx.transferObjects([ca,cb],WAL.addr);
   if(await dExec(tx,'Liquidity removed.','lErr'))closeSheet();}
  setTimeout(dLpBals,1800);},
});

/* ---------- prices and liquidity across Scan ---------- */
topTokens=function(){if(!dReady())return [];const m={};DEX.pools.forEach(p=>{[p.typeA,p.typeB].forEach(t=>{const pr=dPrice(t);if(pr!=null){m[t]=(m[t]||0)+dRes(p,t)*pr;}});});const l=Object.keys(m).map(t=>({t:dSym(t),ct:t,tvl:m[t],vol:0})).sort((a,b)=>b.tvl-a.tvl);
 // The design's overview code reads TOKENS[symbol]; tokens it does not know get a neutral entry.
 l.forEach(x=>{if(!TOKENS[x.t])TOKENS[x.t]={...TOKENS.USDs,name:(ST.meta[x.ct]||{}).name||x.t};});return l;};
treemap=function(){const items=topTokens().slice(0,11).map(x=>({t:x.t,ct:x.ct,v:x.tvl}));const out=[];const TW=innerWidth<700?600:1200,TH=innerWidth<700?360:300;tmapLayout(items,0,0,TW,TH,out);const mx=items[0]?items[0].v:1;
 return '<svg class="tm" viewBox="0 0 '+TW+' '+TH+'" style="width:100%;height:auto" aria-label="Liquidity by token">'+out.map(r=>{const f=r.v/mx;const big=r.w>70&&r.h>40;return '<g data-act="dtok" data-id="'+esc(r.ct)+'" style="cursor:pointer"><rect x="'+(r.x+2)+'" y="'+(r.y+2)+'" width="'+Math.max(0,r.w-4)+'" height="'+Math.max(0,r.h-4)+'" rx="10" style="fill:'+greenRamp(.18+f*.75)+';stroke:var(--hair2)"/>'+
  (big?'<text x="'+(r.x+12)+'" y="'+(r.y+24)+'" style="fill:'+(f>.55&&!C.light?'#012014':'var(--fg)')+'" font-size="14" font-family="Manrope,sans-serif" font-weight="800">'+esc(r.t)+'</text><text x="'+(r.x+12)+'" y="'+(r.y+40)+'" style="fill:'+(f>.55&&!C.light?'#013A23':'var(--muted)')+'" font-size="10.5">'+usdF(r.v)+'</text>':'')+'</g>';}).join('')+'</svg>';};
LACT.dtok=function(el){const t=ntype(el.dataset.id);location.hash=t===RV_T?'explorer-token':'explorer-asset-'+t;};
function dexFill(){if(!dReady())return;const s=CUR.sub;
 if(s==='overview'){const tm=$('tmap');if(tm){const c=tm.closest('.card');if(c&&c.classList.contains('soon')){idxUnsoon(c);}if(!DEX._tm||Date.now()-DEX._tm>8000||!tm.innerHTML){DEX._tm=Date.now();tm.innerHTML=treemap();const sub=c&&c.querySelector('.sub');if(sub)sub.textContent='Value in Rivers DEX pools by token, testnet prices';}}
  const top=$('exTop');if(top){idxUnsoon(top.closest('.card'));const h=topTokens().slice(0,6).map(x=>'<a class="li click" data-act="dtok" data-id="'+esc(x.ct)+'" style="text-decoration:none">'+(x.ct===RV_T?tokIcon('RVRB',30):stIco(x.t,30))+'<span><b>'+esc(x.t)+'</b> <span class="muted" style="font-size:.76rem">'+usdF(dPrice(x.ct))+'</span></span><span class="r">'+usdF(x.tvl)+'<div class="muted" style="font-size:.7rem">in pools</div></span></a>').join('');if(top._h!==h){top.innerHTML=h;top._h=h;}}
  const gs=$('gasK');const pr=dPrice(RV_T);if(gs&&pr!=null){const rows=gs.querySelectorAll('div');const last=rows[rows.length-1];if(last)last.innerHTML='<span>Simple transfer at testnet price</span><span>≈ '+usdF(0.0021*pr)+'</span>';}}
 if(s==='token'){const p=$('tkPx');const pr=dPrice(RV_T);if(p&&pr!=null){const w=p.closest('.kv>div')||p.parentElement;idxUnsoon(w);p.textContent=usdF(pr)+' (testnet)';}}
 if(s==='tokens'){const k=$('tk4');if(k){idxUnsoon(lvKpi('tk4'));k.textContent=usdF(DEX.pools.reduce((a,p)=>a+dTvl(p),0));set2('tk4s',DEX.pools.length+' pools, testnet prices');}}}
(function(){const f=lvFix,m=lvMarks;lvFix=function(s){f(s);dexFill();};lvMarks=function(s){m(s);if(dReady()){dexFill();if(s==='overview'){idxUnsoon(lvCard('tmap'));idxUnsoon(lvCard('exTop'));}if(s==='tokens')idxUnsoon(lvKpi('tk4'));}};
 const tu=EXX.tokens.update;EXX.tokens.update=function(){tu();if(!dReady())return;const U=ntype(DEX.cfg.coins.USDs),N=ntype(DEX.cfg.coins.NGNs);
  $$('#tkTb tr[data-act=lvtok] td:nth-child(3)').forEach(td=>{td.classList.remove('muted');td.textContent=usdF(dPrice(RV_T));});
  $$('#tkTb tr[data-act=sttok]').forEach(tr=>{const pr=dPrice(tr.dataset.id);const td=tr.children[2];if(td&&pr!=null)td.textContent=usdF(pr);});
  if(!document.querySelector('#tkTb tr[data-dex]')&&(EXX.f||'All')!=='Native'&&(EXX.f||'All')!=='Created'&&(EXX.f||'All')!=='Cross-chain'){const rows=[U,N].map(t=>{const m=ST.meta[t]||{};return '<tr class="click" data-dex="1" data-act="sttok" data-id="'+t+'"><td><div style="display:flex;gap:9px;align-items:center">'+stIco(dSym(t),30)+'<div><b>'+esc(dSym(t))+'</b><div class="muted" style="font-size:.72rem">'+esc(m.name||'')+'</div></div></div></td><td>Stablecoin</td><td class="n">'+usdF(dPrice(t))+'</td><td class="n mono">Faucet</td><td class="n">'+(m.decimals||6)+'</td><td class="n">—</td><td>'+featChips(['Testnet','Faucet'])+'</td><td class="n">Rivers DEX</td></tr>';}).join('');
   const first=document.querySelector('#tkTb tr[data-act=lvtok]');if(first)first.insertAdjacentHTML('afterend',rows);else{const tb=$('tkTb');if(tb)tb.insertAdjacentHTML('afterbegin',rows);}
   const sr=document.querySelector('#tkTb .soonrows .soonbadge b');if(sr)sr.textContent='Cross-chain assets';$$('#tkTb .soonrow').forEach(r=>{if(/USDs|NGNs/.test(r.textContent))r.remove();});}};})();

/* ---------- Shielded payments page (live) ----------
   Shows what the ledger shows about the shielded pools: totals going in and out and the number of
   notes and private sends. Amounts inside the pools and the parties to private sends are not public. */
delete LV_SOON_PAGES.privacy;
const SZ={st:[],at:0};
function szName(id){const P=DEX.cfg&&DEX.cfg.shield&&DEX.cfg.shield.pools||{};const k=Object.keys(P).find(k=>P[k].id===id);return k?{k,type:P[k].type}:{k:short(id,4),type:null};}
function szPage(){return `<div class="g c4">${kpi('zk1','Shielded transactions',IC.lock)}${kpi('zk2','Private sends',IC.send)}${kpi('zk3','Notes in pools',IC.cube)}${kpi('zk4','Pools',IC.droplet)}</div>
 <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.lock}</span>Shielded pools</h2><span class="sub">Coins inside a pool are owned through private notes. Only their owners can see them.</span></div><span class="b warn">Testnet</span></div>
  <div class="tw"><table><thead><tr><th>Pool</th><th class="n">Held</th><th class="n">Shielded in</th><th class="n">Unshielded</th><th class="n">Deposits</th><th class="n">Private sends</th><th class="n">Withdrawals</th><th class="n">Last activity</th></tr></thead><tbody id="zT"><tr><td colspan="8"><div class="empty">Loading…</div></td></tr></tbody></table></div></section>
 <section class="card"><div class="ch"><h2>What the ledger shows</h2></div><div class="list">${[['Shield','The amount and the address it came from.'],['Private send','A proof, two spent-note markers and two new encrypted notes. Not the amount, the sender or the receiver.'],['Unshield','The amount and the address it goes to, not which notes paid for it.'],['Proofs','Each transaction carries a Groth16 zero-knowledge proof that the chain checks before it moves anything.']].map(x=>'<div class="li" style="display:block"><b>'+x[0]+'</b><div class="fg2" style="font-size:.84rem;margin-top:2px">'+x[1]+'</div></div>').join('')}</div></section>`;}
async function szLoad(){SZ.at=Date.now();if(!DEX.cfg||!DEX.cfg.shield){try{DEX.cfg=(await idxGet('/config')).dex||DEX.cfg;}catch(e){}}try{SZ.st=await idxGet('/shield/stats');}catch(e){SZ.st=null;}szFill();}
function szFill(){const t=$('zT');if(!t)return;const S=SZ.st||[];const sum=f=>S.reduce((a,r)=>a+Number(r[f]||0),0);
 const set=(id,v)=>{const e=$(id);if(e)e.textContent=v;};set('zk1',fmt(sum('txs')));set('zk2',fmt(sum('privateSends')));set('zk3',fmt(sum('notes')));set('zk4',fmt(DEX.cfg&&DEX.cfg.shield?Object.keys(DEX.cfg.shield.pools||{}).length:0));
 if(SZ.st===null){t.innerHTML='<tr><td colspan="8"><div class="empty">The indexer is not reachable.</div></td></tr>';return;}
 if(!DEX.cfg||!DEX.cfg.shield){t.innerHTML='<tr><td colspan="8"><div class="empty">Shielded pools are not set up on this network yet.</div></td></tr>';return;}
 const rows=Object.entries(DEX.cfg.shield.pools||{}).map(([k,p])=>{const r=S.find(x=>x.pool===p.id)||{};const d=dDec(p.type);const q=v=>fmt(stNum(String(v||0),d),2);const held=BigInt(r.deposited||0)-BigInt(r.withdrawn||0);
  return '<tr><td><b>'+esc(k)+'</b></td><td class="n">'+q(held)+'</td><td class="n">'+q(r.deposited)+'</td><td class="n">'+q(r.withdrawn)+'</td><td class="n">'+fmt(r.deposits||0)+'</td><td class="n">'+fmt(r.privateSends||0)+'</td><td class="n">'+fmt(r.withdrawals||0)+'</td><td class="n muted">'+(r.lastTs?ago(r.lastTs):'—')+'</td></tr>';}).join('');
 t.innerHTML=rows;}
(function(){const v=VIEWS.explorer;const b=v.build,a=v.after,u=v.update;
 v.build=function(s){return s==='privacy'?szPage():b.call(this,s);};
 v.after=function(s){if(s==='privacy'){szLoad();return;}return a.call(this,s);};
 v.update=function(s){if(s==='privacy'){if(Date.now()-SZ.at>15000)szLoad();return;}return u.call(this,s);};})();
