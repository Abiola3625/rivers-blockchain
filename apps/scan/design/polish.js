/* ===================== POLISH: Scan navigation, wallet connect, Token Studio in Scan, extra infographics ===================== */
S.connected=false;
const CARET='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';
const MENU_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
const SCAN_NAV=[
 {t:'Home',h:'overview'},
 {t:'Blockchain',items:[['transactions','Transactions','Every payment, trade and settlement',IC.list],['blocks','Blocks','Produced every 250 ms',IC.cube],['validators','Validators','Who secures Rivers',IC.server],['privacy','Shielded payments','Private by design',IC.lock]]},
 {t:'Tokens',items:[['tokens','All tokens','Native, stable, cross-chain and created',IC.coins],['token','RVRB','Supply, mining and halving',IC.flame],['create','Create token','Launch your own in a few clicks',IC.cube]]},
 {t:'Cross-chain',h:'crosschain'}];

VIEWS.explorer.subs.splice(5,0,['create','Create token',IC.cube]);
EXX.create={
 build(){if(!S.connected)return `<section class="card hud"><div class="cgate"><span class="ico" style="width:64px;height:64px;border-radius:20px">${IC.cube.replace('<svg','<svg style="width:30px;height:30px"')}</span>
   <span class="eyebrow">Token Studio</span><h2>Launch a token on Rivers in under a minute</h2><p class="fg2" style="max-width:52ch">Choose a type, name it, set the supply and switch on the features you need. Rivers writes and deploys the contract for you.</p>
   <button class="btn pri" data-act="wconnect" style="padding:12px 22px">Connect wallet to start</button>
   <div class="g c3" style="width:100%;max-width:720px;margin-top:10px">${[['No code','The contract is generated and verified for you'],['Under a second','Your token is live as soon as its block is final'],['Ready to trade','Open a USDs pool at launch so anyone can buy']].map(x=>'<div class="box" style="text-align:left"><b>'+x[0]+'</b><div class="muted" style="font-size:.78rem;margin-top:4px">'+x[1]+'</div></div>').join('')}</div></div></section>`;
  return '<div class="ch"><div class="cwchip" data-act="wconnect">'+identicon(S.W.addr,24)+'<i></i>'+S.W.name+'</div><span class="muted" style="font-size:.8rem">Tokens you create are owned by this wallet</span></div>'+WVX.create.build();},
 after(){if(S.connected)WVX.create.after();},update(){if(S.connected)WVX.create.update();}};

/* ---------- activity rings ---------- */
function ringsSvg(){const R=[[84,'r1'],[66,'r2'],[48,'r3'],[30,'r4']];return '<svg class="rings" viewBox="0 0 200 200" style="width:100%;max-width:230px;height:auto" aria-hidden="true">'+R.map(([r,id],i)=>{const col=['#FFFFFF','#1FE58C','#C6F36B','#5EE6D0'][i];const cc=C.light&&i===0?'#03241A':col;const c=2*Math.PI*r;
  return '<circle cx="100" cy="100" r="'+r+'" fill="none" style="stroke:'+cc+'" stroke-opacity=".12" stroke-width="13"/><circle class="p" id="'+id+'" cx="100" cy="100" r="'+r+'" fill="none" style="stroke:'+cc+';filter:drop-shadow(0 0 5px '+cc+')" stroke-width="13" stroke-linecap="round" stroke-dasharray="0 '+c.toFixed(1)+'" transform="rotate(-90 100 100)"/>';}).join('')+'</svg>';}
function ringsSet(vals){[[84,'r1'],[66,'r2'],[48,'r3'],[30,'r4']].forEach(([r,id],i)=>{const el=$(id);if(!el)return;const c=2*Math.PI*r;el.setAttribute('stroke-dasharray',(c*clamp(vals[i],0,1)).toFixed(1)+' '+c.toFixed(1));});}
/* ---------- treemap ---------- */
function tmapLayout(items,x,y,w,h,out){if(!items.length)return;if(items.length===1){out.push(Object.assign({},items[0],{x,y,w,h}));return;}const tot=items.reduce((a,b)=>a+b.v,0);let acc=0,i=0;for(;i<items.length-1;i++){acc+=items[i].v;if(acc>=tot/2)break;}
  const A=items.slice(0,i+1),B=items.slice(i+1);const fa=A.reduce((a,b)=>a+b.v,0)/tot;if(w>=h){tmapLayout(A,x,y,w*fa,h,out);tmapLayout(B,x+w*fa,y,w*(1-fa),h,out);}else{tmapLayout(A,x,y,w,h*fa,out);tmapLayout(B,x,y+h*fa,w,h*(1-fa),out);}}
