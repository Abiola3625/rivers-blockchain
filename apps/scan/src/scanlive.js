/* ===================== RIVERS SCAN · LIVE ENGINE =====================
   The agreed Scan design, fed by the real Rivers testnet over gRPC-Web.
   The simulation in core.js never runs here; this file writes real chain data into the same
   state the pages read (S, V, P), and marks sections with no chain data yet as "Coming in Phase 2". */
const LV_DEF_RPC='https://psychic-guide-xvpv4rvg4pjhw54-9000.app.github.dev';
const lvStore={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}}};
const lvQS=new URLSearchParams(location.search);
const LV_RPC=(lvQS.get('rpc')||lvStore.get('rvScanRpc')||LV_DEF_RPC).replace(/\/+$/,'');
const LV_FAUCET=(lvQS.get('faucet')||lvStore.get('rvScanFaucet')||LV_RPC.replace(/-9000\./,'-9123.')).replace(/\/+$/,'');
const lvClient=new SuiGrpcClient({network:'testnet',baseUrl:LV_RPC});
const LSv=lvClient.ledgerService,SSv=lvClient.stateService;
const RVRB_T='0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
const SYS0='0x0000000000000000000000000000000000000000000000000000000000000000';
const SYS_OBJ={clock:'0x'+'0'.repeat(63)+'6',random:'0x'+'0'.repeat(63)+'8',acc:'0x'+'0'.repeat(61)+'acc'};
const LV_FAUCET_ADDR='0xdd5c04e0399b0970caa2b060e88a7019b850fd4adecc37de54ed74a085b645bd';
const GW=[['foundation-1','0x07a8281075e73de243207fc153ef50b49639b1ad2248a6948c1c24d4deb2c2e2'],['foundation-2','0x427538b95b648603c6df38147c0a7a6c7faf5a4b84852ea11efb5534bb1a0cdb'],['foundation-3','0x330dbde1b6613d92f3c1471906c7f1ae586d6efd8f830669ab205b986774c904'],['foundation-4','0x3796fb0a8e8d56d5364864c3ba2a456bca55c3c7e688c9c6c2ed03041b20cc33'],['foundation-5','0x4d378d8724487410d9ae5690b34cf01e5da5f2f575a53903eeba461b78e9c044'],['ecosystem-1','0x79278fc360728f04f0aba3727be8d70c2d4c38cd4abda4a89f6bea001e8c16ba'],['ecosystem-2','0x80dad1f51ac32fa49279124dfec476793e0d1e2e3a63d5cf63adf17a0723bd2e'],['ecosystem-3','0x36e753d87ae5852b3635446775ce3324c42b9a6e69adb1cda479677372030264'],['ecosystem-4','0xf1f7a296b87689504d6093457f0e63d79d0596f253a55a0163b81726d0630b9b'],['community-1','0x86da6f0bb1b0f3ec8df6a14d5b432dc76741caf8a77d91ff3cba9b394fc179a0'],['community-2','0xce662b18c4a8d69b16e2a103dba34cc749eb887de7cb250baf0a03a1afdf1a81'],['early-backers-1','0xb746ef31ec841b20466f8accb154facadc835253a3980922d463a815013cb12f'],['validator-bootstrap-1','0x6e58dc3e70e7ed4bf493cc48ecf05df156ee7ddd2cebd5683c49090908ac4be1'],['dex-liquidity-1','0x8ae1a07107be02909783ead89a84b7d17b0a81c03042d8ba0624088cbeb222f3']];
const GW_GROUP={foundation:'Foundation and developers',ecosystem:'Ecosystem and grants',community:'Community','early-backers':'Early backers','validator-bootstrap':'Validator bootstrap','dex-liquidity':'DEX liquidity'};
const GW_AT={foundation:400000,ecosystem:1000000,community:1000000,'early-backers':1000000,'validator-bootstrap':600000,'dex-liquidity':400000};
const LV_NAMES=new Map(GW.map(g=>[g[1],g[0]]));
const LV={online:null,latency:0,head:null,lowest:0,chainId:'',server:'',oldest:null,seen:new Set(),gw:{},faucetBal:null,ready:false,loadingOld:false,sys:null,rgp:1000,txd:{},cpPending:{},sign:{},total0:null};
const SOON='Coming soon';
const ACT_BUDGET='42424242';

/* ---------- formatting ---------- */
const lvRv=x=>{try{const b=BigInt(x==null?0:x);return Number(b/1000n)/1e6;}catch(e){return 0;}};
const lvTs=t=>t?Number(t.seconds)*1000+Math.floor((t.nanos||0)/1e6):0;
const lvName=a=>LV_NAMES.get(a)||(a===SYS0?'System':a===SYS_OBJ.clock?'Clock':a===SYS_OBJ.random?'Randomness':a===SYS_OBJ.acc?'Accumulator':a===LV_FAUCET_ADDR?'Testnet faucet':null);
const lvAddr=(a,k)=>{if(!a)return '<span class="dim">—</span>';const n=lvName(a);return '<a class="mono alink" href="#explorer-address-'+a+'">'+short(a,k||6)+'</a>'+(n?' <span class="ntag">'+esc(n)+'</span>':'');};
const lvNorm=a=>/^0x[0-9a-fA-F]{1,64}$/.test(a)?'0x'+a.slice(2).toLowerCase().padStart(64,'0'):null;

/* ---------- classify real transactions into the design's types ---------- */
const LV_SYS={consensusCommitPrologue:'Consensus commit',consensusCommitPrologueV2:'Consensus commit',consensusCommitPrologueV3:'Consensus commit',consensusCommitPrologueV4:'Consensus commit',randomnessStateUpdate:'Randomness update',changeEpoch:'Epoch change',endOfEpoch:'Epoch change',genesis:'Genesis',authenticatorStateUpdate:'Login keys update'};
function lvKind(tx){const d=tx&&tx.transaction&&tx.transaction.kind&&tx.transaction.kind.data;const k=d&&d.oneofKind||'';const snd=tx.transaction&&tx.transaction.sender;
  if(k==='programmableTransaction'){const cmds=d.programmableTransaction.commands.map(c=>c.command);const mc=cmds.find(c=>c.oneofKind==='moveCall');
    if(snd===SYS0)return {c:'system',type:'Settlement',label:mc?mc.moveCall.module+'::'+mc.moveCall.function:'',sys:true};
    if(mc)return {c:'defi',type:'Contract call',label:mc.moveCall.module+'::'+mc.moveCall.function,sys:false};
    if(cmds.some(c=>c.oneofKind==='publish'))return {c:'defi',type:'Publish',label:'new package',sys:false};
    return {c:'transfer',type:'Transfer',label:'',sys:false};}
  return {c:'system',type:LV_SYS[k]||'System',label:'',sys:true};}
function lvMapTx(tx,seq,ts,ms){const s=tx.transaction&&tx.transaction.sender;const k=lvKind(tx);const g=tx.effects&&tx.effects.gasUsed||{};
  let out=0n,to=null;for(const b of tx.balanceChanges||[]){if(b.coinType!==RVRB_T)continue;lvSeeAddr(b.address);const v=BigInt(b.amount);if(v>0n&&b.address!==s){out+=v;if(!to)to=b.address;}}
  const comp=BigInt(g.computationCost||0),stor=BigInt(g.storageCost||0),reb=BigInt(g.storageRebate||0);
  const sysTo=k.type==='Consensus commit'?SYS_OBJ.clock:k.type==='Randomness update'?SYS_OBJ.random:k.type==='Settlement'?SYS_OBJ.acc:'';
  return {id:tx.digest,type:k.type,c:k.c,label:k.label,sys:k.sys,from:k.sys?SYS0:s,to:k.sys?sysTo:(to||''),amt:k.sys?0:lvRv(out),tok:'RVRB',gas:Math.round(Number(comp)/Math.max(1,LV.rgp)),fee:lvRv(comp+stor),feeNet:lvRv(comp+stor-reb),rebate:lvRv(reb),comp:lvRv(comp),stor:lvRv(stor),
    activity:String(tx.transaction&&tx.transaction.gasPayment&&tx.transaction.gasPayment.budget)===ACT_BUDGET,sponsored:false,cp:seq,t:ts,born:performance.now()-(Date.now()-ts),ms:ms,final:true,mine:false,objs:(tx.effects&&tx.effects.changedObjects||[]).length,events:(tx.events&&tx.events.events||[]).length,ok:!(tx.effects&&tx.effects.status&&tx.effects.status.success===false),commitment:null,nullifier:null};}

/* roaring bitmap (signer set of a block certificate): array and run containers */
function lvRoaring(b){try{if(!b||b.length<8)return [];const dv=new DataView(b.buffer,b.byteOffset,b.byteLength);let o=0;const cookie=dv.getUint32(0,true);let n,run=null;
  if((cookie&0xffff)===12347){n=(cookie>>>16)+1;o=4;const rb=Math.ceil(n/8);run=b.slice(o,o+rb);o+=rb;}else if(cookie===12346){n=dv.getUint32(4,true);o=8;}else return [];
  const keys=[],cards=[];for(let i=0;i<n;i++){keys.push(dv.getUint16(o,true));cards.push(dv.getUint16(o+2,true)+1);o+=4;}
  if(run==null||n>=4)o+=4*n;const out=[];
  for(let i=0;i<n;i++){const hi=keys[i]<<16;const isRun=run&&(run[i>>3]>>(i&7))&1;
    if(isRun){const nr=dv.getUint16(o,true);o+=2;for(let r=0;r<nr;r++){const st=dv.getUint16(o,true),ln=dv.getUint16(o+2,true);o+=4;for(let v=st;v<=st+ln;v++)out.push(hi|v);}}
    else if(cards[i]<=4096){for(let j=0;j<cards[i];j++){out.push(hi|dv.getUint16(o,true));o+=2;}}
    else{for(let w=0;w<1024;w++){const lo=dv.getUint32(o,true),hiw=dv.getUint32(o+4,true);o+=8;for(let bit=0;bit<32;bit++){if(lo&(1<<bit))out.push(hi|(w*64+bit));if(hiw&(1<<bit))out.push(hi|(w*64+32+bit));}}}}
  return out;}catch(e){return [];}}

