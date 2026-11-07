// Whitepaper and documentation pages: product links, the contents drawer, the "On this page" list
// that follows the reader, copy buttons on code and search across every page.
import { wireLinks } from './links.js';

wireLinks();
const $ = (s) => document.querySelector(s);

$('#sideBtn')?.addEventListener('click', () => document.body.classList.toggle('side-open'));
document.addEventListener('click', (e) => { if (document.body.classList.contains('side-open') && !e.target.closest('#side, #sideBtn')) document.body.classList.remove('side-open'); });

document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', () => {
  const t = b.closest('.code').querySelector('code').innerText;
  navigator.clipboard.writeText(t).then(() => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy'; }, 1400); });
}));

const links = [...document.querySelectorAll('#otp a')];
if (links.length) {
  const heads = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const spy = () => {
    let cur = heads[0];
    for (const h of heads) if (h.getBoundingClientRect().top < 120) cur = h;
    links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id));
  };
  addEventListener('scroll', spy, { passive: true });
  spy();
}

// Search: page titles and section headings of both books.
const q = $('#q'), box = $('#results');
let data = null, sel = -1;
async function load() { if (!data) data = await (await fetch('../search.json')).json(); return data; }
function show(list) {
  sel = -1;
  box.innerHTML = list.length ? list.map((r) => `<a href="../${r.u}"><b>${r.text}</b><small>${r.where}</small></a>`).join('') : '<p>No results. Try another word.</p>';
  box.classList.toggle('on', !!q.value.trim());
}
q?.addEventListener('input', async () => {
  const s = q.value.trim().toLowerCase();
  if (!s) { box.classList.remove('on'); return; }
  const d = await load(), out = [];
  for (const p of d) {
    if (p.t.toLowerCase().includes(s)) out.push({ u: p.u, text: p.t, where: p.b });
    for (const [id, h] of p.h) if (h.toLowerCase().includes(s)) out.push({ u: p.u + '#' + id, text: h, where: p.b + ' · ' + p.t });
  }
  show(out.slice(0, 12));
});
q?.addEventListener('keydown', (e) => {
  const items = [...box.querySelectorAll('a')];
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle('sel', i === sel)); }
  if (e.key === 'Enter' && items[Math.max(0, sel)]) location.href = items[Math.max(0, sel)].href;
  if (e.key === 'Escape') { q.value = ''; box.classList.remove('on'); q.blur(); }
});
document.addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q?.focus(); } });
document.addEventListener('click', (e) => { if (!e.target.closest('.search')) box?.classList.remove('on'); });
