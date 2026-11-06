/* ===================== TOKENS, TOKEN STUDIO, CROSS-CHAIN GATEWAY ===================== */
const B58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const b58=n=>{let s='';for(let i=0;i<n;i++)s+=B58[Math.floor(Math.random()*58)];return s;};
const CHAINS=[
 {id:'btc',n:'Bitcoin',assets:['BTC'],wait:'2 confirmations',ms:16000,addr:()=>'bc1q'+hex(38).replace(/[0-9]/g,c=>'acdefghj'[c%8]),height:871240,bt:600},
 {id:'eth',n:'Ethereum',assets:['ETH','USDT','USDC'],wait:'12 blocks',ms:8000,addr:()=>'0x'+hex(40),height:21390112,bt:12},
 {id:'sol',n:'Solana',assets:['SOL','USDC'],wait:'finalized slot',ms:2500,addr:()=>b58(44),height:301118804,bt:.4},
 {id:'trx',n:'Tron',assets:['TRX','USDT'],wait:'19 blocks',ms:4000,addr:()=>'T'+b58(33),height:67112090,bt:3},
 {id:'bnb',n:'BNB Chain',assets:['BNB','USDT'],wait:'15 blocks',ms:3500,addr:()=>'0x'+hex(40),height:44218335,bt:3},
 {id:'base',n:'Base',assets:['ETH','USDC'],wait:'L2 finality',ms:3000,addr:()=>'0x'+hex(40),height:23001877,bt:2}];
CHAINS.forEach(c=>{c.on=true;c.lag=rnd(.5,3);c.dep=c.addr();});
/* testnet pool prices for wrapped assets (set by testnet liquidity, not a market quote) */
const WRAP={rBTC:{a:'BTC',name:'Bitcoin on Rivers',px:68000,dec:8},rETH:{a:'ETH',name:'Ether on Rivers',px:3400,dec:8},rSOL:{a:'SOL',name:'Solana on Rivers',px:160,dec:6},rTRX:{a:'TRX',name:'Tron on Rivers',px:.24,dec:4},
 rBNB:{a:'BNB',name:'BNB on Rivers',px:600,dec:6},rUSDT:{a:'USDT',name:'Tether on Rivers',px:1,dec:2},rUSDC:{a:'USDC',name:'USD Coin on Rivers',px:1,dec:2}};
const VAULT={};const VLOCK={btc:{BTC:412.5},eth:{ETH:7120,USDT:1.42e7,USDC:9.1e6},sol:{SOL:184000,USDC:5.2e6},trx:{TRX:2.1e7,USDT:1.36e7},bnb:{BNB:6400,USDT:3.4e6},base:{ETH:2700,USDC:4.3e6}};
CHAINS.forEach(c=>{VAULT[c.id]={};c.assets.forEach(a=>VAULT[c.id][a]=VLOCK[c.id][a]);});
const MINTED={};const PENDREL={};const PENDMINT={};
Object.keys(WRAP).forEach(k=>{const w=WRAP[k];MINTED[k]=CHAINS.reduce((s,c)=>s+(VAULT[c.id][w.a]||0),0);PENDREL[k]=0;PENDMINT[k]=0;
  TOKENS[k]={name:w.name,c:'var(--pearl)',bg:'var(--raise)',dec:w.dec>4?4:w.dec};
  const depthTok=MINTED[k]*.12;POOLS['USDs/'+k]={a:'USDs',b:k,x:depthTok*w.px,y:depthTok,vol:0,fees:0,lp:100000};});
const TMETA={RVRB:{type:'Native',features:['Staking','Gas','Governance'],creator:'Genesis',block:0,holders:1284330,dec:9},
 USDs:{type:'Stablecoin',features:['Issuer backed','Freezable','Shielded'],creator:'Licensed issuer',block:1200,holders:402117,dec:6},
 NGNs:{type:'Stablecoin',features:['Issuer backed','Freezable','Shielded'],creator:'Licensed issuer',block:88000,holders:211904,dec:6},
 EURs:{type:'Stablecoin',features:['Issuer backed','Freezable'],creator:'Licensed issuer',block:91000,holders:58210,dec:6},
 KESs:{type:'Stablecoin',features:['Issuer backed','Freezable'],creator:'Licensed issuer',block:120400,holders:33012,dec:6},
 GBPs:{type:'Stablecoin',features:['Issuer backed','Freezable'],creator:'Licensed issuer',block:118000,holders:41980,dec:6}};
