/* ===================== TOKEN STUDIO (create, view and manage tokens) =====================
   Token Studio copies a compiled Move template (rivers-packages/token-studio), renames it to the token's
   symbol, writes the creator's choices into its constants and publishes it from the connected wallet.
   The package is made immutable, and the currency is registered in the Rivers coin registry. */
const U64MAX=18446744073709551615n;
const ST={meta:{},tokens:[],at:0,busy:false};
let stMbtReady=null;
const stMbt=()=>stMbtReady||(stMbtReady=initMbt({module_or_path:'mbt.wasm'}));
const stVu8=s=>bcs.vector(bcs.u8()).serialize(new TextEncoder().encode(s)).toBytes();
const stPow=d=>10n**BigInt(d);
function stUnits(v,dec){const s=String(v).trim();if(!/^\d+(\.\d+)?$/.test(s))return null;const [i,f='']=s.split('.');if(f.length>dec)return null;return BigInt(i)*stPow(dec)+BigInt((f+'0'.repeat(dec)).slice(0,dec)||'0');}
const stNum=(raw,dec)=>Number(BigInt(raw||0))/Math.pow(10,dec||0);
const stFmt=(raw,dec)=>fmt(stNum(raw,dec),Math.min(4,dec||0));
const stSym=ct=>(ST.meta[ct]&&ST.meta[ct].symbol)||ct.split('::').pop();
const stIco=(sym,px)=>'<span class="tk" style="width:'+px+'px;height:'+px+'px;font-size:'+(px/3.6).toFixed(1)+'px;background:linear-gradient(135deg,var(--deep),var(--river));color:#fff">'+esc(String(sym||'?').slice(0,4))+'</span>';
async function stMeta(ct){if(ST.meta[ct])return ST.meta[ct];try{const r=(await SSv.getCoinInfo({coinType:ct})).response;const m=r.metadata||{};ST.meta[ct]={symbol:m.symbol||ct.split('::').pop(),name:m.name||'',decimals:Number(m.decimals||0),description:m.description||'',id:m.id,regulated:!!(r.regulatedMetadata&&r.regulatedMetadata.denyCapObject),supplyState:r.treasury?Number(r.treasury.supplyState||0):null,supply:r.treasury&&r.treasury.totalSupply!=null?String(r.treasury.totalSupply):null};}catch(e){ST.meta[ct]={symbol:ct.split('::').pop(),name:'',decimals:0};}return ST.meta[ct];}

/* ---------- Create page ---------- */
delete LV_SOON_PAGES.create;
Object.assign(TS,{poolTok:100000,poolUsd:500,pool:false,shield:false,vest:false,feePct:0,dec:9,supply:10000000,maxAmt:50000000});
const ST_SOON_FEAT={shield:'Shielded transfers',vest:'Team vesting'};
/* Team vesting needs the vesting package on this network. */
const stVestOk=()=>!!(typeof DEX!=='undefined'&&DEX.cfg&&DEX.cfg.vesting);
const ST_VEST={cliffMo:12,totalMo:36};
function stFlags(){const mint=TS.maxMode!=='fixed';const reg=!!(TS.pause||TS.freeze);return {mint,burn:!!TS.burn,reg,flags:(mint?1:0)|(TS.burn?2:0)|(reg?4:0)};}
tsMove=function(){const s=(TS.sym||'TOKEN').toUpperCase().replace(/[^A-Z0-9]/g,'')||'TOKEN';const f=stFlags();const i=stUnits(TS.supply||0,TS.dec),m=TS.maxMode==='capped'?stUnits(TS.maxAmt||0,TS.dec):0n;const q=x=>JSON.stringify(String(x));
  return ('module creator::'+s.toLowerCase()+';'+TS_TEMPLATE_SRC).replace(/TEMPLATE/g,s).replace(/const DECIMALS: u8 = 9;/,'const DECIMALS: u8 = '+TS.dec+';')
   .replace(/b"TMPLSYMB"/,'b'+q(s)).replace(/b"Token Studio template name"/,'b'+q(TS.name||'')).replace(/b"Token Studio template description"/,'b'+q(TS.desc||''))
   .replace(/1000000000000000001/,String(i==null?0:i)).replace(/1000000000000000002/,String(m==null?0:m)).replace(/const FLAGS: u8 = 200;/,'const FLAGS: u8 = '+f.flags+';')
   .replace(/\/\/\/ Token Studio template\.[\s\S]*?\nmodule/,'module');};
