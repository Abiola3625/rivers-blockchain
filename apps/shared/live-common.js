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
 if(/network/.test(e)&&code&&T.network[code])return T.network[code];if(/vesting/.test(e))return 'The vesting contract refused this action ('+(code||'error')+').';return 'The transaction failed. '+e.slice(0,140);}
/* Plain names for the contract calls of Rivers packages. */
const RV_CALLS={'pool::swap_a_for_b':'Swap','pool::swap_b_for_a':'Swap','pool::add_liquidity':'Add liquidity','pool::remove_liquidity':'Remove liquidity','pool::create_pool':'Create pool','test_faucet::claim':'Claim test coins',
 'sui_system::request_add_stake':'Stake','sui_system::request_withdraw_stake':'Unstake','network::pay':'Bank payment','network::register':'Register institution','network::set_limit':'Change limit','network::set_active':'Change status','network::set_paused':'Pause payments',
 'vesting::issue':'Issue vesting','vesting::issue_many':'Issue vesting','vesting::claim_to_sender':'Claim vesting','vesting::revoke_to_sender':'Revoke vesting','coin_registry::finalize_registration':'Register token','package::make_immutable':'Create token'};
const rvLabel=(l,kind)=>RV_CALLS[l]||(kind==='publish'?'Publish':l?l.split('::').pop().replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()):'Contract call');
/* Rivers Connect registry: the Network object and its institution records (returned by the RPC as BCS). */
const RV_INST=bcs.struct('Institution',{name:bcs.string(),city:bcs.string(),country:bcs.string(),tier:bcs.u8(),payment_limit:bcs.u64(),active:bcs.bool(),joined_ms:bcs.u64(),sent:bcs.u64(),received:bcs.u64()});
const rvHex=b=>'0x'+Array.from(Object.values(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
async function rvNet(){await rvConfig();const c=RVC&&RVC.connect;if(!c)return null;const n=await rvObj(c.network);const net=n.json;const r=(await SSv.listDynamicFields({parent:net.institutions.id,pageSize:1000,readMask:{paths:['name','value']}})).response.dynamicFields||[];
 const inst={};r.forEach(f=>{try{inst[rvHex(f.name.value)]=RV_INST.parse(Uint8Array.from(Object.values(f.value.value)));}catch(e){}});return {c,net,inst,paused:!!net.paused,payments:Number(net.payments||0)};}
