/* ===================== WALLET & DEFI ===================== */
const WS={from:'RVRB',to:'USDs',amt:25,stakeVal:null,stakeAmt:50,actFilter:'all',bridgeDir:'in',bridgeAmt:1000,lpAmt:10};
S.W.unbond=[];
function poolKey(a,b){if(POOLS[a+'/'+b])return [a+'/'+b,true];if(POOLS[b+'/'+a])return [b+'/'+a,false];return null;}
function routeOf(f,t){if(f===t)return [];if(poolKey(f,t))return [[f,t]];return [[f,'USDs'],['USDs',t]];}
function quote(f,t,amt,live){let a=amt;const route=routeOf(f,t);for(const [x,y] of route){const pk=poolKey(x,y);if(!pk)return 0;const p=live?POOLS[pk[0]]:{...POOLS[pk[0]]};a=live?swapPool(p,pk[1],a):(function(){const f2=a*(1-P.swapFee);return pk[1]?p.y*f2/(p.x+f2):p.x*f2/(p.y+f2);})();}return a;}
function hf(sup,bor){let c=0,d=0;for(const t in sup)c+=sup[t]*usdOf(t)*P.liqTh;for(const t in bor)d+=bor[t]*usdOf(t);return d>0?c/d:Infinity;}
function borrowLimit(){let c=0,d=0;for(const t in S.W.sup)c+=S.W.sup[t]*usdOf(t)*P.ltv;for(const t in S.W.bor)d+=S.W.bor[t]*usdOf(t);return Math.max(0,c-d);}
function rewardRate(v){const st=stakedTotal();return eraTotal(currentEra())/ERA_YEARS/st*(1-(v?v.comm:5)/100);}
function payFee(gas){const fee=gas*P.gasPrice/DROPS;if(M.sponsor)return {fee,sponsored:true};S.W.bal.RVRB-=fee;S.others+=fee;return {fee,sponsored:false};}
function paused(flag,what){return flag?'':'<div class="box" style="border-color:rgba(255,162,74,.45);color:var(--warn);font-size:.82rem;font-weight:700">'+what+' is paused by the network operators. Your funds are safe.</div>';}
function opts(sel,list){return list.map(t=>'<option'+(t===sel?' selected':'')+'>'+t+'</option>').join('');}
function TOKL(){return Object.keys(TOKENS);}