tsIssues=function(){const e=[];const s=(TS.sym||'').trim().toUpperCase();
  if(!/^[A-Z][A-Z0-9]{1,7}$/.test(s))e.push('Symbol must be 2 to 8 letters or numbers and start with a letter.');
  if(s==='RVRB'||ST.tokens.some(t=>(t.symbol||'').toUpperCase()===s))e.push('The symbol '+s+' is already used on Rivers.');
  if(!(TS.name||'').trim())e.push('Give the token a name.');if((TS.name||'').length>64)e.push('Keep the name under 64 characters.');
  const i=stUnits(TS.supply||0,TS.dec);if(i==null||i<=0n)e.push('Initial supply must be a whole number above zero.');else if(i>U64MAX)e.push('Supply is too large for '+TS.dec+' decimals. Lower the supply or the decimals.');
  if(TS.maxMode==='capped'){const m=stUnits(TS.maxAmt||0,TS.dec);if(m==null||m>U64MAX)e.push('Maximum supply is too large for '+TS.dec+' decimals.');else if(i!=null&&m<i)e.push('The cap cannot be below the initial supply.');}
  if(TS.pool&&dReady()){if(!(TS.poolTok>0)||!(TS.poolUsd>0))e.push('Enter the token and USDs amounts for the pool.');else if(TS.poolTok>TS.supply*(1-(TS.vest&&stVestOk()?(TS.vestPct||20)/100:0)))e.push('The pool amount is more than the tokens you will hold.');else if(TS.poolUsd>dBal(DEX.cfg.coins.USDs))e.push('You need '+fmt(TS.poolUsd)+' USDs for the pool. Claim test USDs on the Swap page.');}
  if(TS.type==='NFT collection')e.push('NFT collections are coming soon. Choose another type.');
  if(!WAL.kp)e.push('Unlock your wallet to create a token.');else if(WAL.bal<0.2)e.push('Your wallet needs at least 0.2 RVRB for the network fee. Use Test RVRB in your wallet.');
  return e;};
(function(){const r=tsRender;tsRender=function(){r();const kv=document.querySelector('#tsPrev .kv');if(kv)kv.innerHTML=[['Supply',(TS.maxMode==='fixed'?'Fixed at ':TS.maxMode==='capped'?'Capped at '+compact(TS.maxAmt)+', starts at ':'No cap, starts at ')+compact(TS.supply)],['Controls',[stFlags().mint?'mint':'',TS.burn?'burn':'',TS.pause?'pause':'',TS.freeze?'freeze':''].filter(Boolean).join(', ')||'None'],['Contract','Locked after publishing'],['Network fee','About 0.05 RVRB'],['Ready in','About '+fmt(S.fin||400)+' ms']].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');
  const cp=$('tsCode');if(cp){const s=cp.closest('.card').querySelector('.sub');if(s)s.textContent='The exact Move module that will be published';}};})();
(function(){const c=EXX.create,b=c.build,a=c.after;
 c.build=function(){let h=b.call(this);return h;};
 c.after=function(){if(!S.connected)return;a.call(this);
  $$('[data-act=tstype]').forEach(el=>{if(el.dataset.v==='NFT collection'){lvSoon(el,'NFT collections');el.disabled=true;}});
  $$('[data-ts]').forEach(i=>{const k=i.dataset.ts;if((ST_SOON_FEAT[k]&&!(k==='vest'&&stVestOk()))||(k==='pool'&&!dReady())){i.checked=false;i.disabled=true;lvSoon(i.closest('.ctl'),k==='pool'?'Rivers DEX':ST_SOON_FEAT[k]);}});
  const fee=$('tsFee');if(fee){fee.disabled=true;lvSoon(fee.closest('.ctl'),'Transfer fees');}
  const pt=$('tsPT');if(pt){const row=pt.closest('.r2');if(row&&!dReady())lvSoon(row,'Rivers DEX');}
  if(stVestOk()){const vc=document.querySelector('[data-ts=vest]');const d=vc&&vc.closest('.ctl').querySelector('.d');if(d)d.textContent='Locks '+(TS.vestPct||20)+'% of the initial supply for your team: nothing for '+ST_VEST.cliffMo+' months, then unlocking evenly until month '+ST_VEST.totalMo;}
  if(dReady()){const pc=document.querySelector('[data-ts=pool]');const d=pc&&pc.closest('.ctl').querySelector('.d');if(d)d.textContent='Pair your token with test USDs on Rivers DEX so people can trade it right away';dWalBals();}
  const mi=document.querySelector('[data-ts=mint]');if(mi){const sync=()=>{mi.checked=TS.maxMode!=='fixed';mi.disabled=true;};sync();const d=mi.closest('.ctl').querySelector('.d');if(d)d.textContent='Set by the supply choice above';$$('[data-act=tsmax]').forEach(x=>x.addEventListener('click',()=>setTimeout(sync,0)));}
  const go=$('tsGo');if(go)go.textContent='Create token';tsRender();};})();
