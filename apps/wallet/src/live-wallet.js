/* ===================== RIVERS WALLET (live) =====================
   Self-custody wallet and DeFi on Rivers: balances, send, receive, swap, pools, staking, token
   creation, activity and security. Keys stay in this browser, encrypted with the user's password. */
const WV={act:'all',acts:[],actAt:0,lp:[],pos:[],vest:[]};
const wvTokens=()=>{const l=[{ct:RV_T,sym:'RVRB',dec:9,raw:String(BigInt(Math.round(WAL.bal*1e9)))}];WAL.toks.forEach(t=>{if(!/::pool::LP</.test(t.ct))l.push({ct:ntype(t.ct),sym:t.m.symbol,dec:t.m.decimals,raw:t.raw,name:t.m.name});});return l;};
const wvVal=t=>{const p=dReady()?dPrice(t.ct):null;return p==null?null:stNum(t.raw,t.dec)*p;};
const wvStaked=()=>WAL.stakes.reduce((a,x)=>a+x.principal,0);
function wvTotal(){let v=0,known=true;wvTokens().forEach(t=>{const x=wvVal(t);if(x==null)known=false;else v+=x;});const pr=dReady()?dPrice(RV_T):null;if(pr!=null)v+=wvStaked()*pr;WV.lp.forEach(l=>v+=l.usd||0);return {v,known:known&&pr!=null};}
async function wvLoad(){if(!WAL.addr)return;try{WV.acts=IDX.ok?await idxGet('/account/'+WAL.addr+'/txs?limit=100'):[];WV.actAt=Date.now();}catch(e){}
 if(dReady()){await dLpBals();WV.lp=DEX.pools.map(p=>{const s=DLP[p.id];if(!s||!s.share)return null;const a=dRes(p,p.typeA)*s.share,b=dRes(p,p.typeB)*s.share;const pa=dPrice(p.typeA),pb=dPrice(p.typeB);return {p,a,b,share:s.share,usd:(pa!=null?a*pa:0)+(pb!=null?b*pb:0)};}).filter(Boolean);}
 await wvVest();
 if(CUR.app==='wallet')VIEWS.wallet.update(CUR.sub);}
/* Vesting schedules where this wallet is the beneficiary. Amounts follow vesting::vested_amount. */
async function wvVest(){await rvConfig();if(!RVC||!RVC.vesting||!IDX.ok)return;try{const ev=(await idxGet('/events?module=vesting&name=VestingCreated&addr='+WAL.addr+'&limit=100')).filter(e=>e.json.beneficiary===WAL.addr);
 WV.vest=(await Promise.all(ev.map(async e=>{try{const o=await rvObj(e.json.schedule);const j=o.json;if(!j||j.beneficiary!==WAL.addr)return null;return {id:e.json.schedule,type:o.type,label:j.label,total:Number(j.total)/1e9,claimed:Number(j.claimed)/1e9,bps:Number(j.immediate_bps),start:Number(j.start_ms),cliff:Number(j.cliff_ms),dur:Number(j.duration_ms),revoked:!!j.revoked};}catch(x){return null;}}))).filter(Boolean);}catch(e){}}
