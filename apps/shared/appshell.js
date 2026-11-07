/* ===================== RIVERS INTERFACE SHELL =====================
   One shell for every Rivers interface. Each site sets RV_APP and serves only that interface. */
const APPS=['explorer','wallet','institutions','console','validator'];
const PROD={explorer:{name:'Rivers Scan',tag:'Public explorer',who:'For everyone',skin:'dark'},wallet:{name:'Rivers Wallet',tag:'Wallet and DeFi',who:'For users',skin:'dark'},
  institutions:{name:'Rivers Connect',tag:'Institution portal',who:'For banks and payment firms',skin:'light'},console:{name:'Rivers Core',tag:'Administration',who:'For the Rivers administrators',skin:'dark'},validator:{name:'Rivers Validator',tag:'Validator dashboard',who:'For validator operators',skin:'dark'}};
const SKIN={};APPS.forEach(a=>SKIN[a]=PROD[a].skin);SKIN.home='dark';
let CUR={app:'home',sub:''};

/* This site serves one interface, RV_APP. Hashes of other interfaces fall back to its first page. */
function parseHash(){let h=(location.hash||'').slice(1);if(!h||h==='home'||!h.startsWith(RV_APP))h=RV_APP+'-'+VIEWS[RV_APP].subs[0][0];const [a,...r]=h.split('-');if(VIEWS[a].hidden&&VIEWS[a].hidden[r[0]]&&r.length>1)return {app:a,sub:r[0],param:r.slice(1).join('-')};const subs=VIEWS[a].subs.map(s=>s[0]);const sub=subs.includes(r.join('-'))?r.join('-'):subs[0];return {app:a,sub};}
function skinBtn(){return '<button class="skin" data-act="skin" aria-label="Switch light or dark">'+(document.body.dataset.skin==='light'?IC.moon:IC.sun)+'</button>';}
function subTitle(){const v=VIEWS[CUR.app];if(v.hidden&&v.hidden[CUR.sub])return v.hidden[CUR.sub];return (v.subs.find(s=>s[0]===CUR.sub)||v.subs[0])[1];}
function sheetHtml(){return `<div class="scrim" id="scrim" hidden></div>
<aside class="sheet" id="sheet" hidden role="dialog" aria-modal="true" aria-labelledby="shT"><div class="sh"><div><h3 id="shT" style="font-size:1.05rem"></h3><div class="muted" style="font-size:.76rem" id="shS"></div></div><button class="icobtn" id="shX" aria-label="Close">${IC.close}</button></div><div class="sb" id="shB"></div></aside>
<div class="modal" id="modal" hidden role="alertdialog" aria-modal="true" aria-labelledby="mT"><h3 id="mT" style="font-size:1.08rem"></h3><div id="mB"></div><div class="btns" style="justify-content:flex-end"><button class="btn" id="mX">Cancel</button><button class="btn pri" id="mGo">Confirm</button></div></div>
<div class="toast" id="toast" hidden role="status"></div>`;}
function switcher(){return '<nav class="pv" aria-label="Preview switcher"><span>PREVIEW</span>'+[['home','All'],['explorer','Scan'],['wallet','Wallet'],['institutions','Connect']].map(x=>'<a href="#'+x[0]+'" class="'+(CUR.app===x[0]?'on':'')+'">'+x[1]+'</a>').join('')+'</nav>';}
function logoBlock(app,href){return '<a class="logo" href="#'+(href||app)+'">'+logoSvg(34)+'<span><b>RIVERS</b><small>'+(app==='home'?'BLOCKCHAIN · RVRB':PROD[app].name.replace('Rivers ','').toUpperCase())+'</small></span></a>';}