async function stCreate(){if(ST.busy)return;const e=tsIssues();if(e.length)return toast(e[0],false);ST.busy=true;const s=TS.sym.trim().toUpperCase();const f=stFlags();
 const withPool=!!(TS.pool&&dReady());const withVest=!!(TS.vest&&stVestOk());const steps=['Prepare contract','Publish to Rivers','Register currency'].concat(withVest?['Lock team allocation']:[]).concat(withPool?['Open USDs pool']:[]);const show=(k,err)=>{const el=$('stSteps');if(el)el.innerHTML=steps.map((x,i)=>'<div class="li"><span class="chk '+(i<k?'ok':i===k&&err?'bad':'')+'">'+(i<k?'✓':i===k&&err?'!':i+1)+'</span><span><b style="font-size:.85rem">'+x+'</b>'+(i===k&&err?'<br><span class="muted" style="font-size:.74rem">'+esc(err)+'</span>':'')+'</span><span class="r">'+(i===k&&!err?'<span class="spin"></span>':'')+'</span></div>').join('');};
 await new Promise(z=>setTimeout(z,320));/* closeSheet from the confirm dialog hides the sheet after 260 ms */
 openSheet('Creating '+s,'<div class="list" id="stSteps"></div><div id="stDone"></div>','Token Studio');show(0);let k=0;
 try{await stMbt();let b=Uint8Array.from(atob(TS_TEMPLATE_B64),c=>c.charCodeAt(0));
  b=updateIdentifiers(b,{TEMPLATE:s,template:s.toLowerCase()});
  const U8=v=>bcs.u8().serialize(v).toBytes(),U64=v=>bcs.u64().serialize(v).toBytes();
  b=updateConstants(b,U8(TS.dec),U8(9),'U8');b=updateConstants(b,stVu8(s),stVu8('TMPLSYMB'),'Vector(U8)');
  b=updateConstants(b,stVu8(TS.name.trim()),stVu8('Token Studio template name'),'Vector(U8)');b=updateConstants(b,stVu8((TS.desc||'').trim()),stVu8('Token Studio template description'),'Vector(U8)');
  b=updateConstants(b,U64(stUnits(TS.supply,TS.dec)),U64(1000000000000000001n),'U64');b=updateConstants(b,U64(TS.maxMode==='capped'?stUnits(TS.maxAmt,TS.dec):0n),U64(1000000000000000002n),'U64');
  b=updateConstants(b,U8(f.flags),U8(200),'U8');
  k=1;show(1);const tx=new Transaction();tx.setSender(WAL.addr);const [up]=tx.publish({modules:[Array.from(b)],dependencies:['0x1','0x2']});tx.moveCall({target:'0x2::package::make_immutable',arguments:[up]});
  const r=await lvClient.signAndExecuteTransaction({transaction:tx,signer:WAL.kp,include:{effects:true,objectTypes:true}});const t=r.Transaction||r.FailedTransaction;if(r.FailedTransaction||!t.status||!t.status.success)throw new Error('Publishing failed: '+JSON.stringify(t.status&&t.status.error||'').slice(0,120));
  const ty=t.objectTypes||{};const pkg=Object.keys(ty).find(x=>ty[x]==='package');const ct=pkg+'::'+s.toLowerCase()+'::'+s;const cur=Object.keys(ty).find(x=>ty[x].includes('::coin_registry::Currency<'));
  k=2;show(2);await new Promise(z=>setTimeout(z,1200));const tx2=new Transaction();tx2.setSender(WAL.addr);tx2.moveCall({target:'0x2::coin_registry::finalize_registration',typeArguments:[ct],arguments:[tx2.object('0xc'),tx2.object(cur)]});
  const r2=await lvClient.signAndExecuteTransaction({transaction:tx2,signer:WAL.kp,include:{effects:true}});const t2=r2.Transaction||r2.FailedTransaction;if(r2.FailedTransaction||!t2.status||!t2.status.success)throw new Error('Registration failed. The token exists but its name is not registered yet.');
  if(withVest){k=3;show(3);await new Promise(z=>setTimeout(z,1000));const MO=2629746000n;const tv=new Transaction();tv.setSender(WAL.addr);const amt=stUnits(TS.supply,TS.dec)*BigInt(Math.round((TS.vestPct||20)*100))/10000n;
   tv.moveCall({target:DEX.cfg.vesting.package+'::vesting::issue',typeArguments:[ct],arguments:[coinWithBalance({type:ct,balance:amt}),tv.pure.string('Team allocation'),tv.pure.address(WAL.addr),tv.pure.u64(0),tv.pure.u64(MO*BigInt(ST_VEST.cliffMo)),tv.pure.u64(MO*BigInt(ST_VEST.totalMo)),tv.pure.u64(0),tv.pure.bool(false),tv.object('0x6')]});
   const rv=await lvClient.signAndExecuteTransaction({transaction:tv,signer:WAL.kp,include:{effects:true}});const t4=rv.Transaction||rv.FailedTransaction;if(rv.FailedTransaction||!t4.status||!t4.status.success)throw new Error('The token is live, but the team allocation could not be locked.');}
  if(withPool){k=steps.indexOf('Open USDs pool');show(k);await new Promise(z=>setTimeout(z,1000));const tx3=new Transaction();tx3.setSender(WAL.addr);const U=ntype(DEX.cfg.coins.USDs);
   const lp=tx3.moveCall({target:DEX.cfg.package+'::pool::create_pool',typeArguments:[ct,U],arguments:[tx3.object(DEX.cfg.registry),coinWithBalance({type:ct,balance:stUnits(TS.poolTok,TS.dec)}),coinWithBalance({type:U,balance:stUnits(TS.poolUsd,6)})]});tx3.transferObjects([lp],WAL.addr);
   const r3=await lvClient.signAndExecuteTransaction({transaction:tx3,signer:WAL.kp,include:{effects:true}});const t3=r3.Transaction||r3.FailedTransaction;if(r3.FailedTransaction||!t3.status||!t3.status.success)throw new Error('The token is live, but the pool could not be opened. Add it later on the Pools page.');}
  k=steps.length;show(k);ST.tokens.push({coinType:ct,symbol:s,name:TS.name});$('stDone').innerHTML='<div class="walhero"><span class="b ok dot" style="font-size:.8rem;padding:6px 12px">'+esc(s)+' is live on Rivers</span><span class="muted mono" style="font-size:.72rem;word-break:break-all">'+esc(ct)+'</span></div><a class="btn pri wide" href="#explorer-asset-'+ct+'" data-act="closesh">Open token page</a><a class="btn wide" href="#explorer-tx-'+t.digest+'" data-act="closesh">View publish transaction</a>';
  toast(s+' is live on Rivers.');setTimeout(walRefresh,1500);}
 catch(err){show(k,err.message||String(err));}ST.busy=false;}