/* ---------- reading the chain ---------- */
const CP_MASK={paths:['sequence_number','digest','summary.timestamp','summary.total_network_transactions','summary.epoch','summary.previous_digest','signature.bitmap','contents.bcs',
 'transactions.digest','transactions.transaction.sender','transactions.transaction.kind','transactions.transaction.gas_payment.budget','transactions.effects.status','transactions.effects.gas_used','transactions.effects.changed_objects.object_id','transactions.events.events.event_type','transactions.balance_changes']};
async function lvFetchCp(seq){const have=S.cps.find(c=>c.n===seq);if(have)return have;if(LV.cpPending[seq])return LV.cpPending[seq];
  const p=(async()=>{const r=(await LSv.getCheckpoint({checkpointId:{oneofKind:'sequenceNumber',sequenceNumber:BigInt(seq)},readMask:CP_MASK})).response.checkpoint;
    const ts=lvTs(r.summary.timestamp);const prev=S.cps.find(c=>c.n===seq-1);const ms=prev?Math.max(1,ts-prev.t):Math.round(S.fin||250);
    const signers=lvRoaring(r.signature&&r.signature.bitmap);const all=(r.transactions||[]).map(t=>lvMapTx(t,seq,ts,ms));const txs=all;
    const cp={n:seq,txc:all.length,user:all.filter(t=>!t.sys).length,sys:all.filter(t=>t.sys).length,ms,leader:'—',t:ts,reward:blockReward(),txs:0,digest:r.digest,prev:r.summary.previousDigest,epoch:Number(r.summary.epoch),total:Number(r.summary.totalNetworkTransactions),
      sigs:signers.length||Math.ceil(V.length*2/3),signers,size:Math.max(.01,((r.contents&&r.contents.bcs&&r.contents.bcs.value||[]).length)/1024),ids:txs.map(t=>t.id)};
    const nx=S.cps.find(c=>c.n===seq+1);if(nx&&nx._msGuess){nx.ms=Math.max(1,nx.t-ts);nx._msGuess=false;}if(!prev)cp._msGuess=true;
    S.cps.push(cp);S.cps.sort((a,b)=>b.n-a.n);if(S.cps.length>700)S.cps.length=700;
    for(const t of txs)if(!LV.seen.has(t.id)){LV.seen.add(t.id);S.txs.push(t);}
    S.txs.sort((a,b)=>b.cp-a.cp);if(S.txs.length>6000){let sysN=0;S.txs=S.txs.filter(t=>{if(!t.sys)return true;sysN++;if(sysN<=4000)return true;LV.seen.delete(t.id);return false;});const u=S.txs.filter(t=>!t.sys);if(u.length>3000){const cut=new Set(u.slice(3000).map(t=>t.id));S.txs=S.txs.filter(t=>!cut.has(t.id));}}
    if(LV.oldest==null||seq<LV.oldest)LV.oldest=seq;return cp;})();
  LV.cpPending[seq]=p;try{return await p;}finally{delete LV.cpPending[seq];}}
async function lvBatch(list,n,fn){for(let i=0;i<list.length;i+=n)await Promise.all(list.slice(i,i+n).map(x=>fn(x).catch(e=>null)));}

async function lvPoll(){const t0=performance.now();
  try{const si=(await LSv.getServiceInfo({})).response;LV.latency=performance.now()-t0;LV.online=true;LV.chainId=si.chainId;LV.server=si.server;LV.lowest=Number(si.lowestAvailableCheckpoint||0);
    const h=Number(si.checkpointHeight);const from=LV.head==null?Math.max(LV.lowest,h-60):Math.max(LV.head+1,h-14);const need=[];for(let s=from;s<=h;s++)need.push(s);
    if(need.length){await lvBatch(need,8,lvFetchCp);const fresh=need.map(s=>S.cps.find(c=>c.n===s)).filter(Boolean);LV.head=h;lvAfterBlocks(fresh);}
  }catch(e){LV.online=false;console.warn(e);}
  if(LV.ready){renderChrome();updateView();}}
function lvAfterBlocks(fresh){if(!fresh.length)return;fresh.sort((a,b)=>a.n-b.n);
  const win=S.cps.slice(0,40);const ints=win.map(c=>c.ms).filter(x=>x>0).sort((a,b)=>a-b);
  const a=S.cps[Math.min(S.cps.length-1,60)],b=S.cps[0];const span=a&&b&&b.t>a.t?(b.t-a.t)/1000:0;const win2=S.cps.filter(c=>c.n>a.n&&c.n<=b.n);const tps=span?(b.total-a.total)/span:0;LV.walletTps=span?win2.reduce((x,c)=>x+c.user,0)/span:0;
  S.tps=tps;S.fin=ints.length?ints.reduce((x,y)=>x+y,0)/ints.length:S.fin;S.p95=ints.length?ints[Math.floor(ints.length*.95)]:S.fin;S.base=S.fin;S.peak=Math.max(S.peak||0,tps);
  S.cp=b.n;S.totalTx=b.total;if(LV.total0==null)LV.total0=b.total;S.txToday=b.total;S.epoch=b.epoch;P.cpMs=Math.max(1,Math.round(S.fin));
  const m={transfer:0,defi:0,bank:0,private:0,system:0};
  for(const c of fresh){S.finHist[Math.min(11,Math.floor(c.ms/100))]+=1;for(const id of c.ids){const t=S.txs.find(x=>x.id===id);if(t){m[t.c]++;S.mix[t.c]=(S.mix[t.c]||0)+1;}}
    c.signers.forEach(i=>{LV.sign[i]=(LV.sign[i]||0)+1;});V.forEach((v,i)=>{if(c.signers.length){if(c.signers.includes(i))v.signed++;else v.missed++;}v.bits=(v.bits||[]);v.bits.push(c.signers.length?c.signers.includes(i)?1:0:1);if(v.bits.length>60)v.bits.shift();v.up=v.bits.some(x=>x)?100:0;v.on=v.up>0;});}
  S.mixHist.push(m);if(S.mixHist.length>120)S.mixHist.shift();
  S.hist.tps.push(tps);S.hist.fin.push(S.fin);S.hist.t.push(Date.now());for(const k of ['tps','fin','t'])if(S.hist[k].length>240)S.hist[k].shift();
  S.feesToday=S.txs.reduce((x,t)=>x+(t.sys?0:t.feeNet),0);}

async function lvPollSystem(){try{const ep=(await LSv.getEpoch({readMask:{paths:['system_state','start','reference_gas_price']}})).response.epoch;const sys=ep.systemState;LV.sys=sys;
  LV.rgp=Number(ep.referenceGasPrice||sys.referenceGasPrice||1000);P.gasPrice=LV.rgp;S.epoch=Number(sys.epoch);S.epochStart=Number(sys.epochStartTimestampMs)||lvTs(ep.start);
  P.epochHours=Number(sys.parameters.epochDurationMs)/3.6e6;P.maxValidators=Number(sys.parameters.maxValidatorCount);P.minStake=lvRv(sys.parameters.minValidatorJoiningStake);
  const ss=sys.stakeSubsidy;S.reserve=lvRv(ss.balance);S.emitted=MINED-S.reserve;
  const act=sys.validators.activeValidators;const old=V.slice();V.length=0;
  act.forEach((x,i)=>{const o=old.find(v=>v.addr===x.address)||{};const st=lvRv(x.stakingPool.suiBalance);
    V.push({id:i,name:x.name,city:{n:'Not published',c:'Testnet',cc:'',lon:NaN,lat:NaN},stake:st,self:st,comm:Number(x.commissionRate)/100,up:o.up!=null?o.up:100,on:true,jailed:false,power:Number(x.votingPower)/10000,
      joined:Number(x.stakingPool.activationEpoch||0),signed:o.signed||0,missed:o.missed||0,bits:o.bits||[],addr:x.address,gas:Number(x.gasPrice),next:lvRv(x.nextEpochStake),pool:x.stakingPool.id,desc:x.description,url:x.projectUrl});});
  S.leader=0;}catch(e){console.warn(e);}}
async function lvPollWallets(){await lvBatch(GW.concat([['faucet',LV_FAUCET_ADDR]]),6,async g=>{const b=(await SSv.getBalance({owner:g[1],coinType:RVRB_T})).response.balance;const v=lvRv(b&&b.balance||0);if(g[0]==='faucet')LV.faucetBal=v;else LV.gw[g[1]]=v;});}