function wvVested(v,now){if(v.revoked)return v.total;if(now<v.start)return 0;const el=now-v.start,imm=v.total*v.bps/10000;if(el>=v.dur)return v.total;if(el<v.cliff)return imm;return imm+(v.total-imm)*el/v.dur;}
setInterval(()=>{if(WAL.addr)wvLoad();},20000);
const WSUBS=[['portfolio','Home',IC.home],['swap','Swap',IC.swap],['create','Create token',IC.cube],['stake','Stake',IC.stake],['pools','Pools',IC.droplet],['activity','Activity',IC.list],['security','Security',IC.shield],['lend','Lend',IC.lend],['crosschain','Cross-chain',IC.bridge]];
VIEWS.wallet={subs:WSUBS,
 build(sub){
  if(sub==='crosschain')return lvSoonPage('Cross-chain','Moving assets between Rivers and other chains needs audited bridge contracts on both sides and independent operators. It opens after those are in place.');
  if(sub==='lend')return lvSoonPage('Lend','Rivers Lend opens after the lending markets and their price oracle are audited.');
  if(!WAL.kp)return rvGate('Rivers Wallet','Hold, send, swap and stake RVRB and every Rivers token. Create a wallet or import one with its 12 recovery words.');
  if(sub==='swap')return EXX.swap.build();if(sub==='pools')return EXX.pools.build();if(sub==='create')return EXX.create.build();
  if(sub==='portfolio')return `
  <div class="g c32 ais">
   <div class="acct"><div class="ch"><div class="who">${identicon(WAL.addr,46)}<div style="min-width:0"><div style="font-weight:800;font-size:1rem">My wallet</div><div class="mono muted trunc" style="font-size:.74rem">${short(WAL.addr,10)}</div></div></div>
     <div class="btns"><button class="icobtn" data-act="copy" data-v="${WAL.addr}" aria-label="Copy address">${IC.copy}</button><span class="b ok dot">Encrypted in this browser</span></div></div>
    <div><span class="cap">Total value</span><div class="big" id="wTot">—</div><div class="fg2" style="font-size:.84rem;margin-top:4px" id="wChg"></div></div>
    <div class="qa"><button data-act="wvsend">${IC.send}Send</button><button data-act="wvrecv">${IC.recv}Receive</button><a href="#wallet-swap">${IC.swap}Swap</a><a href="#wallet-stake">${IC.stake}Stake</a><a href="#wallet-pools">${IC.droplet}Pools</a><button data-act="walfaucet">${IC.droplet}Test RVRB</button></div></div>
   <div class="card"><div class="ch"><h2>Positions</h2><span class="sub">Earning across Rivers</span></div><div class="list" id="wPos"></div></div></div>
  <div class="g c21 ais"><div class="card"><div class="ch"><h2>Assets</h2><span class="sub">Prices from Rivers DEX pools, testnet</span></div><div id="wAssets"></div></div>
   <div class="card"><div class="ch"><h2>Recent activity</h2><a class="btn sm" href="#wallet-activity">View all</a></div><div class="list" id="wRecent"></div></div></div>
  <div class="g c2 ais"><div class="card"><div class="ch"><h2><span class="ico">${IC.grid}</span>Allocation</h2><span class="sub">By value</span></div><div class="donut" id="wAlloc"></div></div>
   <div class="card hud"><div class="ch"><h2><span class="ico">${IC.flame}</span>Projected staking rewards</h2><span class="sub">Next 12 months at the current rate</span></div><div class="kv" id="wProjK"></div></div></div>`;
  if(sub==='stake')return `
  <div class="g c4" id="stK">${kpi('sk1','Your stake',IC.stake)}${kpi('sk2','Available',IC.coins)}${kpi('sk3','Network APY',IC.flame)}${kpi('sk4','Epoch',IC.clock||IC.activity)}</div>
  <div class="g c2 ais"><div class="card hud"><div class="ch"><h2>Stake RVRB</h2><span class="b gold">Proof of Stake</span></div>
    <div class="fld"><label for="stV">Validator</label><select class="in" id="stV">${V.map(v=>'<option value="'+v.id+'">'+esc(v.name)+' · commission '+fmt(v.comm,2)+'%</option>').join('')}</select></div>
    <div class="amt"><div class="top"><span>Amount</span><span id="stBal"></span></div><div class="mid"><input id="stA" inputmode="decimal" placeholder="Minimum 1" aria-label="Amount to stake"><span class="b gold">RVRB</span></div><div class="bot"><span id="stUsd"></span><button class="maxb" data-act="wvstmax">MAX</button></div></div>
    <div class="kv" id="stKv"></div><div id="stErr"></div><button class="btn gold wide" data-act="wvstake">Stake</button>
    <p class="muted" style="font-size:.76rem">Rewards are paid at the end of each epoch (one day). Unstaked RVRB returns to your balance with its rewards.</p></div>
   <div class="card"><div class="ch"><h2>Your stakes</h2></div><div class="list" id="stMine"></div></div></div>`;
  if(sub==='activity')return `
  <div class="card"><div class="ch"><h2>Activity</h2><div class="seg">${[['all','All'],['out','Sent'],['in','Received'],['call','Contract calls']].map(f=>'<button data-act="wvactf" data-v="'+f[0]+'" class="'+(WV.act===f[0]?'on':'')+'">'+f[1]+'</button>').join('')}</div></div><div class="list" id="acL"><div class="empty">Loading…</div></div></div>`;
  if(sub==='security')return `
  <div class="g c2 ais"><div class="card"><div class="ch"><h2><span class="ico">${IC.shield}</span>This wallet</h2></div><div class="kv">
    <div><span>Address</span><span class="mono">${short(WAL.addr,8)} <button class="btn xs" data-act="copy" data-v="${WAL.addr}">Copy</button></span></div>
    <div><span>Key type</span><span>Ed25519 · 12 recovery words</span></div><div><span>Stored</span><span>Encrypted in this browser (AES-GCM, PBKDF2 250,000 rounds)</span></div></div>
    <div class="cap">Lock automatically after</div><div class="seg" id="seLock">${[5,15,60,0].map(m=>'<button data-act="wvlock" data-v="'+m+'" class="'+(+(lvStore.get(RV_LOCK_KEY)||15)===m?'on':'')+'">'+(m?m+' min':'Never')+'</button>').join('')}</div>
    <div class="btns"><button class="btn sm" data-act="wallock">Lock now</button><button class="btn sm danger" data-act="walforget">Remove from this browser</button></div></div>
   <div class="card hud"><div class="ch"><h2><span class="ico">${IC.lock}</span>Recovery words</h2></div><p class="fg2" style="font-size:.84rem">Anyone with these 12 words controls this wallet. Show them only where nobody can see your screen.</p>
    <div class="fld"><label for="sePw">Password</label><input class="in" id="sePw" type="password" autocomplete="current-password"></div><div id="seErr"></div><button class="btn sm" data-act="wvreveal">Show recovery words</button><div id="seWords"></div>
    <div class="cap">Change password</div><div class="fld"><label for="seOld">Current password</label><input class="in" id="seOld" type="password" autocomplete="current-password"></div>${walPwFields()}<button class="btn sm" data-act="wvpw">Change password</button></div></div>`;
  return '';},
 after(sub){if(!WAL.kp)return;if(sub==='swap')return EXX.swap.after();if(sub==='pools')return EXX.pools.after();if(sub==='create')return EXX.create.after();
  if(sub==='stake'){const a=$('stA');a.addEventListener('input',()=>VIEWS.wallet.update('stake'));$('stV').addEventListener('change',()=>VIEWS.wallet.update('stake'));}
  wvLoad();},
 update(sub){if(!WAL.kp)return;if(['portfolio','stake','activity'].includes(sub)&&!$({portfolio:'wTot',stake:'stK',activity:'acL'}[sub]))return;if(sub==='swap')return EXX.swap.update();if(sub==='pools')return EXX.pools.update();if(sub==='create')return EXX.create.update&&EXX.create.update();
  const pr=dReady()?dPrice(RV_T):null;const apy=wvApy();
  if(sub==='portfolio'){const T=wvTotal();set2('wTot',T.v?usdF(T.v):fmt(WAL.bal,4)+' RVRB');const c=$('wChg');if(c)c.textContent=(T.known?'':'Some tokens have no pool price yet · ')+fmt(WAL.bal,4)+' RVRB available · '+fmt(wvStaked(),2)+' RVRB staked';
   const toks=wvTokens();const as=$('wAssets');if(as){const h='<div class="list">'+toks.map(t=>{const v=wvVal(t);const p=dReady()?dPrice(t.ct):null;return '<div class="li">'+(t.ct===RV_T?tokIcon('RVRB',30):stIco(t.sym,30))+'<span><b>'+esc(t.sym)+'</b><br><span class="muted" style="font-size:.72rem">'+(p!=null?usdF(p):'No pool price')+'</span></span><span class="r">'+fmt(stNum(t.raw,t.dec),4)+'<div class="muted" style="font-size:.7rem">'+(v!=null?usdF(v):'')+'</div></span></div>';}).join('')+'</div>';if(as._h!==h){as.innerHTML=h;as._h=h;}}
   const pos=$('wPos');if(pos){const h=WAL.stakes.map(x=>'<div class="li"><span class="ty stake">Stake</span><span>'+esc(x.val?x.val.name:'Validator')+'<br><span class="muted" style="font-size:.72rem">since epoch '+x.epoch+'</span></span><span class="r">'+fmt(x.principal,2)+' RVRB</span></div>').join('')+WV.vest.map(v=>{const c=Math.max(0,wvVested(v,Date.now())-v.claimed);return '<div class="li"><span class="ty stake">Vesting</span><span>'+esc(v.label||'Vesting')+'<br><span class="muted" style="font-size:.72rem">'+fmt(v.claimed,2)+' of '+fmt(v.total,2)+' RVRB claimed'+(v.revoked?' · stopped':'')+'</span></span><span class="r">'+(c>=0.01?'<button class="btn xs pri" data-act="wvclaim" data-id="'+v.id+'">Claim '+fmt(c,2)+'</button>':'<span class="muted" style="font-size:.74rem">Next unlock '+(Date.now()<v.start+v.cliff?new Date(v.start+v.cliff).toLocaleDateString():'soon')+'</span>')+'</span></div>';}).join('')+WV.lp.map(l=>'<div class="li"><span class="ty defi">Pool</span><span>'+esc(dSym(l.p.typeA))+' / '+esc(dSym(l.p.typeB))+'<br><span class="muted" style="font-size:.72rem">'+pct(l.share,3)+' of the pool</span></span><span class="r">'+usdF(l.usd)+'</span></div>').join('');pos.innerHTML=h||'<div class="empty">No positions yet. <a href="#wallet-stake">Stake RVRB</a> or <a href="#wallet-pools">add liquidity</a>.</div>';}
   const rc=$('wRecent');if(rc)rc.innerHTML=wvRows(WV.acts.slice(0,6))||'<div class="empty">No activity yet.</div>';
   const al=$('wAlloc');if(al){const parts=toks.map(t=>[t.sym,wvVal(t)||0]).filter(x=>x[1]>0);if(pr!=null&&wvStaked())parts.push(['Staked RVRB',wvStaked()*pr]);WV.lp.forEach(l=>parts.push([dSym(l.p.typeA)+'/'+dSym(l.p.typeB)+' pool',l.usd]));const h=parts.length?donut(parts.map((p,i)=>[p[0],p[1],[C.acc,C.river,C.gold,C.violet,C.pearl,C.warn][i%6]]),compact(parts.reduce((a,p)=>a+p[1],0)),'USDs'):'<div class="empty">Allocation appears when your tokens have pool prices.</div>';if(al._h!==h){al.innerHTML=h;al._h=h;}}
   const pk=$('wProjK');if(pk)pk.innerHTML=[['Staked',fmt(wvStaked(),2)+' RVRB'],['Current APY',apy!=null?fmt(apy,2)+'%':'Known after the first epoch ends'],['Rewards in 12 months',apy!=null?fmt(wvStaked()*apy/100,2)+' RVRB':'—'],['Value at today\'s price',apy!=null&&pr!=null?usdF(wvStaked()*apy/100*pr):'—']].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');}
  if(sub==='stake'){set2('sk1',fmt(wvStaked(),2));set2('sk1s','RVRB in '+WAL.stakes.length+' position'+(WAL.stakes.length===1?'':'s'));set2('sk2',fmt(WAL.bal,4));set2('sk2s','RVRB');set2('sk3',apy!=null?fmt(apy,2)+'%':'—');set2('sk3s',apy!=null?'Last finished epoch':'Known after the first epoch');set2('sk4',fmt(S.epoch));set2('sk4s','One epoch is one day');
   const v=V[+($('stV')||{}).value||0];const a=+($('stA')||{}).value||0;set2('stBal','Available '+fmt(WAL.bal,4));set2('stUsd',a&&pr!=null?'≈ '+usdF(a*pr):'');
   const kv=$('stKv');if(kv&&v)kv.innerHTML=[['Validator',esc(v.name)],['Commission',fmt(v.comm,2)+'%'],['Validator stake',compact(v.stake)+' RVRB'],['Rewards start','Next epoch'],['Estimated yearly reward',apy!=null&&a?fmt(a*apy/100,2)+' RVRB':'—']].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');
   const m=$('stMine');if(m){const h=WAL.stakes.map(x=>'<div class="li">'+(x.val?identicon(x.val.addr,26):'')+'<span><b>'+fmt(x.principal,2)+' RVRB</b><br><span class="muted" style="font-size:.72rem">'+esc(x.val?x.val.name:short(x.pool||'',6))+' · since epoch '+x.epoch+'</span></span><span class="r"><button class="btn xs" data-act="walunstake" data-id="'+x.id+'">Unstake</button></span></div>').join('')||'<div class="empty">You have no stake yet.</div>';if(m._h!==h){m.innerHTML=h;m._h=h;}}}
  if(sub==='activity'){const l=$('acL');if(!l)return;const f=WV.act;const rows=WV.acts.filter(t=>f==='all'||(f==='out'&&t.sender===WAL.addr&&t.kind!=='call')||(f==='in'&&t.sender!==WAL.addr)||(f==='call'&&t.kind!=='transfer'));const h=wvRows(rows)||'<div class="empty">'+(IDX.ok?'No activity in this view.':'Activity needs the Rivers indexer, which is not reachable right now.')+'</div>';if(l._h!==h){l.innerHTML=h;l._h=h;}}}};
function wvApy(){const r=Object.values(IDX.rewards||{}).map(x=>x.filter(e=>e.apy!=null).slice(-1)[0]).filter(Boolean);return r.length?r.reduce((a,x)=>a+x.apy,0)/r.length:null;}
function wvRows(list){return list.map(t=>{const out=t.sender===WAL.addr;const lab=t.kind==='call'||t.kind==='publish'?rvLabel(t.label,t.kind):out?'Sent':'Received';
 return '<div class="li click" data-act="tx" data-id="'+t.digest+'"><span class="ty '+(t.kind==='transfer'?'transfer':'defi')+'">'+esc(lab)+'</span><span class="mono trunc">'+(out&&t.recipient?'to '+short(t.recipient,6):!out?'from '+short(t.sender,6):short(t.digest,8))+'</span><span class="r" style="color:'+(t.delta<0?'var(--bad)':t.delta>0?'var(--ok)':'var(--muted)')+'">'+(t.delta>0?'+':'')+(t.delta?fmt(t.delta,4)+' RVRB':'—')+'</span><span class="s">'+ago(t.ts)+(t.ok?'':' · failed')+'</span></div>';}).join('');}
Object.assign(LACT,{
 wvsend(){WAL.flow='send';walSheet();},
 async wvclaim(el){const v=WV.vest.find(x=>x.id===el.dataset.id);if(!v)return;const T=(v.type.match(/<(.+)>$/)||[])[1]||RVRB_T;const tx=new Transaction();tx.moveCall({target:RVC.vesting.package+'::vesting::claim_to_sender',typeArguments:[T],arguments:[tx.object(v.id),tx.object('0x6')]});
  try{await rvSign(tx,'Unlocked RVRB claimed.');setTimeout(wvLoad,2000);}catch(e){toast(e.message,false);}},wvrecv(){WAL.flow='receive';walSheet();},
 wvactf(el){WV.act=el.dataset.v;$$('[data-act=wvactf]').forEach(b=>b.classList.toggle('on',b===el));VIEWS.wallet.update('activity');},
 wvstmax(){$('stA').value=String(Math.max(0,Math.floor(WAL.bal-0.05)));VIEWS.wallet.update('stake');},
 async wvstake(){const v=V[+$('stV').value];const d=toDrops($('stA').value);const e=$('stErr');e.innerHTML='';if(!v)return;if(!d||d<1000000000n){e.innerHTML='<div class="errbox">The minimum stake is 1 RVRB.</div>';return;}if(Number(d)/1e9>WAL.bal-0.02){e.innerHTML='<div class="errbox">Keep a little RVRB for the network fee.</div>';return;}
  const tx=new Transaction();const [c]=tx.splitCoins(tx.gas,[d]);tx.moveCall({target:'0x3::sui_system::request_add_stake',arguments:[tx.object('0x5'),c,tx.pure.address(v.addr)]});
  try{await rvSign(tx,'Staked '+fmt(Number(d)/1e9,2)+' RVRB with '+v.name+'.');$('stA').value='';setTimeout(()=>VIEWS.wallet.update('stake'),1800);}catch(err){e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';}},
 wvlock(el){lvStore.set(RV_LOCK_KEY,el.dataset.v);$$('[data-act=wvlock]').forEach(b=>b.classList.toggle('on',b===el));toast(+el.dataset.v?'The wallet locks after '+el.dataset.v+' minutes without activity.':'Automatic lock turned off.');},
 async wvreveal(){const e=$('seErr');e.innerHTML='';try{const st=walStored();const k=await walKey($('sePw').value,unb64(st.salt));const w=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(st.iv)},k,unb64(st.ct)));
  $('seWords').innerHTML='<div class="words reveal">'+w.split(' ').map((x,i)=>'<span><i>'+(i+1)+'</i>'+x+'</span>').join('')+'</div><button class="btn xs" data-act="wvhide">Hide</button>';$('sePw').value='';setTimeout(()=>{const s=$('seWords');if(s)s.innerHTML='';},60000);}catch(err){e.innerHTML='<div class="errbox">Wrong password.</div>';}},
 wvhide(){$('seWords').innerHTML='';},
 async wvpw(){try{const st=walStored();const k=await walKey($('seOld').value,unb64(st.salt));const w=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(st.iv)},k,unb64(st.ct)));const pw=walPw();await walSave(w,pw);['seOld','wP1','wP2'].forEach(i=>$(i).value='');toast('Password changed.');}
  catch(err){toast(err.name==='OperationError'?'The current password is wrong.':err.message,false);}},
});
function rvWho(){return 'My wallet';}