LACT.tsgo=function(){const e=tsIssues();if(e.length)return toast(e[0],false);const s=TS.sym.trim().toUpperCase();
 confirmBox('Create '+s+'?','<div class="kv"><div><span>Name</span><span>'+esc(TS.name)+'</span></div><div><span>Initial supply</span><span>'+fmt(TS.supply)+' '+esc(s)+'</span></div><div><span>Decimals</span><span>'+TS.dec+'</span></div><div><span>Owner</span><span class="mono">'+short(WAL.addr,6)+'</span></div><div><span>Network fee</span><span>About 0.05 RVRB</span></div></div><p class="muted" style="font-size:.76rem">The contract cannot be changed after it is published.</p>','Create token',false,stCreate);};

/* ---------- Tokens list ---------- */
async function stPoll(){if(!IDX.ok)return;try{ST.tokens=await idxGet('/tokens');ST.at=Date.now();ST.tokens.forEach(t=>{if(t.symbol&&!ST.meta[t.coinType])ST.meta[t.coinType]={symbol:t.symbol,name:t.name,decimals:t.decimals,description:t.description,regulated:!!t.regulated};});if(CUR&&CUR.sub==='tokens')EXX.tokens.update();}catch(e){}}
setInterval(stPoll,20000);setTimeout(stPoll,2500);
EXX.tokens.update=function(){const f=EXX.f||'All';const toks=ST.tokens.filter(t=>t.symbol&&!dIsDex(t.coinType));
  const st=$('tk1');if(st){st.textContent=fmt(1+toks.length);$('tk1s').textContent=toks.length?'RVRB and '+toks.length+' created':'Native token';}
  const t2=$('tk2');if(t2){if(IDX.ok){idxUnsoon(lvKpi('tk2'));t2.textContent=fmt(toks.length);$('tk2s').textContent='No code written';}else lvSoon(lvKpi('tk2'),'Token Studio');}
  ['tk3','tk4'].forEach((id,i)=>lvSoon(lvKpi(id),['Cross-chain assets','DEX liquidity'][i]));
  const cta=document.querySelector('a[href="#wallet-create"]');if(cta){cta.setAttribute('href','#explorer-create');idxUnsoon(cta.closest('.card'));}
  const supply=SUPPLY-S.reserve;const rv='<tr class="click" data-act="lvtok"><td><div style="display:flex;gap:9px;align-items:center">'+tokIcon('RVRB',30)+'<div><b>RVRB</b> <span class="b ok" style="font-size:.6rem">Native</span><div class="muted" style="font-size:.72rem">Rivers</div></div></div></td><td>Native</td><td class="n muted">—</td><td class="n mono">'+fmt(supply)+'<div class="muted" style="font-size:.7rem">of 21,000,000 max</div></td><td class="n">9</td><td class="n">'+(IDX.sum?fmt(IDX.sum.holders):'—')+'</td><td>'+featChips(['Gas','Staking','Fixed supply','Halving'])+'</td><td class="n">Genesis</td></tr>';
  const rows=toks.map(t=>'<tr class="click" data-act="sttok" data-id="'+esc(t.coinType)+'"><td><div style="display:flex;gap:9px;align-items:center">'+stIco(t.symbol,30)+'<div><b>'+esc(t.symbol)+'</b><div class="muted" style="font-size:.72rem">'+esc(t.name||'')+'</div></div></div></td><td>Created</td><td class="n muted">—</td><td class="n mono">'+stFmt(t.supply,t.decimals)+'</td><td class="n">'+t.decimals+'</td><td class="n">'+fmt(t.holders)+'</td><td>'+featChips(['Token Studio'].concat(t.regulated?['Regulated']:[]))+'</td><td class="n">#'+fmt(t.firstCp)+'</td></tr>').join('');
  const soonRows=['USDs','NGNs','rBTC','rETH'].map(t=>'<tr class="soonrow"><td><div style="display:flex;gap:9px;align-items:center">'+stIco(t,28)+'<div><b>'+t+'</b></div></div></td><td>'+(t.startsWith('r')?'Cross-chain':'Stablecoin')+'</td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td></td><td class="n">—</td></tr>').join('');
  const soon='<tr><td colspan="8" style="position:relative;padding:0"><div class="soon soonrows"><table><tbody>'+soonRows+'</tbody></table><div class="soonbadge"><span>'+SOON+'</span><b>Stablecoins and cross-chain assets</b></div></div></td></tr>';
  let h='';if(f==='All'||f==='Native')h+=rv;if(f==='All'||f==='Created')h+=rows||(f==='Created'?'<tr><td colspan="8"><div class="empty">No tokens created yet. <a href="#explorer-create">Create the first one.</a></div></td></tr>':'');if(f==='All'||f==='Stablecoin'||f==='Cross-chain')h+=soon;
  const tb=$('tkTb');if(tb&&tb._h!==h){tb.innerHTML=h;tb._h=h;}};

