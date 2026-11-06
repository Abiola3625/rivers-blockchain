/* ===================== RIVERS WEB WALLET (inside Scan) =====================
   A self-custody wallet: 12 recovery words, encrypted in this browser with the user's password
   (PBKDF2 + AES-GCM). Keys never leave the browser. Send, receive, stake, unstake, test faucet. */
const WAL={kp:null,addr:null,bal:0,toks:[],stakes:[],busy:false,draft:{},flow:'home'};
const WAL_KEY='rvWallet';
const walStored=()=>{try{return JSON.parse(lvStore.get(WAL_KEY)||'null');}catch(e){return null;}};
const b64=u=>btoa(String.fromCharCode(...new Uint8Array(u)));const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function walKey(pw,salt){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function walSave(words,pw){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const k=await walKey(pw,salt);
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(words));const kp=Ed25519Keypair.deriveKeypair(words);
  lvStore.set(WAL_KEY,JSON.stringify({v:1,addr:kp.toSuiAddress(),salt:b64(salt),iv:b64(iv),ct:b64(ct)}));return kp;}
async function walOpen(pw){const st=walStored();if(!st)throw new Error('none');const k=await walKey(pw,unb64(st.salt));
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(st.iv)},k,unb64(st.ct));return Ed25519Keypair.deriveKeypair(new TextDecoder().decode(pt));}
function walSet(kp){WAL.kp=kp;WAL.addr=kp.toSuiAddress();S.connected=true;S.W.addr=WAL.addr;S.W.name=short(WAL.addr,4);lvSeeAddr(WAL.addr);walRefresh();}
async function walRefresh(){if(!WAL.addr)return;try{const [b,o]=await Promise.all([SSv.getBalance({owner:WAL.addr,coinType:RVRB_T}),SSv.listOwnedObjects({owner:WAL.addr,pageSize:100,objectType:'0x3::staking_pool::StakedSui',readMask:{paths:['object_id','json']}})]);
  WAL.bal=lvRv(b.response.balance&&b.response.balance.balance||0);
  try{const lb=(await SSv.listBalances({owner:WAL.addr})).response.balances||[];const t=lb.filter(x=>x.coinType!==RVRB_T&&BigInt(x.balance||0)>0n);for(const x of t)await stMeta(x.coinType);WAL.toks=t.map(x=>({ct:x.coinType,raw:String(x.balance),m:ST.meta[x.coinType]}));}catch(e){}
  WAL.stakes=(o.response.objects||[]).map(x=>{const f=x.json&&x.json.kind&&x.json.kind.structValue?x.json.kind.structValue.fields:{};const g=k=>f[k]&&f[k].kind?(f[k].kind.stringValue||f[k].kind.numberValue):null;
    const pool=g('pool_id');const v=V.find(y=>y.pool===pool);return {id:x.objectId,pool,principal:lvRv(g('principal')||0),epoch:Number(g('stake_activation_epoch')||0),val:v};});
  const el=$('walBody');if(el&&WAL.flow==='home')walRender();renderChrome();}catch(e){console.warn(e);}}