/* ---------- supply, from real balances ---------- */
function lvGroup(g){return GW.filter(x=>x[0].replace(/-\d+$/,'')===g).reduce((a,x)=>a+(LV.gw[x[1]]||0),0);}
function supplyBuckets(){const st=stakedTotal(),fau=LV.faucetBal||0;const parts=[['Staked with validators',st,'var(--river)'],['Not yet mined',S.reserve,'var(--dim)'],['Foundation and developers',lvGroup('foundation'),'#FFFFFF'],['Ecosystem and grants',lvGroup('ecosystem'),'var(--violet)'],
  ['Community',lvGroup('community'),'var(--mint)'],['Early backers',lvGroup('early-backers'),'#00A862'],['DEX liquidity',lvGroup('dex-liquidity'),'var(--gold)'],['Testnet faucet',fau,'#9FE8C8']];
  const known=parts.reduce((a,p)=>a+p[1],0);parts.push(['Other holders',Math.max(0,SUPPLY-known),'var(--deep)']);if(C.light)parts[2][2]='#03241A';return parts;}
function circulating(){return SUPPLY-S.reserve;}
function computePower(){}
function pickTT(){const r=S.txs.slice(0,200);if(!r.length)return TT[TT.length-1];const t=r[Math.floor(Math.random()*r.length)];return {k:t.type,c:t.c,w:0,gas:t.gas};}
function topTokens(){return [];}

/* ---------- rows and pages with real fields ---------- */
function txRow(t){const amt=t.amt?fmt(t.amt,4)+' RVRB':'<span class="dim">0 RVRB</span>';
  return '<div class="li click" data-act="tx" data-id="'+t.id+'"><span class="ty '+t.c+'">'+esc(t.type)+'</span><span class="mono trunc">'+short(t.id,8)+'</span><span class="r">'+amt+'</span>'+
    '<span class="s">'+(t.ok?'':'Failed · ')+'Block #'+fmt(t.cp)+' · '+ago(t.t)+' · '+short(t.from,4)+' → '+(t.to?short(t.to,4):'—')+(t.sys?'':' · Fee '+fmtA(t.feeNet)+' RVRB')+'</span></div>';}
function cpRow(c){return '<div class="li click" data-act="cp" data-n="'+c.n+'"><span class="tag">BLK</span><span class="mono">#'+fmt(c.n)+'</span><span class="r">'+fmt(c.txc)+' tx</span><span class="s">'+fmt(c.ms)+' ms · '+c.sigs+'/'+V.length+' signatures · '+ago(c.t)+'</span></div>';}
function streamRow(t){return '<div class="li click" data-act="tx" data-id="'+t.id+'" style="animation:rise .45s both"><span class="ty '+t.c+'">'+esc(t.type)+'</span><span class="trunc"><span class="mono">'+short(t.id,7)+'</span> <span class="muted" style="font-size:.74rem">'+(short(t.from,5)+' → '+(t.to?short(t.to,5):esc(t.label||'contract')))+'</span></span><span class="r">'+(t.amt?fmt(t.amt,3)+' RVRB':'<span class="dim">0 RVRB</span>')+'</span></div>';}
function marquee(){const u=S.txs.filter(t=>!t.sys);const l=(u.length>=6?u:u.concat(S.txs.filter(t=>t.sys))).slice(0,22);const chip=t=>'<a data-act="tx" data-id="'+t.id+'"><i style="background:'+C.types[t.c]+'"></i>'+esc(t.type)+' · '+short(t.id,5)+' · '+(t.amt?fmt(t.amt,2)+' RVRB':short(t.from,4)+' → '+short(t.to||'',4))+'</a>';const h=l.map(chip).join('');return '<div class="trk">'+h+h+'</div>';}
function partyCell(t,side){return lvAddr(t[side],6);}
function lvSame(n){return S.txs.filter(x=>x.cp===n);}

const TX_MASK={paths:['digest','transaction.sender','transaction.kind','transaction.gas_payment','effects.status','effects.gas_used','effects.changed_objects','checkpoint','timestamp','balance_changes','events.events.event_type']};
async function lvLoadTx(id){if(LV.txd[id])return LV.txd[id];const tx=(await LSv.getTransaction({digest:id,readMask:TX_MASK})).response.transaction;const seq=Number(tx.checkpoint||0);const ts=lvTs(tx.timestamp);
  const cp=S.cps.find(c=>c.n===seq);const t=lvMapTx(tx,seq,ts,cp?cp.ms:Math.round(S.fin||0));t.raw=tx;LV.txd[id]=t;if(!LV.seen.has(id)){LV.seen.add(id);S.txs.push(t);S.txs.sort((a,b)=>b.cp-a.cp);}return t;}
function txPage(t){const d=LV.txd[t.id];if(!d){lvLoadTx(t.id).then(()=>{if(CUR.sub==='tx'&&CUR.param===t.id)route();}).catch(()=>{});}
  if(t.cp&&!S.cps.find(c=>c.n===t.cp)&&!LV.cpPending[t.cp])lvFetchCp(t.cp).then(()=>{if(CUR.sub==='tx'&&CUR.param===t.id)route();}).catch(()=>{});
  const x=d||t;const raw=d&&d.raw;const lab=l=>{l=l||'';return l.length>22?l.split('::').pop().replace(/_/g,' ').slice(0,22):l;};const flow=flowSvg(short(x.from||'',6),'Rivers',x.to?short(x.to,6):'Block #'+fmt(x.cp),x.amt?fmt(x.amt,4)+' RVRB':esc(lab(x.sys?x.type:(x.label||x.type))),false)+'<div class="flowlinks"><span>From '+lvAddr(x.from,8)+'</span><span>To '+(x.to?lvAddr(x.to,8):'<span class="dim">—</span>')+'</span></div>';
  const bc=raw?(raw.balanceChanges||[]):[];const ev=raw?(raw.events&&raw.events.events||[]):[];const objs=raw?(raw.effects&&raw.effects.changedObjects||[]):[];const cpi=S.cps.find(c=>c.n===x.cp);
  const conf=Math.max(0,S.cp-x.cp);const tot=x.comp+x.stor||1;
  return `<section class="card hud"><div class="ch"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><a class="icobtn" href="#explorer-transactions" aria-label="Back">←</a><span class="ty ${x.c}" style="font-size:.8rem;padding:5px 10px">${esc(x.type)}</span><span id="txStat">${x.ok?'<span class="b ok dot" style="font-size:.8rem;padding:5px 12px">Final</span>':'<span class="b bad dot" style="font-size:.8rem;padding:5px 12px">Failed</span>'}</span></div><a class="btn sm" href="#explorer-block-${x.cp}">Block #${fmt(x.cp)}</a></div>
  <div style="display:grid;gap:6px"><span class="cap">Transaction digest</span><div class="mono" style="font-size:clamp(.78rem,1.6vw,1rem);word-break:break-all">${x.id}</div><div class="btns"><button class="btn xs" data-act="copy" data-v="${x.id}">Copy</button><span class="muted" style="font-size:.78rem">${x.t?new Date(x.t).toUTCString():''} · ${fmt(conf)} blocks since</span></div></div>
  ${flow}</section>
 <div class="g c6 rise">${stat('Amount',x.sys?'—':x.amt?fmt(x.amt,4):'—','RVRB')}${stat('Block time',cpi?fmt(cpi.ms)+' ms':'—','Interval')}${stat('Fee',x.sys?'—':fmtA(x.feeNet),'RVRB, net')}${stat('Gas used',fmt(x.gas),fmt(LV.rgp)+' drops per unit')}${stat('Objects changed',raw?fmt(objs.length):fmt(x.objs),'Objects')}${stat('Events',raw?fmt(ev.length):fmt(x.events),'Emitted')}</div>
 <div class="g c21 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.clock}</span>Confirmation</h2></div><div class="timeline">${[['Sender',lvAddr(x.from,8)],['Receiver',x.to?lvAddr(x.to,8):'—'],['Block','<a class="alink mono" href="#explorer-block-'+x.cp+'">#'+fmt(x.cp)+'</a>'],['Certificate',cpi?cpi.sigs+'/'+V.length+' validator signatures':'Quorum certified'],['Epoch',S.epoch],['Status',x.ok?'Final':'Failed']].map(r=>'<div class="tl"><span class="dot"></span><span><b>'+r[0]+'</b><br><span class="muted">'+r[1]+'</span></span></div>').join('')}</div></section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.flame}</span>Gas breakdown</h2></div>${x.sys?'<div class="empty">No fee</div>':'<div class="kv"><div><span>Computation</span><span>'+fmtA(x.comp)+' RVRB</span></div><div class="bar"><i style="width:'+x.comp/tot*100+'%"></i></div><div><span>Storage</span><span>'+fmtA(x.stor)+' RVRB</span></div><div class="bar g"><i style="width:'+x.stor/tot*100+'%"></i></div><div><span>Storage refund</span><span class="up">−'+fmtA(x.rebate)+' RVRB</span></div><div><span>Total fee</span><span>'+fmtA(x.feeNet)+' RVRB</span></div></div>'}</section></div>
 <div class="g c2 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.coins}</span>Balance changes</h2></div>${raw?(bc.length?'<div class="list">'+bc.map(b=>{const v=lvRv(b.amount);return '<div class="li">'+identicon(b.address,26)+'<span>'+lvAddr(b.address,8)+'</span><span class="r" style="color:'+(v<0?'var(--bad)':'var(--ok)')+'">'+(v>0?'+':'')+fmt(v,6)+' '+(b.coinType===RVRB_T?'RVRB':esc(b.coinType.split('::').pop()))+'</span></div>';}).join('')+'</div>':'<div class="empty">No balance changes</div>'):'<div class="empty">Loading…</div>'}</section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.activity}</span>Events</h2></div><div class="list">${raw?(ev.map((e,i)=>'<div class="li"><span class="tag">'+(i+1)+'</span><span class="mono" style="font-size:.78rem">'+esc((e.eventType||'').split('::').slice(-1)[0]||'Event')+'</span><span class="r muted">'+esc((e.eventType||'').split('::').slice(1,2).join(''))+'</span></div>').join('')||'<div class="empty">No events</div>'):'<div class="empty">Loading…</div>'}</div></section></div>
 <div class="g c2 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.cube}</span>Also in block #${fmt(x.cp)}</h2></div><div class="list">${lvSame(x.cp).filter(y=>y.id!==x.id).slice(0,6).map(txRow).join('')||'<div class="empty">No other transactions</div>'}</div></section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.code}</span>Raw</h2></div><pre>${esc(JSON.stringify({digest:x.id,kind:x.type,call:x.label||undefined,status:x.ok?'success':'failure',block:x.cp,sender:x.from||'system',recipient:x.to||undefined,amount_rvrb:x.amt||undefined,gas_used:x.gas,gas_price_drops:LV.rgp,computation_rvrb:x.comp,storage_rvrb:x.stor,storage_refund_rvrb:x.rebate,objects_changed:raw?objs.length:x.objs},null,2))}</pre></section></div>`;}