/* ---------- Token page ---------- */
const STP={ct:null,info:null,ctl:null,admin:null,deny:null};
assetPage=function(t){if(t==='RVRB'){location.hash='explorer-token';return '';}if(!/^0x[0-9a-f]+::\w+::\w+$/i.test(t))return lvSoonPage(esc(t),'Stablecoins and cross-chain assets.');
 const m=ST.meta[t]||{};const sym=m.symbol||t.split('::').pop();
 return `<section class="card hud"><div class="ch"><div style="display:flex;gap:14px;align-items:center;min-width:0"><a class="icobtn" href="#explorer-tokens" aria-label="Back">←</a>${stIco(sym,58)}<div style="min-width:0"><span class="eyebrow">${dIsDex(t)?'Testnet stablecoin · Rivers DEX':'Created with Token Studio'}</span><div style="font-size:1.25rem;font-weight:800" id="stN">${esc(m.name||sym)}</div><div class="mono muted" style="font-size:.74rem;word-break:break-all">${esc(t)}</div></div></div><div class="btns"><button class="btn xs" data-act="copy" data-v="${esc(t)}">Copy type</button><span id="stB"></span></div></div><p class="fg2" id="stD" style="margin-top:6px">${esc(m.description||'')}</p></section>
 <div class="g c4 rise">${kpi('sk1','Supply',IC.coins)}${kpi('sk2','Holders',IC.users)}${kpi('sk3','Transfers',IC.activity)}${kpi('sk4','Created',IC.cube)}</div>
 <div class="g c2 ais"><div class="g" style="gap:16px;align-content:start"><section class="card"><div class="ch"><h2><span class="ico">${IC.users}</span>Holders</h2><span class="sub" id="stHs"></span></div><div class="list" id="stH"><div class="empty">Loading…</div></div></section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.shield}</span>Token info</h2></div><div class="kv" id="stI"></div></section><section class="card" id="stM" hidden></section></div>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.activity}</span>Transfers</h2><span class="sub">Latest</span></div><div class="list" id="stT"><div class="empty">Loading…</div></div></section></div>`;};
