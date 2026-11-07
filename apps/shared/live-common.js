/* ===================== SHARED BY THE RIVERS INTERFACES =====================
   Services configuration from the indexer, wallet gates and chrome hooks. */
let RVC=null;
async function rvConfig(force){if(RVC&&!force)return RVC;try{RVC=(await idxGet('/config')).dex||{};}catch(e){RVC=RVC||{};}return RVC;}
setInterval(()=>rvConfig(true),60000);setTimeout(()=>rvConfig(true),1500);
/* A page that needs an unlocked wallet shows this instead of its content. */
function rvGate(title,text,cta){const st=walStored();return `<section class="card hud gate">${logoSvg(56)}<h2>${esc(title)}</h2><p class="fg2">${esc(text)}</p>
 <div class="btns">${st?'<button class="btn pri" data-act="wconnect">Unlock wallet</button>':'<button class="btn pri" data-act="rvwal" data-v="create">'+esc(cta||'Create a wallet')+'</button><button class="btn" data-act="rvwal" data-v="import">Import with 12 words</button>'}</div>
 <p class="rvnote">Your keys are encrypted in this browser with your password and never leave it.</p></section>`;}
LACT.rvwal=function(el){WAL.flow=el.dataset.v;walSheet();};
/* Every interface re-renders when the wallet is unlocked, locked or removed. */
(function(){const ws=walSet;walSet=function(kp){ws(kp);setTimeout(route,0);};const wl=LACT.wallock;LACT.wallock=function(){wl();setTimeout(route,0);};})();
/* Auto-lock after a period without input. The period is a per-browser setting in Security. */
const RV_LOCK_KEY='rvAutoLock';let rvIdle=Date.now();
['click','keydown','touchstart'].forEach(e=>document.addEventListener(e,()=>{rvIdle=Date.now();},{passive:true}));
setInterval(()=>{const m=+(lvStore.get(RV_LOCK_KEY)||15);if(WAL.kp&&m>0&&Date.now()-rvIdle>m*60000){LACT.wallock();toast('Wallet locked after '+m+' minutes without activity.');}},20000);
const rvSigned=()=>!!WAL.kp;
const rvUsd=v=>v==null?'—':usdF(v);
const rvAgo=t=>t?ago(t):'—';
/* Calls `fn` with the chain's fresh state of an object as plain JSON. */
async function rvObj(id){const o=(await LSv.getObject({objectId:id,readMask:{paths:['json','object_type','owner']}})).response.object;return {type:o.objectType,owner:o.owner,json:plainV(o.json)};}
async function rvOwned(owner,type){const r=(await SSv.listOwnedObjects({owner,objectType:type,pageSize:50,readMask:{paths:['object_id','json','object_type']}})).response.objects||[];return r.map(o=>({id:o.objectId,type:o.objectType,json:plainV(o.json)}));}
async function rvSign(tx,okMsg,errEl){tx.setSender(WAL.addr);const r=await lvClient.signAndExecuteTransaction({transaction:tx,signer:WAL.kp,include:{effects:true,objectTypes:true}});const t=r.Transaction||r.FailedTransaction;
 if(r.FailedTransaction||!t.status||!t.status.success)throw new Error(rvAbort(JSON.stringify(t.status&&t.status.error||'')));if(okMsg)toast(okMsg);setTimeout(()=>{walRefresh();},1500);return t;}