function blockPage(n){const c=S.cps.find(x=>x.n===n);if(!c){if(LV.head!=null&&n>LV.head)return '<section class="card"><div class="empty">Block #'+fmt(n)+' has not been produced yet. The latest block is #'+fmt(LV.head)+'.</div><a class="btn" href="#explorer-blocks">All blocks</a></section>';
    lvFetchCp(n).then(()=>{if(CUR.sub==='block'&&+CUR.param===n)route();}).catch(()=>{const p=$('page');if(p&&CUR.sub==='block'&&+CUR.param===n)p.innerHTML='<section class="card"><div class="empty">Block #'+fmt(n)+' is not kept by this node.</div></section>';});
    return '<section class="card"><div class="empty">Loading block #'+fmt(n)+'…</div></section>';}
  const act=V.length;const list=lvSame(n);const mix=Object.keys(TNAME).map(k=>[TNAME[k],list.filter(t=>t.c===k).length,C.types[k]]);
  return `<section class="card hud"><div class="ch"><div style="display:flex;gap:12px;align-items:center"><a class="icobtn" href="#explorer-blocks" aria-label="Back">←</a><div><span class="cap">Block</span><div class="big glowtx">#${fmt(n)}</div></div></div><div class="btns"><a class="btn sm" href="#explorer-block-${n-1}">← Previous</a>${n<S.cp?'<a class="btn sm" href="#explorer-block-'+(n+1)+'">Next →</a>':''}</div></div>
  <div class="kv"><div><span>Digest</span><span>${short(c.digest,14)} <button class="btn xs" data-act="copy" data-v="${c.digest}">Copy</button></span></div><div><span>Produced</span><span>${new Date(c.t).toUTCString().slice(5,25)} UTC · epoch ${c.epoch}</span></div><div><span>Previous block</span><span>${c.prev?short(c.prev,14):'—'}</span></div></div></section>
 <div class="g c6 rise">${stat('Transactions',fmt(c.txc),fmt(c.user||0)+' wallet · '+fmt(c.sys||0)+' network')}${stat('Block time',fmt(c.ms)+' ms','Interval')}${stat('Block reward',fmtA(c.reward||blockReward()).slice(0,10),'RVRB')}${stat('Signatures',c.sigs+'/'+act,pct(c.sigs/Math.max(1,act),1))}${stat('Size',fmt(c.size,2)+' KB','Contents')}${stat('Era',(currentEra()+1)+' of 10','Halving every 5 years')}</div>
 <div class="g c3 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.server}</span>Certified by</h2><span class="sub">Signatures</span></div><div class="list">${V.map((v,i)=>'<a class="li click" href="#explorer-validator-'+v.id+'" style="text-decoration:none">'+identicon(v.addr,30)+'<span><b class="mono">'+esc(v.name)+'</b><br><span class="muted" style="font-size:.72rem">'+(v.power*100).toFixed(2)+'% power</span></span><span class="r">'+(c.signers.length?(c.signers.includes(i)?'<span class="b ok dot">Signed</span>':'<span class="b">Standby</span>'):'<span class="b ok dot">Quorum</span>')+'</span></a>').join('')}</div></section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.grid}</span>Mix</h2></div><div class="donut">${donut(mix,fmt(c.txc),'TX')+legend(mix.filter(m=>m[1]),fmt)}</div></section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.shield}</span>Votes</h2><span class="sub">${c.sigs} of ${act} signed</span></div>${heat(V.map((v,i)=>c.signers.length?(c.signers.includes(i)?1:-1):1),Math.max(4,act),x=>x<0?'var(--hair3)':greenRamp(.9))}</section></div>
 <section class="card"><div class="ch"><h2><span class="ico">${IC.list}</span>Transactions in this block</h2></div><div class="list">${list.map(txRow).join('')||'<div class="empty">No transactions</div>'}</div></section>`;}
function valPage(v){const up=v.signed+v.missed?v.signed/(v.signed+v.missed)*100:100;
  return `<section class="card hud"><div class="ch"><div style="display:flex;gap:14px;align-items:center"><a class="icobtn" href="#explorer-validators" aria-label="Back">←</a>${identicon(v.addr,58)}<div><div class="mono" style="font-size:1.1rem">${esc(v.name)}</div><div class="muted" style="font-size:.82rem">${lvAddr(v.addr,8)} · Active since epoch ${v.joined}</div></div></div>
  <div class="btns"><span class="b ok dot">Active</span><button class="btn pri sm" data-act="lvsoon" data-v="Staking">Stake with this validator</button></div></div></section>
 <div class="g c6 rise">${stat('Voting power',(v.power*100).toFixed(2)+'%','Committee share')}<div class="kpi"><span class="cap">Total stake</span><span class="v" id="vpS">${fmt(v.stake,2)} RVRB</span><span class="s">Next epoch ${compact(v.next)}</span></div>${stat('Signature rate',up.toFixed(1)+'%','Observed blocks')}${stat('Commission',fmt(v.comm,2)+'%','Of rewards')}${stat('Signed',fmt(v.signed),'Blocks')}${stat('Gas price vote',fmt(v.gas),'Drops')}</div>
 <div class="g c3 ais"><section class="card"><div class="ch"><h2><span class="ico">${IC.coins}</span>Stake</h2></div><div class="donut">${donut([['This validator',v.stake,'var(--river)'],['Other validators',Math.max(0,stakedTotal()-v.stake),'var(--hair3)']],compact(v.stake),'RVRB')}</div></section>
  <section class="card soon" data-soon="Reward history"><div class="ch"><h2><span class="ico">${IC.flame}</span>Rewards per day</h2><span class="sub">Last 14 days, RVRB</span></div>${bars(Array.from({length:14},(_,i)=>1+(i%3)),Array.from({length:14},(_,i)=>i%3===0?'D'+(i+1):''),C.acc,120)}</section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.activity}</span>Signatures</h2><span class="sub">Last ${v.bits.length} blocks</span></div>${heat((v.bits.length?v.bits:[1]).slice(-60),15,x=>x<1?'var(--bad)':greenRamp(1))}</section></div>`;}
function assetPage(t){if(t!=='RVRB')return lvSoonPage(esc(t),'Stablecoins, cross-chain assets and Token Studio tokens.');location.hash='explorer-token';return '';}


/* transaction page: Visual and Classic views of the agreed design, real fields */
EXX.tx.build=function(){const id=CUR.param;const t=LV.txd[id]||S.txs.find(x=>x.id===id);
  if(!t){lvLoadTx(id).then(()=>{if(CUR.sub==='tx'&&CUR.param===id)route();}).catch(()=>{const p=$('page');if(p&&CUR.sub==='tx'&&CUR.param===id)p.innerHTML='<section class="card"><div class="empty">Transaction not found</div><a class="btn" href="#explorer-transactions">All transactions</a></section>';});
    return '<section class="card"><div class="empty">Loading…</div></section>';}
  EXX._t=t;const sw='<div class="ch"><div class="seg" role="tablist" aria-label="Transaction layout"><button data-act="txm" data-v="visual" class="'+(EX.txMode!=='classic'?'on':'')+'">Visual</button><button data-act="txm" data-v="classic" class="'+(EX.txMode==='classic'?'on':'')+'">Classic</button></div></div>';
  return sw+(EX.txMode==='classic'?classicTx(t):txPage(t));};