function walSheet(){openSheet('Rivers Wallet','<div id="walBody"></div>',WAL.addr?short(WAL.addr,8):'Self-custody wallet');walRender();}
function walRender(){const el=$('walBody');if(!el)return;const st=walStored();let h='';const f=WAL.flow;
 if(!WAL.kp&&!st&&f==='home'){h=`<div class="walhero">${logoSvg(56)}<b>Your Rivers wallet</b><span class="muted">Hold, send and stake RVRB. Your keys stay in this browser.</span></div>
   <button class="btn pri wide" data-act="walgo" data-v="create">Create a new wallet</button><button class="btn wide" data-act="walgo" data-v="import">Import with 12 words</button>`;}
 else if(!WAL.kp&&st&&f==='home'){h=`<div class="walhero">${identicon(st.addr,52)}<b class="mono">${short(st.addr,8)}</b><span class="muted">Enter your password to unlock.</span></div>
   <div class="fld"><label for="wPw">Password</label><input class="in" id="wPw" type="password" autocomplete="current-password"></div><div id="wErr"></div><button class="btn pri wide" data-act="walunlock">Unlock</button>
   <button class="btn wide" data-act="walgo" data-v="import">Use a different wallet</button>`;}
 else if(f==='create'){const w=WAL.draft.words||(WAL.draft.words=generateMnemonic(bip39en,128));h=`<p class="fg2" style="font-size:.84rem">Write these 12 words down in order and keep them offline. They are the only way to recover this wallet.</p>
   <div class="words">${w.split(' ').map((x,i)=>'<span><i>'+(i+1)+'</i>'+x+'</span>').join('')}</div>
   <label class="chkrow"><input type="checkbox" id="wOk"> I have written down my 12 words</label>${walPwFields()}<div id="wErr"></div><button class="btn pri wide" data-act="walcreate">Create wallet</button><button class="btn wide" data-act="walgo" data-v="home">Back</button>`;}
 else if(f==='import'){h=`<div class="fld"><label for="wWords">Recovery words</label><textarea class="in mono" id="wWords" rows="3" spellcheck="false" autocomplete="off" placeholder="word1 word2 … word12"></textarea></div>${walPwFields()}<div id="wErr"></div><button class="btn pri wide" data-act="walimport">Import wallet</button><button class="btn wide" data-act="walgo" data-v="home">Back</button>`;}
 else if(f==='send'){const tk=WAL.draft.tok||RVRB_T;const tm=WAL.toks.find(t=>t.ct===tk);h=`${WAL.toks.length?'<div class="fld"><label for="wTok">Token</label><select class="in" id="wTok"><option value="'+RVRB_T+'">RVRB</option>'+WAL.toks.map(t=>'<option value="'+t.ct+'" '+(t.ct===tk?'selected':'')+'>'+esc(t.m.symbol)+'</option>').join('')+'</select></div>':''}<div class="fld"><label for="wTo">Recipient address</label><input class="in mono" id="wTo" placeholder="0x…" spellcheck="false" autocomplete="off" value="${esc(WAL.draft.to||'')}"></div>
   <div class="fld"><label for="wAmt">Amount (${tm?esc(tm.m.symbol):'RVRB'})</label><div style="display:flex;gap:8px"><input class="in mono" id="wAmt" inputmode="decimal" value="${esc(WAL.draft.amt||'')}"><button class="btn" data-act="walmax">Max</button></div><span class="muted" style="font-size:.74rem">Available ${tm?stFmt(tm.raw,tm.m.decimals)+' '+esc(tm.m.symbol):fmt(WAL.bal,4)+' RVRB'}</span></div>
   <div id="wErr"></div><button class="btn pri wide" data-act="walsend">Send</button><button class="btn wide" data-act="walgo" data-v="home">Back</button>`;}
 else if(f==='receive'){h=`<div class="walhero">${identicon(WAL.addr,64)}<b>Your address</b><div class="mono" style="word-break:break-all;font-size:.8rem;text-align:center">${WAL.addr}</div></div><button class="btn pri wide" data-act="copy" data-v="${WAL.addr}">Copy address</button><button class="btn wide" data-act="walgo" data-v="home">Back</button>`;}
 else if(f==='stake'){const sel=WAL.draft.val!=null?WAL.draft.val:0;h=`<div class="fld"><label for="wVal">Validator</label><select class="in" id="wVal">${V.map(v=>'<option value="'+v.id+'" '+(v.id==sel?'selected':'')+'>'+esc(v.name)+' · commission '+fmt(v.comm,2)+'%</option>').join('')}</select></div>
   <div class="fld"><label for="wSAmt">Amount (RVRB)</label><div style="display:flex;gap:8px"><input class="in mono" id="wSAmt" inputmode="decimal" placeholder="Minimum 1"><button class="btn" data-act="walsmax">Max</button></div><span class="muted" style="font-size:.74rem">Available ${fmt(WAL.bal,4)} RVRB · rewards start next epoch</span></div>
   <div id="wErr"></div><button class="btn pri wide" data-act="walstake">Stake</button><button class="btn wide" data-act="walgo" data-v="home">Back</button>`;}
 else if(f==='done'){const d=WAL.draft.done||{};h=`<div class="walhero"><span class="b ok dot" style="font-size:.8rem;padding:6px 12px">${esc(d.title||'Done')}</span><span class="muted">${esc(d.sub||'')}</span></div>${d.digest?'<a class="btn pri wide" href="#explorer-tx-'+d.digest+'" data-act="closesh">View transaction</a>':''}<button class="btn wide" data-act="walgo" data-v="home">Back to wallet</button>`;}
 else{const staked=WAL.stakes.reduce((a,x)=>a+x.principal,0);h=`<div class="walbal"><span class="cap">Balance</span><div class="mono big glowtx">${fmt(WAL.bal,4)} <span style="font-size:.45em;color:var(--muted)">RVRB</span></div><span class="muted" style="font-size:.78rem">Staked ${fmt(staked,2)} RVRB in ${WAL.stakes.length} position${WAL.stakes.length===1?'':'s'}</span></div>
   <div class="walbtns">${[['send','Send',IC.send],['receive','Receive',IC.recv],['stake','Stake',IC.stake]].map(x=>'<button class="btn" data-act="walgo" data-v="'+x[0]+'">'+x[2]+'<span>'+x[1]+'</span></button>').join('')}<button class="btn" data-act="walfaucet">${IC.droplet}<span>Test RVRB</span></button></div>
   ${WAL.toks.length?'<div class="cap" style="margin-top:6px">Tokens</div><div class="list">'+WAL.toks.map(t=>'<a class="li click" href="#explorer-asset-'+t.ct+'" data-act="closesh" style="text-decoration:none">'+stIco(t.m.symbol,26)+'<span><b>'+esc(t.m.symbol)+'</b><br><span class="muted" style="font-size:.72rem">'+esc(t.m.name||'')+'</span></span><span class="r">'+stFmt(t.raw,t.m.decimals)+'</span></a>').join('')+'</div>':''}
   ${WAL.stakes.length?'<div class="cap" style="margin-top:6px">Staking positions</div><div class="list">'+WAL.stakes.map(x=>'<div class="li">'+(x.val?identicon(x.val.addr,26):'<span class="tag">—</span>')+'<span><b>'+fmt(x.principal,2)+' RVRB</b><br><span class="muted" style="font-size:.72rem">'+esc(x.val?x.val.name:short(x.pool||'',6))+' · since epoch '+x.epoch+'</span></span><span class="r"><button class="btn xs" data-act="walunstake" data-id="'+x.id+'">Unstake</button></span></div>').join('')+'</div>':''}
   <div class="kv"><div><span>Address</span><span class="mono">${short(WAL.addr,8)} <button class="btn xs" data-act="copy" data-v="${WAL.addr}">Copy</button></span></div></div>
   <div class="btns"><a class="btn sm" href="#explorer-address-${WAL.addr}" data-act="closesh">View in Scan</a><button class="btn sm" data-act="wallock">Lock</button><button class="btn sm danger" data-act="walforget">Remove from this browser</button></div>`;}
 el.innerHTML=h;const wt=$('wTok');if(wt)wt.addEventListener('change',()=>{WAL.draft.tok=wt.value;WAL.draft.to=$('wTo').value;WAL.draft.amt='';walRender();});const pw=$('wPw');if(pw){pw.focus();pw.addEventListener('keydown',e=>{if(e.key==='Enter')LACT.walunlock();});}}
