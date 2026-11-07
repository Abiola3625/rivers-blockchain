// Whitepaper and documentation pages: product links, the menu, and the contents list that marks
// the section being read.
import { wireLinks } from './links.js';

wireLinks();
const links = [...document.querySelectorAll('.toc a')];
const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
const seen = new Set();
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)));
  const first = [...byId.keys()].find((id) => seen.has(id));
  links.forEach((a) => a.classList.toggle('on', a === byId.get(first)));
}, { rootMargin: '-90px 0px -60% 0px' });
byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