function treemap(){const items=topTokens().slice(0,11).map(x=>({t:x.t,v:x.tvl}));const out=[];const TW=innerWidth<700?600:1200,TH=innerWidth<700?360:300;tmapLayout(items,0,0,TW,TH,out);const mx=items[0]?items[0].v:1;
  return '<svg class="tm" viewBox="0 0 '+TW+' '+TH+'" style="width:100%;height:auto" aria-label="Liquidity by token">'+out.map(r=>{const f=r.v/mx;const big=r.w>70&&r.h>40;return '<g data-act="asset" data-id="'+r.t+'"><rect x="'+(r.x+2)+'" y="'+(r.y+2)+'" width="'+Math.max(0,r.w-4)+'" height="'+Math.max(0,r.h-4)+'" rx="10" style="fill:'+greenRamp(.18+f*.75)+';stroke:var(--hair2)"/>'+
   (big?'<text x="'+(r.x+12)+'" y="'+(r.y+24)+'" style="fill:'+(f>.55&&!C.light?'#012014':'var(--fg)')+'" font-size="14" font-family="Manrope,sans-serif" font-weight="800">'+r.t+'</text><text x="'+(r.x+12)+'" y="'+(r.y+40)+'" style="fill:'+(f>.55&&!C.light?'#013A23':'var(--muted)')+'" font-size="10.5">$'+compact(r.v)+'</text>':'')+'</g>';}).join('')+'</svg>';}
/* ---------- activity calendar ---------- */
const CALD=Array.from({length:7},(_,d)=>Array.from({length:24},(_,h)=>(0.55+0.45*Math.sin((h-7)/24*Math.PI*2))*(d>=5?.78:1)*rnd(.88,1.12)));
function calendar(){const mx=Math.max(...CALD.flat());const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return '<div class="cal">'+CALD.map((row,d)=>'<span>'+days[d]+'</span>'+row.map((v,h)=>'<i style="background:'+greenRamp(v/mx)+'" title="'+days[d]+' '+String(h).padStart(2,'0')+':00 · '+fmt(v/mx*2300*3600)+' transactions"></i>').join('')).join('')+'<span></span>'+Array.from({length:24},(_,h)=>'<span style="text-align:center">'+(h%6===0?String(h).padStart(2,'0'):'')+'</span>').join('')+'</div>';}
/* ---------- marquee ---------- */
function marquee(){const l=S.txs.slice(0,22);const chip=t=>'<a data-act="tx" data-id="'+t.id+'"><i style="background:'+C.types[t.c]+'"></i>'+t.type+' · '+short(t.id,5)+' · '+(t.amt==null?'shielded':fmt(t.amt,t.tok==='RVRB'?2:0)+' '+t.tok)+'</a>';const h=l.map(chip).join('');return '<div class="trk">'+h+h+'</div>';}

