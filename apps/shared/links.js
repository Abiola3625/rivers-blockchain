/* ===================== RIVERS LINKS =====================
   Each Rivers interface is its own site. Fill in each site's address once it is live; a link stays hidden
   until its address is set. `?links=` style overrides are not accepted, so a visitor cannot redirect them. */
const RV_LINKS={
 explorer:'',   // Rivers Scan
 wallet:'',     // Rivers Wallet
 institutions:'', // Rivers Connect (banks and payment firms)
 console:'',    // Rivers Core (administration)
 validator:'',  // Rivers Validator
};
const RV_NAMES={explorer:'Rivers Scan',wallet:'Rivers Wallet',institutions:'Rivers Connect',console:'Rivers Core',validator:'Rivers Validator'};
/* Opens a page of another Rivers interface. Returns false when that site is not configured yet. */
function rvOpen(app,hash){const u=RV_LINKS[app];if(!u){toast(RV_NAMES[app]+' is not linked from this site yet.',false);return false;}location.href=u.replace(/\/+$/,'')+'/#'+(hash||app);return true;}