EXX.tx.update=function(){};
function classicTx(t){const d=LV.txd[t.id];if(!d)lvLoadTx(t.id).then(()=>{if(CUR.sub==='tx'&&CUR.param===t.id)route();}).catch(()=>{});const x=d||t;const raw=d&&d.raw;const conf=Math.max(0,S.cp-x.cp);
 const cp=v=>' <button class="icobtn" style="width:26px;height:26px;display:inline-grid;vertical-align:middle" data-act="copy" data-v="'+v+'" aria-label="Copy">'+IC.copy.replace('<svg','<svg style="width:12px;height:12px"')+'</button>';const cpi=S.cps.find(c=>c.n===x.cp);
 const rows=[['Transaction digest','<span class="mono" style="word-break:break-all">'+x.id+'</span>'+cp(x.id)],['Status',x.ok?'<span class="b ok dot">Final</span>':'<span class="b bad dot">Failed</span>'],
  ['Block','<a href="#explorer-block-'+x.cp+'" class="mono" style="color:var(--river)">#'+fmt(x.cp)+'</a> <span class="b mute">'+fmt(conf)+' blocks since</span>'],['Timestamp',x.t?ago(x.t)+' <span class="muted">('+new Date(x.t).toUTCString()+')</span>':'—'],['Type','<span class="ty '+x.c+'">'+esc(x.type)+'</span>'+(x.label?' <span class="mono muted">'+esc(x.label)+'</span>':'')],null,
  ['From','<a class="mono alink" href="#explorer-address-'+x.from+'">'+x.from+'</a>'+cp(x.from)+(lvName(x.from)?' <span class="ntag">'+esc(lvName(x.from))+'</span>':'')],['To',x.to?'<a class="mono alink" href="#explorer-address-'+x.to+'">'+x.to+'</a>'+cp(x.to)+(lvName(x.to)?' <span class="ntag">'+esc(lvName(x.to))+'</span>':''):'<span class="dim">—</span>'],null,
  ['Value','<b class="mono">'+fmt(x.amt||0,4)+' RVRB</b>'],['Transaction fee',x.sys?'—':'<span class="mono">'+fmtA(x.feeNet)+' RVRB</span> <span class="muted">(computation '+fmtA(x.comp)+' + storage '+fmtA(x.stor)+' − refund '+fmtA(x.rebate)+')</span>'],
  ['Gas price','<span class="mono">'+fmt(LV.rgp)+' drops</span> <span class="muted">('+fmtA(LV.rgp/DROPS)+' RVRB)</span>'],['Gas used','<span class="mono">'+fmt(x.gas)+'</span>'],['Block time','<span class="mono">'+(cpi?fmt(cpi.ms)+' ms':'—')+'</span>'],['Objects changed','<span class="mono">'+(raw?(raw.effects&&raw.effects.changedObjects||[]).length:x.objs)+'</span>'],['Events','<span class="mono">'+(raw?(raw.events&&raw.events.events||[]).length:x.events)+'</span>']];
 return '<section class="card"><div class="ch"><h2>Transaction details</h2><a class="btn sm" href="#explorer-transactions">All transactions</a></div><div class="ctable">'+rows.map(r=>r?'<div class="cr"><span class="cl">'+r[0]+'</span><span class="cv">'+r[1]+'</span></div>':'<div class="sep"></div>').join('')+'</div></section>'+
  '<section class="card"><div class="ch"><h2>Raw</h2></div><pre>'+esc(JSON.stringify({digest:x.id,kind:x.type,call:x.label||undefined,status:x.ok?'success':'failure',block:x.cp,sender:x.from,recipient:x.to||undefined,amount_rvrb:x.amt,gas_used:x.gas,gas_price_drops:LV.rgp,fee_rvrb:x.feeNet},null,2))+'</pre></section>';}


/* tokens page: RVRB, the native token, always first and live; other token types arrive in Phase 2 */
EXX.tokens.update=function(){const f=EXX.f||'All';const st=$('tk1');if(st){st.textContent='1';$('tk1s').textContent='Native token';}
  ['tk2','tk3','tk4'].forEach((id,i)=>lvSoon(lvKpi(id),['Token Studio','Cross-chain assets','DEX liquidity'][i]));
  const cta=document.querySelector('a[href="#wallet-create"]');if(cta)lvSoon(cta.closest('.card'),'Token Studio');
  const supply=SUPPLY-S.reserve;const rv='<tr class="click" data-act="lvtok"><td><div style="display:flex;gap:9px;align-items:center">'+tokIcon('RVRB',30)+'<div><b>RVRB</b> <span class="b ok" style="font-size:.6rem">Native</span><div class="muted" style="font-size:.72rem">Rivers</div></div></div></td><td>Native</td><td class="n muted">—</td><td class="n mono">'+fmt(supply)+'<div class="muted" style="font-size:.7rem">of 21,000,000 max</div></td><td class="n">9</td><td class="n muted">—</td><td>'+featChips(['Gas','Staking','Fixed supply','Halving'])+'</td><td class="n">Genesis</td></tr>';
  const others=Object.keys(TOKENS).filter(t=>t!=='RVRB').slice(0,6).map(t=>'<tr class="soonrow"><td><div style="display:flex;gap:9px;align-items:center">'+tokIcon(t,28)+'<div><b>'+t+'</b><div class="muted" style="font-size:.72rem">'+esc(TOKENS[t].name)+'</div></div></div></td><td>'+esc((TMETA[t]||{}).type||'Token')+'</td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td></td><td class="n">—</td></tr>').join('');
  const showR=f==='All'||f==='Native';const h=(showR?rv:'')+(f==='Native'?'':'<tr><td colspan="8" style="position:relative;padding:0"><div class="soon soonrows"><table><tbody>'+others+'</tbody></table><div class="soonbadge"><span>'+SOON+'</span><b>Stablecoins, cross-chain assets and Token Studio tokens</b></div></div></td></tr>');
  const tb=$('tkTb');if(tb&&tb._h!==h){tb.innerHTML=h;tb._h=h;}};


/* ---------- RVRB holders ---------- */
const LVH={known:new Set(),bal:{},staked:{},activity:new Set(),loading:false,at:0,tab:'holders'};
try{(JSON.parse(lvStore.get('rvScanKnown')||'[]')||[]).forEach(a=>LVH.known.add(a));}catch(e){}
function lvSeeAddr(a){if(!a||a===SYS0||LVH.known.has(a))return;LVH.known.add(a);if(LVH.known.size%25===0)try{lvStore.set('rvScanKnown',JSON.stringify([...LVH.known].slice(-3000)));}catch(e){}}
async function lvGenesisHolders(){try{const cp=(await LSv.getCheckpoint({checkpointId:{oneofKind:'sequenceNumber',sequenceNumber:0n},readMask:{paths:['transactions.effects.changed_objects.object_type','transactions.effects.changed_objects.output_owner']}})).response.checkpoint;
  (cp.transactions||[]).forEach(t=>(t.effects&&t.effects.changedObjects||[]).forEach(o=>{const ty=o.objectType||'';const ow=o.outputOwner&&o.outputOwner.address;if(ow&&(ty.includes('coin::Coin<')&&ty.includes('::sui::SUI>')||ty.includes('StakedSui')))lvSeeAddr(ow);}));}catch(e){console.warn(e);}
  GW.forEach(g=>lvSeeAddr(g[1]));lvSeeAddr(LV_FAUCET_ADDR);V.forEach(v=>lvSeeAddr(v.addr));}
async function lvLoadHolders(force){if(LVH.loading||(!force&&Date.now()-LVH.at<45000))return;LVH.loading=true;
  S.txs.forEach(t=>{if(t.activity&&t.from)LVH.activity.add(t.from);});
  await lvBatch([...LVH.known],10,async a=>{const b=(await SSv.getBalance({owner:a,coinType:RVRB_T})).response.balance;LVH.bal[a]=lvRv(b&&b.balance||0);});
  LVH.at=Date.now();LVH.loading=false;if(CUR.sub==='token')lvTokenUpdate();}
function lvHolderKind(a){const n=lvName(a);if(n&&LV_NAMES.has(a))return ['Genesis',GW_GROUP[n.replace(/-\d+$/,'')]||''];if(a===LV_FAUCET_ADDR)return ['Faucet','Testnet faucet'];if(V.some(v=>v.addr===a))return ['Validator','Validator account'];if(LVH.activity.has(a))return ['Wallet','Network activity'];return ['Wallet',''];}
function lvHolders(){const list=Object.keys(LVH.bal).filter(a=>LVH.bal[a]>0).map(a=>({a,b:LVH.bal[a]}));const st=stakedTotal();if(st>0)list.push({a:'staking',b:st,pool:true});return list.sort((x,y)=>y.b-x.b);}
function lvTokenBlock(){return `<section class="card hud" id="tokHold"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.users}</span>Holders</h2><span class="sub" id="thS">Loading…</span></div>
  <div class="seg" role="tablist" aria-label="Token data">${[['holders','Holders'],['transfers','Transfers'],['distribution','Distribution'],['info','Token info']].map(x=>'<button data-act="lvtt" data-v="'+x[0]+'" class="'+(LVH.tab===x[0]?'on':'')+'">'+x[1]+'</button>').join('')}</div></div>
  <div class="g c4">${kpi('th1','Holders',IC.users)}${kpi('th2','Top 10 share',IC.grid)}${kpi('th3','Top 100 share',IC.activity)}${kpi('th4','Largest holder',IC.shield)}</div>
  <div id="thBody"><div class="empty">Loading…</div></div></section>`;}