/* ---------- extend Scan home ---------- */
(function(){const v=VIEWS.explorer;const b=v.build,a=v.after,u=v.update;
 v.build=function(s){let h=b.call(this,s);if(s!=='overview')return h;
  const i1=h.indexOf('</section>')+10;h=h.slice(0,i1)+'<div class="mq" id="mq" aria-label="Latest transactions"></div>'+h.slice(i1);
  const blk='<section class="card"><div class="ch"><h2><span class="ico">'+IC.cube+'</span>Live blocks';const i2=h.indexOf(blk);
  const row=`<div class="g c3 ais"><section class="card hud"><div class="ch"><h2><span class="ico">${IC.activity}</span>Network at a glance</h2><span class="live">Live</span></div><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:16px;align-items:center"><div id="rgs">${ringsSvg()}</div><div class="rl" id="rgl"></div></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.flame}</span>Gas tracker</h2><span class="sub">Simple transfer</span></div><div class="gas" id="gasT"></div><div class="kv" id="gasK"></div></section>
   <section class="card"><div class="ch"><h2><span class="ico">${IC.clock}</span>Activity by hour</h2><span class="sub">Last 7 days</span></div><div id="cal"></div><div class="legend"><span>Less</span>${[.1,.3,.5,.7,.95].map(x=>'<i class="sq" style="background:'+greenRamp(x)+'"></i>').join('')}<span>More</span></div></section></div>`;
  if(i2>0)h=h.slice(0,i2)+row+h.slice(i2);
  const tt='<span class="ico">'+IC.coins+'</span>Top tokens</h2>';const i3=h.indexOf(tt);const i4=h.lastIndexOf('<div class="g c2 ais">',i3);
  const row2=`<section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.grid}</span>Liquidity map</h2><span class="sub">Value in Rivers DEX pools by token</span></div><a class="btn sm" href="#explorer-tokens">All tokens</a></div><div id="tmap"></div></section>`;
  if(i4>0)h=h.slice(0,i4)+row2+h.slice(i4);return h;};
 v.after=function(s){a.call(this,s);if(s==='overview'){$('cal').innerHTML=calendar();$('mq').innerHTML=marquee();$('tmap').innerHTML=treemap();}};
 v.update=function(s){u.call(this,s);if(s!=='overview')return;const st=stakedTotal(),circ=circulating();const vals=[st/circ,onlinePower(),S.emitted/MINED,epochLeft().f];ringsSet(vals);
  const cols=[C.light?'#03241A':'#FFFFFF','#1FE58C','#C6F36B','#5EE6D0'];$('rgl').innerHTML=[['Staked',pct(vals[0],1),compact(st)+' RVRB'],['Voting power online',pct(vals[1],1),activeVals().filter(x=>x.on).length+' validators'],['Mined',pct(vals[2],2),compact(S.emitted)+' of 11M'],['Epoch '+S.epoch,pct(vals[3],0),hm(epochLeft().left)+' left']].map((r,i)=>'<div><i style="background:'+cols[i]+';box-shadow:0 0 8px '+cols[i]+'"></i><span><b>'+r[0]+'</b><br><span class="muted" style="font-size:.72rem">'+r[2]+'</span></span><span class="mono">'+r[1]+'</span></div>').join('');
  const g=P.gasPrice,usdR=usdOf('RVRB');$('gasT').innerHTML=[['Standard',g,''],['Fast',Math.round(g*1.2),'mid'],['Priority',Math.round(g*1.6),'']].map(x=>{const fee=2100*x[1]/DROPS;return '<div class="t '+x[2]+'"><span class="cap">'+x[0]+'</span><span class="v">'+fmt(x[1])+'</span><span class="muted" style="font-size:.7rem">drops per gas</span><span class="mono" style="font-size:.74rem">'+fmtA(fee)+' RVRB</span><span class="muted" style="font-size:.7rem">$'+fmt(fee*usdR,4)+'</span></div>';}).join('');
  $('gasK').innerHTML='<div><span>Confirms in</span><span>about '+fmt(S.fin||S.base)+' ms at every tier</span></div><div><span>Sponsored transactions</span><span>'+(M.sponsor?'On':'Off')+'</span></div>';
  if(!EX._tmT||Date.now()-EX._tmT>4000){EX._tmT=Date.now();const t=$('tmap');if(t)t.innerHTML=treemap();}}})();