function shellHub(){return `<div class="hub"><div class="hubin">
 <div class="hubh rise"><div style="display:flex;gap:14px;align-items:center">${logoSvg(52)}<span class="prod">Rivers Blockchain · RVRB</span></div>
  <h1>Four products.<br>One <em>free-flowing</em> ledger.</h1><p class="fg2" style="max-width:62ch;font-size:1.02rem">Each product ships as its own app with its own sign-in. This preview runs all four on the same live test network, so an action in one shows up in the others.</p>
  <div class="tickin" id="tick" style="margin-top:6px"></div></div>
 <div class="prods rise">${APPS.filter(a=>a!=='console').map(a=>'<a class="pcard" href="#'+a+'"><svg class="art" viewBox="0 0 260 130" aria-hidden="true">'+prodArt(a)+'</svg><span class="prod" style="justify-self:start">'+PROD[a].tag+'</span><h3>'+PROD[a].name+'</h3><span class="who">'+PROD[a].who+'</span><span class="fg2" style="font-size:.84rem">'+({explorer:'Live transactions, blocks, validators, the RVRB token and shielded payments.',wallet:'Send, swap, stake, lend, bridge. Passkey sign-in, no seed phrase.',institutions:'ISO 20022 payments, liquidity, compliance and developer tools for banks.',console:'Network parameters, module switches, validators, endpoints, drills and audit.'})[a]+'</span></a>').join('')}</div>
</div></div>`;}
function prodArt(a){const g='<defs><linearGradient id="pa'+a+'" x1="0" x2="1"><stop offset="0" stop-color="#008751"/><stop offset="1" stop-color="#1FE58C"/></linearGradient></defs>';
 if(a==='explorer'){let d='';for(let i=0;i<70;i++){const x=10+(i*37)%240,y=12+((i*53)%100);d+='<circle cx="'+x+'" cy="'+y+'" r="1.6" fill="#1FE58C" opacity="'+(.2+((i*7)%10)/14)+'"/>';}return g+d+'<path d="M10 110 L50 92 L90 98 L130 70 L170 76 L210 40 L250 48" fill="none" stroke="url(#pa'+a+')" stroke-width="3" stroke-linecap="round"/><circle cx="210" cy="40" r="5" fill="#FFFFFF"/>';}
 if(a==='wallet')return g+'<rect x="80" y="4" width="100" height="122" rx="18" fill="#05170E" stroke="#1FE58C" stroke-opacity=".4"/><rect x="92" y="18" width="76" height="40" rx="10" fill="url(#pa'+a+')"/><text x="100" y="44" font-size="12" fill="#012014" font-family="JetBrains Mono">$13,864</text>'+[0,1,2].map(i=>'<rect x="92" y="'+(66+i*17)+'" width="76" height="11" rx="5" fill="#1FE58C" opacity="'+(.25-i*.06)+'"/>').join('');
 if(a==='institutions')return g+'<path d="M60 40 L130 14 L200 40 Z" fill="none" stroke="url(#pa'+a+')" stroke-width="3"/>'+[0,1,2,3].map(i=>'<rect x="'+(72+i*34)+'" y="46" width="12" height="50" rx="3" fill="#1FE58C" opacity=".7"/>').join('')+'<rect x="56" y="100" width="148" height="8" rx="4" fill="#FFFFFF"/><path d="M20 120 Q130 60 240 120" fill="none" stroke="#5EE6D0" stroke-dasharray="4 5" stroke-width="2"/>';
 return g+'<circle cx="130" cy="70" r="52" fill="none" stroke="#1FE58C" stroke-opacity=".2" stroke-width="10"/><path d="M78 70 A52 52 0 0 1 172 40" fill="none" stroke="url(#pa'+a+')" stroke-width="10" stroke-linecap="round"/><text x="130" y="76" text-anchor="middle" font-size="22" fill="#FFFFFF" font-family="JetBrains Mono">99</text>'+[0,1,2,3,4].map(i=>'<rect x="'+(20+i*6)+'" y="'+(100-i*12)+'" width="4" height="'+(20+i*12)+'" fill="#1FE58C" opacity=".6"/>').join('');}

function navScan(){return SCAN_NAV.map(g=>{if(!g.items)return '<a href="#explorer-'+g.h+'" class="'+(CUR.sub===g.h?'on':'')+'">'+g.t+'</a>';const on=g.items.some(i=>i[0]===CUR.sub)||(g.t==='Blockchain'&&['tx','block','validator'].includes(CUR.sub))||(g.t==='Tokens'&&CUR.sub==='asset');
  return '<div class="dd '+(on?'on':'')+'"><button type="button" aria-haspopup="true">'+g.t+CARET+'</button><div class="menu" role="menu">'+g.items.map(i=>'<a href="#explorer-'+i[0]+'" role="menuitem"><span class="ico">'+i[3]+'</span><b>'+i[1]+'</b><small>'+i[2]+'</small></a>').join('')+'</div></div>';}).join('');}