Object.keys(WRAP).forEach(k=>TMETA[k]={type:'Cross-chain',features:['1:1 backed','Burn to redeem'],creator:'Rivers gateway',block:3200,holders:Math.round(rnd(4000,90000)),dec:WRAP[k].dec});
const STUDIO_SEED=[['NAIJ','Naija Fan Token','Fungible',5e7,9,['Burnable'],18400],['LCP','Lagos Coffee Points','Reward points',2e6,0,['Mintable','Burnable'],2210],['AGRO','Agro Harvest','Governance',1e7,9,['Burnable','Vesting'],6120]];
STUDIO_SEED.forEach(([sym,name,type,sup,dec,f,h])=>{TOKENS[sym]={name,c:'var(--mint)',bg:'rgba(198,243,107,.12)',dec:Math.min(dec,4)};TMETA[sym]={type,features:f.concat(['Token Studio']),creator:'0x'+hex(40),block:Math.floor(rnd(3e6,4.1e6)),holders:h,dec,supply:sup};POOLS['USDs/'+sym]={a:'USDs',b:sym,x:rnd(2e4,9e4),y:sup*.04,vol:0,fees:0,lp:100000};});
function tokenSupply(t){if(t==='RVRB')return circulating();if(MINTED[t]!=null)return MINTED[t];if(TMETA[t]&&TMETA[t].supply)return TMETA[t].supply;if(MARKETS[t])return MARKETS[t].sup*1.6;const p=POOLS['USDs/'+t];return p?p.y*8:0;}
Object.assign(S.W.bal,{rBTC:.0124,rETH:.84,rSOL:12.5,rTRX:0,rBNB:0,rUSDT:250,rUSDC:0,NAIJ:0,LCP:0,AGRO:0});
S.xc=[];S.xcSeq=40210;
if(!P.tokenFee)P.tokenFee=1;M.tokenFactory=true;M.crossChain=true;MOD_LABEL.tokenFactory='Token Studio (create tokens)';MOD_LABEL.crossChain='Cross-chain gateway';

/* ---------- cross-chain movements ---------- */
const XC_STEPS={in:['Seen on origin chain','Confirmed','Locked in Rivers vault','Minted 1:1 on Rivers'],out:['Burned on Rivers','Signed by two thirds of validators','Released from vault','Arrived on destination']};
function xcStart(dir,chain,asset,amt,addr,mine,auto){const id='XC-'+(++S.xcSeq);const c=CHAINS.find(x=>x.id===chain);const k='r'+asset;
  const x={id,dir,chain,asset,k,amt,addr,mine:!!mine,auto,t:Date.now(),born:performance.now(),step:0,dur:dir==='in'?c.ms:Math.max(2500,c.ms*.6),done:false};
  if(dir==='out'){MINTED[k]-=amt;PENDREL[k]+=amt;if(mine)S.W.bal[k]-=amt;x.tx=newTx({k:'Cross-chain burn',c:'transfer',gas:5200},{amt,tok:k,mine,label:'to '+c.n,sponsored:true});}
  S.xc.unshift(x);if(S.xc.length>120)S.xc.pop();return x;}
function xcTick(){const now=performance.now();S.xc.forEach(x=>{if(x.done)return;const c=CHAINS.find(y=>y.id===x.chain);if(!c.on||!M.crossChain||S.halted)return;
  const f=(now-x.born)/x.dur;const st=Math.min(4,Math.floor(f*4)+1);if(st>x.step){x.step=st;
   if(x.dir==='in'&&st===3){VAULT[x.chain][x.asset]=(VAULT[x.chain][x.asset]||0)+x.amt;PENDMINT[x.k]+=x.amt;}
   if(x.dir==='in'&&st===4){MINTED[x.k]+=x.amt;PENDMINT[x.k]-=x.amt;if(x.mine){S.W.bal[x.k]=(S.W.bal[x.k]||0)+x.amt;}x.tx=newTx({k:'Cross-chain mint',c:'transfer',gas:5200},{amt:x.amt,tok:x.k,mine:x.mine,label:'from '+c.n,sponsored:true});
     if(x.mine&&x.auto&&x.auto!==x.k&&M.dex){const got=quote(x.k,x.auto,x.amt,true);S.W.bal[x.k]-=x.amt;S.W.bal[x.auto]+=got;newTx(TT[1],{amt:x.amt,tok:x.k,mine:true,label:'auto-swap → '+fmtTok(got,x.auto)});x.swapped=got;}
     if(x.mine)toast(fmtTok(x.amt,x.k)+' arrived from '+c.n+(x.swapped?' and was swapped to '+fmtTok(x.swapped,x.auto):'')+'.');x.done=true;}
   if(x.dir==='out'&&st===3){VAULT[x.chain][x.asset]-=x.amt;PENDREL[x.k]-=x.amt;}
   if(x.dir==='out'&&st===4){x.done=true;if(x.mine)toast(x.amt+' '+x.asset+' arrived on '+c.n+'.');}}});
  if(Math.random()<.18&&M.crossChain){const c=pick(CHAINS.filter(z=>z.on));const a=pick(c.assets);const k='r'+a;const usd=rnd(50,40000);const amt=+(usd/WRAP[k].px).toFixed(WRAP[k].dec>4?6:2);
    if(Math.random()<.62)xcStart('in',c.id,a,amt,c.addr(),false);else if(MINTED[k]>amt*10)xcStart('out',c.id,a,amt,c.addr(),false);}
  CHAINS.forEach(c=>{c.height+=Math.random()<.5/c.bt?1:0;c.lag=clamp(c.lag+rnd(-.3,.3),.3,c.on?4:60);});}