/* ---------- wallet connect ---------- */
Object.assign(XACT,{
 wconnect(){if(S.connected){openSheet('Connected wallet','<div style="display:flex;gap:14px;align-items:center">'+identicon(S.W.addr,52)+'<div><b style="font-size:1.05rem">'+S.W.name+'</b><div class="mono muted" style="font-size:.76rem">'+short(S.W.addr,10)+'</div></div></div><div class="kv"><div><span>RVRB</span><span>'+fmt(S.W.bal.RVRB,4)+'</span></div><div><span>USDs</span><span>'+fmt(S.W.bal.USDs,2)+'</span></div><div><span>Network</span><span>Rivers Testnet</span></div></div><div class="btns"><a class="btn pri" href="#wallet" data-act="closesh">Open Rivers Wallet</a><button class="btn danger" data-act="wdisc">Disconnect</button></div>','Signed in with passkey');return;}
  openSheet('Connect a wallet',[['rivers','Rivers Wallet','Sign in with your passkey',IC.wallet],['phone','Rivers Wallet on your phone','Approve on your phone',IC.phone],['hw','Hardware key','Ledger or any FIDO2 key',IC.key]].map(o=>'<button class="wopt" data-act="wpick" data-v="'+o[0]+'"><span class="ico" style="width:40px;height:40px;border-radius:13px">'+o[3]+'</span><span style="flex:1"><b>'+o[1]+'</b><br><span class="muted" style="font-size:.78rem">'+o[2]+'</span></span>'+CARET.replace('<svg','<svg style="width:14px;height:14px;transform:rotate(-90deg)"')+'</button>').join('')+'<p class="muted" style="font-size:.76rem">Connecting lets Rivers Scan ask your wallet to approve actions. It cannot move funds without your approval.</p>','Choose how to sign in');},
 wpick(el){const n={rivers:'Rivers Wallet',phone:'your phone',hw:'your hardware key'}[el.dataset.v];$('shB').innerHTML='<div class="cgate"><div class="spin"></div><b>Waiting for '+n+'…</b><span class="muted" style="font-size:.8rem">Approve the request to connect</span></div>';
  setTimeout(()=>{S.connected=true;closeSheet();toast('Connected as '+S.W.name+'.');route();},1100);},
 wdisc(){S.connected=false;closeSheet();toast('Wallet disconnected.');route();},
 mmenu(){openSheet('Rivers Scan','<div class="mmenu">'+SCAN_NAV.map(g=>g.items?'<div class="grp"><span class="cap">'+g.t+'</span>'+g.items.map(i=>'<a href="#explorer-'+i[0]+'" data-act="closesh" class="'+(CUR.sub===i[0]?'on':'')+'"><span class="ico">'+i[3]+'</span>'+i[1]+'</a>').join('')+'</div>':'<a href="#explorer-'+g.h+'" data-act="closesh" class="'+(CUR.sub===g.h?'on':'')+'"><span class="ico">'+(g.h==='overview'?IC.home:IC.bridge)+'</span>'+g.t+'</a>').join('')+
   '<button class="btn '+(S.connected?'':'pri')+' wide" data-act="wconnect">'+(S.connected?'Connected as '+S.W.name:'Connect wallet')+'</button></div>','Menu');}
});

/* ---------- cursor spotlight + scroll reveal ---------- */
document.addEventListener('pointermove',e=>{const el=e.target.closest&&e.target.closest('.card,.kpi');if(!el)return;const r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});
let revealIO=null;
function polishAfterRoute(){if(reduce||!('IntersectionObserver' in window))return;revealIO&&revealIO.disconnect();revealIO=new IntersectionObserver(en=>en.forEach(x=>{if(x.isIntersecting){x.target.classList.add('pop');revealIO.unobserve(x.target);}}),{rootMargin:'0px 0px -30px 0px'});
  $$('#page .card,#page .kpi').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)revealIO.observe(el);});}