VIEWS.wallet={subs:[['portfolio','Home',IC.home],['swap','Swap',IC.swap],['stake','Stake',IC.stake],['lend','Lend',IC.lend],['pools','Pools',IC.droplet],['bridge','Bridge',IC.bridge],['activity','Activity',IC.list],['security','Security',IC.shield]],
build(sub){const W=S.W;
 if(sub==='portfolio')return `
  <div class="g c32 ais">
   <div class="acct"><div class="ch"><div class="who">${identicon(W.addr,46)}<div style="min-width:0"><div style="font-weight:800;font-size:1rem">${W.name}</div><div class="mono muted trunc" style="font-size:.74rem">${short(W.addr,10)}</div></div></div>
     <div class="btns"><button class="icobtn" data-act="copy" data-v="${W.addr}" aria-label="Copy address">${IC.copy}</button><span class="b ok dot">Passkey secured</span></div></div>
    <div><span class="cap">Total value</span><div class="big" id="wTot"></div><div class="fg2" style="font-size:.84rem;margin-top:4px" id="wChg"></div></div>
    <canvas class="ch" id="wChart"></canvas>
    <div class="qa"><button data-act="send">${IC.send}Send</button><button data-act="recv">${IC.recv}Receive</button><a href="#wallet-swap">${IC.swap}Swap</a><a href="#wallet-stake">${IC.stake}Stake</a><a href="#wallet-lend">${IC.lend}Lend</a><a href="#wallet-crosschain">${IC.bridge}Cross-chain</a></div></div>
   <div class="card"><div class="ch"><h2>Positions</h2><span class="sub">Earning across Rivers DeFi</span></div><div id="wPosRing" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"></div><div class="list" id="wPos"></div></div></div>
  <div class="g c21 ais"><div class="card"><div class="ch"><h2>Assets</h2><span class="sub">Prices from Rivers DEX pools</span></div><div id="wAssets"></div></div>
   <div class="card"><div class="ch"><h2>Recent activity</h2><a class="btn sm" href="#wallet-activity">View all</a></div><div class="list" id="wRecent"></div></div></div>
  <div class="g c2 ais"><div class="card"><div class="ch"><h2><span class="ico">${IC.grid}</span>Allocation</h2><span class="sub">By value</span></div><div class="donut" id="wAlloc"></div></div>
   <div class="card hud"><div class="ch"><h2><span class="ico">${IC.flame}</span>Projected staking rewards</h2><span class="sub">Next 12 months at today's rate</span></div><div id="wProj"></div><div class="kv" id="wProjK"></div></div></div>`;
 if(sub==='swap')return `
  <div class="g c21 ais"><div class="card hud" style="max-width:560px;width:100%;justify-self:center"><div class="ch"><h2>Swap</h2><div class="seg">${[.001,.005,.01].map(s=>'<button data-act="slip" data-v="'+s+'" class="'+(W.slippage===s?'on':'')+'">'+(s*100).toFixed(1)+'%</button>').join('')}</div></div>
   <div id="swPause"></div>
   <div class="amt"><div class="top"><span>You pay</span><span id="swBalF"></span></div><div class="mid"><input id="swAmt" inputmode="decimal" value="${WS.amt}" aria-label="Amount to pay"><select id="swF" aria-label="Token to pay">${opts(WS.from,TOKL())}</select></div><div class="bot"><span id="swUsdF"></span><button class="maxb" data-act="swmax">MAX</button></div></div>
   <button class="flip" data-act="swflip" aria-label="Swap direction">${IC.flip}</button>
   <div class="amt"><div class="top"><span>You receive</span><span id="swBalT"></span></div><div class="mid"><input id="swOut" readonly aria-label="Amount received"><select id="swT" aria-label="Token to receive">${opts(WS.to,TOKL())}</select></div><div class="bot"><span id="swUsdT"></span><span></span></div></div>
   <div class="kv" id="swKv"></div><button class="btn pri wide" data-act="swgo" id="swGo">Review swap</button></div>
   <div class="g"><div class="card"><div class="ch"><h2>Markets</h2><span class="sub">Rivers DEX</span></div><div class="list" id="swMk"></div></div></div></div>`;
 if(sub==='stake')return `
  <div class="g c4" id="stK"></div>
  <div class="g c2 ais"><div class="card hud"><div class="ch"><h2>Stake RVRB</h2><span class="b gold">Proof of Confluence</span></div><div id="stPause"></div>
    <div class="fld"><label for="stV">Validator</label><select class="in" id="stV"></select></div>
    <div class="amt"><div class="top"><span>Amount</span><span id="stBal"></span></div><div class="mid"><input id="stA" inputmode="decimal" value="${WS.stakeAmt}" aria-label="Amount to stake"><span class="b gold">RVRB</span></div><div class="bot"><span id="stUsd"></span><button class="maxb" data-act="stmax">MAX</button></div></div>
    <div class="kv" id="stKv"></div><button class="btn gold wide" data-act="stgo">Stake</button>
    <p class="muted" style="font-size:.76rem">Rewards are paid at the end of each epoch. Unstaked RVRB becomes available when the current epoch ends.</p></div>
   <div class="card"><div class="ch"><h2>Your stakes</h2></div><div class="list" id="stMine"></div><div id="stUnb"></div></div></div>`;
 if(sub==='lend')return `
  <div class="g c4" id="ldK"></div>
  <div class="card"><div class="ch"><div class="ttl"><h2>Markets</h2><span class="sub">Rates move with how much of each market is borrowed</span></div><span id="ldOr"></span></div>
   <div class="tw"><table><thead><tr><th>Asset</th><th class="n">Supplied</th><th class="n">Borrowed</th><th>Utilization</th><th class="n">Supply APY</th><th class="n">Borrow APY</th><th class="n">You supply</th><th class="n">You borrow</th><th></th></tr></thead><tbody id="ldT"></tbody></table></div></div>`;
 if(sub==='pools')return `
  <div class="g c4" id="plK"></div>
  <div class="card"><div class="ch"><h2>Liquidity pools</h2><span class="sub">Constant-product pools · fee ${pct(P.swapFee,2)}</span></div>
   <div class="tw"><table><thead><tr><th>Pool</th><th class="n">Reserves</th><th class="n">TVL</th><th class="n">Volume 24h</th><th class="n">Fees earned</th><th class="n">Price</th><th class="n">Your share</th><th></th></tr></thead><tbody id="plT"></tbody></table></div></div>`;
 if(sub==='bridge')return `
  <div class="g c21 ais"><div class="card hud" style="max-width:560px;width:100%;justify-self:center"><div class="ch"><h2>Bridge</h2><div class="seg"><button data-act="bdir" data-v="in" class="${WS.bridgeDir==='in'?'on':''}">Ethereum → Rivers</button><button data-act="bdir" data-v="out" class="${WS.bridgeDir==='out'?'on':''}">Rivers → Ethereum</button></div></div>
   <div id="brPause"></div>
   <div class="amt"><div class="top"><span id="brFromL"></span><span id="brBal"></span></div><div class="mid"><input id="brA" inputmode="decimal" value="${WS.bridgeAmt}" aria-label="Amount to bridge"><span class="b info" id="brTok"></span></div><div class="bot"><span>1 USDT = 1 USDs, backed one to one</span><span></span></div></div>
   <div class="kv" id="brKv"></div><button class="btn pri wide" data-act="brgo">Bridge</button></div>
   <div class="card"><div class="ch"><h2>Bridge reserves</h2><span class="b ok dot">Fully backed</span></div><div class="kv" id="brRes"></div><div class="cap">Your transfers</div><div class="list" id="brList"></div></div></div>`;
 if(sub==='activity')return `
  <div class="card"><div class="ch"><h2>Activity</h2><div class="seg">${[['all','All'],['transfer','Transfers'],['defi','DeFi'],['bank','Bank']].map(f=>'<button data-act="actf" data-v="'+f[0]+'" class="'+(WS.actFilter===f[0]?'on':'')+'">'+f[1]+'</button>').join('')}</div></div><div class="list" id="acL"></div></div>`;
 if(sub==='security')return `
  <div class="g c2 ais">
   <div class="card"><div class="ch"><h2>Sign-in and approvals</h2></div>
    <div class="ctl"><span class="n">Passkey sign-in</span><label class="sw"><input type="checkbox" data-wtog="twofa" ${W.twofa?'checked':''} aria-label="Passkey sign-in"><i></i></label><span class="d">Face ID, fingerprint or device PIN instead of a seed phrase</span></div>
    <div class="ctl"><span class="n">Transaction alerts</span><label class="sw"><input type="checkbox" data-wtog="alerts" ${W.alerts?'checked':''} aria-label="Transaction alerts"><i></i></label><span class="d">Notify on every incoming and outgoing transfer</span></div>
    <div class="ctl"><span class="n">Daily spending limit</span><span class="val" id="limV">${usd(W.limit)}</span><span class="d">Transfers above this need a second approval from a guardian</span><input type="range" min="500" max="50000" step="500" value="${W.limit}" id="limR" aria-label="Daily spending limit"></div></div>
   <div class="card"><div class="ch"><h2>Recovery guardians</h2><span class="b ok dot">2 of 2 set</span></div><p class="fg2" style="font-size:.84rem">If you lose your device, guardians approve moving your account to a new passkey. They can never spend your funds.</p><div class="list" id="gL"></div>
    <div class="btns"><input class="in" id="gIn" placeholder="name.rivers" style="flex:1;min-width:160px"><button class="btn" data-act="gadd">Add guardian</button></div></div></div>
  <div class="g c2 ais"><div class="card"><div class="ch"><h2>Active sessions</h2></div><div class="list" id="seL"></div></div>
   <div class="card"><div class="ch"><h2>Connected apps</h2></div><div class="list" id="apL"></div></div></div>`;
 return '';},
after(sub){
 if(sub==='portfolio')fitCanvas($('wChart'),150);
 if(sub==='swap'){['swAmt','swF','swT'].forEach(id=>$(id).addEventListener('input',()=>{WS.amt=+$('swAmt').value||0;WS.from=$('swF').value;WS.to=$('swT').value;VIEWS.wallet.update('swap');}));}
 if(sub==='stake'){const sel=$('stV');const top=[...V].filter(v=>!v.jailed).sort((a,b)=>b.power-a.power).slice(0,60);if(WS.stakeVal==null)WS.stakeVal=top[4].id;if(!top.find(v=>v.id===WS.stakeVal))top.unshift(V[WS.stakeVal]);
   sel.innerHTML=top.map(v=>'<option value="'+v.id+'"'+(v.id===WS.stakeVal?' selected':'')+'>'+v.name+' · '+v.city.n+' · '+v.comm+'% fee · '+v.up.toFixed(2)+'%</option>').join('');
   sel.addEventListener('input',()=>{WS.stakeVal=+sel.value;VIEWS.wallet.update('stake');});$('stA').addEventListener('input',()=>{WS.stakeAmt=+$('stA').value||0;VIEWS.wallet.update('stake');});}
 if(sub==='bridge')$('brA').addEventListener('input',()=>{WS.bridgeAmt=+$('brA').value||0;VIEWS.wallet.update('bridge');});
 if(sub==='security')$('limR').addEventListener('input',e=>{S.W.limit=+e.target.value;$('limV').textContent=usd(S.W.limit);});},
update(sub){const W=S.W;
 if(sub==='portfolio'){const v=walletValue();$('wTot').textContent=usd(v);const h0=W.hist[0]||v;const d=v-h0;$('wChg').innerHTML='<span class="'+(d>=0?'up':'down')+'">'+(d>=0?'+':'−')+usd(Math.abs(d))+' ('+(d>=0?'+':'−')+Math.abs(d/h0*100).toFixed(2)+'%)</span> <span class="muted">24h</span>';
  const hv=W.hist.length>1?W.hist:[v,v];const mn=Math.min(...hv),mx2=Math.max(...hv),pad=(mx2-mn)*.25||mx2*.01;areaChart($('wChart'),[{v:hv,color:'#5CFFB0',fill:'rgba(92,255,176,.3)'}],{n:Math.max(2,hv.length),lo:mn-pad,hi:mx2+pad,xl:[],fmt:x=>'$'+compact(x)});
  $('wAssets').innerHTML=TOKL().filter(t=>W.bal[t]>0).map(t=>{const px=PXH[t]||[];const ch=px.length>1?(px[px.length-1]/px[0]-1):0;return '<div class="asset">'+tokIcon(t)+'<div style="min-width:0"><div style="font-weight:800">'+TOKENS[t].name+'</div><div class="muted mono" style="font-size:.74rem">'+fmt(usdOf(t),t==='NGNs'||t==='KESs'?6:4)+' USDs · <span class="'+(ch>=0?'up':'down')+'">'+(ch>=0?'+':'')+(ch*100).toFixed(2)+'%</span></div></div>'+spark(px.slice(-40),t==='RVRB'?C.tok:C.acc)+'<div style="text-align:right"><div class="mono">'+fmt(W.bal[t],TOKENS[t].dec)+' '+t+'</div><div class="muted mono" style="font-size:.74rem">'+usd(W.bal[t]*usdOf(t))+'</div></div></div>';}).join('');
  const stk=W.stakes.reduce((a,s)=>a+s.amt,0),rew=W.stakes.reduce((a,s)=>a+s.rew,0);const h=hf(W.sup,W.bor);
  $('wPosRing').innerHTML='<div class="hf">'+ring(h===Infinity?1:clamp((h-1)/2,0,1),h<1.25?C.bad:h<1.6?C.warn:C.ok,104,h===Infinity?'∞':h.toFixed(2),'HEALTH')+'</div><div class="kv" style="flex:1;min-width:160px"><div><span>Borrow limit left</span><span>'+usd(borrowLimit())+'</span></div><div><span>Liquidation at</span><span>health 1.00</span></div><div><span>Staking rewards</span><span>'+fmt(rew,4)+' RVRB</span></div></div>';
  const lp=W.lp['RVRB/USDs']||0;$('wPos').innerHTML=
   '<div class="li"><span class="ty defi">Staked</span><span class="trunc">'+W.stakes.length+' validators</span><span class="r">'+fmt(stk,4)+' RVRB</span></div>'+
   Object.keys(W.sup).filter(t=>W.sup[t]>0).map(t=>'<div class="li"><span class="ty transfer">Supplied</span><span class="trunc">'+t+' market · '+pct(mRates(t).s,2)+' APY</span><span class="r">'+fmt(W.sup[t],2)+' '+t+'</span></div>').join('')+
   Object.keys(W.bor).filter(t=>W.bor[t]>0).map(t=>'<div class="li"><span class="ty bank">Borrowed</span><span class="trunc">'+t+' market · '+pct(mRates(t).b,2)+' APR</span><span class="r">'+fmt(W.bor[t],2)+' '+t+'</span></div>').join('')+
   (lp>0?'<div class="li"><span class="ty defi">Pool</span><span class="trunc">RVRB/USDs liquidity</span><span class="r">'+pct(lp/POOLS['RVRB/USDs'].lp,3)+'</span></div>':'');
  $('wRecent').innerHTML=W.mine.slice(0,6).map(txRow).join('')||'<div class="empty">Your transactions will appear here.</div>';
  const al=TOKL().map((t,i)=>[t,W.bal[t]*usdOf(t),['var(--gold)','var(--river)','#00A862','var(--violet)','var(--mint)','#9FE8C8'][i]||['#7FD8B0','#3FA77A','#BFEFD6','#5E8C76'][i%4]]).concat([['Staked RVRB',stk*usdOf('RVRB'),'var(--deep)'],['Supplied',Object.keys(W.sup).reduce((a,t)=>a+W.sup[t]*usdOf(t),0),'var(--pearl)']]).filter(a=>a[1]>0.5);
  $('wAlloc').innerHTML=donut(al,'$'+compact(v),'NET WORTH')+legend(al,x=>'$'+compact(x));
  const rr=rewardRate(V[(W.stakes[0]||{vid:0}).vid]);const months=Array.from({length:12},(_,i)=>stk*rr/12*(i+1));$('wProj').innerHTML=bars(months,months.map((_,i)=>i%3===0?'M'+(i+1):''),C.acc,120);
  $('wProjK').innerHTML='<div><span>Reward rate now</span><span class="up">'+pct(rr,2)+' a year</span></div><div><span>In 12 months</span><span>+'+fmt(stk*rr,4)+' RVRB</span></div><div><span>Next halving</span><span>in '+fmt(nextHalving().days)+' days</span></div>';}
 if(sub==='swap'){const f=WS.from,t=WS.to,a=WS.amt;const out=f===t?0:quote(f,t,a,false);const spot=f===t?0:a*usdOf(f)/usdOf(t);const imp=spot?Math.max(0,1-out/spot-P.swapFee*routeOf(f,t).length):0;
  $('swPause').innerHTML=paused(M.dex,'Trading');$('swOut').value=out?fmt(out,TOKENS[t].dec):'';$('swBalF').textContent='Balance '+fmt(W.bal[f],TOKENS[f].dec);$('swBalT').textContent='Balance '+fmt(W.bal[t],TOKENS[t].dec);
  $('swUsdF').textContent='≈ '+usd(a*usdOf(f));$('swUsdT').textContent='≈ '+usd(out*usdOf(t));
  $('swKv').innerHTML=f===t?'<div><span>Choose two different tokens</span><span></span></div>':'<div><span>Rate</span><span>1 '+f+' = '+fmt(usdOf(f)/usdOf(t),6)+' '+t+'</span></div><div><span>Route</span><span>'+routeOf(f,t).map(r=>r[0]).concat(t).join(' → ')+'</span></div><div><span>Price impact</span><span class="'+(imp>.02?'down':'')+'">'+pct(imp,2)+'</span></div><div><span>Minimum received</span><span>'+fmt(out*(1-W.slippage),TOKENS[t].dec)+' '+t+'</span></div><div><span>Pool fee</span><span>'+pct(P.swapFee*routeOf(f,t).length,2)+'</span></div><div><span>Network fee</span><span>'+(M.sponsor?'Sponsored':fmtA(9800*P.gasPrice/DROPS)+' RVRB')+'</span></div>';
  $('swGo').disabled=!M.dex||f===t||a<=0||a>W.bal[f];$('swGo').textContent=a>W.bal[f]?'Not enough '+f:'Review swap';
  $('swMk').innerHTML=TOKL().filter(x=>x!=='USDs').map(x=>{const px=PXH[x]||[];const ch=px.length>1?(px[px.length-1]/px[0]-1):0;return '<div class="li">'+tokIcon(x,30)+'<span><b>'+x+'</b><span class="muted"> / USDs</span></span><span class="r">'+fmt(1/usdOf(x)>=10?1/usdOf(x):usdOf(x),4)+'<br><span class="'+(ch>=0?'up':'down')+'" style="font-size:.7rem">'+(ch>=0?'+':'')+(ch*100).toFixed(2)+'%</span></span></div>';}).join('');}
 if(sub==='stake'){const v=V[WS.stakeVal]||V[0];const rr=rewardRate(v);const stk=W.stakes.reduce((a,s)=>a+s.amt,0);
  $('stK').innerHTML=stat('Your stake',fmt(stk,4)+' RVRB',usd(stk*usdOf('RVRB')))+stat('Pending rewards',fmt(W.stakes.reduce((a,s)=>a+s.rew,0),4),'paid each epoch')+stat('Network reward rate',pct(rewardRate(null)/(1-.05),2),'before validator fee')+stat('Epoch '+S.epoch,hm(epochLeft().left),'until rewards are paid');
  $('stPause').innerHTML=paused(M.stakeNew,'New staking');$('stBal').textContent='Available '+fmt(W.bal.RVRB,4);$('stUsd').textContent='≈ '+usd(WS.stakeAmt*usdOf('RVRB'));
  $('stKv').innerHTML='<div><span>Validator power</span><span>'+(v.power*100).toFixed(3)+'%</span></div><div><span>Uptime</span><span>'+v.up.toFixed(2)+'%</span></div><div><span>Validator fee</span><span>'+v.comm+'%</span></div><div><span>Your reward rate</span><span class="up">'+pct(rr,2)+' a year</span></div><div><span>Expected per epoch</span><span>'+fmt(WS.stakeAmt*rr/365*(P.epochHours/24),5)+' RVRB</span></div>';
  $('stMine').innerHTML=W.stakes.map((s,i)=>{const x=V[s.vid];return '<div class="li">'+identicon(x.addr,30)+'<span class="trunc"><span class="mono">'+x.name+'</span><br><span class="muted" style="font-size:.74rem">'+x.city.n+' · rewards '+fmt(s.rew,4)+' RVRB</span></span><span class="r">'+fmt(s.amt,4)+' RVRB<br><span class="btns" style="justify-content:flex-end;margin-top:4px"><button class="btn xs" data-act="claim" data-i="'+i+'"'+(s.rew<=0?' disabled':'')+'>Claim</button><button class="btn xs" data-act="unstake" data-i="'+i+'">Unstake</button></span></span></div>';}).join('')||'<div class="empty">You are not staking yet.</div>';
  $('stUnb').innerHTML=W.unbond.length?'<div class="cap" style="margin-top:10px">Unstaking</div>'+W.unbond.map(u=>'<div class="li"><span class="ty system">Unbonding</span><span>'+V[u.vid].name+'</span><span class="r">'+fmt(u.amt,4)+' RVRB<br><span class="muted" style="font-size:.72rem">after epoch '+u.ep+'</span></span></div>').join(''):'';}
 if(sub==='lend'){const h=hf(W.sup,W.bor);let ts=0,tb=0;for(const t in MARKETS){ts+=MARKETS[t].sup*usdOf(t);tb+=MARKETS[t].bor*usdOf(t);}
  $('ldK').innerHTML=stat('Total supplied',usd(ts).replace(/\.\d+$/,''),'across '+Object.keys(MARKETS).length+' markets')+stat('Total borrowed',usd(tb).replace(/\.\d+$/,''),pct(tb/ts)+' utilization')+stat('Your health factor',h===Infinity?'No debt':h.toFixed(2),'liquidation below 1.00')+stat('Borrow limit left',usd(borrowLimit()),'at '+pct(P.ltv,0)+' loan-to-value');
  $('ldOr').innerHTML=S.oracleStale&&S.oracleAge>P.oracleMaxAge?'<span class="b bad dot">Price feed delayed · borrowing blocked</span>':'<span class="b ok dot">Price feed '+S.oracleAge.toFixed(1)+' s old</span>';
  $('ldT').innerHTML=Object.keys(MARKETS).map(t=>{const m=MARKETS[t],r=mRates(t);return '<tr><td><div style="display:flex;gap:9px;align-items:center">'+tokIcon(t,28)+'<b>'+t+'</b></div></td><td class="n">'+compact(m.sup)+'</td><td class="n">'+compact(m.bor)+'</td><td style="min-width:120px"><div class="bar"><i style="width:'+(r.u*100)+'%"></i></div><span class="mono muted" style="font-size:.7rem">'+pct(r.u)+'</span></td><td class="n up">'+pct(r.s,2)+'</td><td class="n">'+pct(r.b,2)+'</td><td class="n">'+fmt(W.sup[t]||0,2)+'</td><td class="n">'+fmt(W.bor[t]||0,2)+'</td><td><div class="btns"><button class="btn xs" data-act="lend" data-t="'+t+'" data-m="supply">Supply</button><button class="btn xs" data-act="lend" data-t="'+t+'" data-m="borrow">Borrow</button><button class="btn xs" data-act="lend" data-t="'+t+'" data-m="withdraw">Withdraw</button><button class="btn xs" data-act="lend" data-t="'+t+'" data-m="repay">Repay</button></div></td></tr>';}).join('');}
 if(sub==='pools'){let tvl=0,vol=0,fees=0;const rows=Object.keys(POOLS).map(k=>{const p=POOLS[k];const t=p.x*usdOf(p.a)+p.y*usdOf(p.b);tvl+=t;vol+=p.vol;fees+=p.fees;const sh=(W.lp[k]||0)/p.lp;
   return '<tr><td><div style="display:flex;gap:6px;align-items:center">'+tokIcon(p.a,26)+tokIcon(p.b,26)+'<b style="margin-left:4px">'+k+'</b></div></td><td class="n">'+compact(p.x)+' / '+compact(p.y)+'</td><td class="n">'+usd(t).replace(/\.\d+$/,'')+'</td><td class="n">'+usd(p.vol)+'</td><td class="n">'+usd(p.fees)+'</td><td class="n">'+fmt(p.y/p.x,4)+'</td><td class="n">'+(sh?pct(sh,3):'—')+'</td><td>'+(k==='RVRB/USDs'?'<div class="btns"><button class="btn xs" data-act="lpadd">Add</button><button class="btn xs" data-act="lprem"'+(sh?'':' disabled')+'>Remove</button></div>':'')+'</td></tr>';}).join('');
  $('plK').innerHTML=stat('Total value locked',usd(tvl).replace(/\.\d+$/,''),Object.keys(POOLS).length+' pools')+stat('Volume 24h',usd(vol),'all pools')+stat('Fees to providers',usd(fees),'pool fee '+pct(P.swapFee,2))+stat('Trading',M.dex?'Open':'Paused',M.dex?'circuit breaker armed at '+P.breakerPct+'%':'by network operators');$('plT').innerHTML=rows;}
 if(sub==='bridge'){const inn=WS.bridgeDir==='in';$('brPause').innerHTML=paused(inn?M.bridgeIn:M.bridgeOut,inn?'Bridge deposits':'Bridge withdrawals');
  $('brFromL').textContent=inn?'From Ethereum (USDT)':'From Rivers (USDs)';$('brBal').textContent=inn?'Ethereum wallet connected':'Balance '+fmt(W.bal.USDs,2);$('brTok').textContent=inn?'USDT':'USDs';
  $('brKv').innerHTML='<div><span>You receive</span><span>'+fmt(WS.bridgeAmt,2)+' '+(inn?'USDs on Rivers':'USDT on Ethereum')+'</span></div><div><span>Arrives in</span><span>'+(inn?'about 3 minutes (Ethereum confirmations)':'about 1 minute')+'</span></div><div><span>Bridge fee</span><span>0.00 · launch period</span></div>';
  $('brRes').innerHTML='<div><span>USDT locked on Ethereum</span><span>'+fmt(S.bridge.locked,2)+'</span></div><div><span>USDs minted on Rivers</span><span>'+fmt(S.bridge.minted,2)+'</span></div><div><span>Backing</span><span class="up">'+pct(S.bridge.locked/S.bridge.minted,2)+'</span></div>';
  $('brList').innerHTML=S.bridge.deps.slice(0,6).map(d=>'<div class="li"><span class="ty '+(d.dir==='in'?'transfer':'bank')+'">'+(d.dir==='in'?'Deposit':'Withdraw')+'</span><span>'+fmt(d.amt,2)+' '+(d.dir==='in'?'USDT → USDs':'USDs → USDT')+'</span><span class="r">'+(Date.now()-d.t>d.wait?'<span class="b ok">Complete</span>':'<span class="b info">'+Math.ceil((d.wait-(Date.now()-d.t))/1000)+' s</span>')+'</span></div>').join('')||'<div class="empty">No bridge transfers yet.</div>';}
 if(sub==='activity'){const l=WS.actFilter==='all'?W.mine:W.mine.filter(t=>t.c===WS.actFilter);$('acL').innerHTML=l.map(txRow).join('')||'<div class="empty">Nothing here yet. Swaps, stakes, loans and transfers you make will show here.</div>';}
 if(sub==='security'){$('gL').innerHTML=W.guardians.map((g,i)=>'<div class="li">'+identicon(g,28)+'<span class="mono">'+esc(g)+'</span><span class="r"><button class="btn xs danger" data-act="grem" data-i="'+i+'">Remove</button></span></div>').join('')||'<div class="empty">Add at least two guardians.</div>';
  $('seL').innerHTML=W.sessions.map((s,i)=>'<div class="li"><span class="ty '+(s.cur?'system':'transfer')+'">'+(s.cur?'This device':'Session')+'</span><span>'+s.d+'<br><span class="muted" style="font-size:.74rem">'+s.t+'</span></span><span class="r">'+(s.cur?'':'<button class="btn xs danger" data-act="sesx" data-i="'+i+'">Sign out</button>')+'</span></div>').join('');
  $('apL').innerHTML=W.apps.map((a,i)=>'<div class="li"><span class="ty defi">App</span><span>'+a.n+'<br><span class="muted" style="font-size:.74rem">'+a.p+'</span></span><span class="r"><button class="btn xs danger" data-act="apx" data-i="'+i+'">Revoke</button></span></div>').join('')||'<div class="empty">No apps connected.</div>';}
}};