function shellScan(){const tb=[['overview','Home',IC.home],['transactions','Txns',IC.list],['blocks','Blocks',IC.cube],['tokens','Tokens',IC.coins]];
 return `<header class="xtop"><div class="xtopin">${logoBlock('explorer')}
  <nav class="xnav" aria-label="Rivers Scan">${navScan()}</nav>
  <form class="search" id="gs" role="search"><span>${IC.search}</span><label for="gq" style="position:absolute;left:-9999px">Search Rivers</label><input id="gq" placeholder="Search by digest, block, validator or token" autocomplete="off"></form>
  ${skinBtn()}${S.connected?'<button class="cwchip cw" data-act="wconnect">'+identicon(S.W.addr,24)+'<i></i>'+S.W.name+'</button>':'<button class="btn pri sm cw" data-act="wconnect">Connect wallet</button>'}<button class="icobtn hamb" data-act="mmenu" aria-label="Open menu">${MENU_ICON}</button></div>
  <div class="xtick"><div class="tickin" id="tick"></div></div></header>
 <main class="page" id="page"></main>
 <footer class="xfoot"><div class="xfootin"><div><div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">${logoSvg(28)}<b style="margin:0;font-family:var(--f-display);letter-spacing:.05em">RIVERS SCAN</b></div><p>The open explorer for the Rivers network. Chain ID rivers-test-2.</p></div>
  <div><b>Blockchain</b><a href="#explorer-transactions">Transactions</a><a href="#explorer-blocks">Blocks</a><a href="#explorer-validators">Validators</a><a href="#explorer-privacy">Shielded payments</a></div>
  <div><b>Tokens</b><a href="#explorer-tokens">All tokens</a><a href="#explorer-token">RVRB</a><a href="#explorer-create">Create token</a></div>
  <div><b>Products</b><a href="#wallet">Rivers Wallet</a><a href="#institutions">Rivers Connect</a><a href="#explorer-crosschain">Cross-chain gateway</a></div></div></footer>
 <nav class="tabbar" aria-label="Rivers Scan">${tb.map(t=>'<a href="#explorer-'+t[0]+'" class="'+(CUR.sub===t[0]?'on':'')+'">'+t[2]+'<span>'+t[1]+'</span></a>').join('')}<a href="#" data-act="mmenu" onclick="return false">${MENU_ICON}<span>Menu</span></a></nav>`;}
function rvTop(app){const who=WAL.addr?'<button class="chip" data-act="wconnect" style="cursor:pointer">'+identicon(WAL.addr,26)+'<span class="trunc" style="max-width:180px">'+esc(typeof rvWho==='function'&&rvWho()||short(WAL.addr,4))+'</span></button>':'<button class="btn pri sm" data-act="wconnect">'+(app==='wallet'?'Open wallet':'Sign in')+'</button>';
 return (typeof rvBadge==='function'?rvBadge():'')+'<span class="b warn dot">Testnet</span>'+who;}
function shellRail(app){const v=VIEWS[app];const p=PROD[app];const compact=app==='wallet';
 const top=rvTop(app);
 return `<div class="rs ${compact?'compact':''}"><aside class="rail" aria-label="${p.name}">${compact?'<a class="logo" href="#wallet">'+logoSvg(38)+'</a>':logoBlock(app)}
  <div class="grp">${compact?'':'<span class="gl">'+p.tag+'</span>'}${v.subs.map(s=>'<a class="it '+(CUR.sub===s[0]?'on':'')+'" href="#'+app+'-'+s[0]+'">'+s[2]+'<span>'+s[1]+'</span></a>').join('')}</div>
  ${compact?'':'<div class="bx" id="rbox"></div>'}${rvOther(app)}</aside>
  <div class="rmain"><header class="rtop"><div class="rtopin">${compact?'<a class="logo" href="#wallet" style="display:none" id="mlogo">'+logoSvg(30)+'</a>':''}<div class="crumb"><small>${p.name}</small><h1>${subTitle()}</h1></div><span style="flex:1"></span>${top}${skinBtn()}</div>
   ${app==='console'?'<div class="tickin" id="tick"></div>':''}</header>
   <main class="page" id="page"></main></div></div>
 <nav class="tabbar" aria-label="${p.name} sections">${v.subs.map(s=>'<a href="#'+app+'-'+s[0]+'" class="'+(CUR.sub===s[0]?'on':'')+'">'+s[2]+'<span>'+s[1]+'</span></a>').join('')}</nav>`;}

