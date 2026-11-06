/* ===================== RIVERS INDEXER (account analytics, activity history, rewards, holders) =====================
   The indexer runs next to the testnet node on port 9200. Scan uses it when it answers and keeps the
   "Coming soon" state on these cards when it does not. */
const LV_IDX=(lvQS.get('indexer')||lvStore.get('rvScanIndexer')||(/-9000\./.test(LV_RPC)?LV_RPC.replace(/-9000\./,'-9200.'):LV_RPC.replace(/:9000$/,':9200'))).replace(/\/+$/,'');
const IDX={ok:false,sum:null,hourly:[],rewards:{},hAt:0,rAt:0};
async function idxGet(p){const r=await fetch(LV_IDX+p,{cache:'no-store'});if(!r.ok)throw new Error(r.status);return r.json();}
async function idxPoll(){const was=IDX.ok;try{IDX.sum=await idxGet('/summary');IDX.ok=true;
  if(Date.now()-IDX.hAt>300000){IDX.hourly=await idxGet('/stats/hourly?hours=168');IDX.hAt=Date.now();}
  if(Date.now()-IDX.rAt>300000){IDX.rewards=await idxGet('/validators/rewards');IDX.rAt=Date.now();}
}catch(e){IDX.ok=false;return;}if(typeof CUR==='undefined'||!CUR)return;try{if(!was)idxActivate();idxFill();}catch(e){console.warn(e);}}
function idxUnsoon(el){if(!el)return;el.classList.remove('soon');el.removeAttribute('data-soon');const b=el.querySelector(':scope>.soonbadge');if(b)b.remove();}
function idxActivate(){if(CUR.sub==='overview'){idxUnsoon(lvKpi('k2'));idxUnsoon(lvCard('cal'));}if(CUR.sub==='validator'||CUR.sub==='address'||CUR.sub==='token')route();}
function idxCalendar(){const now=new Date();const days=[];for(let i=6;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i);days.push(d);}
  const grid=days.map(()=>new Array(24).fill(0));IDX.hourly.forEach(h=>{const t=new Date(h.hour);const di=days.findIndex(d=>d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate());if(di>=0)grid[di][t.getHours()]+=h.txUser;});
  const mx=Math.max(1,...grid.flat());const wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return '<div class="cal">'+grid.map((row,i)=>{const d=days[i];const lab=wd[d.getDay()];return '<span>'+lab+'</span>'+row.map((v,h)=>'<i style="background:'+(v?greenRamp(Math.max(.08,v/mx)):'var(--hair)')+'" title="'+lab+' '+d.getDate()+' · '+String(h).padStart(2,'0')+':00 · '+fmt(v)+' wallet transaction'+(v===1?'':'s')+'"></i>').join('');}).join('')
   +'<span></span>'+Array.from({length:24},(_,h)=>'<span style="text-align:center">'+(h%6===0?String(h).padStart(2,'0'):'')+'</span>').join('')+'</div>';}
function idxFill(){if(CUR&&CUR.sub==='transactions'){const t2=$('t2');if(t2){if(IDX.ok&&IDX.sum){t2.textContent=compact(IDX.sum.tx24h);set2('t2s','Last 24 hours');}else{const c=lvKpi('t2');const cap=c&&c.querySelector('.cap');if(cap)cap.textContent='Total transactions';}}}
 if(!IDX.ok||!IDX.sum)return;const s=IDX.sum;
  if(CUR.sub==='overview'){const k=$('k2');if(k){idxUnsoon(lvKpi('k2'));k.textContent=fmt(s.accounts);const ks=$('k2s');if(ks)ks.textContent=fmt(s.active24h)+' active in the last 24 hours';}
   const c=$('cal');if(c){idxUnsoon(lvCard('cal'));c.innerHTML=idxCalendar();const sub=c.closest('.card').querySelector('.sub');if(sub)sub.textContent='Wallet transactions, last 7 days';}}}

/* Validator reward history: one bar per epoch (one epoch is one day). */
function idxRewardCard(v){const rw=(IDX.rewards[v.addr]||[]).filter(r=>r.rewards!=null).slice(-14);
  if(!IDX.ok)return `<section class="card soon" data-soon="Reward history"><div class="ch"><h2><span class="ico">${IC.flame}</span>Rewards per day</h2><span class="sub">Last 14 days, RVRB</span></div>${bars(Array.from({length:14},(_,i)=>1+(i%3)),Array.from({length:14},(_,i)=>i%3===0?'D'+(i+1):''),C.acc,120)}</section>`;
  const apy=rw.length?rw[rw.length-1].apy:null;
  return `<section class="card"><div class="ch"><h2><span class="ico">${IC.flame}</span>Rewards per epoch</h2><span class="sub">${apy!=null?'Current APY '+fmt(apy,2)+'%':'One epoch is one day'}</span></div>${rw.length?bars(rw.map(r=>r.rewards),rw.map(r=>'E'+r.epoch),C.acc,120)+'<div class="kv"><div><span>Total over '+rw.length+' epoch'+(rw.length===1?'':'s')+'</span><span>'+fmt(rw.reduce((a,r)=>a+r.rewards,0),2)+' RVRB</span></div></div>':'<div class="empty">Rewards appear after the first epoch ends.</div>'}</section>`;}