function lvTokenUpdate(){const body=$('thBody');if(!body)return;const hs=lvHolders();const supply=SUPPLY-S.reserve;const tot=hs.reduce((a,h)=>a+h.b,0);
  const top=n=>hs.slice(0,n).reduce((a,h)=>a+h.b,0)/Math.max(1,supply);
  set2('th1',fmt(hs.filter(h=>!h.pool).length));set2('th1s','Addresses holding RVRB');set2('th2',pct(top(10),2));set2('th2s','Of supply in existence');set2('th3',pct(top(100),2));set2('th3s','Of supply in existence');
  const L=hs[0];set2('th4',L?pct(L.b/supply,2):'—');set2('th4s',L?(L.pool?'Validator staking pools':(lvName(L.a)||short(L.a,6))):'');
  set2('thS',LVH.at?'Updated '+ago(LVH.at)+' · tracked balances cover '+pct(Math.min(1,tot/Math.max(1,supply)),2)+' of supply':'Loading…');
  let h='';const nm=a=>a==='staking'?'<b>Validator staking pools</b>':lvAddr(a,8);
  if(LVH.tab==='holders'){h='<div class="tw tall"><table><thead><tr><th class="n">#</th><th>Holder</th><th>Type</th><th class="n">Balance (RVRB)</th><th class="n">Share</th><th style="min-width:140px"></th></tr></thead><tbody>'+
    hs.slice(0,100).map((x,i)=>{const k=x.pool?['Staking','Delegated stake']:lvHolderKind(x.a);const sh=x.b/Math.max(1,supply);return '<tr'+(x.pool?'':' class="click" data-act="lvaddr" data-a="'+x.a+'"')+'><td class="n dim">'+(i+1)+'</td><td><div style="display:flex;gap:9px;align-items:center">'+(x.pool?tokIcon('RVRB',22):identicon(x.a,22))+'<span>'+nm(x.a)+(k[1]?'<div class="muted" style="font-size:.7rem">'+esc(k[1])+'</div>':'')+'</span></div></td><td><span class="b">'+k[0]+'</span></td><td class="n mono">'+fmt(x.b,2)+'</td><td class="n mono">'+pct(sh,3)+'</td><td><div class="bar"><i style="width:'+Math.max(.5,sh/Math.max(1e-9,hs[0].b/supply)*100)+'%"></i></div></td></tr>';}).join('')+'</tbody></table></div>';}
  else if(LVH.tab==='transfers'){const tr=S.txs.filter(t=>!t.sys&&t.amt>0).slice(0,40);h=tr.length?'<div class="tw"><table><thead><tr><th>Transaction</th><th>From</th><th>To</th><th class="n">Amount (RVRB)</th><th class="n">Block</th><th>Age</th></tr></thead><tbody>'+tr.map(t=>'<tr class="click" data-act="tx" data-id="'+t.id+'"><td class="mono">'+short(t.id,8)+'</td><td>'+lvAddr(t.from)+'</td><td>'+lvAddr(t.to)+'</td><td class="n mono">'+fmt(t.amt,4)+'</td><td class="n mono">#'+fmt(t.cp)+'</td><td class="muted">'+ago(t.t)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty">No transfers</div>';}
  else if(LVH.tab==='distribution'){const B=[['1M and above',1e6,Infinity],['100K – 1M',1e5,1e6],['10K – 100K',1e4,1e5],['1K – 10K',1e3,1e4],['100 – 1K',100,1e3],['Below 100',0,100]];
    const rows=B.map(b=>{const m=hs.filter(x=>!x.pool&&x.b>=b[1]&&x.b<b[2]);return [b[0],m.length,m.reduce((a,x)=>a+x.b,0)];});const mx=Math.max(1,...rows.map(r=>r[2]));
    const n=hs.length;let acc=0;const pts=hs.map((x,i)=>{acc+=x.b;return [(i+1)/n,acc/Math.max(1,tot)];});const W=520,H=200,pad=30;
    const path='M'+pad+' '+(H-pad)+' '+pts.map(p=>'L'+(pad+p[0]*(W-2*pad)).toFixed(1)+' '+(H-pad-p[1]*(H-2*pad)).toFixed(1)).join(' ');
    h='<div class="g c2 ais"><div><div class="cap" style="margin-bottom:8px">Balance ranges</div><div class="list">'+rows.map(r=>'<div class="li"><span class="tag">'+r[1]+'</span><span>'+r[0]+'<div class="bar" style="margin-top:6px"><i style="width:'+(r[2]/mx*100)+'%"></i></div></span><span class="r">'+compact(r[2])+'</span></div>').join('')+'</div></div>'+
      '<div><div class="cap" style="margin-bottom:8px">Concentration curve</div><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto"><line x1="'+pad+'" y1="'+(H-pad)+'" x2="'+(W-pad)+'" y2="'+pad+'" stroke="var(--hair3)" stroke-dasharray="4 4"/><path d="'+path+'" fill="none" stroke="var(--river)" stroke-width="2.4"/><text x="'+pad+'" y="'+(H-8)+'" class="vtk">Largest holders</text><text x="'+(W-pad)+'" y="'+(H-8)+'" text-anchor="end" class="vtk">All holders</text><text x="'+(pad+4)+'" y="'+(pad+10)+'" class="vtk">100%</text></svg>'+
      '<div class="kv"><div><span>Top 1</span><span>'+pct(top(1),2)+'</span></div><div><span>Top 10</span><span>'+pct(top(10),2)+'</span></div><div><span>Top 100</span><span>'+pct(top(100),2)+'</span></div><div><span>Staked</span><span>'+pct(stakedTotal()/Math.max(1,supply),2)+'</span></div></div></div></div>';}
  else{h='<div class="kv"><div><span>Name</span><span>Rivers (RVRB)</span></div><div><span>Coin type</span><span class="mono">0x2::sui::SUI <button class="btn xs" data-act="copy" data-v="'+RVRB_T+'">Copy</button></span></div><div><span>Decimals</span><span>9 · 1 RVRB = 1,000,000,000 drops</span></div><div><span>Maximum supply</span><span>21,000,000 RVRB</span></div><div><span>In existence</span><span>'+fmt(supply)+' RVRB</span></div><div><span>Not yet mined</span><span>'+fmt(S.reserve,2)+' RVRB</span></div><div><span>Staked</span><span>'+fmt(stakedTotal())+' RVRB</span></div><div><span>Created</span><span>Genesis block</span></div><div><span>Supply policy</span><span>Fixed maximum, halving every 5 years</span></div></div>';}
  if(body._h!==h){body.innerHTML=h;body._h=h;}}
const set2=(id,v)=>{const e=$(id);if(e&&e.textContent!==String(v))e.textContent=v;};

/* ---------- address and faucet pages (new in the live Scan) ---------- */
function lvAddrPage(a){const n=lvName(a);return `<section class="card hud"><div class="ch"><div style="display:flex;gap:14px;align-items:center;min-width:0">${identicon(a,58)}<div style="min-width:0"><span class="eyebrow" id="aEye">${n&&LV_NAMES.has(a)?'Genesis wallet · '+esc(GW_GROUP[n.replace(/-\d+$/,'')]||''):'Address'}</span><div style="font-size:1.25rem;font-weight:800">${esc(n||'Wallet')}</div><div class="mono muted" style="font-size:.76rem;word-break:break-all">${a}</div></div></div><div class="btns"><button class="btn xs" data-act="copy" data-v="${a}">Copy</button><a class="btn pri sm" href="#explorer-faucet" data-act="lvfa" data-a="${a}">Get test RVRB</a></div></div></section>
 <div class="g c4 rise">${kpi('aB','RVRB balance',IC.coins)}${kpi('aS','Staked RVRB',IC.stake)}${kpi('aO','Coins and objects',IC.cube)}${kpi('aT','Recent transactions',IC.activity)}</div>
 <div class="g c2 ais"><div class="g" style="gap:16px;align-content:start"><section class="card"><div class="ch"><h2><span class="ico">${IC.coins}</span>Holdings on Rivers</h2></div><div id="aBal"><div class="empty">Loading…</div></div></section>
   <section class="card soon" data-soon="Cross-chain holdings"><div class="ch"><h2><span class="ico">${IC.globe}</span>Holdings on other chains</h2></div><div class="list">${['Bitcoin','Ethereum','Solana','BNB Chain','Tron'].map(c=>'<div class="li"><span class="tag">'+c.slice(0,3).toUpperCase()+'</span><span>'+c+'</span><span class="r">0.00</span></div>').join('')}</div></section></div><section class="card"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.activity}</span>Recent activity</h2><span class="sub">Latest transactions</span></div></div><div class="list" id="aTx"><div class="empty">Loading…</div></div></section></div>`;}
async function lvAddrLoad(a){try{const [bals,objs]=await Promise.all([SSv.listBalances({owner:a}),SSv.listOwnedObjects({owner:a,pageSize:100,readMask:{paths:['object_id','object_type','previous_transaction']}})]);if(CUR.param!==a)return;
  const bl=bals.response.balances||[];const r=bl.find(b=>b.coinType===RVRB_T);$('aB').textContent=r?fmt(lvRv(r.balance),4):'0';$('aBs').textContent=r?pct(lvRv(r.balance)/SUPPLY,4)+' of maximum supply':'RVRB';
  const ob=objs.response.objects||[];$('aO').textContent=fmt(ob.length)+(objs.response.nextPageToken?'+':'');$('aOs').textContent='Owned';lvSoonAll();
  SSv.listOwnedObjects({owner:a,pageSize:100,objectType:'0x3::staking_pool::StakedSui',readMask:{paths:['json']}}).then(r=>{const os=r.response.objects||[];const tot=os.reduce((x,o)=>{const j=o.json;let v=0;try{const f=j&&j.kind&&j.kind.oneofKind==='structValue'?j.kind.structValue.fields:{};const pr=f.principal&&f.principal.kind;v=pr?lvRv(pr.stringValue||pr.numberValue||0):0;}catch(e){}return x+v;},0);if(CUR.param===a){$('aS').textContent=fmt(tot,2);$('aSs').textContent=os.length+' staking position'+(os.length===1?'':'s');}}).catch(()=>{if(CUR.param===a){$('aS').textContent='0';$('aSs').textContent='No staking positions';}});
  $('aBal').innerHTML=bl.length?'<div class="list">'+bl.map(b=>'<div class="li">'+(b.coinType===RVRB_T?tokIcon('RVRB',30):'<span class="tk">•</span>')+'<span><b>'+(b.coinType===RVRB_T?'RVRB':esc(b.coinType.split('::').pop()))+'</b><br><span class="muted" style="font-size:.72rem">'+(b.coinType===RVRB_T?'Native token':esc(short(b.coinType,8)))+'</span></span><span class="r">'+fmt(lvRv(b.balance),4)+'</span></div>').join('')+'</div>':'<div class="empty">No balances</div>';
  const digs=[...new Set(ob.map(o=>o.previousTransaction).filter(Boolean))].slice(0,25);S.txs.filter(t=>t.from===a||t.to===a).forEach(t=>{if(!digs.includes(t.id))digs.push(t.id);});
  if(!digs.length){$('aT').textContent='0';$('aTx').innerHTML='<div class="empty">No transactions</div>';return;}
  const got=(await LSv.batchGetTransactions({digests:digs.slice(0,40),readMask:TX_MASK})).response.transactions||[];if(CUR.param!==a)return;
  const rows=got.map(g=>g.result&&g.result.oneofKind==='transaction'?g.result.transaction:null).filter(Boolean).map(tx=>{const t=lvMapTx(tx,Number(tx.checkpoint||0),lvTs(tx.timestamp),0);t.mine=(tx.balanceChanges||[]).filter(b=>b.address===a&&b.coinType===RVRB_T).reduce((x,b)=>x+lvRv(b.amount),0);return t;}).sort((x,y)=>y.cp-x.cp);
  $('aT').textContent=fmt(rows.length);$('aTs').textContent='Latest';if(rows.some(t=>t.activity&&t.from===a)&&$('aEye'))$('aEye').textContent='Network activity account';
  $('aTx').innerHTML=rows.map(t=>'<div class="li click" data-act="tx" data-id="'+t.id+'"><span class="ty '+t.c+'">'+(t.sys?esc(t.type):t.from===a?'Sent':'Received')+'</span><span class="mono trunc">'+short(t.id,8)+'</span><span class="r" style="color:'+(t.mine<0?'var(--bad)':t.mine>0?'var(--ok)':'var(--muted)')+'">'+(t.mine>0?'+':'')+(t.mine?fmt(t.mine,4)+' RVRB':'—')+'</span><span class="s">Block #'+fmt(t.cp)+' · '+(t.t?ago(t.t):'')+(t.label?' · '+esc(t.label):'')+'</span></div>').join('')||'<div class="empty">No transactions</div>';
 }catch(e){console.warn(e);const b=$('aBal');if(b)b.innerHTML='<div class="empty">Address unavailable</div>';}}
function lvFaucetPage(){return `<div class="g c21 ais"><section class="card hud"><div class="ch"><div class="ttl"><h2><span class="ico">${IC.droplet}</span>Testnet faucet</h2><span class="sub">50 RVRB per request</span></div><span class="b ok dot" id="fauB">Online</span></div>
  <div class="fld"><label for="fA">Wallet address</label><input class="in mono" id="fA" placeholder="0x…" autocomplete="off" spellcheck="false" value="${esc(lvQS.get('addr')||lvStore.get('rvScanLastAddr')||'')}"></div>
  <button class="btn pri wide" data-act="lvfaucet" id="fGo">Request 50 RVRB</button><div id="fR"></div><div class="kv"><div><span>Faucet balance</span><span id="fBal">—</span></div></div></section>
  <section class="card"><div class="ch"><h2><span class="ico">${IC.shield}</span>Terms</h2></div><div class="list">${[['Testnet only','Testnet RVRB has no monetary value.'],['For development','Use it to test transfers, staking and contracts.'],['Rate limited','Requests are limited per address.']].map(x=>'<div class="li"><span class="chk ok">✓</span><span><b style="font-size:.84rem">'+x[0]+'</b><br><span class="muted" style="font-size:.76rem">'+x[1]+'</span></span><span></span></div>').join('')}</div></section></div>`;}
function lvSoonPage(title,why){return '<section class="card hud soonhead"><div class="ch"><div class="ttl"><span class="eyebrow">'+SOON+'</span><h2 style="font-family:var(--f-display);font-weight:500;font-size:1.25rem;margin-top:6px">'+title+'</h2></div><span class="b gold">'+SOON+'</span></div><p class="fg2" style="max-width:76ch">'+why+'</p></section>';}
const LV_SOON_PAGES={privacy:['Shielded payments','Private payments with zero-knowledge proofs and regulator view keys.'],crosschain:['Cross-chain gateway','Native assets from other chains, held one to one in audited vaults.'],create:['Token Studio','Create and manage tokens on Rivers without writing code.']};

/* ---------- wire into the agreed views ---------- */
TNAME.defi='Contract calls';TNAME.bank='Bank settlement';TNAME.private='Shielded';
SCAN_NAV.forEach(g=>{if(g.t==='Tokens'&&g.items&&!g.items.find(i=>i[0]==='faucet'))g.items.push(['faucet','Testnet faucet','Free test RVRB for builders',IC.droplet]);});
VIEWS.explorer.hidden.address='Address';
(function(){const v=VIEWS.explorer;const b=v.build,a=v.after,u=v.update;
 v.build=function(s){if(s==='address'){const a2=lvNorm(CUR.param||'');return a2?lvAddrPage(a2):'<div class="empty">Invalid address</div>';}if(s==='faucet')return lvFaucetPage();
  let h=b.call(this,s);if(s==='token'){const k=h.indexOf('<div class="g c32 ais">');h=k>0?h.slice(0,k)+lvTokenBlock()+h.slice(k):h+lvTokenBlock();}if(LV_SOON_PAGES[s])h=lvSoonPage(LV_SOON_PAGES[s][0],LV_SOON_PAGES[s][1])+'<div class="soonwrap">'+h+'</div>';return h;};
 v.after=function(s){if(s==='address'){const a2=lvNorm(CUR.param||'');if(a2){CUR.param=a2;lvAddrLoad(a2);}return;}if(s==='faucet'){lvFaucetBal();return;}try{a.call(this,s);}catch(e){console.warn(e);}lvMarks(s);if(s==='token'){lvTokenUpdate();lvLoadHolders(true);}};
 v.update=function(s){if(s==='address'||s==='faucet')return;if(!LV.ready)return;try{u.call(this,s);}catch(e){console.warn(e);}lvFix(s);if(s==='token'){lvTokenUpdate();lvLoadHolders(false);}};})();
if(!VIEWS.explorer.subs.find(x=>x[0]==='faucet'))VIEWS.explorer.subs.push(['faucet','Faucet',IC.droplet]);

function lvSoon(el,note){if(!el||el.classList.contains('soon'))return;el.classList.add('soon');el.insertAdjacentHTML('beforeend','<div class="soonbadge"><span>'+SOON+'</span><b>'+esc(note||SOON)+'</b></div>');}
function lvSoonAll(){document.querySelectorAll('.soon[data-soon]').forEach(el=>{if(!el.querySelector('.soonbadge'))el.insertAdjacentHTML('beforeend','<div class="soonbadge"><span>'+SOON+'</span><b>'+esc(el.dataset.soon)+'</b></div>');});}
const lvCard=id=>{const e=$(id);return e?e.closest('.card'):null;};const lvKpi=id=>{const e=$(id);return e?e.closest('.kpi'):null;};
function lvMarks(s){lvSoonAll();
 if(s==='overview'){lvSoon(lvKpi('k2'),'Account analytics');lvSoon(lvKpi('k3'),'Light clients');lvSoon(lvCard('cal'),'Activity history');lvSoon(lvCard('tmap'),'Liquidity map');
  lvSoon(lvCard('exTop'),'Token rankings');lvSoon(lvCard('exXc'),'Cross-chain gateway');lvSoon(lvCard('exRadar'),'Proof of Confluence analytics');
  const hp=document.querySelector('.hcopy p');if(hp)hp.textContent='Every payment, trade and settlement is confirmed by '+V.length+' validators on one open ledger.';
}
 if(s==='transactions'){lvSoon(lvKpi('t4'),'Shielded payments');}
 if(s==='validators'){lvSoon(lvCard('world'),'Validator map');lvSoon($('vReg'),'Regional distribution');}
 if(s==='token'){const p=$('tkPx');if(p)lvSoon(p.closest('.kv>div')||p.parentElement,'Market price');}
}
function lvFix(s){
 if(s==='overview'){const e1=$('hF');if(e1)e1.textContent=fmt(S.fin)+' ms';const e2=$('hF2');if(e2)e2.textContent='p95 '+fmt(S.p95)+' ms';const e3=$('hV2');if(e3)e3.textContent='Equal voting power';
  const k1s=$('k1s');if(k1s)k1s.textContent='Since genesis';const gk=$('gTk');if(gk)gk.innerHTML='<div><span>Sustained target</span><span>2,000 TPS</span></div><div><span>All transactions</span><span>'+fmt(S.tps,1)+' per second</span></div><div><span>Wallet transfers</span><span>'+fmt(LV.walletTps,2)+' per second</span></div>';
  const gs=$('gasK');if(gs)gs.innerHTML='<div><span>Reference gas price</span><span>'+fmt(LV.rgp)+' drops</span></div><div><span>Fiat estimate</span><span>Coming soon</span></div>';
  document.querySelectorAll('#gasT .t').forEach(t=>{const l=t.lastElementChild;if(l)l.textContent='—';});
  const xl=['−2m','−90s','−60s','−30s','now'];const cv=$('exChart');if(cv&&EX.chart==='tps')areaChart(cv,[{v:S.hist.tps,color:C.acc}],{n:240,min:1,xl});else if(cv&&EX.chart==='fin')areaChart(cv,[{v:S.hist.fin,color:C.tok,fill:C.light?'rgba(3,36,26,.12)':'rgba(255,255,255,.18)'}],{n:240,min:1,xl,fmt:v=>fmt(v)+'ms'});}
 if(s==='transactions'){const t2=$('t2s');if(t2)t2.textContent='Since genesis';const t3=$('t3');const u=S.txs.filter(t=>!t.sys);if(t3&&u.length){t3.textContent=fmtA(u.reduce((a,t)=>a+t.feeNet,0)/u.length)+' RVRB';const s3=$('t3s');if(s3)s3.textContent='Average per transaction';}
  const ti=$('txInfo');if(ti&&!S.txs.length)ti.textContent='Reading blocks…';}
 if(s==='blocks'){const c1=$('c1s');if(c1)c1.textContent='Every ~'+fmt(S.fin)+' ms';const c2=$('c2s');if(c2)c2.textContent='p95 '+fmt(S.p95)+' ms';}
 if(s==='validators'){const v4=$('v4s');if(v4)v4.textContent='Last 60 blocks';}
 if(s==='token'){const p=$('tkPx');if(p)p.textContent='—';}
}
/* labels: the chain reports block times, not per-transaction finality */
function lvRelabel(root){(root||document).querySelectorAll('h2,th,.cap,.sub,button,.legend span,span.s').forEach(el=>{if(el.children.length>2)return;el.childNodes.forEach(n=>{if(n.nodeType===3&&/inality/.test(n.textContent))n.textContent=n.textContent.replace('Finality p50','Block time').replace('Milliseconds to finality','Milliseconds between blocks').replace('finality of the last 40 blocks, ms','time between the last 40 blocks, ms').replace(/Finality/g,'Block time').replace(/finality/g,'block time');});});}

/* ---------- shell: search, ticker, actions ---------- */
function bindShell(){const gs=$('gs');if(!gs)return;gs.addEventListener('submit',e=>{e.preventDefault();const raw=$('gq').value.trim();const q=raw.replace(/[,#\s]/g,'');if(!q)return;
  if(/^\d+$/.test(q)){location.hash='explorer-block-'+q;return;}const a=lvNorm(q);if(a){location.hash='explorer-address-'+a;return;}
  const g=GW.find(x=>x[0]===q.toLowerCase());if(g){location.hash='explorer-address-'+g[1];return;}const v=V.find(x=>x.name.toLowerCase()===q.toLowerCase());if(v){location.hash='explorer-validator-'+v.id;return;}
  if(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q)){location.hash='explorer-tx-'+q;return;}if(q.toUpperCase()==='RVRB'){location.hash='explorer-token';return;}
  toast('No results for "'+raw+'"',false);});}
function lvFooter(){const p=document.querySelector('.xfoot p');if(p&&LV.chainId)p.textContent='Rivers Testnet explorer · Chain ID '+short(LV.chainId,6);document.querySelectorAll('.xfoot a[href="#wallet"],.xfoot a[href="#institutions"]').forEach(a=>{a.setAttribute('href','#');a.dataset.act='lvsoon';a.dataset.v=a.textContent;});}
function renderChrome(){lvFooter();const t=$('tick');if(t){const st=LV.online===false?'<span class="live bad">OFFLINE</span>':LV.online?'<span class="live">LIVE</span>':'<span class="muted">CONNECTING</span>';
  t.innerHTML=st+'<span>TPS <b>'+fmt(S.tps,1)+'</b></span><span>BLOCK TIME <b>'+fmt(S.fin)+' ms</b></span><span>BLOCK <b>#'+fmt(S.cp)+'</b></span><span>EPOCH <b>'+S.epoch+'</b></span><span>VALIDATORS <b>'+V.length+'</b></span><span>STAKED <b>'+compact(stakedTotal())+' RVRB</b></span><span>MINED <b>'+fmt(S.emitted,2)+' / 11M</b></span><span>GAS <b>'+fmt(LV.rgp)+' drops</b></span>';}
 let o=$('lvOff');if(!o){const pg=$('page');if(pg){pg.insertAdjacentHTML('beforebegin','<div id="lvOff"></div>');o=$('lvOff');}}
 if(o)o.innerHTML=LV.online===false?'<div class="offbar"><b>Network unavailable.</b> Reconnecting automatically.</div>':'';}
async function lvFaucetBal(){const e=$('fBal');if(e)e.textContent=LV.faucetBal!=null?fmt(LV.faucetBal,2)+' RVRB':'—';}
const LACT={
 lvtok(){location.hash='explorer-token';},
 lvtt(el){LVH.tab=el.dataset.v;$$('[data-act=lvtt]').forEach(b=>b.classList.toggle('on',b===el));const b=$('thBody');if(b)b._h='';lvTokenUpdate();},
 lvaddr(el){location.hash='explorer-address-'+el.dataset.a;},
 lvsoon(el){toast((el.dataset.v||'This feature')+' is coming soon.');},
 wconnect(){toast('Wallet connection is coming soon.');},
 stakeon(){toast('Staking is coming soon.');},
 lvfa(el){lvStore.set('rvScanLastAddr',el.dataset.a);},
 tx(el){location.hash='explorer-tx-'+el.dataset.id;},cp(el){location.hash='explorer-block-'+el.dataset.n;},val(el){location.hash='explorer-validator-'+el.dataset.id;},
 async lvfaucet(){const a=lvNorm($('fA').value.trim());if(!a)return toast('Enter a valid wallet address.',false);lvStore.set('rvScanLastAddr',a);const b=$('fGo');b.disabled=true;b.textContent='Sending…';
  try{const r=await fetch(LV_FAUCET+'/v2/gas',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({FixedAmountRequest:{recipient:a}})});const j=await r.json();if(j.status!=='Success'||!(j.coins_sent||[]).length)throw new Error('faucet');
   const d=j.coins_sent[0].transferTxDigest;const tot=j.coins_sent.reduce((x,c)=>x+c.amount,0)/1e9;$('fR').innerHTML='<div class="okbox"><b>'+fmt(tot)+' RVRB sent</b><div class="kv"><div><span>To</span><span>'+lvAddr(a,8)+'</span></div><div><span>Transaction</span><span><a class="alink mono" href="#explorer-tx-'+d+'">'+short(d,8)+'</a></span></div></div></div>';toast(fmt(tot)+' RVRB sent.');
  }catch(e){$('fR').innerHTML='<div class="errbox">Faucet unavailable. Please try again shortly.</div>';}b.disabled=false;b.textContent='Request 50 RVRB';}
};

/* ---------- boot ---------- */
async function lvBoot(){Object.assign(ACTS,LACT);EX.txView=EX.txView||'table';
 V.length=0;S.cps=[];S.txs=[];S.pays=[];S.arcs=[];S.xc=[];S.alerts=[];S.mix={transfer:0,defi:0,bank:0,private:0,system:0};S.mixHist=[];S.finHist=new Array(12).fill(0);S.hist={tps:[],fin:[],t:[]};
 S.tps=0;S.fin=0;S.p95=0;S.peak=0;S.halted=false;S.load=0;S.connected=false;S.W.mine=[];S.light=0;S.accounts=0;S.totalTx=0;S.txToday=0;S.feesToday=0;S.cp=0;S.reserve=MINED;S.emitted=0;
 $('root').innerHTML='<div class="lvload">'+logoSvg(64)+'<b>Rivers Scan</b><span>Connecting…</span></div>';
 await lvPollSystem();await lvPoll();await lvGenesisHolders();lvPollWallets().then(()=>{if(LV.ready)updateView();});
 LV.ready=true;route();
 setInterval(lvPoll,1500);setInterval(lvPollSystem,15000);setInterval(lvPollWallets,30000);
 new MutationObserver(()=>lvRelabel($('page'))).observe($('root'),{childList:true,subtree:true});lvRelabel();
 if(!reduce)requestAnimationFrame(loop);}
function contShares(){const cs={};CONTS.forEach(c=>cs[c]={power:0,n:0,on:0,stake:0});V.forEach(v=>{const x=cs[v.city.c];if(!x||v.jailed)return;x.power+=v.power;x.n++;x.stake+=v.stake;if(v.on)x.on++;});return cs;}