function rvOther(app){const l=APPS.filter(a=>a!==app&&a!=='console'&&RV_LINKS[a]);return l.length?'<div class="grp" style="margin-top:auto"><span class="gl">Rivers</span>'+l.map(a=>'<a class="it" href="'+RV_LINKS[a]+'" rel="noopener">'+IC.bridge+'<span>'+PROD[a].name.replace('Rivers ','')+'</span></a>').join('')+'</div>':'';}
function route(){CUR=parseHash();const a=CUR.app;document.body.dataset.skin=SKIN[a];readPal();
 const root=$('root');root.innerHTML=a==='explorer'?shellScan():shellRail(a);
 document.title=subTitle()+' · '+PROD[a].name;
 if(a!=='home'){const v=VIEWS[a];$('page').innerHTML='<div class="g rise" style="gap:18px">'+v.build(CUR.sub)+'</div>'+(a==='explorer'?'':'<p class="foot">'+PROD[a].name+' · Rivers Testnet'+(LV.chainId?' · chain '+short(LV.chainId,6):'')+' · test tokens have no monetary value</p>');v.after&&v.after(CUR.sub);try{v.update(CUR.sub);}catch(e){console.error(e);}}
 bindShell();renderChrome();drawActive();window.scrollTo(0,0);if(typeof polishAfterRoute==='function')polishAfterRoute();const on=document.querySelector('.mnav a.on,.tabbar a.on');on&&on.scrollIntoView({block:'nearest',inline:'center'});}