const walPwFields=()=>'<div class="fld"><label for="wP1">Password for this browser</label><input class="in" id="wP1" type="password" autocomplete="new-password" placeholder="At least 8 characters"></div><div class="fld"><label for="wP2">Repeat password</label><input class="in" id="wP2" type="password" autocomplete="new-password"></div>';
const walErr=m=>{const e=$('wErr');if(e)e.innerHTML=m?'<div class="errbox">'+esc(m)+'</div>':'';};
function walPw(){const a=$('wP1').value,b=$('wP2').value;if(a.length<8)throw new Error('Use a password of at least 8 characters.');if(a!==b)throw new Error('The passwords do not match.');return a;}
async function walExec(tx,title,sub){if(WAL.busy)return;WAL.busy=true;walErr('');const btns=$$('#walBody .btn.pri');btns.forEach(b=>{b.disabled=true;b.textContent='Signing…';});
  try{tx.setSender(WAL.addr);const r=await lvClient.signAndExecuteTransaction({transaction:tx,signer:WAL.kp,include:{effects:true}});const t=r.Transaction||r.FailedTransaction||r;
    if(r.FailedTransaction||(t.status&&t.status.success===false))throw new Error((t.status&&t.status.error&&JSON.stringify(t.status.error).slice(0,140))||'The transaction failed.');
    WAL.draft={done:{title,sub,digest:t.digest}};WAL.flow='done';walRender();toast(title);setTimeout(walRefresh,1500);}
  catch(e){walErr(e.message||String(e));btns.forEach(b=>{b.disabled=false;b.textContent='Try again';});}
  WAL.busy=false;}