/* ===== wallet actions ===== */
const WACT={
 send(){openSheet('Send',`<div class="fld"><label for="sdTo">To</label><input class="in mono" id="sdTo" placeholder="0x… or name.rivers" value="ada.rivers"></div>
  <div class="amt"><div class="top"><span>Amount</span><span id="sdBal"></span></div><div class="mid"><input id="sdA" inputmode="decimal" value="25" aria-label="Amount"><select id="sdT" aria-label="Token">${opts('USDs',TOKL())}</select></div><div class="bot"><span id="sdUsd"></span><span></span></div></div>
  <div class="fld"><label for="sdMemo">Note (optional)</label><input class="in" id="sdMemo" placeholder="What is it for?"></div>
  <div class="kv"><div><span>Network fee</span><span>${M.sponsor?'Sponsored by Rivers':fmtA(2100*P.gasPrice/DROPS)+' RVRB'}</span></div><div><span>Final in</span><span>about ${fmt(S.fin||S.base)} ms</span></div></div>
  <button class="btn pri wide" data-act="sdgo">Send</button>`,'From '+S.W.name);
  const upd=()=>{const t=$('sdT').value,a=+$('sdA').value||0;$('sdBal').textContent='Balance '+fmt(S.W.bal[t],TOKENS[t].dec);$('sdUsd').textContent='≈ '+usd(a*usdOf(t));};['sdT','sdA'].forEach(id=>$(id).addEventListener('input',upd));upd();},
 sdgo(){const to=$('sdTo').value.trim(),t=$('sdT').value,a=+$('sdA').value;if(!to)return toast('Enter an address or .rivers name.',false);if(!(a>0))return toast('Enter an amount above zero.',false);if(a>S.W.bal[t])return toast('Not enough '+t+'.',false);
  if(a*usdOf(t)>S.W.limit)return toast('Above your daily limit of '+usd(S.W.limit)+'. A guardian must approve it.',false);
  S.W.bal[t]-=a;if(t==='RVRB')S.others+=a;const f=payFee(2100);newTx(TT[0],{amt:a,tok:t,mine:true,from:S.W.addr,to:to.startsWith('0x')?to:'0x'+hex(40),label:'to '+to,sponsored:f.sponsored});closeSheet();toast('Sent '+fmtTok(a,t)+' to '+to+'.');updateView();},
 recv(){openSheet('Receive',`<div style="display:grid;justify-items:center;gap:14px;text-align:center">${identicon(S.W.addr,132)}<div style="font-weight:800;font-size:1.1rem">${S.W.name}</div>
  <div class="box mono" style="font-size:.78rem;word-break:break-all;width:100%">${S.W.addr}</div><div class="btns"><button class="btn pri" data-act="copy" data-v="${S.W.addr}">Copy address</button><button class="btn" data-act="copy" data-v="${S.W.name}">Copy name</button></div>
  <p class="muted" style="font-size:.8rem;max-width:36ch">Only send assets on the Rivers network to this address. For USDT on Ethereum, use the bridge.</p></div>`,'Your Rivers address');},
 swmax(){$('swAmt').value=S.W.bal[WS.from];WS.amt=S.W.bal[WS.from];VIEWS.wallet.update('swap');},
 swflip(){const f=WS.from;WS.from=WS.to;WS.to=f;$('swF').value=WS.from;$('swT').value=WS.to;VIEWS.wallet.update('swap');},
 slip(el){S.W.slippage=+el.dataset.v;$$('[data-act=slip]').forEach(b=>b.classList.toggle('on',b===el));VIEWS.wallet.update('swap');},
 swgo(){const f=WS.from,t=WS.to,a=WS.amt;const out=quote(f,t,a,false);
  confirmBox('Confirm swap','<div class="kv"><div><span>You pay</span><span>'+fmtTok(a,f)+'</span></div><div><span>You receive</span><span>'+fmtTok(out,t)+'</span></div><div><span>Minimum</span><span>'+fmtTok(out*(1-S.W.slippage),t)+'</span></div><div><span>Route</span><span>'+routeOf(f,t).map(r=>r[0]).concat(t).join(' → ')+'</span></div></div>','Swap',false,()=>{
   if(!M.dex)return toast('Trading is paused.',false);const got=quote(f,t,a,true);S.W.bal[f]-=a;S.W.bal[t]+=got;
   if(f==='RVRB'||t==='RVRB'){/* RVRB moved between wallet and pool */}
   payFee(9800);newTx(TT[1],{amt:a,tok:f,mine:true,from:S.W.addr,label:'→ '+fmtTok(got,t)});toast('Swapped '+fmtTok(a,f)+' for '+fmtTok(got,t)+'.');updateView();});},
 stmax(){$('stA').value=Math.floor(S.W.bal.RVRB*1e4)/1e4;WS.stakeAmt=+$('stA').value;VIEWS.wallet.update('stake');},
 stgo(){const a=WS.stakeAmt,v=V[WS.stakeVal];if(!M.stakeNew)return toast('New staking is paused.',false);if(!(a>0)||a>S.W.bal.RVRB)return toast('Not enough RVRB for that amount.',false);if(v.jailed)return toast('That validator is jailed. Choose another.',false);
  confirmBox('Confirm stake','<div class="kv"><div><span>Amount</span><span>'+fmtTok(a,'RVRB')+'</span></div><div><span>Validator</span><span>'+v.name+'</span></div><div><span>Reward rate</span><span>'+pct(rewardRate(v),2)+' a year</span></div></div>','Stake',false,()=>{
   S.W.bal.RVRB-=a;v.stake+=a;const ex=S.W.stakes.find(s=>s.vid===v.id);if(ex)ex.amt+=a;else S.W.stakes.push({vid:v.id,amt:a,rew:0});computePower();payFee(7400);
   newTx(TT[3],{amt:a,tok:'RVRB',mine:true,from:S.W.addr,label:'with '+v.name});toast('Staked '+fmtTok(a,'RVRB')+' with '+v.name+'.');updateView();});},
 claim(el){const s=S.W.stakes[+el.dataset.i];if(!s||s.rew<=0)return;const r=s.rew;s.rew=0;V[s.vid].stake-=r;S.W.bal.RVRB+=r;computePower();newTx(TT[3],{amt:r,tok:'RVRB',mine:true,label:'rewards claimed'});toast('Claimed '+fmtTok(r,'RVRB')+'.');updateView();},
 unstake(el){const i=+el.dataset.i,s=S.W.stakes[i];confirmBox('Unstake '+fmtTok(s.amt,'RVRB')+'?','<p class="fg2">It stops earning now and becomes available when epoch '+S.epoch+' ends, in '+hm(epochLeft().left)+'.</p>','Unstake',true,()=>{
   S.W.unbond.push({vid:s.vid,amt:s.amt+s.rew,ep:S.epoch});S.W.stakes.splice(i,1);computePower();newTx(TT[3],{amt:s.amt,tok:'RVRB',mine:true,label:'unstake requested'});toast('Unstaking started.');updateView();});},
 lend(el){const t=el.dataset.t,m=el.dataset.m;const lbl={supply:'Supply',borrow:'Borrow',withdraw:'Withdraw',repay:'Repay'}[m];
  openSheet(lbl+' '+t,`<div class="amt"><div class="top"><span>Amount</span><span id="lnBal"></span></div><div class="mid"><input id="lnA" inputmode="decimal" value="${t==='NGNs'?100000:t==='RVRB'?5:100}" aria-label="Amount"><span class="b info">${t}</span></div><div class="bot"><span id="lnUsd"></span><span></span></div></div>
   <div class="kv" id="lnKv"></div><button class="btn pri wide" id="lnGo" data-act="lngo" data-t="${t}" data-m="${m}">${lbl}</button>`,t+' market');
  const upd=()=>{const a=+$('lnA').value||0;const sup={...S.W.sup},bor={...S.W.bor};if(m==='supply')sup[t]+=a;if(m==='withdraw')sup[t]-=a;if(m==='borrow')bor[t]+=a;if(m==='repay')bor[t]-=a;const h=hf(sup,bor);const r=mRates(t);
   $('lnBal').textContent=m==='supply'||m==='repay'?'Wallet '+fmt(S.W.bal[t],2):m==='withdraw'?'Supplied '+fmt(S.W.sup[t],2):'Limit '+usd(borrowLimit());$('lnUsd').textContent='≈ '+usd(a*usdOf(t));
   $('lnKv').innerHTML='<div><span>'+(m==='borrow'||m==='repay'?'Borrow APR':'Supply APY')+'</span><span>'+pct(m==='borrow'||m==='repay'?r.b:r.s,2)+'</span></div><div><span>Health factor after</span><span class="'+(h<1.25?'down':'up')+'">'+(h===Infinity?'No debt':h.toFixed(2))+'</span></div><div><span>Price feed</span><span>'+(S.oracleStale&&S.oracleAge>P.oracleMaxAge?'Delayed':'Fresh')+'</span></div>';
   let ok=a>0;if(m==='supply')ok=ok&&a<=S.W.bal[t]&&M.lendSupply;if(m==='withdraw')ok=ok&&a<=S.W.sup[t]&&h>=1.25;if(m==='repay')ok=ok&&a<=S.W.bal[t]&&a<=S.W.bor[t];if(m==='borrow')ok=ok&&M.lendBorrow&&h>=1.25&&!(S.oracleStale&&S.oracleAge>P.oracleMaxAge)&&MARKETS[t].bor+a<=MARKETS[t].sup*.95;$('lnGo').disabled=!ok;};
  $('lnA').addEventListener('input',upd);upd();},
 lngo(el){const t=el.dataset.t,m=el.dataset.m,a=+$('lnA').value;const W=S.W,mk=MARKETS[t];
  if(m==='supply'){W.bal[t]-=a;W.sup[t]+=a;mk.sup+=a;}if(m==='withdraw'){W.bal[t]+=a;W.sup[t]-=a;mk.sup-=a;}if(m==='borrow'){W.bal[t]+=a;W.bor[t]+=a;mk.bor+=a;}if(m==='repay'){W.bal[t]-=a;W.bor[t]-=a;mk.bor-=a;}
  payFee(11900);newTx(TT[4],{amt:a,tok:t,mine:true,label:m});closeSheet();toast({supply:'Supplied',withdraw:'Withdrew',borrow:'Borrowed',repay:'Repaid'}[m]+' '+fmtTok(a,t)+'.');updateView();},
 lpadd(){const p=POOLS['RVRB/USDs'];openSheet('Add liquidity',`<div class="amt"><div class="top"><span>RVRB</span><span>Balance ${fmt(S.W.bal.RVRB,4)}</span></div><div class="mid"><input id="lpA" inputmode="decimal" value="10" aria-label="RVRB amount"><span class="b gold">RVRB</span></div></div>
  <div class="amt"><div class="top"><span>USDs (matched at pool price)</span><span>Balance ${fmt(S.W.bal.USDs,2)}</span></div><div class="mid"><input id="lpB" readonly aria-label="USDs amount"><span class="b info">USDs</span></div></div><div class="kv" id="lpKv"></div><button class="btn pri wide" id="lpGo" data-act="lpgo">Add liquidity</button>`,'RVRB/USDs pool');
  const upd=()=>{const a=+$('lpA').value||0;const b=a*p.y/p.x;$('lpB').value=fmt(b,2);$('lpKv').innerHTML='<div><span>Pool share after</span><span>'+pct((a/p.x*p.lp+(S.W.lp['RVRB/USDs']||0))/(p.lp+a/p.x*p.lp),3)+'</span></div><div><span>Fee earned on every trade</span><span>'+pct(P.swapFee,2)+'</span></div>';$('lpGo').disabled=!(a>0)||a>S.W.bal.RVRB||b>S.W.bal.USDs;};$('lpA').addEventListener('input',upd);upd();},
 lpgo(){const p=POOLS['RVRB/USDs'];const a=+$('lpA').value,b=a*p.y/p.x;const sh=a/p.x*p.lp;S.W.bal.RVRB-=a;S.W.bal.USDs-=b;p.x+=a;p.y+=b;p.lp+=sh;S.W.lp['RVRB/USDs']=(S.W.lp['RVRB/USDs']||0)+sh;newTx(TT[2],{amt:a,tok:'RVRB',mine:true,label:'RVRB/USDs pool'});closeSheet();toast('Liquidity added.');updateView();},
 lprem(){const p=POOLS['RVRB/USDs'];const sh=S.W.lp['RVRB/USDs']||0;if(!sh)return;const f=sh/p.lp;const a=p.x*f,b=p.y*f;confirmBox('Remove liquidity','<div class="kv"><div><span>You receive</span><span>'+fmtTok(a,'RVRB')+'</span></div><div><span>and</span><span>'+fmtTok(b,'USDs')+'</span></div></div>','Remove',false,()=>{p.x-=a;p.y-=b;p.lp-=sh;S.W.lp['RVRB/USDs']=0;S.W.bal.RVRB+=a;S.W.bal.USDs+=b;newTx(TT[2],{amt:a,tok:'RVRB',mine:true,label:'liquidity removed'});toast('Liquidity removed.');updateView();});},
 bdir(el){WS.bridgeDir=el.dataset.v;$$('[data-act=bdir]').forEach(b=>b.classList.toggle('on',b===el));VIEWS.wallet.update('bridge');},
 brgo(){const inn=WS.bridgeDir==='in',a=WS.bridgeAmt;if(!(a>0))return toast('Enter an amount above zero.',false);if(inn&&!M.bridgeIn||!inn&&!M.bridgeOut)return toast('This bridge direction is paused.',false);if(!inn&&a>S.W.bal.USDs)return toast('Not enough USDs.',false);
  if(inn){S.bridge.locked+=a;S.bridge.minted+=a;S.W.bal.USDs+=a;}else{S.bridge.locked-=a;S.bridge.minted-=a;S.W.bal.USDs-=a;}
  S.bridge.deps.unshift({dir:WS.bridgeDir,amt:a,t:Date.now(),wait:inn?12000:5000});newTx(TT[0],{amt:a,tok:'USDs',mine:true,label:inn?'bridge deposit':'bridge withdrawal'});toast(inn?'Deposit received. USDs will show as complete after Ethereum confirmations.':'Withdrawal sent to Ethereum.');updateView();},
 actf(el){WS.actFilter=el.dataset.v;$$('[data-act=actf]').forEach(b=>b.classList.toggle('on',b===el));VIEWS.wallet.update('activity');},
 gadd(){const g=$('gIn').value.trim();if(!/^[a-z0-9.-]+\.rivers$/.test(g))return toast('Use a name like ada.rivers.',false);S.W.guardians.push(g);$('gIn').value='';toast('Guardian added. They will be asked to accept.');updateView();},
 grem(el){const i=+el.dataset.i;confirmBox('Remove guardian?','<p class="fg2">'+esc(S.W.guardians[i])+' will no longer be able to help recover your account.</p>','Remove',true,()=>{S.W.guardians.splice(i,1);updateView();});},
 sesx(el){S.W.sessions.splice(+el.dataset.i,1);toast('Session signed out.');updateView();},
 apx(el){const a=S.W.apps.splice(+el.dataset.i,1)[0];toast(a.n+' can no longer request approvals.');updateView();},
 stakeon(el){WS.stakeVal=+el.dataset.id;closeSheet();}
};