function backing(k){const locked=CHAINS.reduce((s,c)=>s+(VAULT[c.id][WRAP[k].a]||0),0);return {locked,minted:MINTED[k],pend:PENDREL[k]+PENDMINT[k]};}
function backedOK(k){const b=backing(k);return Math.abs(b.locked-b.minted-b.pend)<=1e-6+b.locked*1e-9;}
function xcValue(){return Object.keys(WRAP).reduce((s,k)=>s+backing(k).locked*WRAP[k].px,0);}
function xcSteps(x){const L=XC_STEPS[x.dir];return '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin-top:6px">'+L.map((s,i)=>'<div style="display:grid;gap:4px"><div style="height:4px;border-radius:2px;background:'+(i<x.step?'var(--river)':'var(--hair2)')+';'+(i<x.step?'box-shadow:0 0 8px var(--river)':'')+'"></div><span style="font-size:.6rem;color:'+(i<x.step?'var(--fg2)':'var(--dim)')+'" class="trunc">'+s+'</span></div>').join('')+'</div>';}
function xcRow(x){const c=CHAINS.find(y=>y.id===x.chain);return '<div class="li"><span class="ty '+(x.dir==='in'?'transfer':'system')+'">'+(x.dir==='in'?'In':'Out')+'</span><span class="trunc"><b>'+fmt(x.amt,WRAP[x.k].dec>4?4:2)+' '+(x.dir==='in'?x.asset+' → '+x.k:x.k+' → '+x.asset)+'</b> <span class="muted">· '+c.n+'</span>'+xcSteps(x)+'</span><span class="r">'+(x.done?'<span class="b ok dot">Done</span>':'<span class="b info dot">'+x.step+'/4</span>')+'<br><span class="muted" style="font-size:.68rem">'+ago(x.t)+'</span></span></div>';}
function chainHub(){const W=700,H=360,cx=350,cy=180;const n=CHAINS.length;let s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto" aria-hidden="true"><defs><radialGradient id="hubg"><stop offset="0" stop-color="#1FE58C" stop-opacity=".5"/><stop offset="1" stop-color="#1FE58C" stop-opacity="0"/></radialGradient></defs><circle cx="'+cx+'" cy="'+cy+'" r="110" fill="url(#hubg)"/>';
  CHAINS.forEach((c,i)=>{const a=-Math.PI/2+i/n*Math.PI*2;const x=cx+Math.cos(a)*270,y=cy+Math.sin(a)*140;const val=c.assets.reduce((t,as)=>t+(VAULT[c.id][as]||0)*WRAP['r'+as].px,0);
   s+='<path d="M'+x+' '+y+' Q'+((x+cx)/2)+' '+((y+cy)/2-30)+' '+cx+' '+cy+'" fill="none" style="stroke:'+(c.on?'var(--river)':'var(--bad)')+';stroke-width:2;stroke-dasharray:6 8;animation:flow '+(1.2+i*.15)+'s linear infinite" stroke-opacity=".7"/>'+
    '<g><rect x="'+(x-62)+'" y="'+(y-26)+'" width="124" height="52" rx="14" style="fill:var(--card2);stroke:'+(c.on?'var(--hair3)':'var(--bad)')+'"/><text x="'+x+'" y="'+(y-5)+'" text-anchor="middle" style="fill:var(--fg)" font-size="12" font-family="Manrope,sans-serif" font-weight="800">'+c.n+'</text><text x="'+x+'" y="'+(y+12)+'" text-anchor="middle" style="fill:var(--muted)" font-size="9.5">'+(c.on?'$'+compact(val)+' locked':'paused')+'</text></g>';});
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="46" style="fill:var(--deep);filter:drop-shadow(0 0 18px #1FE58C)"/><text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" fill="#fff" font-size="14" font-family="Unbounded,sans-serif" font-weight="700">RIVERS</text><text x="'+cx+'" y="'+(cy+14)+'" text-anchor="middle" fill="#CFFFE6" font-size="9">gateway</text></svg>';return s;}

/* ---------- Token Studio ---------- */
const TS={type:'Fungible',name:'Lagos Market Token',sym:'LMT',dec:9,supply:10000000,maxMode:'fixed',maxAmt:10000000,mint:false,burn:true,pause:false,freeze:false,feePct:0,shield:true,vest:false,vestPct:20,cliff:12,pool:true,poolTok:500000,poolUsd:2000,desc:'Rewards for shoppers at partner stores in Lagos.'};
const TS_TYPES=[['Fungible','Standard token for payments and apps'],['Stablecoin','Backed one to one by a licensed issuer'],['Governance','Votes on a project or community'],['Reward points','Loyalty points, no decimals by default'],['NFT collection','Unique items, one of each']];
function tsMove(){const m=TS.sym.toLowerCase().replace(/[^a-z0-9]/g,'')||'token';return 'module creator::'+m+' {\n    use rivers::token_studio;\n\n    /// '+esc(TS.name)+' ('+esc(TS.sym)+')\n    fun init(ctx: &mut TxContext) {\n        token_studio::create(\n            b"'+esc(TS.sym)+'", b"'+esc(TS.name)+'",\n            decimals: '+TS.dec+',\n            initial_supply: '+fmt(TS.supply).replace(/,/g,'_')+',\n            max_supply: '+(TS.maxMode==='fixed'?'fixed('+fmt(TS.supply).replace(/,/g,'_')+')':TS.maxMode==='capped'?'capped('+fmt(TS.maxAmt).replace(/,/g,'_')+')':'unlimited')+',\n            mintable: '+TS.mint+', burnable: '+TS.burn+',\n            pausable: '+TS.pause+', freezable: '+TS.freeze+',\n            transfer_fee_bps: '+Math.round(TS.feePct*100)+',\n            shielded_transfers: '+TS.shield+',\n            ctx\n        );\n    }\n}';}
function tsIssues(){const e=[];const s=TS.sym.trim().toUpperCase();if(!/^[A-Z0-9]{2,8}$/.test(s))e.push('Symbol must be 2 to 8 letters or numbers.');if(TOKENS[s])e.push('The symbol '+s+' is already taken on Rivers.');if(!TS.name.trim())e.push('Give the token a name.');
  if(!(TS.supply>0))e.push('Initial supply must be above zero.');if(TS.maxMode==='capped'&&TS.maxAmt<TS.supply)e.push('The cap cannot be below the initial supply.');if(TS.pool&&TS.poolTok>TS.supply*(TS.vest?1-TS.vestPct/100:1))e.push('Pool amount is more than the tokens you will hold.');
  if(TS.pool&&TS.poolUsd>S.W.bal.USDs)e.push('Not enough USDs in your wallet for the pool.');if(S.W.bal.RVRB<P.tokenFee)e.push('You need '+P.tokenFee+' RVRB for the creation fee.');if(!M.tokenFactory)e.push('Token Studio is paused by the network operators.');return e;}
function createToken(){const s=TS.sym.trim().toUpperCase();const vest=TS.vest?TS.supply*TS.vestPct/100:0;const pool=TS.pool?TS.poolTok:0;
  S.W.bal.RVRB-=P.tokenFee;S.treasury+=P.tokenFee;TOKENS[s]={name:TS.name.trim(),c:'var(--river)',bg:'linear-gradient(135deg,rgba(31,229,140,.3),rgba(255,255,255,.06))',dec:Math.min(TS.dec,4)};
  const feats=[];if(TS.mint)feats.push('Mintable');if(TS.burn)feats.push('Burnable');if(TS.pause)feats.push('Pausable');if(TS.freeze)feats.push('Freezable');if(TS.feePct>0)feats.push(TS.feePct+'% transfer fee');if(TS.shield)feats.push('Shielded');if(TS.vest)feats.push('Vesting');feats.push('Token Studio');
  TMETA[s]={type:TS.type,features:feats,creator:S.W.name,block:Math.floor(S.cp),holders:1,dec:TS.dec,supply:TS.supply,desc:TS.desc,mine:true};
  S.W.bal[s]=TS.supply-vest-pool;if(pool){S.W.bal.USDs-=TS.poolUsd;POOLS['USDs/'+s]={a:'USDs',b:s,x:TS.poolUsd,y:pool,vol:0,fees:0,lp:100000};S.W.lp['USDs/'+s]=100000;}
  PXH[s]=Array.from({length:30},()=>usdOf(s));const t=newTx({k:'Create token',c:'system',gas:48000},{amt:TS.supply,tok:s,mine:true,label:TS.name,sponsored:false});audit&&0;return {s,t};}
