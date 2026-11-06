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
let toastT;
function toast(m,ok){const t=$('toast');t.innerHTML=(ok===false?'<span class="b bad">!</span>':'<span class="b ok dot"></span>')+'<span>'+esc(m)+'</span>';t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3400);}
function openSheet(title,html,sub){$('shT').textContent=title;$('shS').textContent=sub||'';$('shB').innerHTML=html;$('scrim').hidden=false;$('sheet').hidden=false;requestAnimationFrame(()=>{$('scrim').classList.add('on');$('sheet').classList.add('on');});setTimeout(()=>{const b=$('shX');b&&b.focus();},50);}
function closeSheet(){$('scrim').classList.remove('on');$('sheet').classList.remove('on');$('modal').classList.remove('on');setTimeout(()=>{$('scrim').hidden=true;$('sheet').hidden=true;$('modal').hidden=true;},260);}
let modalCb=null;
function confirmBox(title,body,label,danger,cb){$('mT').textContent=title;$('mB').innerHTML=body;const go=$('mGo');go.textContent=label||'Confirm';go.className='btn '+(danger?'danger':'pri');modalCb=cb;$('scrim').hidden=false;$('modal').hidden=false;requestAnimationFrame(()=>{$('scrim').classList.add('on');$('modal').classList.add('on');});setTimeout(()=>go.focus(),60);}
function copyText(t){try{navigator.clipboard.writeText(t).then(()=>toast('Copied to clipboard.'),()=>toast('Copy is blocked here. Select the text to copy it.',false));}catch(e){toast('Copy is blocked here. Select the text to copy it.',false);}}

/* ===================== palette (read from the active skin) ===================== */
const C={};
function kpi(id,label,icon,sub,extra){return '<div class="kpi"><div class="kh"><span class="cap">'+label+'</span>'+(icon?'<span class="ico">'+icon+'</span>':'')+'</div><span class="v" id="'+id+'">—</span><span class="s" id="'+id+'s">'+(sub||'')+'</span>'+(extra||'')+'</div>';}
function logoSvg(sz,bg){return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lgb'+sz+(bg||'')+'" x1="0" x2="1"><stop offset="0" stop-color="#008751"/><stop offset="1" stop-color="#1FE58C"/></linearGradient></defs><rect width="40" height="40" rx="11" fill="'+(bg||'#05170E')+'"/><path d="M7 11c10 0 11 9 21 9h5" stroke="url(#lgb'+sz+(bg||'')+')" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M7 20h26" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round"/><path d="M7 29c10 0 11-9 21-9" stroke="url(#lgb'+sz+(bg||'')+')" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>';}
const CARET='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';
const MENU_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
function readPal(){const cs=getComputedStyle(document.body);const g=k=>cs.getPropertyValue(k).trim();
  Object.assign(C,{acc:g('--river'),deep:g('--deep'),tok:g('--gold'),fg:g('--fg'),fg2:g('--fg2'),mut:g('--muted'),dim:g('--dim'),hair:g('--hair2'),hair3:g('--hair3'),ok:g('--ok'),warn:g('--warn'),bad:g('--bad'),vio:g('--violet'),mint:g('--mint'),pearl:g('--pearl'),sunk:g('--sunk'),card:g('--card'),
    light:document.body.dataset.skin==='light'});
  C.grid=C.light?'rgba(0,90,50,.08)':'rgba(150,255,200,.07)';C.accA=C.light?'rgba(0,135,81,.22)':'rgba(31,229,140,.3)';
  C.types={transfer:C.acc,defi:C.tok,bank:C.vio,private:C.pearl,system:C.mint};}
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