EXX.create.update=function(){if(!S.connected)return;const m=$('tsMine');if(!m)return;const mine=ST.tokens.filter(t=>t.creator===WAL.addr);
 const h=mine.map(t=>'<a class="li click" href="#explorer-asset-'+esc(t.coinType)+'" style="text-decoration:none">'+stIco(t.symbol,30)+'<span><b>'+esc(t.symbol||'')+'</b> <span class="muted">'+esc(t.name||'')+'</span></span><span class="r">'+stFmt(t.supply,t.decimals)+'</span></a>').join('')||'<div class="empty">Tokens you create appear here.</div>';if(m._h!==h){m.innerHTML=h;m._h=h;}};
EXX.asset.after=function(){const ct=CUR.param;if(/::/.test(ct||''))stTokLoad(ct);};
EXX.asset.update=function(){};
async function stTokLoad(ct){STP.ct=ct;const m=await stMeta(ct);if(CUR.param!==ct)return;const dec=m.decimals||0,sym=m.symbol;
 set2('stN',m.name||sym);const d=$('stD');if(d)d.textContent=m.description||'';
 let info=null,hold=[],txs=[];if(IDX.ok){try{[info,hold,txs]=await Promise.all([idxGet('/token/'+encodeURIComponent(ct)),idxGet('/token/'+encodeURIComponent(ct)+'/holders?limit=50'),idxGet('/token/'+encodeURIComponent(ct)+'/txs?limit=40')]);}catch(e){}}
 if(CUR.param!==ct)return;if(info&&info.error)info=null;STP.info=info;
 const supply=info&&info.supply!=null?info.supply:m.supply;
 set2('sk1',supply!=null?(stNum(supply,dec)>=1000?fmt(stNum(supply,dec),0):stFmt(supply,dec)):'—');set2('sk1s',sym);set2('sk2',info?fmt(info.holders):'—');set2('sk2s','Addresses holding '+sym);set2('sk3',info?fmt(info.transfers):'—');set2('sk3s','Since creation');
 set2('sk4',info?'#'+fmt(info.firstCp):'—');set2('sk4s',info?ago(info.firstTs):'');
 const tot=supply!=null?stNum(supply,dec):0;
 $('stHs').textContent=hold.length?'Top '+hold.length:'';$('stH').innerHTML=hold.map((h,i)=>{const v=stNum(h.balance,dec);return '<div class="li"><span class="tag">#'+(i+1)+'</span><span>'+lvAddr(h.addr,6)+'<div class="bar" style="margin-top:5px"><i style="width:'+(tot?v/tot*100:0)+'%"></i></div></span><span class="r">'+fmt(v,Math.min(4,dec))+'<div class="muted" style="font-size:.7rem">'+(tot?pct(v/tot,2):'')+'</div></span></div>';}).join('')||'<div class="empty">'+(IDX.ok?'No holders yet':'Holder data needs the Rivers indexer')+'</div>';
 $('stT').innerHTML=txs.map(t=>'<div class="li click" data-act="tx" data-id="'+t.digest+'"><span class="ty '+(t.recipient?'transfer':'defi')+'">'+(t.recipient?'Transfer':String(t.amount).startsWith('-')?'Burn':'Mint')+'</span><span>'+lvAddr(t.sender,6)+(t.recipient?' → '+lvAddr(t.recipient,6):'')+'</span><span class="r">'+(t.amount&&t.amount!=='0'?stFmt(String(t.amount).replace('-',''),dec)+' '+esc(sym):'—')+'</span><span class="s">Block #'+fmt(t.cp)+' · '+ago(t.ts)+'</span></div>').join('')||'<div class="empty">No transfers yet</div>';
 let policy=dIsDex(ct)?'Minted by the testnet faucet':m.supplyState===1?'Fixed supply':m.supplyState===2?'Burn only, no minting':'Mintable';STP.ctl=null;
 if(info&&info.digest){try{const tr=(await LSv.getTransaction({digest:info.digest,readMask:{paths:['effects.changed_objects.object_id','effects.changed_objects.object_type']}})).response.transaction;
   const co=((tr.effects&&tr.effects.changedObjects)||[]).find(o=>(o.objectType||'').endsWith('::Controls'));
   if(co){const o=(await LSv.getObject({objectId:co.objectId,readMask:{paths:['json','object_id']}})).response.object;const fl=o.json&&o.json.kind&&o.json.kind.structValue?o.json.kind.structValue.fields:{};const g=k=>fl[k]&&fl[k].kind?(fl[k].kind.stringValue!=null?fl[k].kind.stringValue:fl[k].kind.boolValue):null;
     const mx=g('max_supply');const bn=g('burnable');STP.ctl={id:co.objectId,max:mx,burnable:bn===true||bn==='true'};policy='Mintable'+(mx&&mx!=='0'?', capped at '+stFmt(mx,dec):', no cap')+(STP.ctl.burnable?', burnable':'');}}catch(e){console.warn(e);}}
 const pkg=ct.split('::')[0];
 $('stI').innerHTML=[['Symbol',esc(sym)],['Decimals',dec],['Supply policy',policy],['Transfer controls',m.regulated?'Issuer can pause and freeze':'None'],['Creator',info?lvAddr(info.creator,6):'—'],['Package','<a class="mono alink" href="#explorer-address-'+pkg+'">'+short(pkg,6)+'</a>'],['Contract',dIsDex(ct)?'Rivers DEX package':'Immutable']].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');
 const bb=$('stB');if(bb)bb.innerHTML='<span class="b ok dot">Live</span>'+(m.regulated?' <span class="b gold">Regulated</span>':'');
 stManage(ct);}