/* ===================== TRANSACTIONS: table or live view; transaction page: visual or classic ===================== */
EX.txView='table';EX.txMode='visual';
const TL={p:[],chain:[],fill:0,lastN:0,flash:0,last:performance.now()};
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function drawTxLive(now){const cv=$('txLive');if(!cv||!cv._w)return;const c=cv.getContext('2d'),W=cv._w,H=cv._h;const dt=Math.min(.05,(now-TL.last)/1000);TL.last=now;c.clearRect(0,0,W,H);
  const nar=W<640,bx=W*(nar?.3:.34),by=H*.5,bs=Math.min(nar?96:132,W*.2);
  /* backdrop rings */
  c.strokeStyle=C.grid;for(let i=1;i<6;i++){c.beginPath();c.arc(bx,by,bs*.6+i*48,0,7);c.stroke();}
  /* spawn particles in proportion to throughput */
  const rate=S.halted?0:S.tps/2000*46*dt;let n=Math.floor(rate)+(Math.random()<rate%1?1:0);
  while(n--){const t=pickTT();const a=rnd(Math.PI*.5,Math.PI*1.5);const r=Math.max(W*.45,H*.75);TL.p.push({x:bx+Math.cos(a)*r,y:by+Math.sin(a)*r*.75,c:t.c,t:0,sp:rnd(.45,.85),sz:rnd(1.6,3.4),bend:rnd(-1,1),px:null,py:null});}
  if(TL.p.length>900)TL.p.splice(0,TL.p.length-900);
  c.globalCompositeOperation=C.light?'source-over':'lighter';
  TL.p=TL.p.filter(p=>{p.t+=dt*p.sp*(S.halted?.1:1);const k=Math.min(1,p.t),e=k*k*(3-2*k);const x=p.x+(bx-p.x)*e+Math.sin(k*Math.PI)*p.bend*50,y=p.y+(by-p.y)*e;const col=C.types[p.c];
    if(p.px!=null){c.strokeStyle=col;c.globalAlpha=.35;c.lineWidth=p.sz*.8;c.beginPath();c.moveTo(p.px,p.py);c.lineTo(x,y);c.stroke();}
    c.globalAlpha=.95;c.fillStyle=col;c.beginPath();c.arc(x,y,p.sz*(1-k*.5),0,7);c.fill();c.globalAlpha=.12;c.beginPath();c.arc(x,y,p.sz*4,0,7);c.fill();p.px=x;p.py=y;
    if(k>=1){TL.fill++;return false;}return true;});
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
  /* seal a block whenever the chain produces one */
  const top=S.cps[0];if(top&&top.n!==TL.lastN){const from=TL.lastN&&top.n-TL.lastN<6?TL.lastN+1:top.n;for(let k=from;k<=top.n;k++){const cb=S.cps.find(x=>x.n===k)||top;TL.chain.unshift({n:k,x:bx,txc:cb.txc,ms:cb.ms});}TL.lastN=top.n;TL.flash=1;TL.fill=0;while(TL.chain.length>16)TL.chain.pop();}
  const sb=bs*.62,gap=14;
  TL.chain.forEach((b,i)=>{const tx=bx+bs/2+26+i*(sb+gap);b.x+=(tx-b.x)*Math.min(1,dt*9);const y=by-sb/2;const a=Math.max(.15,1-i*.07);
    if(i>0){const pb=TL.chain[i-1];c.strokeStyle=C.acc;c.globalAlpha=.35*a;c.lineWidth=2;c.beginPath();c.moveTo(pb.x+sb,by);c.lineTo(b.x,by);c.stroke();}
    c.globalAlpha=a;const g=c.createLinearGradient(b.x,y,b.x,y+sb);g.addColorStop(0,C.light?'#E6F5EC':'rgba(31,229,140,.22)');g.addColorStop(1,C.light?'#FFFFFF':'rgba(5,23,14,.9)');c.fillStyle=g;rr(c,b.x,y,sb,sb,12);c.fill();c.strokeStyle=i===0?C.acc:C.hair3;c.lineWidth=i===0?1.8:1;c.stroke();
    if(sb>50){c.fillStyle=C.fg;c.font='500 '+Math.round(sb*.15)+'px "JetBrains Mono", monospace';c.textAlign='center';c.fillText('#'+String(b.n).slice(-4),b.x+sb/2,by-2);c.fillStyle=C.mut;c.font='600 '+Math.round(sb*.11)+'px Manrope, sans-serif';c.fillText(b.txc+' tx',b.x+sb/2,by+sb*.2);}});
  TL.hit=TL.chain.map(b=>({n:b.n,x:b.x,y:by-sb/2,s:sb}));
  c.globalAlpha=1;
  /* the block being filled */
  const x0=bx-bs/2,y0=by-bs/2;const target=(top?top.txc:500)/12;const lvl=clamp(TL.fill/Math.max(1,target),0,1);
  c.save();c.shadowColor=C.acc;c.shadowBlur=C.light?0:24+TL.flash*30;c.fillStyle=C.light?'#FFFFFF':'rgba(3,18,10,.95)';rr(c,x0,y0,bs,bs,20);c.fill();c.restore();
  c.save();rr(c,x0,y0,bs,bs,20);c.clip();const fg=c.createLinearGradient(0,y0+bs,0,y0);fg.addColorStop(0,C.deep);fg.addColorStop(1,C.acc);c.fillStyle=fg;c.globalAlpha=.85;const fh=bs*lvl;c.fillRect(x0,y0+bs-fh,bs,fh);
  c.globalAlpha=.5;c.strokeStyle='#FFFFFF';c.lineWidth=1.5;c.beginPath();for(let x=0;x<=bs;x+=4){const yy=y0+bs-fh+Math.sin(now/220+x/12)*3;x?c.lineTo(x0+x,yy):c.moveTo(x0+x,yy);}c.stroke();c.restore();
  c.strokeStyle=C.acc;c.lineWidth=2;rr(c,x0,y0,bs,bs,20);c.stroke();
  if(TL.flash>0){c.strokeStyle=C.acc;c.globalAlpha=TL.flash;c.lineWidth=2;const e=1-TL.flash;rr(c,x0-e*26,y0-e*26,bs+e*52,bs+e*52,20+e*20);c.stroke();c.globalAlpha=1;TL.flash=Math.max(0,TL.flash-dt*2.4);}
  c.textAlign='center';c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=C.light?0:8;c.fillStyle=C.light&&lvl<.5?C.fg:'#FFFFFF';c.font='500 '+Math.round(bs*.105)+'px "JetBrains Mono", monospace';c.fillText('#'+fmt((top?top.n:0)+1),bx,by-4);
  c.font='700 '+Math.round(bs*.085)+'px Manrope, sans-serif';c.fillStyle=C.light&&lvl<.5?C.mut:'rgba(255,255,255,.85)';c.fillText(S.halted?'PAUSED':'FILLING · '+Math.round(lvl*100)+'%',bx,by+bs*.16);c.restore();c.textAlign='left';
  if(!nar){c.font='700 10px Manrope, sans-serif';c.fillStyle=C.mut;c.fillText('INCOMING TRANSACTIONS',16,22);c.textAlign='right';c.fillText('FINALISED BLOCKS →',W-16,22);c.textAlign='left';}}
