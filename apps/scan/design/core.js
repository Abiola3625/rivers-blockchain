/* ===================== utilities ===================== */
const $=id=>document.getElementById(id);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)], clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=(n,d=0)=>(isFinite(n)?Number(n):0).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtA=n=>fmt(n,Math.abs(n)<1?6:Math.abs(n)<100?4:2);
const compact=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(n);
const usd=n=>'$'+fmt(n,2);
const pct=(n,d=1)=>(n*100).toFixed(d)+'%';
const hex=n=>{let s='';for(let i=0;i<n;i++)s+='0123456789abcdef'[Math.floor(Math.random()*16)];return s;};
const short=(a,k=6)=>a.length>k*2+2?a.slice(0,k)+'…'+a.slice(-4):a;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago=t=>{const s=Math.max(0,(Date.now()-t)/1000);return s<1?'now':s<60?Math.floor(s)+'s ago':s<3600?Math.floor(s/60)+'m ago':Math.floor(s/3600)+'h ago';};
const clock=t=>new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
function hashCode(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

const IC={
 explorer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7c5 0 6 5 11 5h7"/><path d="M3 12h18"/><path d="M3 17c5 0 6-5 11-5"/></svg>',
 wallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2" fill="currentColor"/><path d="M6 6l9-3 1.5 3"/></svg>',
 institutions:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 9l9-5 9 5"/><path d="M5 9v8M9.5 9v8M14.5 9v8M19 9v8"/><path d="M3 20h18"/></svg>',
 console:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9l3 3-3 3M12 15h5"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
 recv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
 swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/></svg>',
 stake:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg>',
 lend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 19h16M6 15v-4M10 15V8M14 15v-6M18 15V5"/></svg>',
 bridge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M3 16h18M5 16c0-5 3-8 7-8s7 3 7 8M8 16v-3M16 16v-3M12 16V8"/></svg>',
 copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg>',
 close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 flip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M8 4v16M4 16l4 4 4-4M16 20V4M12 8l4-4 4 4"/></svg>'
};

/* ===================== world ===================== */
const CONTS=['Africa','Europe','Americas','Asia-Pacific & Middle East'];
const CITIES=[
 ['Lagos','Africa',3.4,6.5,'NG'],['London','Europe',-0.1,51.5,'GB'],['New York','Americas',-74,40.7,'US'],['Dubai','Asia-Pacific & Middle East',55.3,25.2,'AE'],
 ['Abuja','Africa',7.5,9.1,'NG'],['Frankfurt','Europe',8.7,50.1,'DE'],['São Paulo','Americas',-46.6,-23.5,'BR'],['Singapore','Asia-Pacific & Middle East',103.8,1.35,'SG'],
 ['Nairobi','Africa',36.8,-1.3,'KE'],['Paris','Europe',2.35,48.9,'FR'],['Toronto','Americas',-79.4,43.7,'CA'],['Mumbai','Asia-Pacific & Middle East',72.9,19.1,'IN'],
 ['Johannesburg','Africa',28,-26.2,'ZA'],['Amsterdam','Europe',4.9,52.4,'NL'],['Mexico City','Americas',-99.1,19.4,'MX'],['Tokyo','Asia-Pacific & Middle East',139.7,35.7,'JP'],
 ['Accra','Africa',-0.2,5.6,'GH'],['Stockholm','Europe',18.1,59.3,'SE'],['Chicago','Americas',-87.6,41.9,'US'],['Seoul','Asia-Pacific & Middle East',127,37.6,'KR'],
 ['Cairo','Africa',31.2,30,'EG'],['Warsaw','Europe',21,52.2,'PL'],['San Francisco','Americas',-122.4,37.8,'US'],['Hong Kong','Asia-Pacific & Middle East',114.2,22.3,'HK'],
 ['Kigali','Africa',30.1,-1.95,'RW'],['Madrid','Europe',-3.7,40.4,'ES'],['Bogotá','Americas',-74.1,4.7,'CO'],['Riyadh','Asia-Pacific & Middle East',46.7,24.7,'SA'],
 ['Cape Town','Africa',18.4,-33.9,'ZA'],['Zurich','Europe',8.5,47.4,'CH'],['Buenos Aires','Americas',-58.4,-34.6,'AR'],['Bangalore','Asia-Pacific & Middle East',77.6,12.97,'IN'],
 ['Casablanca','Africa',-7.6,33.6,'MA'],['Dublin','Europe',-6.3,53.3,'IE'],['Miami','Americas',-80.2,25.8,'US'],['Jakarta','Asia-Pacific & Middle East',106.8,-6.2,'ID'],
 ['Dakar','Africa',-17.5,14.7,'SN'],['Lisbon','Europe',-9.1,38.7,'PT'],['Santiago','Americas',-70.7,-33.4,'CL'],['Sydney','Asia-Pacific & Middle East',151.2,-33.9,'AU'],
 ['Addis Ababa','Africa',38.7,9,'ET'],['Port Harcourt','Africa',7,4.8,'NG']
].map(a=>({n:a[0],c:a[1],lon:a[2],lat:a[3],cc:a[4]}));
const CITY=n=>CITIES.find(c=>c.n===n);

/* ===================== parameters & modules ===================== */
const SUPPLY=21000000;
const DROPS=1e9; /* 1 RVRB = 1,000,000,000 drops */
const P={gasPrice:1000,maxValidators:500,minStake:10000,contCap:.30,valCap:.02,epochHours:24,cpMs:250,
  swapFee:.003,ltv:.75,liqTh:.82,borrowCap:2e10,oracleMaxAge:2,payLimit:5e6,dailyLimit:5e7,privacyDefault:true,breakerOn:true,breakerPct:15,rateLimit:600,sponsorBudget:2500};
const STAGED={}; /* parameter changes waiting for the next epoch */
const M={dex:true,lendSupply:true,lendBorrow:true,bridgeIn:true,bridgeOut:true,gateway:true,sponsor:true,faucet:true,stakeNew:true,publicApi:true,privateLedger:true,wsStream:true};
const MOD_LABEL={dex:'DEX trading',lendSupply:'Lending · new supply',lendBorrow:'Lending · new borrowing',bridgeIn:'Bridge deposits',bridgeOut:'Bridge withdrawals',gateway:'Bank gateway (ISO 20022)',sponsor:'Sponsored fees',faucet:'Testnet faucet',stakeNew:'New stake deposits',publicApi:'Public explorer API',privateLedger:'Private ledgers',wsStream:'Live stream (WebSocket)'};

/* ===================== validators ===================== */
const V=[];
(function(){const slug=s=>s.toLowerCase().normalize('NFD').replace(/[^a-z]/g,'');
  for(let i=0;i<252;i++){const c=CITIES[i%CITIES.length],k=Math.floor(i/CITIES.length)+1;
    V.push({id:i,name:'rv-'+slug(c.n)+'-'+String(k).padStart(2,'0'),city:c,stake:Math.round(rnd(15000,40000)),comm:pick([2,3,4,5,5,5,6,8,10]),up:rnd(99.1,99.995),on:true,jailed:false,power:0,joined:Math.floor(rnd(1,880)),signed:0,missed:Math.floor(rnd(0,40)),addr:'0x'+hex(40),self:0});}})();
V.forEach(v=>v.self=Math.round(v.stake*rnd(.08,.3)));
const APPL=[['Kano','Africa',8.5,12,'NG'],['Lusaka','Africa',28.3,-15.4,'ZM'],['Ibadan','Africa',3.9,7.4,'NG'],['Oslo','Europe',10.7,59.9,'NO'],['Lima','Americas',-77,-12,'PE'],['Manila','Asia-Pacific & Middle East',121,14.6,'PH'],['Doha','Asia-Pacific & Middle East',51.5,25.3,'QA'],['Dar es Salaam','Africa',39.3,-6.8,'TZ'],['Vienna','Europe',16.4,48.2,'AT']]
  .map((a,i)=>({id:'app'+i,city:{n:a[0],c:a[1],lon:a[2],lat:a[3],cc:a[4]},name:'rv-'+a[0].toLowerCase().replace(/[^a-z]/g,'')+'-01',stake:Math.round(rnd(12000,60000)),hw:pick(['32 cores · 128 GB · 1 Gbps','24 cores · 96 GB · 1 Gbps','16 cores · 64 GB · 500 Mbps']),status:'pending'}));

function computePower(){
  let w=V.map(v=>v.jailed?0:v.stake*Math.pow(v.up/100,4));
  for(let it=0;it<60;it++){
    const s=w.reduce((a,b)=>a+b,0)||1;w=w.map(x=>x/s);
    const cs={};CONTS.forEach(c=>cs[c]=0);V.forEach((v,i)=>cs[v.city.c]+=w[i]);
    V.forEach((v,i)=>{if(cs[v.city.c]>P.contCap)w[i]*=P.contCap/cs[v.city.c];if(w[i]>P.valCap)w[i]=P.valCap;});}
  const s=w.reduce((a,b)=>a+b,0)||1;V.forEach((v,i)=>v.power=w[i]/s);}
function activeVals(){return V.filter(v=>!v.jailed);}
function onlinePower(){return V.reduce((a,v)=>a+(v.on&&!v.jailed?v.power:0),0);}
function contShares(){const cs={};CONTS.forEach(c=>cs[c]={power:0,n:0,on:0,stake:0});V.forEach(v=>{if(v.jailed)return;const x=cs[v.city.c];x.power+=v.power;x.n++;x.stake+=v.stake;if(v.on)x.on++;});return cs;}
function hav(a,b){const r=Math.PI/180,dLa=(b.lat-a.lat)*r,dLo=(b.lon-a.lon)*r;const x=Math.sin(dLa/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.sqrt(x));}
let finCacheKey='',finCache=0;
function baseFinality(){
  const key=V.map(v=>v.on&&!v.jailed?1:0).join('');if(key===finCacheKey)return finCache;finCacheKey=key;
  const per={};V.forEach(v=>{if(v.on&&!v.jailed){per[v.city.n]=per[v.city.n]||{c:v.city,n:0,p:0};per[v.city.n].n++;per[v.city.n].p+=v.power;}});
  const cities=Object.values(per);if(!cities.length){finCache=0;return 0;}
  const ds=cities.map(a=>{const d=cities.map(b=>({d:a===b?2:hav(a.c,b.c)/100+5,p:b.p})).sort((x,y)=>x.d-y.d);let acc=0;for(const e of d){acc+=e.p;if(acc>=2/3)return {d:e.d,w:a.n};}return {d:d[d.length-1].d,w:a.n};}).sort((x,y)=>x.d-y.d);
  const tot=ds.reduce((a,b)=>a+b.w,0);let acc=0,med=ds[0].d;for(const e of ds){acc+=e.w;if(acc>=tot/2){med=e.d;break;}}
  finCache=Math.round(3*med+70);return finCache;}

/* ===================== economy ===================== */
const GENESIS=10000000,MINED=11000000,ERA_YEARS=5,ERAS=10;
const ERA1=MINED/(2*(1-Math.pow(2,-ERAS)));

const TOKENS={
 RVRB:{name:'Rivers',c:'var(--gold)',bg:'linear-gradient(135deg,rgba(31,229,140,.35),rgba(255,255,255,.08))',dec:4},
 USDs:{name:'US Dollar Stable',c:'var(--river)',bg:'rgba(31,229,140,.12)',dec:2},
 NGNs:{name:'Naira Stable',c:'#00C46A',bg:'rgba(0,135,81,.2)',dec:2},
 EURs:{name:'Euro Stable',c:'var(--violet)',bg:'rgba(94,230,208,.12)',dec:2},
 KESs:{name:'Kenyan Shilling Stable',c:'var(--mint)',bg:'rgba(198,243,107,.12)',dec:2},
 GBPs:{name:'Pound Stable',c:'#9FE8C8',bg:'rgba(159,232,200,.12)',dec:2}};
const POOLS={
 'RVRB/USDs':{a:'RVRB',b:'USDs',x:61500,y:762600,vol:0,fees:0,lp:100000},
 'USDs/NGNs':{a:'USDs',b:'NGNs',x:2.1e6,y:3.255e9,vol:0,fees:0,lp:100000},
 'USDs/EURs':{a:'USDs',b:'EURs',x:1.45e6,y:1.334e6,vol:0,fees:0,lp:100000},
 'USDs/KESs':{a:'USDs',b:'KESs',x:6.2e5,y:8.0e7,vol:0,fees:0,lp:100000},
 'USDs/GBPs':{a:'USDs',b:'GBPs',x:8.8e5,y:6.95e5,vol:0,fees:0,lp:100000}};
function poolPrice(p){return p.y/p.x;}
function usdOf(tok){if(tok==='USDs')return 1;if(tok==='RVRB')return poolPrice(POOLS['RVRB/USDs']);const p=POOLS['USDs/'+tok];return p?1/poolPrice(p):0;}
const MARKETS={USDs:{sup:2.42e7,bor:1.38e7},NGNs:{sup:3.1e10,bor:1.72e10},RVRB:{sup:210000,bor:38000},EURs:{sup:6.1e6,bor:2.9e6}};
function mRates(t){const m=MARKETS[t];const u=m.bor/m.sup;const b=.02+u*.11+(u>.8?(u-.8)*.6:0);return {u,b,s:b*u*.9};}

const S={
  load:2000,tps:0,fin:0,p95:0,cp:4182311,epoch:812,epochStart:Date.now()-14.3*3600*1000,halted:false,peak:0,
  totalTx:412883190,accounts:1284330,objects:96200000,light:48210,feesToday:0,txToday:0,
  hist:{tps:[],fin:[],t:[]},mix:{transfer:0,defi:0,bank:0,private:0,system:0},finHist:new Array(12).fill(0),
  txs:[],cps:[],pays:[],alerts:[],audit:[],oracleStale:false,oracleAge:.4,burstUntil:0,leader:0,arcs:[],
  bridge:{locked:31.2e6,minted:31.2e6,deps:[]},
  reserve:0,treasury:800000,faucet:50000,ecosystem:1200000,slashed:0,emitted:0,mixHist:[],lastMix:null,
  others:0,kOk:true,breakerTrips:0,
  W:{name:'mubarak.rivers',addr:'0x'+hex(40),bal:{RVRB:342.1842,USDs:4820.55,NGNs:1250000,EURs:180.2,KESs:0,GBPs:0},
     stakes:[],sup:{USDs:1500,NGNs:0,RVRB:0,EURs:0},bor:{USDs:0,NGNs:400000,RVRB:0,EURs:0},lp:{'RVRB/USDs':0},hist:[],mine:[],
     slippage:.005,sessions:[{d:'iPhone · Lagos',t:'Active now',cur:true},{d:'Chrome on macOS · Abuja',t:'2 days ago'},{d:'Rivers desktop · Lagos',t:'9 days ago'}],
     apps:[{n:'Rivers DEX',p:'Swap, pools'},{n:'Settlement Explorer',p:'Read only'}],guardians:['ada.rivers','faruk.rivers'],limit:5000,twofa:true,alerts:true},
  inst:null,paySeq:880412,apiKeys:[],hooks:[],viewKeys:[]
};
/* user's own stakes */
S.W.stakes=[{vid:3,amt:120,rew:4.21},{vid:57,amt:80,rew:2.06}];
S.W.stakes.forEach(s=>V[s.vid].stake+=s.amt+s.rew);

const INSTS=[
 {id:'ins-ng-01',name:'Lagoon Meridian Bank',city:'Lagos',cur:'NGN',sym:'₦',status:'live',tier:'Tier 1',vol:0,cnt:0,since:'Epoch 640'},
 {id:'ins-gb-01',name:'Thameside Clearing',city:'London',cur:'GBP',sym:'£',status:'live',tier:'Tier 1',vol:0,cnt:0,since:'Epoch 655'},
 {id:'ins-ke-01',name:'Savanna Pay Bank',city:'Nairobi',cur:'KES',sym:'KSh ',status:'live',tier:'Tier 2',vol:0,cnt:0,since:'Epoch 690'},
 {id:'ins-us-01',name:'Hudson Settlement Co.',city:'New York',cur:'USD',sym:'$',status:'live',tier:'Tier 1',vol:0,cnt:0,since:'Epoch 702'},
 {id:'ins-de-01',name:'Mainbrück Bank',city:'Frankfurt',cur:'EUR',sym:'€',status:'live',tier:'Tier 1',vol:0,cnt:0,since:'Epoch 711'},
 {id:'ins-ae-01',name:'Creekline Bank',city:'Dubai',cur:'USD',sym:'$',status:'live',tier:'Tier 2',vol:0,cnt:0,since:'Epoch 730'},
 {id:'ins-za-01',name:'Highveld Trust',city:'Johannesburg',cur:'USD',sym:'$',status:'live',tier:'Tier 2',vol:0,cnt:0,since:'Epoch 744'},
 {id:'ins-sg-01',name:'Straits Ledger Bank',city:'Singapore',cur:'USD',sym:'$',status:'live',tier:'Tier 1',vol:0,cnt:0,since:'Epoch 761'},
 {id:'ins-ng-02',name:'Delta Union Bank',city:'Abuja',cur:'NGN',sym:'₦',status:'live',tier:'Tier 2',vol:0,cnt:0,since:'Epoch 777'},
 {id:'ins-gh-01',name:'Volta Commerce Bank',city:'Accra',cur:'USD',sym:'$',status:'pending',tier:'Tier 2',vol:0,cnt:0,since:'In review'},
 {id:'ins-in-01',name:'Konkan Payments',city:'Mumbai',cur:'USD',sym:'$',status:'pending',tier:'Tier 3',vol:0,cnt:0,since:'In review'},
 {id:'ins-eg-01',name:'Nilegate Bank',city:'Cairo',cur:'USD',sym:'$',status:'suspended',tier:'Tier 2',vol:0,cnt:0,since:'Epoch 790'}];
INSTS.forEach(i=>{i.c=CITY(i.city);i.limit=P.dailyLimit;i.tok=i.cur+'s';});
const CUR_SCALE={NGN:1550,GBP:.79,KES:129,USD:1,EUR:.92};
S.inst=INSTS[0];
S.apiKeys=[{id:'rvk_live_7Q2m',label:'Core banking · production',created:'Epoch 641',last:'just now',scope:'payments:write, accounts:read',on:true},{id:'rvk_live_X9c4',label:'Reconciliation service',created:'Epoch 702',last:'4m ago',scope:'payments:read',on:true}];
S.hooks=[{url:'https://hooks.lagoonmeridian.example/rivers',ev:'payment.final, payment.failed',ok:99.98,on:true}];
S.viewKeys=[{holder:'Central bank supervisor',scope:'All private payments',issued:'Epoch 640',on:true},{holder:'External auditor',scope:'Q4 private payments',issued:'Epoch 801',on:true}];

/* genesis fund wallets that pay investors, team and grants; balances are what each wallet holds today */
const MONTH=30.4375*864e5;
const FUNDS=[{id:'early-backers-1',g:'Early backers',bal:520000},
 {id:'foundation-1',g:'Foundation',bal:310000},{id:'foundation-2',g:'Foundation',bal:285000},{id:'foundation-3',g:'Foundation',bal:240000},{id:'foundation-4',g:'Foundation',bal:300000},{id:'foundation-5',g:'Foundation',bal:300000},
 {id:'ecosystem-1',g:'Ecosystem',bal:380000},{id:'ecosystem-2',g:'Ecosystem',bal:320000},{id:'ecosystem-3',g:'Ecosystem',bal:280000},{id:'ecosystem-4',g:'Ecosystem',bal:220000}];
FUNDS.forEach(f=>f.addr='0x'+hex(64));
Object.defineProperty(S,'ecosystem',{get(){return FUNDS.filter(f=>f.g==='Ecosystem').reduce((a,f)=>a+f.bal,0);},set(){},enumerable:true});
function fundTotal(){return FUNDS.filter(f=>f.g!=='Ecosystem').reduce((a,f)=>a+f.bal,0);}
/* same unlock rule as rivers_vesting::vesting: a share at the start, nothing more before the cliff, then linear from the start to the end */
function vestedAt(v,t){if(v.revoked)return v.total;if(t<v.start)return 0;const e=t-v.start,d=v.months*MONTH,imm=v.total*v.imm/100;if(e>=d)return v.total;if(e<v.cliff*MONTH)return imm;return imm+(v.total-imm)*e/d;}
const VEST=[];
[['Harmattan Ventures','Seed',250000,'early-backers-1',14,10,12,36,false,.9],['Okapi Seed Fund','Seed',150000,'early-backers-1',14,10,12,36,false,.6],
 ['Lekki Angels Syndicate','Pre-seed',80000,'early-backers-1',20,0,6,24,false,1],['Adaeze Nwosu','Advisors',20000,'foundation-2',8,0,6,24,true,.5],
 ['Tunde Akande','Team',60000,'foundation-3',10,0,12,48,true,0]].forEach((x,i)=>{
 const v={id:'0x'+hex(64),name:x[0],round:x[1],total:x[2],orig:x[2],fund:x[3],start:Date.now()-x[4]*MONTH,imm:x[5],cliff:x[6],months:x[7],revocable:x[8],revoked:false,claimed:0,addr:'0x'+hex(64),created:Date.now()-x[4]*MONTH};
 v.claimed=Math.floor(vestedAt(v,Date.now())*x[9]);VEST.push(v);});
function vestLocked(){return VEST.reduce((a,v)=>a+v.total-v.claimed,0);}

/* supply bookkeeping: every RVRB sits in exactly one bucket */
function stakedTotal(){return V.reduce((a,v)=>a+v.stake,0);}
function lpRVRB(){return POOLS['RVRB/USDs'].x;}
function supplyBuckets(){return [
  ['Staked with validators',stakedTotal(),'var(--river)'],['Not yet mined',S.reserve,'var(--dim)'],['Ecosystem fund',S.ecosystem,'var(--violet)'],
  ['Treasury',S.treasury+S.slashed,'var(--mint)'],['DEX liquidity',lpRVRB()+MARKETS.RVRB.sup-MARKETS.RVRB.bor,'var(--gold)'],['Testnet faucet',S.faucet,'#9FE8C8'],['Foundation and early backers',fundTotal(),'#7FD3A8'],['Investor vesting',vestLocked(),'#3FAE7A'],
  ['Your wallet',S.W.bal.RVRB,'#00C46A'],['Other holders',S.others,'var(--deep)']];}
function supplySum(){return supplyBuckets().reduce((a,b)=>a+b[1],0);}
S.emitted=minedBy(chainYears());S.reserve=MINED-S.emitted;
S.others=SUPPLY-(fundTotal()+vestLocked()+stakedTotal()+S.reserve+S.ecosystem+S.treasury+lpRVRB()+(MARKETS.RVRB.sup-MARKETS.RVRB.bor)+S.faucet+S.W.bal.RVRB);
/* annual reward emission halves every four years, starting at half the reserve spread over four years */
/* RVRB: 10,000,000 at genesis, 11,000,000 mined by stakers over 50 years. Rewards halve every 5 years (10 eras). */
function eraTotal(e){return e>=0&&e<ERAS?ERA1/Math.pow(2,e):0;}
function yearlyEmission(year){return eraTotal(Math.floor((year-1)/ERA_YEARS))/ERA_YEARS;}
function chainYears(){return S.epoch/365;}
function currentEra(){return Math.floor(chainYears()/ERA_YEARS);}
function epochEmission(){return eraTotal(currentEra())/ERA_YEARS/365*(P.epochHours/24);}
function minedBy(y){let m=0;for(let e=0;e<ERAS;e++){const s=e*ERA_YEARS;if(y<=s)break;m+=eraTotal(e)*Math.min(1,(y-s)/ERA_YEARS);}return m;}
function blocksPerYear(){return 365*86400*1000/P.cpMs;}
function blockRewardAt(e){return eraTotal(e)/ERA_YEARS/blocksPerYear();}
function blockReward(){return blockRewardAt(currentEra());}
/* every block pays its reward out of the not-yet-mined reserve, split by voting power; stakers get their share minus the validator fee */
function emitBlocks(n){const r=Math.min(S.reserve,n*blockReward());if(r<=0)return;S.reserve-=r;S.emitted+=r;S.blockRewards=(S.blockRewards||0)+r;V.forEach(v=>{if(v.jailed)return;const a=r*v.power;const b=v.stake;v.stake+=a;S.W.stakes.forEach(s=>{if(s.vid===v.id)s.rew+=a*(s.amt/b)*(1-v.comm/100);});});}
function nextHalving(){const y=(currentEra()+1)*ERA_YEARS;return {year:y,days:Math.max(0,Math.round((y-chainYears())*365))};}

const VIEWS={};
const PXH={};
/* ===================== log ===================== */
function alertMsg(level,msg){S.alerts.unshift({t:Date.now(),level,msg});if(S.alerts.length>60)S.alerts.pop();}
function audit(action,detail,kind){S.audit.unshift({t:Date.now(),who:'mubarak@rivers-core',action,detail,kind:kind||'change',id:'AUD-'+(10200+S.audit.length)});if(S.audit.length>200)S.audit.pop();}

/* ===================== transactions ===================== */
const TT=[{k:'Transfer',c:'transfer',w:.40,gas:2100},{k:'Swap',c:'defi',w:.17,gas:9800},{k:'Add liquidity',c:'defi',w:.03,gas:14200},{k:'Stake',c:'defi',w:.05,gas:7400},{k:'Lend',c:'defi',w:.05,gas:11900},
  {k:'Bank settlement',c:'bank',w:.15,gas:6300},{k:'Private settlement',c:'private',w:.12,gas:21500},{k:'Validator vote',c:'system',w:.03,gas:0}];
function pickTT(){let r=Math.random();for(const t of TT){if((r-=t.w)<0)return t;}return TT[0];}
function newTx(t,o){o=o||{};const tok=o.tok||(t.c==='bank'||t.c==='private'?pick(['NGNs','USDs','EURs','KESs','GBPs']):t.k==='Transfer'?pick(['RVRB','USDs','NGNs','USDs']):'RVRB');
  const amt=o.amt!=null?o.amt:(tok==='RVRB'?rnd(.5,240):tok==='NGNs'?rnd(5e3,2e7):rnd(10,2e5));
  const gas=t.gas*rnd(.9,1.15);const fee=gas*P.gasPrice/DROPS;
  const priv=t.c==='private';const tx={id:'0x'+hex(64),type:t.k,c:t.c,from:priv?null:(o.from||('0x'+hex(40))),to:priv?null:(o.to||('0x'+hex(40))),commitment:priv?'0x'+hex(64):null,nullifier:priv?'0x'+hex(64):null,amt:priv?null:amt,tok,gas:Math.round(gas),fee,
    sponsored:o.sponsored!=null?o.sponsored:(M.sponsor&&Math.random()<.35),cp:Math.floor(S.cp),t:Date.now(),born:performance.now(),ms:Math.round((S.fin||S.base||500)*rnd(.9,1.12)),final:false,mine:!!o.mine,label:o.label||'',objs:Math.floor(rnd(2,9)),events:Math.floor(rnd(1,5))};
  S.txs.unshift(tx);if(S.txs.length>400)S.txs.pop();S.mix[t.c]=(S.mix[t.c]||0)+1;S.feesToday+=fee;
  if(window.spawnParticle&&!reduce)spawnParticle(t.c,true);
  if(o.mine){S.W.mine.unshift(tx);if(S.W.mine.length>80)S.W.mine.pop();}
  return tx;}

/* ===================== bank payments ===================== */
function makePayment(from,to,amt,priv,ref,mine){
  const p={id:'PAY-'+(++S.paySeq),uetr:hex(8)+'-'+hex(4)+'-4'+hex(3)+'-'+hex(4)+'-'+hex(12),from,to,amt,cur:from.cur,priv,ref:ref||('INV-'+Math.floor(rnd(10000,99999))),
    t:Date.now(),born:performance.now(),due:performance.now()+(S.halted||!M.gateway?Infinity:(S.fin||500)),status:S.halted||!M.gateway?'held':'committing',ms:0,aml:'clear',mine:!!mine,digest:'0x'+hex(64)};
  S.pays.unshift(p);if(S.pays.length>300)S.pays.pop();from.vol+=amt;from.cnt++;to.cnt++;
  p.tx=newTx(TT.find(x=>x.k===(priv?'Private settlement':'Bank settlement')),{amt,tok:from.tok,sponsored:false});
  return p;}
function gatewayPay(){if(!M.gateway)return;const live=INSTS.filter(i=>i.status==='live');const f=pick(live);let t=pick(live);if(t===f)t=live[(live.indexOf(f)+3)%live.length];
  makePayment(f,t,Math.round(CUR_SCALE[f.cur]*rnd(2000,250000)),Math.random()<(P.privacyDefault?.55:.25));}

/* ===================== simulation tick ===================== */
let lastT=performance.now(),tickN=0;
function tick(){
  const now=performance.now(),dt=Math.min(2,(now-lastT)/1000);lastT=now;tickN++;
  if(S.burstUntil&&now>S.burstUntil){S.burstUntil=0;S.load=2000;alertMsg('ok','Load test finished. Traffic back to 2,000 TPS.');}
  const op=onlinePower();const was=S.halted;S.halted=op<2/3;
  if(S.halted&&!was)alertMsg('bad','Consensus paused: '+pct(op,0)+' of voting power online, 66.7% required. No transaction is lost.');
  if(!S.halted&&was)alertMsg('ok','Consensus resumed. Held transactions are now committing.');
  S.base=baseFinality();
  if(S.halted){S.tps=0;S.fin=0;S.p95=0;}
  else{S.tps=S.load*rnd(.975,1.025);const over=S.load>9000?Math.pow(S.load/9000,1.6):1;
    S.fin=S.base*rnd(.95,1.05)*over;S.p95=S.fin*rnd(1.42,1.58);S.peak=Math.max(S.peak,S.tps);
    S.totalTx+=S.tps*dt;S.txToday+=S.tps*dt;S.cp+=dt*1000/P.cpMs;emitBlocks(dt*1000/P.cpMs);S.accounts+=Math.round(rnd(0,3));S.objects+=Math.round(S.tps*dt*.4);
    if(Math.random()<.3)S.light+=Math.round(rnd(-2,5));
    const nCp=Math.floor(S.cp);if(!S.cps.length||S.cps[0].n!==nCp){S.cps.unshift({n:nCp,txc:Math.round(S.tps*P.cpMs/1000),ms:Math.round(S.fin),leader:V[S.leader].name,t:Date.now(),reward:blockReward(),txs:0,digest:'0x'+hex(64),sigs:Math.round(activeVals().filter(v=>v.on).length*rnd(.97,1)),size:Math.round(S.tps*P.cpMs/1000*0.31)});if(S.cps.length>80)S.cps.pop();}
    let g=0;do{S.leader=(S.leader+1)%V.length;g++;}while((!V[S.leader].on||V[S.leader].jailed)&&g<V.length);
    const n=S.load>9000?6:3;for(let i=0;i<n;i++)newTx(pickTT());
    if(tickN%2===0)gatewayPay();
    for(let k=0;k<6;k++){const b=pick(V);if(b.on&&!b.jailed&&b.id!==S.leader)S.arcs.push({a:S.leader,b:b.id,t:now});}
    const bi=Math.min(11,Math.floor(S.fin/100));S.finHist[bi]+=1;
    V.forEach(v=>{if(v.on&&!v.jailed)v.signed+=1;else if(!v.jailed)v.missed+=1;});
  }
  S.arcs=S.arcs.filter(a=>now-a.t<1400);if(typeof xcTick==='function')xcTick();
  S.txs.forEach(t=>{if(!t.final&&!S.halted&&now-t.born>=t.ms)t.final=true;});
  S.pays.forEach(p=>{if(p.status==='final')return;if(S.halted||!M.gateway){p.status='held';return;}if(p.status==='held'){p.status='committing';p.due=now+S.fin;}if(now>=p.due){p.status='final';p.ms=Math.round(now-p.born);}});
  if(S.oracleStale)S.oracleAge+=dt;else S.oracleAge=rnd(.2,.9);
  if(S.oracleStale&&S.oracleAge>P.oracleMaxAge&&M.lendBorrow&&P.breakerOn&&!S._oracleTripped){S._oracleTripped=true;alertMsg('warn','Oracle older than '+P.oracleMaxAge+' s. New borrowing is blocked until prices refresh.');}
  /* small random DEX activity keeps pools alive */
  if(!S.halted&&M.dex&&Math.random()<.5){const k=pick(Object.keys(POOLS));const p=POOLS[k];const dir=Math.random()<.5;const amt=(dir?p.x:p.y)*rnd(.00002,.0004);const out=swapPool(p,dir,amt);if(k==='RVRB/USDs'){if(dir)S.others-=amt;else S.others+=out;}}
  {const m=S.mix,l=S.lastMix||m;S.mixHist.push({transfer:m.transfer-(l.transfer||0),defi:m.defi-(l.defi||0),bank:m.bank-(l.bank||0),private:m.private-(l.private||0),system:m.system-(l.system||0)});S.lastMix={...m};if(S.mixHist.length>120)S.mixHist.shift();}
  S.hist.tps.push(S.tps);S.hist.fin.push(S.fin);S.hist.t.push(Date.now());if(S.hist.tps.length>240){S.hist.tps.shift();S.hist.fin.shift();S.hist.t.shift();}
  for(const t in TOKENS){(PXH[t]=PXH[t]||[]).push(usdOf(t)*rnd(.9995,1.0005));if(PXH[t].length>80)PXH[t].shift();}
  if(tickN%4===0){S.W.hist.push(walletValue());if(S.W.hist.length>120)S.W.hist.shift();}
  renderChrome();if(window.updateView)updateView();
}
function swapPool(p,dir,ain){const f=ain*(1-P.swapFee);const k0=p.x*p.y;let out;
  if(dir){out=p.y*f/(p.x+f);p.x+=ain;p.y-=out;p.vol+=ain*usdOf(p.a);p.fees+=ain*P.swapFee*usdOf(p.a);}else{out=p.x*f/(p.y+f);p.y+=ain;p.x-=out;p.vol+=ain*usdOf(p.b);p.fees+=ain*P.swapFee*usdOf(p.b);}
  if(p.x*p.y<k0-1e-6)S.kOk=false;return out;}
function walletValue(){const W=S.W;let v=0;for(const t in W.bal)v+=W.bal[t]*usdOf(t);W.stakes.forEach(s=>v+=(s.amt+s.rew)*usdOf('RVRB'));for(const t in W.sup)v+=W.sup[t]*usdOf(t);for(const t in W.bor)v-=W.bor[t]*usdOf(t);
  const p=POOLS['RVRB/USDs'];v+=(W.lp['RVRB/USDs']||0)/p.lp*(p.x*usdOf('RVRB')+p.y);return v;}

/* ===================== charts ===================== */
function fitCanvas(cv,h){const d=window.devicePixelRatio||1,w=cv.clientWidth;if(!w)return 0;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.height=h+'px';const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);cv._w=w;cv._h=h;return w;}
function niceMax(v){if(v<=0)return 1;const e=Math.pow(10,Math.floor(Math.log10(v)));const m=v/e;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*e;}
function areaChart(cv,series,o){if(!cv||!cv._w)return;const c=cv.getContext('2d'),W=cv._w,H=cv._h;c.clearRect(0,0,W,H);
  const L=46,R=8,T=10,B=22;const n=o.n||series[0].v.length;const all=series.flatMap(s=>s.v);const lo=o.lo||0;const mx=o.hi||niceMax(Math.max(o.min||1,...all)*1.08);
  c.font='500 10px "JetBrains Mono", monospace';c.textAlign='right';c.textBaseline='middle';
  for(let i=0;i<=4;i++){const y=T+(H-T-B)*(1-i/4);c.strokeStyle=C.grid;c.beginPath();c.moveTo(L,y+.5);c.lineTo(W-R,y+.5);c.stroke();c.fillStyle=C.dim;const yv=lo+(mx-lo)*i/4;c.fillText(o.fmt?o.fmt(yv):compact(yv),L-8,y);}
  c.textAlign='center';c.textBaseline='top';const lbl=o.xl||[];lbl.forEach((t,i)=>{c.fillText(t,L+(W-L-R)*(i/(lbl.length-1)),H-B+7);});
  series.forEach(s=>{const v=s.v;if(v.length<2)return;const xs=i=>L+(W-L-R)*(i+(n-v.length))/(n-1),ys=x=>T+(H-T-B)*(1-(x-lo)/(mx-lo));
    c.beginPath();v.forEach((x,i)=>i?c.lineTo(xs(i),ys(x)):c.moveTo(xs(i),ys(x)));
    const g=c.createLinearGradient(0,T,0,H-B);g.addColorStop(0,s.fill||C.accA);g.addColorStop(1,'rgba(0,0,0,0)');
    c.strokeStyle=s.color;c.lineWidth=1.8;c.lineJoin='round';c.stroke();
    if(s.area!==false){c.lineTo(xs(v.length-1),H-B);c.lineTo(xs(0),H-B);c.closePath();c.fillStyle=g;c.fill();}
    const lx=xs(v.length-1),ly=ys(v[v.length-1]);c.fillStyle=s.color;c.beginPath();c.arc(lx,ly,3.2,0,7);c.fill();c.globalAlpha=.25;c.beginPath();c.arc(lx,ly,7,0,7);c.fill();c.globalAlpha=1;});
}
function spark(v,color,h){h=h||30;if(!v||v.length<2)return '<svg class="spk" viewBox="0 0 100 '+h+'" preserveAspectRatio="none"></svg>';const mn=Math.min(...v),mx=Math.max(...v),r=mx-mn||1;
  const pts=v.map((x,i)=>(i/(v.length-1)*100).toFixed(2)+','+(h-2-(x-mn)/r*(h-6)).toFixed(2)).join(' ');
  return '<svg class="spk" viewBox="0 0 100 '+h+'" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+pts+' 100,'+h+' 0,'+h+'" style="fill:'+color+'" fill-opacity=".14" stroke="none"/><polyline points="'+pts+'" fill="none" style="stroke:'+color+'" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>';}
function donut(parts,center,sub){const tot=parts.reduce((a,p)=>a+p[1],0)||1;let a0=-Math.PI/2;const R=62,r=46,cx=75,cy=75;
  const segs=parts.map(p=>{const a1=a0+p[1]/tot*Math.PI*2-0.012;const large=a1-a0>Math.PI?1:0;
    const d=['M',cx+R*Math.cos(a0),cy+R*Math.sin(a0),'A',R,R,0,large,1,cx+R*Math.cos(a1),cy+R*Math.sin(a1),'L',cx+r*Math.cos(a1),cy+r*Math.sin(a1),'A',r,r,0,large,0,cx+r*Math.cos(a0),cy+r*Math.sin(a0),'Z'].join(' ');
    a0=a1+0.012;return p[1]>0?'<path d="'+d+'" style="fill:'+p[2]+'"/>':'';}).join('');
  return '<svg viewBox="0 0 150 150" aria-hidden="true">'+segs+'<text x="75" y="72" text-anchor="middle" style="fill:var(--fg)" font-family="JetBrains Mono, monospace" font-size="15" font-weight="500">'+center+'</text><text x="75" y="90" text-anchor="middle" style="fill:var(--muted)" font-family="Manrope, sans-serif" font-size="9.5" font-weight="700" letter-spacing=".8">'+(sub||'')+'</text></svg>';}
function legend(parts,fmtv){const tot=parts.reduce((a,p)=>a+p[1],0)||1;return '<div class="lg">'+parts.map(p=>'<div><i class="sq" style="background:'+p[2]+'"></i><span class="trunc">'+p[0]+'</span><span class="mono muted">'+(fmtv?fmtv(p[1]):compact(p[1]))+' · '+(p[1]/tot*100).toFixed(1)+'%</span></div>').join('')+'</div>';}
function ring(v,color,size,label,sub){size=size||120;const r=size/2-9,c=2*Math.PI*r;const f=clamp(v,0,1);
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" style="stroke:var(--hair2)" stroke-width="8"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" style="stroke:'+color+';filter:drop-shadow(0 0 6px '+color+')" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+(c*f).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/><text x="50%" y="'+(size/2+(sub?-2:5))+'" text-anchor="middle" style="fill:var(--fg)" font-family="JetBrains Mono, monospace" font-size="'+(size/6.2)+'" font-weight="500">'+label+'</text>'+(sub?'<text x="50%" y="'+(size/2+15)+'" text-anchor="middle" style="fill:var(--muted)" font-family="Manrope, sans-serif" font-size="9.5" font-weight="700">'+sub+'</text>':'')+'</svg>';}
function bars(vals,labels,color,h){h=h||120;const mx=Math.max(...vals,1);const w=100/vals.length;
  return '<svg viewBox="0 0 100 '+(h+14)+'" preserveAspectRatio="none" style="width:100%;height:'+(h+14)+'px" aria-hidden="true">'+vals.map((v,i)=>{const bh=v/mx*h;return '<rect x="'+(i*w+w*.15).toFixed(2)+'" y="'+(h-bh).toFixed(2)+'" width="'+(w*.7).toFixed(2)+'" height="'+bh.toFixed(2)+'" rx="1" style="fill:'+color+'" fill-opacity="'+(.35+.65*v/mx).toFixed(2)+'"/>';}).join('')+'</svg>'+
   '<div style="display:grid;grid-template-columns:repeat('+vals.length+',1fr);font-family:var(--f-mono);font-size:.62rem;color:var(--dim);text-align:center;margin-top:-10px">'+labels.map(l=>'<span>'+l+'</span>').join('')+'</div>';}
function identicon(seed,size){const h=hashCode(seed);const hue=h%360;let cells='';for(let y=0;y<5;y++)for(let x=0;x<3;x++){const bit=(h>>(y*3+x))&1;if(bit){cells+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';if(x<2)cells+='<rect x="'+(4-x)+'" y="'+y+'" width="1" height="1"/>';}}
  return '<svg class="idn" viewBox="-0.5 -0.5 6 6" width="'+(size||42)+'" height="'+(size||42)+'" style="background:hsl('+hue+',45%,14%)"><g fill="hsl('+hue+',85%,62%)">'+cells+'</g></svg>';}
function tokIcon(t,sz){const k=TOKENS[t]||TOKENS.USDs;return '<span class="tk" style="color:'+k.c+';background:'+k.bg+(sz?';width:'+sz+'px;height:'+sz+'px':'')+'">'+t.slice(0,3)+'</span>';}
function fmtTok(n,t){return fmt(n,TOKENS[t]?TOKENS[t].dec:2)+' '+t;}
function stat(label,v,sub,extra){return '<div class="kpi"><span class="cap">'+label+'</span><span class="v">'+v+'</span>'+(sub?'<span class="s">'+sub+'</span>':'')+(extra||'')+'</div>';}

/* ===================== UI: sheet, modal, toast ===================== */
let toastT;
function toast(m,ok){const t=$('toast');t.innerHTML=(ok===false?'<span class="b bad">!</span>':'<span class="b ok dot"></span>')+'<span>'+esc(m)+'</span>';t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3400);}
function openSheet(title,html,sub){$('shT').textContent=title;$('shS').textContent=sub||'';$('shB').innerHTML=html;$('scrim').hidden=false;$('sheet').hidden=false;requestAnimationFrame(()=>{$('scrim').classList.add('on');$('sheet').classList.add('on');});setTimeout(()=>{const b=$('shX');b&&b.focus();},50);}
function closeSheet(){$('scrim').classList.remove('on');$('sheet').classList.remove('on');$('modal').classList.remove('on');setTimeout(()=>{$('scrim').hidden=true;$('sheet').hidden=true;$('modal').hidden=true;},260);}
let modalCb=null;
function confirmBox(title,body,label,danger,cb){$('mT').textContent=title;$('mB').innerHTML=body;const go=$('mGo');go.textContent=label||'Confirm';go.className='btn '+(danger?'danger':'pri');modalCb=cb;$('scrim').hidden=false;$('modal').hidden=false;requestAnimationFrame(()=>{$('scrim').classList.add('on');$('modal').classList.add('on');});setTimeout(()=>go.focus(),60);}
function copyText(t){try{navigator.clipboard.writeText(t).then(()=>toast('Copied to clipboard.'),()=>toast('Copy is blocked here. Select the text to copy it.',false));}catch(e){toast('Copy is blocked here. Select the text to copy it.',false);}}

/* ===================== palette (read from the active skin) ===================== */
const C={};
function readPal(){const cs=getComputedStyle(document.body);const g=k=>cs.getPropertyValue(k).trim();
  Object.assign(C,{acc:g('--river'),deep:g('--deep'),tok:g('--gold'),fg:g('--fg'),fg2:g('--fg2'),mut:g('--muted'),dim:g('--dim'),hair:g('--hair2'),hair3:g('--hair3'),ok:g('--ok'),warn:g('--warn'),bad:g('--bad'),vio:g('--violet'),mint:g('--mint'),pearl:g('--pearl'),sunk:g('--sunk'),card:g('--card'),
    light:document.body.dataset.skin==='light'});
  C.grid=C.light?'rgba(0,90,50,.08)':'rgba(150,255,200,.07)';C.accA=C.light?'rgba(0,135,81,.22)':'rgba(31,229,140,.3)';
  C.types={transfer:C.acc,defi:C.tok,bank:C.vio,private:C.pearl,system:C.mint};}

/* ===================== world land mask (simplified outlines) ===================== */
const LAND=[
 [[-168,66],[-162,70],[-140,70],[-120,72],[-95,72],[-80,73],[-62,66],[-55,52],[-66,45],[-70,41],[-76,35],[-81,31],[-80,25],[-82,28],[-84,30],[-90,29],[-97,26],[-97,21],[-92,18],[-87,21],[-84,15],[-83,9],[-79,8],[-77,8],[-80,7],[-85,10],[-92,15],[-105,20],[-110,23],[-115,31],[-117,33],[-124,40],[-124,48],[-130,55],[-140,60],[-150,60],[-158,57],[-165,60]],
 [[-55,60],[-45,60],[-20,70],[-20,80],[-60,82],[-72,78],[-60,70]],
 [[-80,8],[-72,12],[-62,10],[-52,5],[-35,-5],[-38,-13],[-40,-22],[-48,-26],[-58,-35],[-65,-41],[-68,-50],[-72,-54],[-75,-50],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0]],
 [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[8,57],[5,60],[10,63],[15,68],[25,71],[40,68],[45,60],[40,45],[30,46],[28,41],[22,37],[15,40],[12,44],[8,44],[3,43],[-1,37]],
 [[-6,50],[2,51],[0,54],[-3,58],[-6,57]],
 [[-17,21],[-16,12],[-12,7],[-5,5],[5,6],[9,4],[9,0],[13,-6],[12,-17],[18,-35],[25,-34],[33,-27],[40,-15],[40,-3],[51,11],[44,11],[38,18],[33,28],[32,31],[20,32],[10,37],[-1,36],[-9,33]],
 [[26,40],[36,36],[35,32],[43,13],[52,16],[58,22],[56,26],[62,25],[67,24],[73,20],[77,8],[80,15],[88,22],[92,21],[98,16],[100,5],[104,1],[106,10],[109,12],[108,21],[115,22],[122,30],[121,40],[126,38],[129,35],[130,43],[142,47],[140,55],[155,60],[163,62],[180,66],[180,72],[140,73],[110,77],[80,73],[68,70],[60,68],[45,66],[40,68],[45,60],[40,45],[48,42],[53,37],[45,40]],
 [[95,5],[105,-6],[115,-8],[125,-8],[131,-3],[141,-3],[150,-10],[141,-9],[132,-1],[120,1],[118,5],[110,2],[104,-2]],
 [[130,31],[136,34],[141,38],[142,44],[140,41],[135,35]],
 [[114,-22],[123,-17],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[135,-35],[129,-32],[115,-34]],
 [[44,-25],[49,-14],[50,-16],[47,-25]],[[172,-34],[178,-38],[174,-41],[167,-46],[170,-45]],[[-24,64],[-14,66],[-14,64],[-22,63]]];
function inPoly(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;}
const LANDDOTS=[];for(let lat=78;lat>=-56;lat-=2.6)for(let lon=-178;lon<=180;lon+=2.6){if(LAND.some(p=>inPoly(lon,lat,p)))LANDDOTS.push([lon,lat]);}

/* flat dotted world map with validators and live consensus arcs */
function drawWorld(cv,now,o){if(!cv||!cv._w)return;o=o||{};const c=cv.getContext('2d'),W=cv._w,H=cv._h;c.clearRect(0,0,W,H);
  if(o.aurora){const t=now/7000;[[.22+.08*Math.sin(t),.38,'0,135,81'],[.72+.07*Math.cos(t*1.3),.62,'31,229,140'],[.5+.1*Math.sin(t*.7),.2,'255,255,255']].forEach(([fx,fy,rgb],i)=>{const g=c.createRadialGradient(W*fx,H*fy,0,W*fx,H*fy,W*(i===2?.18:.32));g.addColorStop(0,'rgba('+rgb+','+(C.light?.08:(i===2?.035:.14))+')');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.fillRect(0,0,W,H);});
    const sx=(now/22)%(W+200)-100;const sg=c.createLinearGradient(sx-80,0,sx+80,0);sg.addColorStop(0,'rgba(31,229,140,0)');sg.addColorStop(.5,C.light?'rgba(0,135,81,.06)':'rgba(31,229,140,.07)');sg.addColorStop(1,'rgba(31,229,140,0)');c.fillStyle=sg;c.fillRect(sx-80,0,160,H);}
  const top=80,bot=-58;const mh=Math.min(H,W*.56),oy=(H-mh)*.62;const px=lon=>(lon+180)/360*W,py=lat=>oy+(top-lat)/(top-bot)*mh;
  const r=Math.max(1,W/520);c.fillStyle=C.light?'rgba(0,110,60,.22)':'rgba(120,255,190,.16)';
  LANDDOTS.forEach(d=>{c.beginPath();c.arc(px(d[0]),py(d[1]),r,0,7);c.fill();});
  const cnt={};const pos=v=>{const n=(cnt[v.city.n]||0);return [px(v.city.lon)+(n%3-1)*2.2,py(v.city.lat)+(Math.floor(n/3)%3-1)*2.2];};
  const P2={};V.forEach(v=>{P2[v.id]=pos(v);cnt[v.city.n]=(cnt[v.city.n]||0)+1;});
  c.lineWidth=1.2;S.arcs.forEach(a=>{const A=P2[a.a],B=P2[a.b];if(!A||!B)return;const k=(now-a.t)/1400;const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2-Math.hypot(B[0]-A[0],B[1]-A[1])*.28;
    c.strokeStyle=C.acc;c.globalAlpha=.42*(1-k);c.beginPath();c.moveTo(A[0],A[1]);c.quadraticCurveTo(mx,my,B[0],B[1]);c.stroke();
    const s=Math.min(1,k*1.5);const x=(1-s)*(1-s)*A[0]+2*(1-s)*s*mx+s*s*B[0],y=(1-s)*(1-s)*A[1]+2*(1-s)*s*my+s*s*B[1];c.globalAlpha=1-k;c.fillStyle=C.acc;c.beginPath();c.arc(x,y,1.8,0,7);c.fill();});
  c.globalAlpha=1;
  V.forEach(v=>{const [x,y]=P2[v.id];const lead=v.id===S.leader&&!S.halted;const col=v.jailed?C.dim:!v.on?C.bad:lead?C.tok:C.acc;
    c.fillStyle=col;c.globalAlpha=.2;c.beginPath();c.arc(x,y,lead?11:4.5,0,7);c.fill();c.globalAlpha=1;c.beginPath();c.arc(x,y,lead?3.2:1.7,0,7);c.fill();
    if(lead){const q=(now%1600)/1600;c.strokeStyle=C.tok;c.globalAlpha=.6*(1-q);c.beginPath();c.arc(x,y,4+q*22,0,7);c.stroke();c.globalAlpha=1;}});
  if(o.labels&&W>640){c.font='600 9.5px "JetBrains Mono", monospace';c.fillStyle=C.mut;['Lagos','London','New York','Dubai','Singapore','São Paulo','Nairobi','Tokyo','Johannesburg','Frankfurt','Sydney','Mumbai'].forEach(n=>{const ct=CITY(n);c.fillText(n.toUpperCase(),px(ct.lon)+7,py(ct.lat)-6);});}}

/* semicircle gauge with ticks and needle */
function gauge(v,max,label,unit,col){const f=clamp(v/max,0,1);const cx=140,cy=130,R=104;const arc=(a0,a1,r)=>{const p=a=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];const s=p(a0),e=p(a1);return 'M'+s[0]+' '+s[1]+' A'+r+' '+r+' 0 '+(a1-a0>Math.PI?1:0)+' 1 '+e[0]+' '+e[1];};
  const a0=Math.PI,a1=Math.PI+f*Math.PI;let ticks='';for(let i=0;i<=40;i++){const a=Math.PI+i/40*Math.PI;const r1=R+10,r2=R+(i%5===0?20:15);ticks+='<line x1="'+(cx+r1*Math.cos(a)).toFixed(1)+'" y1="'+(cy+r1*Math.sin(a)).toFixed(1)+'" x2="'+(cx+r2*Math.cos(a)).toFixed(1)+'" y2="'+(cy+r2*Math.sin(a)).toFixed(1)+'" style="stroke:'+(i/40<=f?col:'var(--hair3)')+'" stroke-width="'+(i%5===0?2:1)+'"/>';}
  const na=Math.PI+f*Math.PI;const nx=cx+(R-18)*Math.cos(na),ny=cy+(R-18)*Math.sin(na);
  return '<div class="gauge"><svg viewBox="0 0 280 160" aria-hidden="true">'+ticks+'<path d="'+arc(Math.PI,2*Math.PI-.0001,R)+'" fill="none" style="stroke:var(--hair2)" stroke-width="12" stroke-linecap="round"/>'+(f>0.001?'<path d="'+arc(a0,a1,R)+'" fill="none" style="stroke:'+col+';filter:drop-shadow(0 0 8px '+col+')" stroke-width="12" stroke-linecap="round"/>':'')+
   '<line x1="'+cx+'" y1="'+cy+'" x2="'+nx.toFixed(1)+'" y2="'+ny.toFixed(1)+'" style="stroke:var(--fg)" stroke-width="2.5" stroke-linecap="round"/><circle cx="'+cx+'" cy="'+cy+'" r="6" style="fill:var(--fg)"/>'+
   '<text x="'+cx+'" y="'+(cy-30)+'" text-anchor="middle" style="fill:var(--fg)" font-size="26" font-weight="500">'+label+'</text><text x="'+cx+'" y="'+(cy-10)+'" text-anchor="middle" style="fill:var(--muted)" font-size="10" font-family="Manrope,sans-serif" font-weight="800" letter-spacing="1">'+unit+'</text>'+
   '<text x="'+(cx-R)+'" y="'+(cy+22)+'" text-anchor="middle" style="fill:var(--dim)" font-size="9">0</text><text x="'+(cx+R)+'" y="'+(cy+22)+'" text-anchor="middle" style="fill:var(--dim)" font-size="9">'+compact(max)+'</text></svg></div>';}
/* heat strip: values 0..1 into a grid of cells */
function heat(vals,cols,colorFn){return '<div class="hm" style="grid-template-columns:repeat('+cols+',minmax(0,1fr))">'+vals.map(v=>'<i style="background:'+colorFn(v)+'" title=""></i>').join('')+'</div>';}
function greenRamp(v){const a=clamp(v,0,1);return C.light?'rgba(0,135,81,'+(0.08+a*.85).toFixed(2)+')':'rgba(31,229,140,'+(0.06+a*.85).toFixed(2)+')';}
/* radar chart */
function radar(axes,vals,col){const n=axes.length,cx=130,cy=120,R=86;const pt=(i,r)=>[cx+r*Math.sin(i/n*Math.PI*2),cy-r*Math.cos(i/n*Math.PI*2)];
  let g='';for(let k=1;k<=4;k++){g+='<polygon points="'+axes.map((_,i)=>pt(i,R*k/4).join(',')).join(' ')+'" fill="none" style="stroke:var(--hair2)"/>';}
  axes.forEach((a,i)=>{const [x,y]=pt(i,R);g+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" style="stroke:var(--hair2)"/>';const [lx,ly]=pt(i,R+18);g+='<text x="'+lx+'" y="'+(ly+3)+'" text-anchor="middle" style="fill:var(--muted)" font-size="9" font-family="Manrope,sans-serif" font-weight="800">'+a+'</text>';});
  const poly=vals.map((v,i)=>pt(i,R*clamp(v,0,1)).join(',')).join(' ');
  return '<svg viewBox="0 0 260 240" style="width:100%;max-width:320px;height:auto" aria-hidden="true">'+g+'<polygon points="'+poly+'" style="fill:'+col+';fill-opacity:.18;stroke:'+col+';filter:drop-shadow(0 0 6px '+col+')" stroke-width="2"/>'+vals.map((v,i)=>{const [x,y]=pt(i,R*clamp(v,0,1));return '<circle cx="'+x+'" cy="'+y+'" r="3" style="fill:'+col+'"/>';}).join('')+'</svg>';}
/* stacked area of transaction types */
function stackChart(cv,hist){if(!cv||!cv._w)return;const c=cv.getContext('2d'),W=cv._w,H=cv._h;c.clearRect(0,0,W,H);const keys=['transfer','defi','bank','private','system'];const n=hist.length;if(n<2)return;
  const tot=hist.map(h=>keys.reduce((a,k)=>a+h[k],0));const mx=Math.max(...tot,1);const L=0,B=4;const xs=i=>L+(W-L)*i/(n-1);
  let base=new Array(n).fill(0);keys.forEach(k=>{const top=base.map((b,i)=>b+hist[i][k]);c.beginPath();top.forEach((v,i)=>{const x=xs(i),y=H-B-(v/mx)*(H-B-6);i?c.lineTo(x,y):c.moveTo(x,y);});for(let i=n-1;i>=0;i--){c.lineTo(xs(i),H-B-(base[i]/mx)*(H-B-6));}c.closePath();c.fillStyle=C.types[k];c.globalAlpha=.55;c.fill();c.globalAlpha=1;base=top;});}
/* smooth number tween */
function setNum(el,v,f){if(!el)return;if(reduce||el._v==null||!isFinite(el._v)){el._v=v;el.textContent=f(v);return;}const from=el._v,t0=performance.now();el._v=v;cancelAnimationFrame(el._raf);const step=t=>{const k=clamp((t-t0)/450,0,1);const e=1-Math.pow(1-k,3);el.textContent=f(from+(v-from)*e);if(k<1)el._raf=requestAnimationFrame(step);};el._raf=requestAnimationFrame(step);}
function kpi(id,label,icon,sub,extra){return '<div class="kpi"><div class="kh"><span class="cap">'+label+'</span>'+(icon?'<span class="ico">'+icon+'</span>':'')+'</div><span class="v" id="'+id+'">—</span><span class="s" id="'+id+'s">'+(sub||'')+'</span>'+(extra||'')+'</div>';}
Object.assign(IC,{
 bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 cube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>',
 users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.6c2 .8 3.2 2.7 3.6 5.4"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/></svg>',
 flame:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 22c4 0 7-3 7-7 0-5-4-7-5-12-2 3-1 5-3 7-1-1-2-2-2-4-2 2-4 5-4 9 0 4 3 7 7 7z"/></svg>',
 coins:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M15 11.5c3.3 0 6 1.3 6 3v4c0 1.7-2.7 3-6 3-2.4 0-4.4-.7-5.4-1.7"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 018 0v3.5"/></svg>',
 globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>',
 server:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="4" width="17" height="7" rx="2"/><rect x="3.5" y="13" width="17" height="7" rx="2"/><path d="M7.5 7.5h.01M7.5 16.5h.01"/></svg>',
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg>',
 sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
 moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg>',
 grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
 sliders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
 alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5h.01"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
 code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>',
 palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 100 18c1.2 0 1.6-1 1.1-1.9-.6-1-.1-2.1 1.1-2.1H17a4 4 0 004-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
 activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
 key:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="15" r="4.5"/><path d="M11.5 11.5L20 3M16.5 6.5l3 3"/></svg>',
 droplet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z"/></svg>'
});