async function stManage(ct){const el=$('stM');if(!el)return;if(!WAL.kp){el.hidden=false;el.innerHTML='<div class="ch"><h2><span class="ico">'+IC.stake+'</span>Manage</h2></div><p class="muted" style="font-size:.8rem">Unlock the wallet that created this token to mint, pause or freeze. Holders can burn when burning is allowed.</p><button class="btn sm" data-act="wconnect">Unlock wallet</button>';return;}
 const m=await stMeta(ct);const pkg=ct.split('::')[0],mod=ct.split('::')[1];
 const [adm,den,bal]=await Promise.all([SSv.listOwnedObjects({owner:WAL.addr,objectType:pkg+'::'+mod+'::AdminCap',pageSize:5,readMask:{paths:['object_id']}}).then(r=>r.response.objects||[]).catch(()=>[]),
  SSv.listOwnedObjects({owner:WAL.addr,objectType:'0x2::coin::DenyCapV2<'+ct+'>',pageSize:5,readMask:{paths:['object_id']}}).then(r=>r.response.objects||[]).catch(()=>[]),
  SSv.getBalance({owner:WAL.addr,coinType:ct}).then(r=>r.response.balance&&r.response.balance.balance||0).catch(()=>0)]);
 if(CUR.param!==ct)return;STP.admin=adm[0]&&adm[0].objectId;STP.deny=den[0]&&den[0].objectId;const canBurn=(STP.ctl&&STP.ctl.burnable)||m.supplyState===2;
 let h='<div class="ch"><h2><span class="ico">'+IC.stake+'</span>Manage</h2><span class="sub">Your balance '+stFmt(bal,m.decimals)+' '+esc(m.symbol)+'</span></div>';
 if(STP.admin&&STP.ctl)h+='<div class="cap">Mint</div><div class="r2 st"><div class="fld"><label for="smA">Amount</label><input class="in mono" id="smA" inputmode="decimal"></div><div class="fld"><label for="smR">Recipient</label><input class="in mono" id="smR" value="'+WAL.addr+'"></div></div><button class="btn pri sm" data-act="stmint">Mint</button>';
 if(STP.deny)h+='<div class="cap">Transfer controls</div><div class="btns"><button class="btn sm" data-act="stpause" data-v="1">Pause all transfers</button><button class="btn sm" data-act="stpause" data-v="0">Resume transfers</button></div><div class="fld"><label for="sfA">Address</label><input class="in mono" id="sfA" placeholder="0x…"></div><div class="btns"><button class="btn sm danger" data-act="stfreeze" data-v="1">Freeze address</button><button class="btn sm" data-act="stfreeze" data-v="0">Unfreeze</button></div>';
 if(canBurn&&BigInt(bal)>0n)h+='<div class="cap">Burn</div><div class="fld"><label for="sbA">Amount to destroy</label><input class="in mono" id="sbA" inputmode="decimal"></div><button class="btn sm danger" data-act="stburn">Burn</button>';
 if(!STP.admin&&!STP.deny&&!(canBurn&&BigInt(bal)>0n))h+='<p class="muted" style="font-size:.8rem">This wallet has no controls for '+esc(m.symbol)+'.</p>';
 el.hidden=false;el.innerHTML=h+'<div id="stMErr"></div>';}