/* Address page: analytics and full transaction history from the indexer. */
async function idxAddr(a){if(!IDX.ok||CUR.param!==a)return;try{const [ac,txs]=await Promise.all([idxGet('/account/'+a),idxGet('/account/'+a+'/txs?limit=60')]);if(CUR.param!==a)return;
  const card=$('aTx')&&$('aTx').closest('.card');const hc=$('aBal')&&$('aBal').closest('.card');if(hc&&!$('aIdx'))hc.insertAdjacentHTML('afterend','<section class="card" id="aIdx"><div class="ch"><h2><span class="ico">'+IC.grid+'</span>Account analytics</h2><span class="sub">Since genesis</span></div><div class="kv" id="aIdxK"></div></section>');
  const k=$('aIdxK');if(k)k.innerHTML=ac.known?[['First seen',ac.firstTs?new Date(ac.firstTs).toLocaleString()+' · block #'+fmt(ac.firstCp):'Genesis'],['Last active',ac.lastTs?ago(ac.lastTs):'—'],['Transactions',fmt(ac.total||0)+' · '+fmt(ac.txCount)+' sent'],['Total sent',fmt(ac.sent,4)+' RVRB'],['Total received',fmt(ac.received,4)+' RVRB'],['Holder rank','#'+fmt(ac.rank)]].map(x=>'<div><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join(''):'<div><span>Status</span><span>No activity recorded yet</span></div>';
  if(!txs.length)return;$('aT').textContent=fmt(ac.total||txs.length);$('aTs').textContent=txs.length>=60?'Latest 60 shown below':'Since genesis';const kc=lvKpi('aT');const cap=kc&&kc.querySelector('.cap');if(cap)cap.textContent='Transactions';
  if(txs.some(t=>t.activity&&t.sender===a)&&$('aEye'))$('aEye').textContent='Network activity account';
  const sub=card&&card.querySelector('.sub');if(sub)sub.textContent='Complete history';
  $('aTx').innerHTML=txs.map(t=>{const out=t.sender===a;const lab=t.kind==='call'?'Contract call':t.kind==='publish'?'Publish':out?'Sent':'Received';const c=t.kind==='call'||t.kind==='publish'?'defi':'transfer';
   return '<div class="li click" data-act="tx" data-id="'+t.digest+'"><span class="ty '+c+'">'+lab+'</span><span class="mono trunc">'+short(t.digest,8)+'</span><span class="r" style="color:'+(t.delta<0?'var(--bad)':t.delta>0?'var(--ok)':'var(--muted)')+'">'+(t.delta>0?'+':'')+(t.delta?fmt(t.delta,4)+' RVRB':'—')+'</span><span class="s">Block #'+fmt(t.cp)+' · '+ago(t.ts)+(out&&t.recipient?' · to '+lvShortA(t.recipient,6):!out?' · from '+lvShortA(t.sender,6):'')+(t.label?' · '+esc(t.label):'')+(t.ok?'':' · failed')+'</span></div>';}).join('');
 }catch(e){console.warn(e);}}

/* Complete holder list for the token page. */
async function idxHolders(){const h=await idxGet('/holders?limit=500');const bal={};h.rows.forEach(r=>{bal[r.addr]=r.balance;LVH.known.add(r.addr);if(r.activity)LVH.activity.add(r.addr);});LVH.bal=bal;LVH.total=h.total;}

(function(){const m=lvMarks,f=lvFix,al=lvAddrLoad,lh=lvLoadHolders;
 lvMarks=function(s){m(s);if(IDX.ok&&s==='overview'){idxUnsoon(lvKpi('k2'));idxUnsoon(lvCard('cal'));}};
 lvFix=function(s){f(s);idxFill();};
 lvAddrLoad=async function(a){await al(a);await idxAddr(a);};
 lvLoadHolders=async function(force){if(IDX.ok&&!LVH.loading&&(force||Date.now()-LVH.at>45000)){LVH.loading=true;try{await idxHolders();LVH.at=Date.now();}catch(e){}LVH.loading=false;if(CUR.sub==='token')lvTokenUpdate();return;}return lh(force);};})();
idxPoll();setInterval(idxPoll,20000);