const toDrops=v=>{const x=String(v).trim();if(!/^\d+(\.\d{1,9})?$/.test(x))return null;const [i,d='']=x.split('.');return BigInt(i)*1000000000n+BigInt((d+'000000000').slice(0,9));};
Object.assign(LACT,{
 wconnect(){walSheet();},
 walgo(el){WAL.flow=el.dataset.v;if(WAL.flow==='home')WAL.draft={};walRender();},
 async walcreate(){try{if(!$('wOk').checked)throw new Error('Confirm that you have written down your 12 words.');const pw=walPw();const kp=await walSave(WAL.draft.words,pw);WAL.draft={};WAL.flow='home';walSet(kp);walRender();toast('Wallet created.');}catch(e){walErr(e.message);}},
 async walimport(){try{const w=$('wWords').value.trim().toLowerCase().split(/\s+/).join(' ');if(!validateMnemonic(w,bip39en))throw new Error('These are not valid recovery words. Check the spelling and order.');const pw=walPw();const kp=await walSave(w,pw);WAL.flow='home';walSet(kp);walRender();toast('Wallet imported.');}catch(e){walErr(e.message);}},
 async walunlock(){try{const kp=await walOpen($('wPw').value);walSet(kp);WAL.flow='home';walRender();}catch(e){walErr('Wrong password.');}},
 wallock(){WAL.kp=null;WAL.addr=null;S.connected=false;WAL.flow='home';closeSheet();route();},
 walforget(){confirmBox('Remove this wallet from this browser?','<p class="fg2">You can only get it back with your 12 recovery words.</p>','Remove',true,()=>{lvStore.set(WAL_KEY,null);LACT.wallock();toast('Wallet removed from this browser.');});},
 walmax(){const tm=WAL.toks.find(t=>t.ct===WAL.draft.tok);$('wAmt').value=tm?String(stNum(tm.raw,tm.m.decimals)):Math.max(0,WAL.bal-0.01).toFixed(4);},walsmax(){$('wSAmt').value=Math.max(0,Math.floor(WAL.bal-0.05)).toString();},
 async walsend(){const to=lvNorm($('wTo').value.trim());const tm=WAL.toks.find(t=>t.ct===WAL.draft.tok);WAL.draft.to=$('wTo').value;WAL.draft.amt=$('wAmt').value;
  if(tm){const a=stUnits($('wAmt').value,tm.m.decimals);if(!to)return walErr('Enter a valid recipient address.');if(!a||a<=0n)return walErr('Enter an amount.');if(a>BigInt(tm.raw))return walErr('The amount is more than your balance.');
   const tx=new Transaction();tx.transferObjects([coinWithBalance({type:tm.ct,balance:a})],to);return walExec(tx,'Sent '+$('wAmt').value+' '+tm.m.symbol,'To '+short(to,6));}
  const d=toDrops($('wAmt').value);
  if(!to)return walErr('Enter a valid recipient address.');if(!d||d<=0n)return walErr('Enter an amount.');if(Number(d)/1e9>WAL.bal)return walErr('The amount is more than your balance.');
  const tx=new Transaction();const [c]=tx.splitCoins(tx.gas,[d]);tx.transferObjects([c],to);await walExec(tx,'Sent '+fmt(Number(d)/1e9,4)+' RVRB','To '+short(to,6));},
 async walstake(){const v=V[+$('wVal').value];const d=toDrops($('wSAmt').value);WAL.draft.val=+$('wVal').value;if(!v)return walErr('Choose a validator.');if(!d||d<1000000000n)return walErr('The minimum stake is 1 RVRB.');if(Number(d)/1e9>WAL.bal-0.02)return walErr('Keep a little RVRB for the network fee.');
  const tx=new Transaction();const [c]=tx.splitCoins(tx.gas,[d]);tx.moveCall({target:'0x3::sui_system::request_add_stake',arguments:[tx.object('0x5'),c,tx.pure.address(v.addr)]});await walExec(tx,'Staked '+fmt(Number(d)/1e9,2)+' RVRB','With '+v.name+' · rewards start next epoch');},
 async walunstake(el){const x=WAL.stakes.find(s=>s.id===el.dataset.id);if(!x)return;const tx=new Transaction();tx.moveCall({target:'0x3::sui_system::request_withdraw_stake',arguments:[tx.object('0x5'),tx.object(x.id)]});WAL.flow='home';await walExec(tx,'Unstaked '+fmt(x.principal,2)+' RVRB','Returned to your balance with any rewards');},
 async walfaucet(){try{const r=await fetch(LV_FAUCET+'/v2/gas',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({FixedAmountRequest:{recipient:WAL.addr}})});const j=await r.json();if(j.status!=='Success')throw new Error();toast('50 test RVRB received.');setTimeout(walRefresh,2000);}catch(e){toast('Faucet unavailable. Please try again shortly.',false);}},
 lvstake(el,e){if(e&&e.preventDefault)e.preventDefault();if(!WAL.kp){walSheet();return;}WAL.draft={val:+el.dataset.id};WAL.flow='stake';walSheet();},
 stakeon(el,e){LACT.lvstake(el,e);},
});
setInterval(()=>{if(WAL.kp)walRefresh();},15000);
// Links to the standalone wallet app open the wallet sheet inside Scan.
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#wallet"]');if(!a)return;e.preventDefault();if(!a.dataset.act)walSheet();},true);