async function stExec(tx,msg){if(ST.busy)return;ST.busy=true;const e=$('stMErr');if(e)e.innerHTML='';try{tx.setSender(WAL.addr);const r=await lvClient.signAndExecuteTransaction({transaction:tx,signer:WAL.kp,include:{effects:true}});const t=r.Transaction||r.FailedTransaction;
  if(r.FailedTransaction||!t.status||!t.status.success)throw new Error(JSON.stringify(t.status&&t.status.error||'Transaction failed').slice(0,160));toast(msg);setTimeout(()=>{if(STP.ct&&CUR.param===STP.ct)stTokLoad(STP.ct);walRefresh();},1500);}
 catch(err){if(e)e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';}ST.busy=false;}
Object.assign(LACT,{
 sttok(el){location.hash='explorer-asset-'+el.dataset.id;},
 stmint(){const ct=STP.ct,m=ST.meta[ct];const a=stUnits($('smA').value,m.decimals);const to=lvNorm($('smR').value.trim());if(!a||a<=0n)return toast('Enter an amount.',false);if(!to)return toast('Enter a valid recipient.',false);
  const [pkg,mod]=ct.split('::');const tx=new Transaction();tx.moveCall({target:pkg+'::'+mod+'::mint',arguments:[tx.object(STP.ctl.id),tx.object(STP.admin),tx.pure.u64(a),tx.pure.address(to)]});stExec(tx,'Minted '+$('smA').value+' '+m.symbol+'.');},
 stburn(){const ct=STP.ct,m=ST.meta[ct];const a=stUnits($('sbA').value,m.decimals);if(!a||a<=0n)return toast('Enter an amount.',false);const tx=new Transaction();const c=coinWithBalance({type:ct,balance:a});
  if(STP.ctl){const [pkg,mod]=ct.split('::');tx.moveCall({target:pkg+'::'+mod+'::burn',arguments:[tx.object(STP.ctl.id),c]});}else tx.moveCall({target:'0x2::coin_registry::burn',typeArguments:[ct],arguments:[tx.object(m.id),c]});stExec(tx,'Burned '+$('sbA').value+' '+m.symbol+'.');},
 stpause(el){const ct=STP.ct;const on=el.dataset.v==='1';const tx=new Transaction();tx.moveCall({target:'0x2::coin::deny_list_v2_'+(on?'enable':'disable')+'_global_pause',typeArguments:[ct],arguments:[tx.object('0x403'),tx.object(STP.deny)]});stExec(tx,on?'All transfers paused.':'Transfers resumed.');},
 stfreeze(el){const ct=STP.ct;const a=lvNorm($('sfA').value.trim());if(!a)return toast('Enter a valid address.',false);const on=el.dataset.v==='1';const tx=new Transaction();tx.moveCall({target:'0x2::coin::deny_list_v2_'+(on?'add':'remove'),typeArguments:[ct],arguments:[tx.object('0x403'),tx.object(STP.deny),tx.pure.address(a)]});stExec(tx,on?'Address frozen.':'Address unfrozen.');},
});
/* Re-render pages that depend on the wallet when it is unlocked or locked. */
(function(){const ws=walSet;walSet=function(kp){ws(kp);if(CUR&&(CUR.sub==='create'||CUR.sub==='asset'))route();};const wl=LACT.wallock;LACT.wallock=function(){wl();};})();