function txKpis(){setNum($('t1'),S.tps,v=>fmt(v)+' TPS');$('t1s').textContent='2,000 sustained target';setNum($('t2'),S.txToday,compact);$('t2s').textContent='since 00:00 UTC';$('t3').textContent=fmtA(2100*P.gasPrice/DROPS)+' RVRB';$('t3s').textContent='simple transfer';
  $('t4').textContent=pct((S.mix.private||0)/Math.max(1,Object.values(S.mix).reduce((a,b)=>a+b,0)),1);$('t4s').textContent='of all transactions';}
(function(){const v=VIEWS.explorer;const b=v.build,a=v.after,u=v.update;
 const seg=()=>'<div class="ch"><div class="seg" role="tablist" aria-label="Transactions view"><button data-act="txv" data-v="table" class="'+(EX.txView==='table'?'on':'')+'">'+IC.list.replace('<svg','<svg width="13" height="13" style="vertical-align:-2px;margin-right:6px"')+'Table</button><button data-act="txv" data-v="live" class="'+(EX.txView==='live'?'on':'')+'">'+IC.activity.replace('<svg','<svg width="13" height="13" style="vertical-align:-2px;margin-right:6px"')+'Live view</button></div><span class="live">Streaming</span></div>';
 v.build=function(s){if(s!=='transactions')return b.call(this,s);if(EX.txView==='table')return seg()+b.call(this,s);
  return seg()+`<div class="g c4 rise">${kpi('t1','Throughput',IC.bolt)}${kpi('t2','Transactions today',IC.activity)}${kpi('t3','Average fee',IC.flame)}${kpi('t4','Shielded share',IC.lock)}</div>
   <section class="card hud" style="padding:0;overflow:hidden"><canvas class="ch" id="txLive" aria-label="Transactions streaming into the next block"></canvas>
    <div class="legend" style="padding:0 18px 16px">${Object.keys(TNAME).map(k=>'<span><i class="sq" style="background:'+C.types[k]+'"></i>'+TNAME[k]+'</span>').join('')}</div></section>
   <div class="g c2 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.list}</span>Latest transactions</h2><span class="live">Live</span></div><div class="list" id="txLs"></div></section>
    <section class="card"><div class="ch"><h2><span class="ico">${IC.cube}</span>Latest blocks</h2></div><div class="list" id="txLb"></div></section></div>`;};
 v.after=function(s){if(s==='transactions'&&EX.txView==='live'){const cv=$('txLive');fitCanvas(cv,innerWidth<700?360:460);TL.chain=[];TL.lastN=0;cv.style.cursor='default';
   cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;cv.style.cursor=(TL.hit||[]).some(h=>x>=h.x&&x<=h.x+h.s&&y>=h.y&&y<=h.y+h.s)?'pointer':'default';});
   cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const h=(TL.hit||[]).find(h=>x>=h.x&&x<=h.x+h.s&&y>=h.y&&y<=h.y+h.s);if(h)location.hash='explorer-block-'+h.n;});return;}a.call(this,s);};
 v.update=function(s){if(s==='transactions'&&EX.txView==='live'){txKpis();updStream($('txLs'));$('txLb').innerHTML=S.cps.slice(0,8).map(cpRow).join('');return;}u.call(this,s);};
 const tb=EXX.tx.build;EXX.tx.build=function(){const t=S.txs.find(x=>x.id===CUR.param)||S.W.mine.find(x=>x.id===CUR.param);
  const sw='<div class="ch"><div class="seg" role="tablist" aria-label="Transaction layout"><button data-act="txm" data-v="visual" class="'+(EX.txMode==='visual'?'on':'')+'">Visual</button><button data-act="txm" data-v="classic" class="'+(EX.txMode==='classic'?'on':'')+'">Classic</button></div></div>';
  if(!t)return tb();EXX._t=t;return sw+(EX.txMode==='classic'?classicTx(t):tb());};})();
