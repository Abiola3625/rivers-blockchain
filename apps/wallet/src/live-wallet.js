/* ===================== RIVERS WALLET (live) =====================
   Self-custody wallet and DeFi on Rivers: balances, send, receive, swap, pools, staking, token
   creation, activity and security. Keys stay in this browser, encrypted with the user's password. */
const WV={act:'all',acts:[],actAt:0,lp:[],pos:[],vest:[]};
const wvTokens=()=>{const l=[{ct:RV_T,sym:'RVRB',dec:9,raw:String(BigInt(Math.round(WAL.bal*1e9)))}];WAL.toks.forEach(t=>{if(!/::pool::LP<|::lend::Share</.test(t.ct))l.push({ct:ntype(t.ct),sym:t.m.symbol,dec:t.m.decimals,raw:t.raw,name:t.m.name});});return l;};
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
const WSUBS=[['portfolio','Home',IC.home],['swap','Swap',IC.swap],['create','Create token',IC.cube],['stake','Stake',IC.stake],['pools','Pools',IC.droplet],['activity','Activity',IC.list],['security','Security',IC.shield],['verify','Chain check',IC.shield],['lend','Lend',IC.lend],['private','Private',IC.lock],['crosschain','Cross-chain',IC.bridge]];
VIEWS.wallet={subs:WSUBS,
 build(sub){
  if(sub==='crosschain')return lvSoonPage('Cross-chain','Moving assets between Rivers and other chains needs audited bridge contracts on both sides and independent operators. It opens after those are in place.');
  if(sub==='verify')return wcPage();
  if(!WAL.kp)return rvGate('Rivers Wallet','Hold, send, swap and stake RVRB and every Rivers token. Create a wallet or import one with its 12 recovery words.');
  if(sub==='swap')return EXX.swap.build();if(sub==='pools')return EXX.pools.build();if(sub==='create')return EXX.create.build();
  if(sub==='portfolio')return `
  <div class="g c32 ais">
   <div class="acct"><div class="ch"><div class="who">${identicon(WAL.addr,46)}<div style="min-width:0"><div style="font-weight:800;font-size:1rem">My wallet</div><div class="mono muted trunc" style="font-size:.74rem">${short(WAL.addr,10)}</div></div></div>
     <div class="btns"><button class="icobtn" data-act="copy" data-v="${WAL.addr}" aria-label="Copy address">${IC.copy}</button><span class="b ok dot">Encrypted in this browser</span></div></div>
    <a href="#wallet-verify" id="wcBadge" class="b dot" style="align-self:flex-start">Checking the chain…</a>
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
  if(sub==='lend'){if(!RVC||!RVC.lend){rvConfig().then(c=>{if(c&&c.lend&&CUR.sub==='lend')route();});return lvSoonPage('Lend','Rivers Lend is being set up on this testnet. This page opens when the first markets are live.');}
   return `<div class="g c4" id="ldK"></div>
  <div class="card"><div class="ch"><div class="ttl"><h2>Markets</h2><span class="sub">Rates move with how much of each market is borrowed. Collateral is valued with a 10-minute time-weighted price from Rivers DEX.</span></div><span class="b warn">Testnet</span></div>
   <div class="tw"><table><thead><tr><th>Market</th><th class="n">Supplied</th><th class="n">Borrowed</th><th>Utilization</th><th class="n">Supply APY</th><th class="n">Borrow APY</th><th class="n">You supply</th><th class="n">Your loan</th><th></th></tr></thead><tbody id="ldT"></tbody></table></div></div>
  <div class="card"><div class="ch"><h2>How it works</h2></div><div class="kv"><div><span>Borrowing limit</span><span>Up to the market's loan-to-value of your collateral</span></div><div><span>Liquidation</span><span>Above the liquidation threshold, anyone can repay half your loan and take collateral worth it plus a bonus</span></div><div><span>Price</span><span>Average of the Rivers DEX pool over at least 10 minutes; a price pushed inside one transaction does not count</span></div><div><span>Pausing</span><span>Rivers Core can stop new borrowing. Repaying, supplying and withdrawing always work.</span></div></div></div>`;}
  if(sub==='private'){if(!RVC||!RVC.shield||!RVC.shield.pools){rvConfig().then(c=>{if(c&&c.shield&&c.shield.pools&&CUR.sub==='private')route();});return lvSoonPage('Private','Shielded payments are being set up on this testnet. This page opens when the shielded pools are live.');}
   return `<div class="g c3" id="zK"></div>
  <div class="g c2 ais"><div class="card"><div class="ch"><h2><span class="ico">${IC.lock}</span>Your private address</h2><span class="b warn">Testnet</span></div>
    <p class="fg2" style="font-size:.84rem">Give this address to people who want to pay you privately. It is not your public address, and it does not reveal it.</p>
    <div class="mono" id="zAddr" style="word-break:break-all;font-size:.74rem;line-height:1.5">Opening…</div><div class="btns"><button class="btn sm" data-act="zcopy">Copy private address</button></div>
    <div class="cap">Your notes</div><div class="list" id="zNotes"><div class="empty">Looking for your notes…</div></div></div>
   <div class="card"><div class="ch"><h2>Move money privately</h2></div>
    <div class="seg" id="zMode">${[['shield','Shield'],['send','Send privately'],['unshield','Unshield']].map(m=>'<button data-act="zmode" data-v="'+m[0]+'" class="'+(WZ.mode===m[0]?'on':'')+'">'+m[1]+'</button>').join('')}</div>
    <div class="fld"><label for="zCoin">Coin</label><select class="in" id="zCoin">${Object.keys(RVC.shield.pools).map(k=>'<option value="'+k+'"'+(WZ.coin===k?' selected':'')+'>'+k+'</option>').join('')}</select></div>
    <div class="fld"><label for="zAmt">Amount</label><input class="in mono" id="zAmt" inputmode="decimal" placeholder="0"><span class="muted" style="font-size:.72rem" id="zAv"></span></div>
    <div class="fld" id="zToF"><label for="zTo"></label><input class="in mono" id="zTo" autocomplete="off" spellcheck="false"></div>
    <p class="rvnote" id="zHelp"></p><div id="zErr"></div><button class="btn pri wide" data-act="zgo" id="zGo"></button></div></div>
  <div class="card"><div class="ch"><h2>What others can see</h2></div><div class="list"><div class="li" style="display:block"><b>Shield</b><div class="fg2" style="font-size:.84rem;margin-top:2px">The amount you put in and your public address.</div></div><div class="li" style="display:block"><b>Send privately</b><div class="fg2" style="font-size:.84rem;margin-top:2px">That your public address paid a network fee for a private payment. Not the amount, not the receiver, not which of your notes were used.</div></div><div class="li" style="display:block"><b>Unshield</b><div class="fg2" style="font-size:.84rem;margin-top:2px">The amount and the public address it goes to, but not which notes paid for it.</div></div><div class="li" style="display:block"><b>Your keys</b><div class="fg2" style="font-size:.84rem;margin-top:2px">Your private address comes from this wallet's key, so your 12 recovery words also restore your private notes.</div></div><div class="li" style="display:block"><b>Proof</b><div class="fg2" style="font-size:.84rem;margin-top:2px">Your device makes a zero-knowledge proof for each private payment. It takes a few seconds and downloads about 12 MB the first time.</div></div><div class="li" style="display:block"><b>Testnet setup</b><div class="fg2" style="font-size:.84rem;margin-top:2px">The proving key on this testnet was made by one party. Mainnet will use a public ceremony with many contributors.</div></div></div></div>`;}
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
 after(sub){if(sub==='verify'){wcPaint();wcCheck();return;}if(sub==='portfolio'){wcPaint();if(Date.now()-WC.at>300000)wcCheck();}if(!WAL.kp)return;if(sub==='private'&&$('zCoin')){$('zCoin').addEventListener('change',wzView);WZ.at=0;wzView();return;}if(sub==='swap')return EXX.swap.after();if(sub==='pools')return EXX.pools.after();if(sub==='create')return EXX.create.after();
  if(sub==='stake'){const a=$('stA');a.addEventListener('input',()=>VIEWS.wallet.update('stake'));$('stV').addEventListener('change',()=>VIEWS.wallet.update('stake'));}
  wvLoad();},
 update(sub){if(!WAL.kp)return;if(sub==='private')return wzView();if(['portfolio','stake','activity','lend'].includes(sub)&&!$({portfolio:'wTot',stake:'stK',activity:'acL',lend:'ldT'}[sub]))return;if(sub==='swap')return EXX.swap.update();if(sub==='pools')return EXX.pools.update();if(sub==='create')return EXX.create.update&&EXX.create.update();
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
  if(sub==='lend'&&$('ldT'))wvLend();
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
/* ---------- Rivers Lend ---------- */
const WL={m:[],at:0};
async function wvLendLoad(){WL.m=await rvLendMarkets(WAL.addr);WL.at=Date.now();if(CUR.sub==='lend')wvLend(true);}
const wlF=(raw,t)=>fmt(stNum(String(raw),dDec(t)),Math.min(4,dDec(t)));
function wvLend(fresh){if(!fresh&&Date.now()-WL.at>15000){wvLendLoad();}const M=WL.m;const k=$('ldK');if(!k)return;
 const usd=(raw,t)=>{const p=dReady()?dPrice(t):null;return p==null?0:stNum(String(raw),dDec(t))*p;};
 const sup=M.reduce((a,m)=>a+usd(m.supplied,m.D),0),bor=M.reduce((a,m)=>a+usd(m.debt,m.D),0),mine=M.reduce((a,m)=>a+usd(m.mySupply||0n,m.D),0),myd=M.reduce((a,m)=>a+usd(m.myDebt||0n,m.D),0);
 k.innerHTML=stat('Supplied',usdF(sup),'all markets')+stat('Borrowed',usdF(bor),'all markets')+stat('You supply',usdF(mine),'earning interest')+stat('You owe',usdF(myd),M.some(m=>m.myDebt>0n)?'see health below':'no loans');
 const h=M.map(m=>{const pr=rvLendPrice(m);const colV=pr!=null?stNum(String(m.myCol),dDec(m.C))*pr:null;const dv=stNum(String(m.myDebt),dDec(m.D));const hf=m.myDebt>0n&&colV!=null?colV*m.liq/dv:null;
  return '<tr><td><b>'+esc(dSym(m.D))+'</b> <span class="muted" style="font-size:.74rem">against '+esc(dSym(m.C))+'</span>'+(m.paused?' <span class="b warn">Borrowing paused</span>':'')+'<div class="muted" style="font-size:.7rem">LTV '+pct(m.ltv,0)+' · liquidation at '+pct(m.liq,0)+'</div></td><td class="n">'+wlF(m.supplied,m.D)+'</td><td class="n">'+wlF(m.debt,m.D)+'</td><td><div class="bar"><i style="width:'+(m.util*100)+'%"></i></div><span class="muted" style="font-size:.72rem">'+pct(m.util,1)+'</span></td><td class="n">'+pct(m.sr,2)+'</td><td class="n">'+pct(m.br,2)+'</td><td class="n">'+wlF(m.mySupply||0n,m.D)+'</td><td class="n">'+(m.myCol>0n||m.myDebt>0n?wlF(m.myDebt,m.D)+' '+esc(dSym(m.D))+'<div class="muted" style="font-size:.7rem">'+wlF(m.myCol,m.C)+' '+esc(dSym(m.C))+' collateral'+(hf!=null?' · health '+fmt(hf,2):'')+'</div>':'—')+'</td><td><div class="btns"><button class="btn xs" data-act="wlact" data-id="'+m.id+'" data-v="supply">Supply</button><button class="btn xs pri" data-act="wlact" data-id="'+m.id+'" data-v="borrow">Borrow</button>'+(m.myShares>0n?'<button class="btn xs" data-act="wlact" data-id="'+m.id+'" data-v="withdraw">Withdraw</button>':'')+(m.myDebt>0n?'<button class="btn xs" data-act="wlact" data-id="'+m.id+'" data-v="repay">Repay</button>':'')+(m.myCol>0n?'<button class="btn xs" data-act="wlact" data-id="'+m.id+'" data-v="uncol">Take collateral</button>':'')+'</div></td></tr>';}).join('')||'<tr><td colspan="9"><div class="empty">Loading markets…</div></td></tr>';
 const t=$('ldT');if(t._h!==h){t.innerHTML=h;t._h=h;}}
const wlBal=t=>{t=ntype(t);if(t===RV_T)return WAL.bal;const x=WAL.toks.find(k=>ntype(k.ct)===t);return x?stNum(x.raw,x.m.decimals):0;};
function wlSheet(m,mode){const C=dSym(m.C),D=dSym(m.D);const pr=rvLendPrice(m);const T={supply:['Supply '+D,'Amount of '+D+' to lend','Earns '+pct(m.sr,2)+' a year at the current rate. You can withdraw whatever is not lent out.'],
  borrow:['Borrow '+D,'Amount of '+D+' to borrow','Add '+C+' as collateral first or in the same step. You can borrow up to '+pct(m.ltv,0)+' of its value.'],withdraw:['Withdraw '+D,'Share of your supply to withdraw (%)',''],repay:['Repay '+D,'Amount of '+D+' to repay','Anything above your loan is returned.'],uncol:['Take back '+C,'Amount of '+C,'You can take back collateral while your loan stays within the limit.']}[mode];
 let extra='';if(mode==='borrow')extra='<div class="fld"><label for="wlC">'+esc(C)+' to add as collateral (optional)</label><input class="in mono" id="wlC" inputmode="decimal" placeholder="0"><span class="muted" style="font-size:.72rem">Balance '+fmt(wlBal(m.C),4)+' '+esc(C)+(pr!=null?' · 1 '+esc(C)+' ≈ '+fmt(pr,4)+' '+esc(D):'')+'</span></div>';
 openSheet(T[0],extra+'<div class="fld"><label for="wlA">'+T[1]+'</label><input class="in mono" id="wlA" inputmode="decimal" '+(mode==='withdraw'?'value="100"':mode==='repay'?'value="'+String(Math.min(wlBal(m.D),stNum(String(m.myDebt),dDec(m.D))))+'"':'')+'><span class="muted" style="font-size:.72rem">'+(mode==='supply'||mode==='repay'?'Balance '+fmt(wlBal(m.D),4)+' '+esc(D):mode==='uncol'?'Deposited '+wlF(m.myCol,m.C)+' '+esc(C):mode==='borrow'?'Available to borrow in the market '+wlF(m.avail,m.D)+' '+esc(D):'')+'</span></div><p class="rvnote">'+T[2]+'</p><div id="wlErr"></div><button class="btn pri wide" data-act="wlgo" data-id="'+m.id+'" data-v="'+mode+'">'+T[0]+'</button>','Rivers Lend · '+D+' against '+C);}
/* ---------- Private (shielded) payments ---------- */
const WZ={w:null,seq:0,wait:{},addr:null,for:null,mode:'shield',coin:'RVRB',bal:{},notes:{},at:0,busy:false};
function wzCall(op,data){if(!WZ.w){WZ.w=new Worker('shield-worker.js');WZ.w.onmessage=e=>{const p=WZ.wait[e.data.id];if(!p)return;delete WZ.wait[e.data.id];e.data.ok?p.res(e.data.result):p.rej(new Error(e.data.error));};WZ.w.onerror=e=>{Object.values(WZ.wait).forEach(p=>p.rej(new Error('The private payment worker stopped. Reload the page.')));WZ.wait={};};}
 const id=++WZ.seq;return new Promise((res,rej)=>{WZ.wait[id]={res,rej};WZ.w.postMessage(Object.assign({id,op},data));});}
// The worker holds keys derived from the wallet key, so it is stopped whenever the wallet locks.
function wzStop(){if(WZ.w)WZ.w.terminate();Object.assign(WZ,{w:null,wait:{},addr:null,for:null,bal:{},notes:{},at:0});}
async function wzInit(){if(WZ.addr&&WZ.for===WAL.addr)return;if(WZ.for&&WZ.for!==WAL.addr)wzStop();const r=await wzCall('init',{seed:WAL.kp.getSecretKey(),indexer:LV_IDX});WZ.addr=r.address;WZ.for=WAL.addr;}
const wzDec=k=>dDec(RVC.shield.pools[k].type);
async function wzLoad(){if(!WAL.kp||!RVC||!RVC.shield)return;try{await wzInit();for(const k of Object.keys(RVC.shield.pools)){const r=await wzCall('scan',{pool:RVC.shield.pools[k].id});WZ.bal[k]=BigInt(r.balance);WZ.notes[k]=r.notes;}WZ.at=Date.now();WZ.err=null;}catch(e){WZ.err=e.message;}if(CUR.sub==='private')wzView();}
function wzView(){const k=$('zK');if(!k)return;const ks=Object.keys(RVC.shield.pools);
 k.innerHTML=ks.map(c=>stat('Shielded '+c,WZ.bal[c]!=null?fmt(stNum(String(WZ.bal[c]),wzDec(c)),4):'…',WZ.notes[c]?WZ.notes[c].length+' note'+(WZ.notes[c].length===1?'':'s'):'scanning')).join('')+stat('Public RVRB',fmt(WAL.bal,4),'pays network fees');
 const a=$('zAddr');if(a&&WZ.addr)a.textContent=WZ.addr;
 const n=$('zNotes');if(n){const h=WZ.err?'<div class="errbox">'+esc(WZ.err)+'</div>':ks.flatMap(c=>(WZ.notes[c]||[]).map(x=>'<div class="li"><span><b>'+fmt(stNum(x.amount,wzDec(c)),4)+' '+esc(c)+'</b></span><span class="r muted">note '+x.index+'</span></div>')).join('')||'<div class="empty">'+(WZ.at?'No private notes yet. Shield some coins to start.':'Looking for your notes…')+'</div>';if(n._h!==h){n.innerHTML=h;n._h=h;}}
 const c=($('zCoin')||{}).value||WZ.coin;const m=WZ.mode;const T={shield:['Shield '+c,'','Moves coins from your public balance into the shielded pool. Only you can see your shielded notes.','Public balance '+fmt(wlBal(RVC.shield.pools[c].type),4)+' '+c],
  send:['Send privately','Private address of the receiver (rvz1…)','The receiver gets a private note. Nobody else can see the amount or who received it.','Shielded '+fmt(stNum(String(WZ.bal[c]||0n),wzDec(c)),4)+' '+c],
  unshield:['Unshield '+c,'Public address to receive the coins','Takes coins out of the shielded pool to any public address. Leave your own address to move them back to this wallet.','Shielded '+fmt(stNum(String(WZ.bal[c]||0n),wzDec(c)),4)+' '+c]}[m];
 $('zGo').textContent=T[0];$('zHelp').textContent=T[2];$('zAv').textContent=T[3];const f=$('zToF');f.style.display=m==='shield'?'none':'';f.querySelector('label').textContent=T[1];const to=$('zTo');if(m==='unshield'&&!to.value)to.value=WAL.addr;if(m==='send'&&to.value===WAL.addr)to.value='';
 if(!WAL.kp)return;if(Date.now()-WZ.at>20000&&!WZ.busy){WZ.at=Date.now();wzLoad();}}
Object.assign(LACT,{
 zmode(el){WZ.mode=el.dataset.v;const to=$('zTo');if(to)to.value='';document.querySelectorAll('#zMode button').forEach(b=>b.classList.toggle('on',b===el));wzView();},
 zcopy(){if(WZ.addr){navigator.clipboard.writeText(WZ.addr).then(()=>toast('Private address copied.'),()=>toast('Copy failed. Select the address and copy it.',false));}},
 async zgo(el){if(WZ.busy)return;const e=$('zErr');e.innerHTML='';const c=$('zCoin').value;WZ.coin=c;const P=RVC.shield.pools[c];const dec=wzDec(c);const m=WZ.mode;
  try{const amt=stUnits($('zAmt').value.trim(),dec);if(!amt||amt<=0n)throw new Error('Enter an amount above zero.');let to='',recipient=WAL.addr;
   if(m==='shield'){if(stNum(String(amt),dec)>wlBal(P.type))throw new Error('Your public balance is '+fmt(wlBal(P.type),4)+' '+c+'.');}
   else{if((WZ.bal[c]||0n)<amt)throw new Error('Your shielded balance is '+fmt(stNum(String(WZ.bal[c]||0n),dec),4)+' '+c+'.');to=$('zTo').value.trim();
    if(m==='send'){if(!/^rvz1[0-9a-f]{128}$/.test(to))throw new Error('Enter a private address. It starts with rvz1.');}else{recipient=lvNorm(to);if(!recipient)throw new Error('Enter a valid public address.');}}
   if(WAL.bal<0.05)throw new Error('Keep at least 0.05 RVRB in your public balance for the network fee.');
   WZ.busy=true;el.disabled=true;el.textContent='Making the proof…';
   const r=await wzCall('prove',{pool:P.id,kind:m,amount:String(amt),to,recipient});
   el.textContent='Sending…';const tx=new Transaction();
   tx.moveCall({target:RVC.shield.package+'::shield::transact',typeArguments:[P.type],arguments:[tx.object(P.id),tx.pure.vector('u8',r.proof),tx.pure.u256(BigInt(r.root)),tx.pure.vector('u256',r.nullifiers.map(BigInt)),tx.pure.vector('u256',r.commitments.map(BigInt)),
    BigInt(r.deposit)>0n?coinWithBalance({type:P.type,balance:BigInt(r.deposit)}):tx.moveCall({target:'0x2::coin::zero',typeArguments:[P.type]}),tx.pure.u64(BigInt(r.withdraw)),tx.pure.address(r.recipient),tx.pure.vector('u8',r.enc1),tx.pure.vector('u8',r.enc2)]});
   await rvSign(tx,{shield:'Shielded.',send:'Sent privately.',unshield:'Unshielded.'}[m]);$('zAmt').value='';[2500,6000,12000].forEach(t=>setTimeout(()=>{wzLoad();walRefresh();},t));}
  catch(err){e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';}finally{WZ.busy=false;el.disabled=false;wzView();}},
});
{const lock=LACT.wallock;LACT.wallock=function(){wzStop();return lock.apply(this,arguments);};}
Object.assign(LACT,{
 wlact(el){const m=WL.m.find(x=>x.id===el.dataset.id);if(m)wlSheet(m,el.dataset.v);},
 async wlgo(el){const m=WL.m.find(x=>x.id===el.dataset.id);const mode=el.dataset.v;const e=$('wlErr');e.innerHTML='';const P=RVC.package+'::lend::';const TA=[m.C,m.D];const pool=DEX.pools.find(x=>x.id===m.pool);const TP=[m.C,m.D,pool.typeA,pool.typeB];
  const tx=new Transaction();const v=$('wlA').value.trim();
  try{
   if(mode==='supply'){const a=stUnits(v,dDec(m.D));if(!a)throw new Error('Enter an amount.');const sh=tx.moveCall({target:P+'supply',typeArguments:TA,arguments:[tx.object(m.id),coinWithBalance({type:m.D,balance:a}),tx.object('0x6')]});tx.transferObjects([sh],WAL.addr);}
   else if(mode==='withdraw'){const pc=Math.min(100,Math.max(0,+v||0));const n=m.myShares*BigInt(Math.round(pc*100))/10000n;if(n<=0n)throw new Error('Enter a share above zero.');const c=tx.moveCall({target:P+'withdraw',typeArguments:TA,arguments:[tx.object(m.id),coinWithBalance({type:m.shareType,balance:n}),tx.object('0x6')]});tx.transferObjects([c],WAL.addr);}
   else if(mode==='borrow'){const col=$('wlC').value.trim();if(col&&+col>0){const ca=stUnits(col,dDec(m.C));if(!ca)throw new Error('Check the collateral amount.');tx.moveCall({target:P+'deposit_collateral',typeArguments:TA,arguments:[tx.object(m.id),coinWithBalance({type:m.C,balance:ca})]});}
    const a=stUnits(v,dDec(m.D));if(!a)throw new Error('Enter an amount to borrow.');tx.moveCall({target:P+'observe',typeArguments:TP,arguments:[tx.object(m.id),tx.object(m.pool),tx.object('0x6')]});const c=tx.moveCall({target:P+'borrow',typeArguments:TP,arguments:[tx.object(m.id),tx.object(m.pool),tx.pure.u64(a),tx.object('0x6')]});tx.transferObjects([c],WAL.addr);}
   else if(mode==='repay'){const a=stUnits(v,dDec(m.D));if(!a)throw new Error('Enter an amount.');if(+v>wlBal(m.D))throw new Error('You hold '+fmt(wlBal(m.D),4)+' '+dSym(m.D)+'.');const ch=tx.moveCall({target:P+'repay',typeArguments:TA,arguments:[tx.object(m.id),tx.pure.address(WAL.addr),coinWithBalance({type:m.D,balance:a}),tx.object('0x6')]});tx.transferObjects([ch],WAL.addr);}
   else if(mode==='uncol'){const a=stUnits(v,dDec(m.C));if(!a)throw new Error('Enter an amount.');const c=tx.moveCall({target:P+'withdraw_collateral',typeArguments:TP,arguments:[tx.object(m.id),tx.object(m.pool),tx.pure.u64(a),tx.object('0x6')]});tx.transferObjects([c],WAL.addr);}
   await rvSign(tx,'Done.');closeSheet();setTimeout(wvLendLoad,1800);}catch(err){e.innerHTML='<div class="errbox">'+esc(err.message)+'</div>';}},
});

/* ---------- Chain check ----------
   The wallet checks on this device that the newest checkpoint is final: validators holding more
   than two thirds of the voting power signed it. The validator set is trusted on the first check
   and every later change is followed through the last checkpoint of each epoch, which the
   outgoing validators sign and which names the next validators. The BLS work runs in
   chain-worker.js so the page stays responsive on phones. */
const WC={w:null,n:0,cb:{},busy:false,res:null,err:null,gap:null,at:0,diff:false};
function wcWorker(){if(!WC.w){WC.w=new Worker('chain-worker.js');WC.w.onmessage=e=>{const c=WC.cb[e.data.id];delete WC.cb[e.data.id];if(c)e.data.err?c[1](new Error(e.data.err)):c[0](e.data.r);};WC.w.onerror=e=>{Object.values(WC.cb).forEach(c=>c[1](new Error('The checker could not start on this device.')));WC.cb={};};}return WC.w;}
const wcVerify=job=>new Promise((ok,no)=>{const id=++WC.n;WC.cb[id]=[ok,no];wcWorker().postMessage({id,job});});
const wcHex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
async function wcCommittee(e){const m=(await LSv.getEpoch({epoch:BigInt(e),readMask:{paths:['committee']}})).response.epoch.committee.members;return m.map(x=>[wcHex(x.publicKey),String(x.weight)]);}
async function wcCp(seq){const r=(await LSv.getCheckpoint({checkpointId:seq==null?{oneofKind:undefined}:{oneofKind:'sequenceNumber',sequenceNumber:BigInt(seq)},readMask:{paths:['summary.bcs','signature']}})).response.checkpoint;if(!r||!r.summary||!r.summary.bcs||!r.signature)throw new Error('The node did not send the checkpoint signature.');return {summary:r.summary.bcs.value,signature:r.signature.signature,bitmap:r.signature.bitmap,epoch:String(r.signature.epoch)};}
const wcKey=c=>'rvChainTrust:'+c;
async function wcCheck(repin){if(WC.busy)return;WC.busy=true;WC.err=null;wcPaint();const t0=performance.now();
 try{const chain=(await LSv.getServiceInfo({})).response.chainId;let T=null;try{T=JSON.parse(lvStore.get(wcKey(chain)));}catch(e){}
  const cp=await wcCp();const E=+cp.epoch;
  if(!T||repin){T={epoch:E,committee:await wcCommittee(E),since:Date.now(),first:E,steps:0};lvStore.set(wcKey(chain),JSON.stringify(T));WC.gap=null;}
  if(T.epoch>E)throw new Error('This node is behind: its newest checkpoint is in epoch '+E+', and this device has already seen epoch '+T.epoch+'. Try again later or use another node.');
  while(T.epoch<E){let last,cpe;
   try{last=(await LSv.getEpoch({epoch:BigInt(T.epoch),readMask:{paths:['last_checkpoint']}})).response.epoch.lastCheckpoint;cpe=await wcCp(last);}
   catch(e){WC.gap={from:T.epoch,to:E};throw new Error('The node no longer keeps the history between epoch '+T.epoch+' and epoch '+E+', so this device cannot follow the validator changes since its last check.');}
   const r=await wcVerify({...cpe,committee:T.committee});if(!r.nextCommittee)throw new Error('The last checkpoint of epoch '+T.epoch+' does not name the next validators.');
   T={...T,epoch:T.epoch+1,committee:r.nextCommittee,steps:T.steps+1};lvStore.set(wcKey(chain),JSON.stringify(T));}
  const r=await wcVerify({...cp,committee:T.committee});
  // A node that reports a different validator set than the one the chain signed is not trusted for it.
  try{const n=await wcCommittee(E);WC.diff=JSON.stringify(n.map(x=>x.join()).sort())!==JSON.stringify(T.committee.map(x=>x.join()).sort());}catch(e){}
  WC.res={...r,trust:T,ms:performance.now()-t0};WC.at=Date.now();WC.gap=null;}
 catch(e){WC.err=e.message;WC.res=null;}
 WC.busy=false;wcPaint();}
function wcPage(){return `<div class="g c2 ais"><div class="card hud"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.shield}</span>Chain check</h2><span class="sub">Runs on this device</span></div><button class="btn sm" data-act="wccheck">Check again</button></div>
  <div id="wcS"></div><div class="kv" id="wcK"></div><div id="wcE"></div></div>
 <div class="card"><div class="ch"><h2>What this check proves</h2></div><div class="list">
  <div class="li"><span class="chk ok">✓</span><span>The newest checkpoint is final. Validators holding more than two thirds of the voting power signed it, and this device checked their signature itself.</span></div>
  <div class="li"><span class="chk ok">✓</span><span>Each change of validators since your first check was signed by the validators before it.</span></div>
  <div class="li"><span class="chk note">!</span><span>The first check trusts the validator set that the node reports. Compare the checkpoint number with Rivers Scan or a second node once to confirm it.</span></div>
  <div class="li"><span class="chk note">!</span><span>Balances and history on the other pages still come from the node. A dishonest node can hold back new data, but it cannot make a false checkpoint pass this check.</span></div></div>
  <p class="muted" style="font-size:.76rem;margin-top:10px">The check uses about 1 MB of data the first time and a few kilobytes after that. It needs no wallet and works on any phone with a modern browser.</p></div></div>`;}
function wcPaint(){const b=$('wcBadge');if(b){b.className='b dot '+(WC.res?'ok':WC.err?'warn':'');b.textContent=WC.res?'Chain verified on this device':WC.err?'Chain check needs attention':'Checking the chain…';}
 const s=$('wcS');if(!s)return;
 if(WC.busy&&!WC.res){s.innerHTML='<div class="big">Checking…</div><p class="fg2" style="font-size:.84rem">Fetching the newest checkpoint and the validators’ signatures.</p>';}
 else if(WC.res){const r=WC.res,pct=Number(BigInt(r.weight)*10000n/BigInt(r.total))/100,age=Date.now()-r.timestampMs;
  s.innerHTML='<div class="big" style="color:var(--ok);font-size:clamp(1.25rem,5vw,1.8rem)">✓ Checkpoint '+fmt(Number(r.seq),0)+' is final</div><p class="fg2" style="font-size:.84rem">Checked '+ago(WC.at)+'.'+(age>120000?' The newest checkpoint is '+ago(r.timestampMs).replace(' ago','')+' old, so the node may be behind.':'')+'</p>';
  const T=r.trust;$('wcK').innerHTML='<div><span>Signed by</span><span>'+r.signers+' of '+r.members+' validators, '+fmt(pct,2)+'% of the voting power</span></div><div><span>Needed</span><span>More than 66.67%</span></div><div><span>Epoch</span><span>'+fmt(Number(r.epoch),0)+'</span></div><div><span>Checkpoint time</span><span>'+new Date(r.timestampMs).toLocaleString()+'</span></div><div><span>Validator set</span><span>'+(T.steps?'Followed from epoch '+T.first+' through '+T.steps+' signed '+(T.steps===1?'change':'changes'):'Trusted at the first check, epoch '+T.first)+'</span></div><div><span>First check</span><span>'+new Date(T.since).toLocaleDateString()+'</span></div><div><span>Time on this device</span><span>'+fmt(r.ms/1000,2)+' s</span></div>';
  $('wcE').innerHTML=WC.diff?'<div class="errbox">The node reports a validator set that differs from the one the chain signed. This device keeps using the signed set. Consider another node.</div>':'';}
 else if(WC.err){s.innerHTML='<div class="big" style="color:var(--warn);font-size:clamp(1.25rem,5vw,1.8rem)">Not verified</div>';$('wcK').innerHTML='';$('wcE').innerHTML='<div class="errbox">'+esc(WC.err)+'</div>'+(WC.gap?'<p class="fg2" style="font-size:.84rem">You can start again from the validators the node reports now. Do this only if you trust this node, or compare the checkpoint number with a second source afterwards.</p><button class="btn sm" data-act="wcrepin">Start again from now</button>':'');}}
setInterval(()=>{if(typeof CUR!=='undefined'&&CUR.app==='wallet'&&(CUR.sub==='verify'||(CUR.sub==='portfolio'&&Date.now()-WC.at>300000))&&!document.hidden)wcCheck();else wcPaint();},30000);
Object.assign(LACT,{wccheck(){wcCheck();},wcrepin(){wcCheck(true);}});
