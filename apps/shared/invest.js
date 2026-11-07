/* ===================== CORE: investors and vesting (rivers_vesting::vesting) ===================== */
IC.vest='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12"/><path d="M7 3v1.5c0 3 5 4.5 5 7.5 0-3 5-4.5 5-7.5V3"/><path d="M7 21v-1.5c0-3 5-4.5 5-7.5 0 3 5 4.5 5 7.5V21"/></svg>';
const ROUNDS={'Pre-seed':{imm:0,cliff:12,months:36,revocable:false,fund:'early-backers-1',c:'var(--deep)'},
 'Seed':{imm:10,cliff:12,months:36,revocable:false,fund:'early-backers-1',c:'var(--river)'},
 'Strategic':{imm:5,cliff:6,months:24,revocable:false,fund:'early-backers-1',c:'var(--violet)'},
 'Advisors':{imm:0,cliff:6,months:24,revocable:true,fund:'foundation-1',c:'var(--mint)'},
 'Team':{imm:0,cliff:12,months:48,revocable:true,fund:'foundation-1',c:'var(--gold)'},
 'Grant':{imm:0,cliff:3,months:12,revocable:true,fund:'ecosystem-1',c:'#9FE8C8'}};
const IV={round:'Seed',name:'',addr:'',amt:100000,price:'',fund:'early-backers-1',startMode:'now',startDate:'',imm:10,cliff:12,months:36,revocable:false,filter:'all'};
const ADDR_RE=/^0x[0-9a-fA-F]{64}$/;
const dstr=t=>new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const mlab=m=>m===0?'None':m%12===0?(m/12)+(m===12?' year':' years'):m+' months';
const fundOf=id=>FUNDS.find(f=>f.id===id);
function ivStart(){if(IV.startMode==='now')return Date.now();const t=Date.parse(IV.startDate+'T00:00:00');return isFinite(t)?t:NaN;}
function ivDraft(){return {total:+IV.amt||0,imm:IV.imm,cliff:IV.cliff,months:IV.months,start:ivStart(),revocable:IV.revocable,revoked:false};}
function vStatus(v,t){t=t||Date.now();if(v.revoked)return ['bad','Stopped'];if(t<v.start)return ['info','Starts '+dstr(v.start)];const un=vestedAt(v,t);if(un>=v.total)return ['mute','Fully unlocked'];if(t<v.start+v.cliff*MONTH)return ['warn','In cliff'];return ['ok','Unlocking'];}
function vNext(v){const t=Date.now();if(v.revoked)return v.total>v.claimed?'Unlocked tokens wait to be claimed':'Closed';if(t<v.start)return (v.imm?pct(v.imm/100,0)+' on ':'Starts ')+dstr(v.start);const c=v.start+v.cliff*MONTH,e=v.start+v.months*MONTH;
 if(t<c)return fmt(vestedAt(v,c)-vestedAt(v,t))+' RVRB on '+dstr(c);if(t<e)return fmt(v.total*(1-v.imm/100)/v.months)+' RVRB a month until '+dstr(e);return 'Complete';}
function ivIssues(){const e=[];const f=fundOf(IV.fund);if(!IV.name.trim())e.push('Enter the investor name.');if(!ADDR_RE.test(IV.addr.trim()))e.push('Enter a Rivers wallet address: 0x followed by 64 letters and numbers.');
 if(!(+IV.amt>0))e.push('Enter an amount above zero.');else if(+IV.amt>f.bal)e.push(f.id+' holds '+fmt(f.bal)+' RVRB. Lower the amount or pick another wallet.');
 if(!isFinite(ivStart()))e.push('Pick a start date.');if(IV.cliff>IV.months)e.push('The cliff must end before the schedule ends.');return e;}