function classicTx(t){const priv=t.c==='private';const conf=Math.max(0,Math.floor(S.cp)-t.cp);const usdv=t.amt!=null?t.amt*usdOf(t.tok):0;const cp=v=>' <button class="icobtn" style="width:26px;height:26px;display:inline-grid;vertical-align:middle" data-act="copy" data-v="'+v+'" aria-label="Copy">'+IC.copy.replace('<svg','<svg style="width:12px;height:12px"')+'</button>';
 const rows=[['Transaction digest','<span class="mono" style="word-break:break-all">'+t.id+'</span>'+cp(t.id)],['Status',t.final?'<span class="b ok dot">Final</span>':'<span class="b info dot">Committing</span>'],
  ['Block','<a href="#explorer-block-'+t.cp+'" class="mono" style="color:var(--river)">#'+fmt(t.cp)+'</a> <span class="b mute">'+fmt(conf)+' blocks since</span>'],['Timestamp',ago(t.t)+' <span class="muted">('+new Date(t.t).toUTCString()+')</span>'],['Type','<span class="ty '+t.c+'">'+t.type+'</span>'],null,
  ['From',priv?'<span class="b mute">Shielded</span>':'<span class="mono">'+t.from+'</span>'+cp(t.from)],['To',priv?'<span class="b mute">Shielded</span>':'<span class="mono">'+t.to+'</span>'+cp(t.to)],null,
  ['Value',priv?'<span class="b mute">Shielded</span>':'<b class="mono">'+fmt(t.amt,t.tok==='RVRB'?4:2)+' '+t.tok+'</b> <span class="muted">($'+fmt(usdv,2)+')</span>'],
  ['Transaction fee',priv?'Paid from the shielded pool':t.sponsored?'<span class="b info">Sponsored</span> <span class="mono muted">'+fmtA(t.fee)+' RVRB</span>':'<span class="mono">'+fmtA(t.fee)+' RVRB</span> <span class="muted">($'+fmt(t.fee*usdOf('RVRB'),5)+')</span>'],
  ['Gas price','<span class="mono">'+fmt(P.gasPrice)+' drops</span> <span class="muted">('+fmtA(P.gasPrice/DROPS)+' RVRB)</span>'],['Gas used','<span class="mono">'+fmt(t.gas)+'</span>'],['Finality','<span class="mono">'+t.ms+' ms</span>'],['Objects changed','<span class="mono">'+t.objs+'</span>'],['Events','<span class="mono">'+t.events+'</span>']]
  .concat(priv?[null,['Commitment','<span class="mono" style="word-break:break-all">'+t.commitment+'</span>'],['Nullifier','<span class="mono" style="word-break:break-all">'+t.nullifier+'</span>'],['Proof','<span class="b ok dot">Valid</span>']]:[]);
 return '<section class="card"><div class="ch"><h2>Transaction details</h2><a class="btn sm" href="#explorer-transactions">All transactions</a></div><div class="ctable">'+rows.map(r=>r?'<div class="cr"><span class="cl">'+r[0]+'</span><span class="cv">'+r[1]+'</span></div>':'<div class="sep"></div>').join('')+'</div></section>'+
  '<section class="card"><div class="ch"><h2>Raw</h2></div><pre>'+esc(JSON.stringify(priv?{digest:t.id,kind:'shielded_transfer',block:t.cp,commitments:[t.commitment],nullifiers:[t.nullifier],proof:'groth16:valid'}:{digest:t.id,kind:t.type,status:t.final?'final':'pending',block:t.cp,sender:t.from,recipient:t.to,amount:String(t.amt),coin:t.tok,gas_used:t.gas,gas_price_drops:P.gasPrice,fee_rvrb:+t.fee.toFixed(8),sponsored:t.sponsored,latency_ms:t.ms},null,2))+'</pre></section>';}
Object.assign(XACT,{txv(el){EX.txView=el.dataset.v;route();},txm(el){EX.txMode=el.dataset.v;route();}});