/* Turns Move abort codes of the Rivers packages into plain messages. */
function rvAbort(e){const m=e.match(/"function(?:Name)?":"(\w+)".*?"abortCode":"?(\d+)|abort_code[^\d]*(\d+)/i);const code=m?+(m[2]||m[3]):null;const fn=m&&m[1]||'';
 const T={network:{1:'This address is not a registered institution.',2:'This institution is suspended.',3:'The amount is above the payment limit.',4:'Institutional payments are paused by Rivers Core.',5:'This institution is already registered.',6:'Enter an amount.',7:'A field is too long.'}};
 const Z={1:'The private payment proof was not accepted. Refresh the page and try again.',2:'The shielded pool changed while the proof was made. Try again.',3:'One of these notes was already spent. Refresh and try again.',4:'The private payment details are not valid.',6:'That is above the most this pool accepts in one deposit.',7:'The shielded pool does not hold that much.',8:'New deposits and private sends are paused by Rivers Core. Unshielding still works.'};
 if(/shield/.test(e)&&code&&Z[code])return Z[code];
 if(/network/.test(e)&&code&&T.network[code])return T.network[code];const L={1:'Borrowing is paused in this market.',2:'Enter an amount above zero.',3:'Add collateral first.',4:'That is above your borrowing limit.',5:'This loan is healthy and cannot be liquidated.',6:'The market does not have that much available right now.',8:'The market price needs fresh observations. Try again in about 10 minutes.',12:'You do not have that much collateral in this market.'};
 if(/lend/.test(e)&&code&&L[code])return L[code];if(/vesting/.test(e))return 'The vesting contract refused this action ('+(code||'error')+').';return 'The transaction failed. '+e.slice(0,140);}
/* Plain names for the contract calls of Rivers packages. */
const RV_CALLS={'shield::transact':'Private payment','pool::swap_a_for_b':'Swap','pool::swap_b_for_a':'Swap','pool::add_liquidity':'Add liquidity','pool::remove_liquidity':'Remove liquidity','pool::create_pool':'Create pool','test_faucet::claim':'Claim test coins',
 'sui_system::request_add_stake':'Stake','sui_system::request_withdraw_stake':'Unstake','network::pay':'Bank payment','network::register':'Register institution','network::set_limit':'Change limit','network::set_active':'Change status','network::set_paused':'Pause payments',
 'vesting::issue':'Issue vesting','vesting::issue_many':'Issue vesting','vesting::claim_to_sender':'Claim vesting','vesting::revoke_to_sender':'Revoke vesting','coin_registry::finalize_registration':'Register token','package::make_immutable':'Create token'};
const rvLabel=(l,kind)=>RV_CALLS[l]||(kind==='publish'?'Publish':l?l.split('::').pop().replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()):'Contract call');
/* Rivers Connect registry: the Network object and its institution records (returned by the RPC as BCS). */
const RV_INST=bcs.struct('Institution',{name:bcs.string(),city:bcs.string(),country:bcs.string(),tier:bcs.u8(),payment_limit:bcs.u64(),active:bcs.bool(),joined_ms:bcs.u64(),sent:bcs.u64(),received:bcs.u64()});
const rvHex=b=>'0x'+Array.from(Object.values(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
async function rvNet(){await rvConfig();const c=RVC&&RVC.connect;if(!c)return null;const n=await rvObj(c.network);const net=n.json;const r=(await SSv.listDynamicFields({parent:net.institutions.id,pageSize:1000,readMask:{paths:['name','value']}})).response.dynamicFields||[];
 const inst={};r.forEach(f=>{try{inst[rvHex(f.name.value)]=RV_INST.parse(Uint8Array.from(Object.values(f.value.value)));}catch(e){}});return {c,net,inst,paused:!!net.paused,payments:Number(net.payments||0)};}
/* ---------- Rivers Lend: market state as seen by the interfaces ---------- */
const LEND_POS=bcs.struct('Position',{collateral:bcs.u64(),debt_scaled:bcs.u256()});
const WADn=10n**18n,YEARn=31536000000n;
const rvBn=x=>BigInt(x&&typeof x==='object'?(x.value!=null?x.value:0):(x||0));
async function rvLendMarkets(owner){await rvConfig();if(!RVC||!RVC.lend)return [];const out=[];
 for(const [name,m] of Object.entries(RVC.lend)){try{const o=await rvObj(m.id);const j=o.json;const C=ntype(m.collateral),D=ntype(m.debt);
  const debt=BigInt(j.total_debt_scaled)*BigInt(j.borrow_index)/WADn;const cash=rvBn(j.cash);const res=BigInt(j.reserves);const avail=cash>res?cash-res:0n;
  const util=debt>0n?Number(debt*10000n/(avail+debt))/10000:0;const kink=Number(j.kink_bps)/10000,base=Number(j.base_rate_bps)/10000,s1=Number(j.slope1_bps)/10000,s2=Number(j.slope2_bps)/10000;
  const br=util<=kink?base+s1*util/kink:base+s1+s2*(util-kink)/(1-kink);const sr=br*util*(1-Number(j.reserve_factor_bps)/10000);
  const shareSupply=rvBn(j.shares);const supplied=cash+debt-res;
  const r={name,id:m.id,C,D,pool:m.pool,debt,cash,avail,util,br,sr,supplied,shareSupply,ltv:Number(j.ltv_bps)/10000,liq:Number(j.liq_threshold_bps)/10000,bonus:Number(j.liq_bonus_bps)/10000,paused:!!j.paused,index:BigInt(j.borrow_index),positionsId:j.positions.id,obs:(j.observations||[]).length,lastObs:Number(((j.observations||[]).slice(-1)[0]||{}).ms||0),twapMin:Number(j.twap_min_ms)};
  if(owner){const shareType=RVC.package+'::lend::Share<'+m.collateral+', '+m.debt+'>';try{r.myShares=BigInt(((await SSv.getBalance({owner,coinType:shareType})).response.balance||{}).balance||0);}catch(e){r.myShares=0n;}r.shareType=shareType;
   r.mySupply=r.shareSupply>0n?r.myShares*supplied/r.shareSupply:0n;r.myCol=0n;r.myDebt=0n;
   try{const df=(await SSv.listDynamicFields({parent:r.positionsId,pageSize:1000,readMask:{paths:['name','value']}})).response.dynamicFields||[];const f=df.find(x=>rvHex(x.name.value)===owner);if(f){const p=LEND_POS.parse(Uint8Array.from(Object.values(f.value.value)));r.myCol=BigInt(p.collateral);r.myDebt=(BigInt(p.debt_scaled)*r.index+WADn-1n)/WADn;}}catch(e){}}
  out.push(r);}catch(e){console.warn(e);}}return out;}
/* Spot price of one whole C in whole D from the pool; borrowing itself uses the on-chain time-weighted price. */
function rvLendPrice(m){if(!dReady())return null;const p=DEX.pools.find(x=>x.id===m.pool);if(!p)return null;return dRes(p,m.D)/dRes(p,m.C);}