/* unlock curve: cumulative tokens unlocked over the life of one schedule */
function vestCurve(v,opt){opt=opt||{};const W=640,H=opt.h||190,pl=8,pr=8,pt=18,pb=26,iw=W-pl-pr,ih=H-pt-pb;const end=v.start+v.months*MONTH,span=end-v.start||1;
 const X=t=>pl+(t-v.start)/span*iw,Y=a=>pt+ih-(v.total?a/v.total:0)*ih;const n=160;let d='';for(let i=0;i<=n;i++){const t=v.start+span*i/n;d+=(i?'L':'M')+X(t).toFixed(1)+' '+Y(vestedAt(v,t)).toFixed(1);}
 const area=d+'L'+X(end).toFixed(1)+' '+Y(0)+'L'+X(v.start)+' '+Y(0)+'Z';const cx=X(v.start+v.cliff*MONTH);const step=v.months>24?12:v.months>12?6:3;let ticks='';
 for(let m=0;m<=v.months;m+=step){const x=X(v.start+m*MONTH);ticks+='<line x1="'+x+'" x2="'+x+'" y1="'+(pt+ih)+'" y2="'+(pt+ih+4)+'" stroke="var(--hair3)"/><text x="'+x+'" y="'+(H-8)+'" text-anchor="'+(m===0?'start':m>=v.months?'end':'middle')+'" class="vtk">'+(m===0?'Start':'Month '+m)+'</text>';}
 let now='';if(opt.now){const t=Date.now();if(t>v.start&&t<end){const x=X(t),y=Y(vestedAt(v,t));now='<line x1="'+x+'" x2="'+x+'" y1="'+pt+'" y2="'+(pt+ih)+'" stroke="var(--fg)" stroke-opacity=".5" stroke-dasharray="2 3"/><circle cx="'+x+'" cy="'+y+'" r="5" fill="var(--fg)"/><circle cx="'+x+'" cy="'+y+'" r="10" fill="var(--fg)" opacity=".15"><animate attributeName="r" values="6;13;6" dur="2.4s" repeatCount="indefinite"/></circle><text x="'+(x>W-90?x-8:x+8)+'" y="'+(pt+10)+'" text-anchor="'+(x>W-90?'end':'start')+'" class="vtk" style="fill:var(--fg)">Today</text>';}}
 const gid='vg'+Math.random().toString(36).slice(2,7);
 return '<svg class="vcurve" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Unlock schedule from '+dstr(v.start)+' to '+dstr(end)+'"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--river)" stop-opacity=".45"/><stop offset="1" stop-color="var(--river)" stop-opacity="0"/></linearGradient></defs>'
  +[0,.5,1].map(f=>'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v.total*f)+'" y2="'+Y(v.total*f)+'" stroke="var(--hair)"/>').join('')
  +(v.cliff?'<rect x="'+X(v.start)+'" y="'+pt+'" width="'+(cx-X(v.start))+'" height="'+ih+'" fill="var(--warn)" opacity=".06"/><line x1="'+cx+'" x2="'+cx+'" y1="'+pt+'" y2="'+(pt+ih)+'" stroke="var(--warn)" stroke-dasharray="4 4" opacity=".8"/><text x="'+(cx+6)+'" y="'+(pt+ih-8)+'" class="vtk" style="fill:var(--warn)">Cliff ends</text>':'')
  +'<path d="'+area+'" fill="url(#'+gid+')"/><path d="'+d+'" fill="none" stroke="var(--river)" stroke-width="2.6" stroke-linejoin="round" class="vline"/>'+ticks+now
  +'<text x="'+(W-pr)+'" y="'+(Y(v.total)-6)+'" text-anchor="end" class="vtk" style="fill:var(--fg2)">'+compact(v.total)+' RVRB</text></svg>';}

/* monthly unlocks across every schedule, next 36 months, stacked by round */
function vestCalendar(){const now=new Date();const m0=new Date(now.getFullYear(),now.getMonth(),1).getTime();const N=36;const cols=[];
 for(let i=0;i<N;i++){const a=new Date(now.getFullYear(),now.getMonth()+i,1).getTime(),b=new Date(now.getFullYear(),now.getMonth()+i+1,1).getTime();const by={};
  VEST.forEach(v=>{const u=vestedAt(v,b)-vestedAt(v,Math.max(a,i===0?Date.now():a));if(u>.5)by[v.round]=(by[v.round]||0)+u;});cols.push({a,by,sum:Object.values(by).reduce((x,y)=>x+y,0)});}
 const mx=Math.max(1,...cols.map(c=>c.sum));const W=640,H=200,pb=24,pt=10,ih=H-pb-pt,bw=W/N;let bars='';
 cols.forEach((c,i)=>{let y=pt+ih;Object.keys(ROUNDS).concat(['Custom']).forEach(r=>{const u=c.by[r];if(!u)return;const h=u/mx*ih;y-=h;bars+='<rect x="'+(i*bw+2)+'" y="'+y.toFixed(1)+'" width="'+(bw-4).toFixed(1)+'" height="'+Math.max(1,h).toFixed(1)+'" rx="2" fill="'+(ROUNDS[r]?ROUNDS[r].c:'var(--pearl)')+'"><title>'+new Date(c.a).toLocaleDateString('en-GB',{month:'short',year:'numeric'})+' · '+r+': '+fmt(u)+' RVRB</title></rect>';});
  if(i%6===0)bars+='<text x="'+(i*bw+2)+'" y="'+(H-6)+'" class="vtk">'+new Date(c.a).toLocaleDateString('en-GB',{month:'short',year:'2-digit'})+'</text>';});
 const peak=cols.reduce((a,c)=>c.sum>a.sum?c:a,cols[0]);const total=cols.reduce((a,c)=>a+c.sum,0);
 const used=[...new Set(VEST.map(v=>v.round))];
 return {svg:'<svg class="vcal" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Monthly unlocks for the next 36 months"><line x1="0" x2="'+W+'" y1="'+(pt+ih)+'" y2="'+(pt+ih)+'" stroke="var(--hair2)"/>'+bars+'<rect x="2" y="'+pt+'" width="'+(bw-4)+'" height="'+ih+'" fill="none" stroke="var(--fg)" stroke-opacity=".35" stroke-dasharray="3 3" rx="3"/></svg>',
  legend:used.map(r=>'<span><i style="background:'+(ROUNDS[r]?ROUNDS[r].c:'var(--pearl)')+'"></i>'+r+'</span>').join(''),total,peak};}

function ivRow(v){const t=Date.now(),un=vestedAt(v,t),st=vStatus(v,t);const f=fundOf(v.fund);
 return '<tr><td><div style="display:grid;gap:3px"><b class="trunc" style="max-width:220px">'+esc(v.name)+'</b><span><span class="b" style="font-size:.6rem;border-color:'+(ROUNDS[v.round]?ROUNDS[v.round].c:'var(--pearl)')+'">'+esc(v.round)+'</span> <span class="mono muted" style="font-size:.68rem">'+short(v.addr,6)+'</span></span></div></td>'
  +'<td class="n mono">'+fmt(v.orig)+(v.revoked?'<br><span class="muted" style="font-size:.68rem">now '+fmt(v.total)+'</span>':'')+'</td>'
  +'<td style="min-width:170px"><div class="vbar" title="Claimed '+fmt(v.claimed)+' · unlocked '+fmt(un)+' of '+fmt(v.total)+'"><i class="un" style="width:'+(v.total?un/v.orig*100:0)+'%"></i><i class="cl" style="width:'+(v.claimed/v.orig*100)+'%"></i></div><span class="mono muted" style="font-size:.68rem">'+pct(un/v.orig,1)+' unlocked · '+pct(v.claimed/v.orig,1)+' claimed</span></td>'
  +'<td style="font-size:.78rem">'+esc(vNext(v))+'</td><td><span class="b '+st[0]+' dot">'+esc(st[1])+'</span></td>'
  +'<td><div class="btns" style="flex-wrap:nowrap"><button class="btn xs" data-act="ivview" data-id="'+v.id+'">View</button>'+(v.revocable&&!v.revoked&&un<v.total?'<button class="btn xs danger" data-act="ivrev" data-id="'+v.id+'">Stop</button>':'')+'</div></td></tr>';}

VIEWS.console.subs.splice(2,0,['investors','Investors',IC.vest]);
wrapView('console',{investors:{build:()=>`
 <div class="g c4 rise">${kpi('ivk1','Issued with vesting',IC.vest)}${kpi('ivk2','Unlocked so far',IC.activity)}${kpi('ivk3','Claimed by holders',IC.send)}${kpi('ivk4','Still locked',IC.lock)}</div>
 <div class="g c2 ais">
  <section class="card hud"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.vest}</span>Issue tokens</h2><span class="sub">Locks RVRB on chain and unlocks it to the investor on a schedule</span></div><button class="btn sm" data-act="ivbatch">Add many</button></div>
   <div class="cap">1 · Round</div>
   <div class="seg wrap" role="group" aria-label="Round">${Object.keys(ROUNDS).map(r=>'<button data-act="ivround" data-v="'+r+'" class="'+(IV.round===r?'on':'')+'">'+r+'</button>').join('')}</div>
   <div class="cap">2 · Investor</div>
   <div class="r2 st"><div class="fld"><label for="ivN">Investor or company name</label><input class="in" id="ivN" value="${esc(IV.name)}" autocomplete="off" placeholder="Name on the agreement"></div>
    <div class="fld"><label for="ivAmt">Amount of RVRB</label><input class="in mono" id="ivAmt" value="${IV.amt}" inputmode="decimal"></div></div>
   <div class="fld"><label for="ivA">Investor wallet address</label><input class="in mono" id="ivA" value="${esc(IV.addr)}" autocomplete="off" spellcheck="false" placeholder="0x… from the investor's Rivers Wallet"></div>
   <div class="qa" style="display:flex;gap:6px;flex-wrap:wrap">${[25000,50000,100000,250000].map(a=>'<button class="btn xs" data-act="ivamt" data-v="'+a+'">'+compact(a)+'</button>').join('')}</div>
   <div class="fld"><label for="ivP">Price paid per RVRB, in US dollars (optional, for your records)</label><input class="in mono" id="ivP" value="${esc(IV.price)}" inputmode="decimal" placeholder="Leave empty if not agreed"></div>
   <div class="cap">3 · Paid from</div>
   <div class="fld"><label for="ivF">Genesis wallet</label><select class="in" id="ivF">${['Early backers','Foundation','Ecosystem'].map(g=>'<optgroup label="'+g+'">'+FUNDS.filter(f=>f.g===g).map(f=>'<option value="'+f.id+'" '+(IV.fund===f.id?'selected':'')+'>'+f.id+' · '+fmt(f.bal)+' RVRB</option>').join('')+'</optgroup>').join('')}</select></div>
   <div class="cap">4 · Unlock terms</div>
   <div class="fld"><span class="lbl">Start</span><div class="seg" role="group" aria-label="Start">${[['now','Now'],['date','On a date']].map(x=>'<button data-act="ivstart" data-v="'+x[0]+'" class="'+(IV.startMode===x[0]?'on':'')+'">'+x[1]+'</button>').join('')}</div><input class="in mono" type="date" id="ivSd" value="${IV.startDate}" ${IV.startMode==='date'?'':'hidden'} aria-label="Start date"></div>
   <div class="ctl"><span class="n">Unlock at start</span><span class="val" id="ivImmV">${IV.imm}%</span><span class="d">Share the investor can claim on the start date</span><input type="range" min="0" max="25" step="1" value="${IV.imm}" id="ivImm" aria-label="Unlock at start, percent"></div>
   <div class="fld"><span class="lbl">Cliff: nothing more unlocks before it ends</span><div class="seg wrap" role="group" aria-label="Cliff">${[0,3,6,9,12,18].map(m=>'<button data-act="ivcliff" data-v="'+m+'" class="'+(IV.cliff===m?'on':'')+'">'+mlab(m)+'</button>').join('')}</div></div>
   <div class="fld"><span class="lbl">Fully unlocked after</span><div class="seg wrap" role="group" aria-label="Vesting length">${[6,12,18,24,36,48].map(m=>'<button data-act="ivmon" data-v="'+m+'" class="'+(IV.months===m?'on':'')+'">'+mlab(m)+'</button>').join('')}</div></div>
   <div class="ctl"><span class="n">Can be stopped</span><label class="sw"><input type="checkbox" id="ivRev" ${IV.revocable?'checked':''} aria-label="Schedule can be stopped"><i></i></label><span class="d">If on, you can stop the schedule and take back tokens that have not unlocked. Unlocked tokens always stay with the investor.</span></div>
   <div id="ivChart" class="vchart"></div>
   <div class="kv" id="ivSum"></div>
   <div id="ivErr"></div>
   <button class="btn pri wide" data-act="ivgo" id="ivGo">Issue tokens</button></section>
  <div class="g" style="gap:18px;align-content:start">
   <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.clock}</span>Unlock calendar</h2><span class="sub" id="ivCalS"></span></div></div><div id="ivCal"></div><div class="legend" id="ivCalL"></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.shield}</span>Rules the contract enforces</h2></div>
    <div class="list">${[['Investors claim from Rivers Wallet','Unlocked tokens can be claimed at any time, in one go or in parts.'],['Unlocked tokens cannot be taken back','Not by the core team, not by validators. Only locked tokens can return, and only on schedules that can be stopped.'],['Every schedule is public','Anyone can check the total, the terms and what has been claimed on Rivers Scan.'],['Investors can change wallet','The investor moves the schedule to a new address if a phone is lost or replaced.']].map(x=>'<div class="li"><span class="chk ok">✓</span><span><b style="font-size:.84rem">'+x[0]+'</b><br><span class="muted" style="font-size:.76rem">'+x[1]+'</span></span></div>').join('')}</div>
    <div class="kv" style="margin-top:10px"><div><span>Contract</span><span class="mono">rivers_vesting::vesting</span></div><div><span>Works with</span><span>RVRB and every Token Studio token</span></div></div></section>
  </div></div>
 <section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.users}</span>Schedules</h2><span class="sub" id="ivTs"></span></div><div class="seg" role="group" aria-label="Filter">${[['all','All'],['active','Unlocking'],['cliff','In cliff'],['done','Complete'],['stopped','Stopped']].map(f=>'<button data-act="ivflt" data-v="'+f[0]+'" class="'+(IV.filter===f[0]?'on':'')+'">'+f[1]+'</button>').join('')}</div></div>
  <div class="tw"><table><thead><tr><th>Holder</th><th class="n">RVRB</th><th>Progress</th><th>Next unlock</th><th>Status</th><th></th></tr></thead><tbody id="ivT"></tbody></table></div></section>`,
 after(){const bind=(id,k,num)=>{const el=$(id);if(el)el.addEventListener('input',()=>{IV[k]=num?el.value.replace(/[^0-9.]/g,''):el.value;ivPreview();});};
  bind('ivN','name');bind('ivA','addr');bind('ivAmt','amt',true);bind('ivP','price',true);
  $('ivF').addEventListener('change',e=>{IV.fund=e.target.value;ivPreview();});$('ivSd').addEventListener('input',e=>{IV.startDate=e.target.value;ivPreview();});
  $('ivImm').addEventListener('input',e=>{IV.imm=+e.target.value;$('ivImmV').textContent=IV.imm+'%';ivPreview();});$('ivRev').addEventListener('change',e=>{IV.revocable=e.target.checked;ivPreview();});
  ivPreview();},
 update(){const t=Date.now();const tot=VEST.reduce((a,v)=>a+v.orig,0),un=VEST.reduce((a,v)=>a+vestedAt(v,t),0),cl=VEST.reduce((a,v)=>a+v.claimed,0),lk=VEST.reduce((a,v)=>a+v.total-vestedAt(v,t),0);
  $('ivk1').textContent=compact(tot);$('ivk1s').textContent=VEST.length+' schedules · '+new Set(VEST.map(v=>v.addr)).size+' wallets';
  $('ivk2').textContent=compact(un);$('ivk2s').textContent=pct(un/Math.max(1,tot),1)+' of everything issued';
  $('ivk3').textContent=compact(cl);$('ivk3s').textContent=compact(un-cl)+' unlocked and not yet claimed';
  $('ivk4').textContent=compact(lk);const nx=VEST.filter(v=>!v.revoked&&t<v.start+v.cliff*MONTH).sort((a,b)=>(a.start+a.cliff*MONTH)-(b.start+b.cliff*MONTH))[0];$('ivk4s').textContent=nx?'next cliff: '+dstr(nx.start+nx.cliff*MONTH):'no cliffs ahead';
  const cal=vestCalendar();if(!$('ivCal')._done||Math.random()<.04){$('ivCal').innerHTML=cal.svg;$('ivCal')._done=1;$('ivCalL').innerHTML=cal.legend;}
  $('ivCalS').textContent=compact(cal.total)+' RVRB unlocks in the next 36 months · busiest month '+new Date(cal.peak.a).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const rows=VEST.filter(v=>{const s=vStatus(v,t)[1];return IV.filter==='all'||(IV.filter==='active'&&s==='Unlocking')||(IV.filter==='cliff'&&s==='In cliff')||(IV.filter==='done'&&s==='Fully unlocked')||(IV.filter==='stopped'&&s==='Stopped');});
  $('ivTs').textContent=rows.length+' of '+VEST.length+' shown';const tb=$('ivT');const html=rows.length?rows.map(ivRow).join(''):'<tr><td colspan="6"><div class="empty">No schedules match this filter.</div></td></tr>';if(tb._h!==html){tb.innerHTML=html;tb._h=html;}}}});

function ivPreview(){const v=ivDraft();const ok=isFinite(v.start)&&v.total>0;const f=fundOf(IV.fund);
 $('ivChart').innerHTML=ok?vestCurve(v):'<div class="empty">Enter an amount and a start to see the unlock curve.</div>';
 if(ok){const c=v.start+v.cliff*MONTH,e=v.start+v.months*MONTH,imm=v.total*v.imm/100;const price=+IV.price;
  $('ivSum').innerHTML='<div><span>On '+dstr(v.start)+'</span><span>'+fmt(imm)+' RVRB</span></div>'+(v.cliff?'<div><span>When the cliff ends, '+dstr(c)+'</span><span>'+fmt(vestedAt(v,c))+' RVRB in total</span></div>':'')
   +'<div><span>Then every month</span><span>'+fmt((v.total-imm)/v.months)+' RVRB</span></div><div><span>Fully unlocked</span><span>'+dstr(e)+'</span></div>'
   +'<div><span>'+esc(IV.fund)+' after issuing</span><span>'+fmt(f.bal-v.total)+' RVRB</span></div>'+(price>0?'<div><span>Deal value</span><span>$'+fmt(price*v.total,2)+'</span></div>':'');}
 else $('ivSum').innerHTML='';
 const e=ivIssues();$('ivErr').innerHTML=e.length&&(IV.name||IV.addr)?'<p class="muted" style="font-size:.78rem;color:var(--warn)">'+esc(e[0])+'</p>':'';$('ivGo').disabled=e.length>0;}

function parseBatch(txt){const f=fundOf(IV.fund);let sum=0;const rows=txt.split('\n').map(l=>l.trim()).filter(Boolean).map((l,i)=>{const p=l.split(/[,;\t]/).map(x=>x.trim());const r={name:p[0]||'',addr:p[1]||'',amt:+String(p[2]||'').replace(/[^0-9.]/g,''),err:''};
  if(!r.name)r.err='Name missing';else if(!ADDR_RE.test(r.addr))r.err='Wallet address is not valid';else if(!(r.amt>0))r.err='Amount missing';sum+=r.amt||0;return r;});
 return {rows,sum,bad:rows.filter(r=>r.err).length,over:sum>f.bal};}
function batchRender(){const b=parseBatch($('ivB').value);const f=fundOf(IV.fund);
 $('ivBt').innerHTML=b.rows.length?'<div class="tw"><table><thead><tr><th>Name</th><th>Wallet</th><th class="n">RVRB</th><th></th></tr></thead><tbody>'+b.rows.map(r=>'<tr><td>'+esc(r.name)+'</td><td class="mono">'+esc(short(r.addr,6))+'</td><td class="n mono">'+fmt(r.amt||0)+'</td><td>'+(r.err?'<span class="b bad">'+r.err+'</span>':'<span class="b ok dot">Ready</span>')+'</td></tr>').join('')+'</tbody></table></div>':'';
 $('ivBs').innerHTML='<div><span>Investors</span><span>'+b.rows.length+'</span></div><div><span>Total</span><span>'+fmt(b.sum)+' RVRB</span></div><div><span>Paid from</span><span>'+f.id+' · '+fmt(f.bal)+' RVRB</span></div><div><span>Terms</span><span>'+IV.round+' · '+IV.imm+'% at start · cliff '+mlab(IV.cliff).toLowerCase()+' · '+mlab(IV.months)+'</span></div>';
 const go=$('ivBgo');go.disabled=!b.rows.length||b.bad>0||b.over;go.textContent=b.over?'Not enough RVRB in '+f.id:b.bad?'Fix '+b.bad+' line'+(b.bad>1?'s':''):'Issue '+b.rows.length+' schedule'+(b.rows.length===1?'':'s')+' in one transaction';}
function issueOne(name,addr,amt,start){const f=fundOf(IV.fund);f.bal-=amt;const v={id:'0x'+hex(64),name:name.trim(),round:IV.round,total:amt,orig:amt,fund:IV.fund,start,imm:IV.imm,cliff:IV.cliff,months:IV.months,revocable:IV.revocable,revoked:false,claimed:0,addr:addr.trim(),created:Date.now()};VEST.unshift(v);return v;}

Object.assign(XACT,{
 ivround(el){IV.round=el.dataset.v;Object.assign(IV,(({imm,cliff,months,revocable,fund})=>({imm,cliff,months,revocable,fund}))(ROUNDS[IV.round]));route();},
 ivamt(el){IV.amt=el.dataset.v;$('ivAmt').value=IV.amt;ivPreview();},
 ivstart(el){IV.startMode=el.dataset.v;if(IV.startMode==='date'&&!IV.startDate){const d=new Date(Date.now()+30*864e5);IV.startDate=d.toISOString().slice(0,10);$('ivSd').value=IV.startDate;}$$('[data-act=ivstart]').forEach(b=>b.classList.toggle('on',b===el));$('ivSd').hidden=IV.startMode!=='date';ivPreview();},
 ivcliff(el){IV.cliff=+el.dataset.v;$$('[data-act=ivcliff]').forEach(b=>b.classList.toggle('on',b===el));ivPreview();},
 ivmon(el){IV.months=+el.dataset.v;$$('[data-act=ivmon]').forEach(b=>b.classList.toggle('on',b===el));ivPreview();},
 ivflt(el){IV.filter=el.dataset.v;$$('[data-act=ivflt]').forEach(b=>b.classList.toggle('on',b===el));updateView();},
 ivgo(){const e=ivIssues();if(e.length)return toast(e[0],false);const v=ivDraft();const end=v.start+v.months*MONTH;
  confirmBox('Issue '+fmt(v.total)+' RVRB to '+IV.name.trim()+'?','<div class="kv"><div><span>Wallet</span><span class="mono">'+esc(short(IV.addr.trim(),8))+'</span></div><div><span>Round</span><span>'+IV.round+'</span></div><div><span>Paid from</span><span>'+IV.fund+'</span></div><div><span>Unlock at start</span><span>'+IV.imm+'% on '+dstr(v.start)+'</span></div><div><span>Cliff</span><span>'+mlab(IV.cliff)+'</span></div><div><span>Fully unlocked</span><span>'+dstr(end)+'</span></div><div><span>Can be stopped</span><span>'+(IV.revocable?'Yes':'No, the terms are final')+'</span></div></div><p class="muted" style="font-size:.78rem;margin-top:8px">The owner of '+IV.fund+' signs this transaction. The tokens leave the wallet at once and sit in the schedule until they unlock.</p>','Sign and issue',false,()=>{
   const s=issueOne(IV.name,IV.addr,v.total,v.start);newTx({k:'Vesting created',c:'defi',gas:14800},{amt:v.total,tok:'RVRB',label:'vesting · '+s.name});audit('Tokens issued',fmt(v.total)+' RVRB to '+s.name+' ('+s.round+') from '+s.fund,'treasury');
   toast(fmt(v.total)+' RVRB locked for '+s.name+'.');IV.name='';IV.addr='';route();});},
 ivbatch(){openSheet('Add many investors','<p class="fg2" style="font-size:.84rem">Paste one investor per line: name, wallet address, amount. Copy the columns straight from a spreadsheet. Every investor gets the terms you set on the Issue tokens card.</p><div class="fld"><label for="ivB">Investors</label><textarea class="in mono" id="ivB" rows="7" spellcheck="false" placeholder="Name, 0x…, 50000"></textarea></div><div id="ivBt"></div><div class="kv" id="ivBs"></div><button class="btn pri wide" data-act="ivbgo" id="ivBgo" disabled>Issue</button>',IV.round+' terms · paid from '+IV.fund);
  $('ivB').addEventListener('input',batchRender);batchRender();},
 ivbgo(){const b=parseBatch($('ivB').value);if(!b.rows.length||b.bad||b.over)return;const start=ivStart();if(!isFinite(start))return toast('Pick a start date on the Issue tokens card.',false);
  b.rows.forEach(r=>issueOne(r.name,r.addr,r.amt,start));newTx({k:'Vesting created',c:'defi',gas:9800+5200*b.rows.length},{amt:b.sum,tok:'RVRB',label:'vesting · '+b.rows.length+' investors'});
  audit('Tokens issued',fmt(b.sum)+' RVRB to '+b.rows.length+' investors ('+IV.round+') from '+IV.fund,'treasury');closeSheet();toast(b.rows.length+' schedules created in one transaction.');route();},
 ivview(el){const v=VEST.find(x=>x.id===el.dataset.id);if(!v)return;const t=Date.now(),un=vestedAt(v,t);const st=vStatus(v,t);
  openSheet(v.name,'<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="b '+st[0]+' dot">'+st[1]+'</span><span class="b">'+esc(v.round)+'</span>'+(v.revocable?'<span class="b">Can be stopped</span>':'<span class="b">Final terms</span>')+'</div>'
   +'<div class="g c2" style="gap:10px;margin-top:12px">'+[['Issued',v.orig],['Unlocked',un],['Claimed',v.claimed],['Locked',v.total-un]].map(x=>'<div class="box" style="padding:10px 12px"><span class="cap">'+x[0]+'</span><div class="mono" style="font-size:1.05rem">'+fmt(x[1])+'</div></div>').join('')+'</div>'
   +'<div class="vchart" style="margin-top:12px">'+vestCurve(v,{now:true,h:170})+'</div>'
   +'<div class="kv"><div><span>Wallet</span><span class="mono">'+short(v.addr,8)+'</span></div><div><span>Schedule ID</span><span class="mono">'+short(v.id,8)+'</span></div><div><span>Paid from</span><span>'+v.fund+'</span></div><div><span>Start</span><span>'+dstr(v.start)+' · '+v.imm+'% unlocked</span></div><div><span>Cliff ends</span><span>'+(v.cliff?dstr(v.start+v.cliff*MONTH):'No cliff')+'</span></div><div><span>Fully unlocked</span><span>'+dstr(v.start+v.months*MONTH)+'</span></div><div><span>Next</span><span>'+esc(vNext(v))+'</span></div></div>'
   +'<div class="btns" style="margin-top:12px"><button class="btn" data-act="copy" data-v="'+v.id+'">'+IC.copy+' Copy schedule ID</button><button class="btn" data-act="copy" data-v="'+v.addr+'">'+IC.copy+' Copy wallet</button>'+(v.revocable&&!v.revoked&&un<v.total?'<button class="btn danger" data-act="ivrev" data-id="'+v.id+'">Stop schedule</button>':'')+'</div>',v.round+' · created '+dstr(v.created));},
 ivrev(el){const v=VEST.find(x=>x.id===el.dataset.id);if(!v)return;const un=vestedAt(v,Date.now());const back=v.total-un;
  confirmBox('Stop '+v.name+'’s schedule?','<div class="kv"><div><span>Stays with '+esc(v.name)+'</span><span>'+fmt(un-v.claimed)+' RVRB still to claim</span></div><div><span>Returns to '+v.fund+'</span><span>'+fmt(back)+' RVRB</span></div></div><p class="muted" style="font-size:.78rem;margin-top:8px">Nothing more unlocks after this. The investor sees the change in Rivers Wallet and on Rivers Scan. This cannot be undone.</p>','Stop schedule',true,()=>{
   v.total=un;v.revoked=true;fundOf(v.fund).bal+=back;newTx({k:'Vesting stopped',c:'defi',gas:8600},{amt:back,tok:'RVRB',label:'vesting stopped · '+v.name});audit('Vesting stopped',v.name+': '+fmt(back)+' RVRB returned to '+v.fund,'treasury');toast(fmt(back)+' RVRB returned to '+v.fund+'.');route();});}
});