function bindShell(){const gs=$('gs');if(gs)gs.addEventListener('submit',e=>{e.preventDefault();const q=$('gq').value.trim().toLowerCase().replace(/^#/,'').replace(/,/g,'');if(!q)return;
  const t=S.txs.find(x=>x.id.startsWith(q)||x.id.includes(q)||(x.commitment&&x.commitment.includes(q)));if(t){location.hash='explorer-tx-'+t.id;return;}
  if(/^\d+$/.test(q)&&+q<=S.cp&&+q>0){location.hash='explorer-block-'+q;return;}const v=V.find(x=>x.name.includes(q)||x.city.n.toLowerCase()===q);if(v){location.hash='explorer-validator-'+v.id;return;}const tk=Object.keys(TOKENS).find(k=>k.toLowerCase()===q);if(tk){location.hash='explorer-asset-'+tk;return;}
  toast('No match for "'+$('gq').value+'". Try a digest, block number or validator name.',false);});}
function updateView(){if(CUR.app==='home'){renderChrome();return;}const v=VIEWS[CUR.app];try{v.update(CUR.sub);}catch(e){console.error(e);}if(reduce)drawActive();}
function drawActive(){const now=performance.now();const a=CUR.app,s=CUR.sub;if(a==='explorer'&&(s==='overview'||s==='validators'))drawWorld($('world'),now,{labels:s==='validators',aurora:s==='overview'});if(a==='institutions'&&s==='overview')drawCorr(now);if(a==='explorer'&&s==='transactions'&&EX.txView==='live')drawTxLive(now);if(a==='console'&&s==='overview')drawGlobe(now);}
function loop(){drawActive();requestAnimationFrame(loop);}
function renderChrome(){const act=activeVals();const t=$('tick');
 if(t)t.innerHTML='<span class="live'+(S.halted?' bad':'')+'">'+(S.halted?'PAUSED':'LIVE')+'</span><span>TPS <b>'+fmt(S.tps)+'</b></span><span>FINALITY <b>'+(S.halted?'—':fmt(S.fin)+' ms')+'</b></span><span>BLOCK <b>#'+fmt(Math.floor(S.cp))+'</b></span><span>EPOCH <b>'+S.epoch+'</b></span><span>VALIDATORS <b>'+act.filter(v=>v.on).length+'/'+act.length+'</b></span><span>RVRB <b>'+fmt(usdOf('RVRB'),2)+' USDs</b></span><span>CIRCULATING <b>'+compact(circulating())+' / 21M</b></span><span>GAS <b>'+fmt(P.gasPrice)+' drops</b></span>';
 const b=$('rbox');if(b){if(CUR.app==='console')b.innerHTML='<div class="row"><span class="muted">Health</span><b class="'+(health()>=95?'up':'')+'" style="color:'+(health()>=95?'':'var(--warn)')+'">'+health()+'/100</b></div><div class="bar"><i style="width:'+health()+'%"></i></div><div class="row"><span class="muted">Epoch '+S.epoch+'</span><span class="mono">'+hm(epochLeft().left)+'</span></div><div class="row"><span class="muted">Staged</span><span class="mono">'+Object.keys(STAGED).length+'</span></div>';
  else b.innerHTML='<div class="row"><span class="muted">Gateway</span><b class="'+(M.gateway&&!S.halted?'up':'down')+'">'+(M.gateway&&!S.halted?'Connected':'Paused')+'</b></div><div class="row"><span class="muted">Finality</span><span class="mono">'+(S.halted?'—':fmt(S.fin)+' ms')+'</span></div><div class="row"><span class="muted">Daily limit</span><span class="mono">'+pct(S.inst.vol/(P.dailyLimit*CUR_SCALE[S.inst.cur]),1)+'</span></div>';}}

const GACT={
 tx(el){const id=el.dataset.id;if(CUR.app==='explorer'){location.hash='explorer-tx-'+id;return;}if(!rvOpen('explorer','explorer-tx-'+id))copyText(id);},
 closesh(){closeSheet();},
 cp(el){if(CUR.app==='explorer'){location.hash='explorer-block-'+el.dataset.n;return;}rvOpen('explorer','explorer-block-'+el.dataset.n);},val(el){if(CUR.app==='explorer'){location.hash='explorer-validator-'+el.dataset.id;return;}if(RV_APP==='validator'){location.hash='validator-overview';return;}rvOpen('explorer','explorer-validator-'+el.dataset.id);},copy(el){copyText(el.dataset.v);},
 exchart(el){EX.chart=el.dataset.v;$$('[data-act=exchart]').forEach(b=>b.classList.toggle('on',b===el));updateView();},
 txf(el){EX.txFilter=el.dataset.v;EX.txPage=0;$$('[data-act=txf]').forEach(b=>b.classList.toggle('on',b===el));updateView();},
 txp(el){EX.txPage+=+el.dataset.v;updateView();},
 vreg(el){EX.valRegion=el.dataset.v;$$('[data-act=vreg]').forEach(b=>b.classList.toggle('on',b===el));updateView();},
 vsort(el){EX.valSort=el.dataset.v;updateView();},
 skin(){SKIN[CUR.app]=document.body.dataset.skin==='light'?'dark':'light';route();}
};
const ACTS=Object.assign({},GACT,WACT,IACT,CACT,XACT,{skin(){SKIN[CUR.app]=document.body.dataset.skin==='light'?'dark':'light';try{localStorage.setItem('rvSkin',SKIN[CUR.app]);}catch(e){}route();}});
try{const sk=localStorage.getItem('rvSkin');if(sk)APPS.forEach(a=>SKIN[a]=sk);}catch(e){}

function boot(){
 document.body.insertAdjacentHTML('afterbegin','<div id="root"></div>'+sheetHtml());readPal();
 document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const f=ACTS[el.dataset.act];if(f){if(el.tagName==='BUTTON'&&el.closest('form'))e.preventDefault();f(el,e);}});
 document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.wtog){S.W[t.dataset.wtog]=t.checked;toast(t.checked?'Turned on.':'Turned off.');}
  if(t.dataset.ptog){P[t.dataset.ptog]=t.checked;audit('Parameter changed',t.dataset.ptog+' → '+(t.checked?'on':'off'),'change');toast('Saved. Applies immediately.');}
  if(t.dataset.eptog){const ep=EPS[+t.dataset.eptog];ep.on=t.checked;audit(ep.on?'Endpoint enabled':'Endpoint disabled',ep.m+' '+ep.p,'module');updateView();}
  if(t.dataset.mtog){const k=t.dataset.mtog;if(!t.checked){t.checked=true;confirmBox('Pause '+MOD_LABEL[k]+'?','<p class="fg2">New actions in this module stop for every user until you turn it back on. Balances are not touched.</p>','Pause',true,()=>{M[k]=false;audit('Module paused',MOD_LABEL[k],'module');alertMsg('warn',MOD_LABEL[k]+' paused by operator.');updateView();});}
   else{M[k]=true;audit('Module resumed',MOD_LABEL[k],'module');alertMsg('ok',MOD_LABEL[k]+' resumed.');updateView();}}});
 $('mGo').addEventListener('click',()=>{const cb=modalCb;modalCb=null;closeSheet();cb&&cb();});
 $('mX').addEventListener('click',()=>{modalCb=null;closeSheet();});$('shX').addEventListener('click',closeSheet);$('scrim').addEventListener('click',()=>{modalCb=null;closeSheet();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){modalCb=null;closeSheet();}if(e.key==='/'&&$('gq')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('gq').focus();}});
 window.addEventListener('hashchange',route);
 // Links to pages of another Rivers interface open that interface's own site.
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.dataset.act)return;const h=a.getAttribute('href').slice(1);const app=h.split('-')[0];if(APPS.includes(app)&&app!==RV_APP){e.preventDefault();rvOpen(app,h);}},true);
 let lw=innerWidth,rz;window.addEventListener('resize',()=>{if(Math.abs(innerWidth-lw)<40)return;lw=innerWidth;clearTimeout(rz);rz=setTimeout(route,160);});
 lvBoot();}

