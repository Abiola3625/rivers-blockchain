// Product links and the small-screen menu, shared by every page of the site.
const NAMES = { explorer: 'Rivers Scan', wallet: 'Rivers Wallet', institutions: 'Rivers Connect', console: 'Rivers Core', validator: 'Rivers Validator' };

export function wireLinks() {
  const LINKS = window.RV_LINKS || {};
  document.querySelectorAll('[data-link]').forEach((a) => {
    const u = LINKS[a.dataset.link];
    if (u) { a.href = u; a.rel = 'noopener'; return; }
    // A product without a public address yet: the link stays, and says so when pressed.
    a.href = '#'; a.classList.add('soon');
    a.addEventListener('click', (e) => { e.preventDefault(); toast((NAMES[a.dataset.link] || 'This product') + ' opens to the public soon. It runs on the Rivers testnet today.'); });
  });
  document.getElementById('menuBtn')?.addEventListener('click', () => document.body.classList.toggle('menu'));
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => document.body.classList.remove('menu')));
}

export function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 3800);
}
