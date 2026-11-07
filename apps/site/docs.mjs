// Builds the whitepaper and the documentation from content/*.md into one page per chapter, with a
// sidebar, an "On this page" list, previous and next links, search data and light and dark themes.
import { marked } from 'marked';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const BOOKS = {
  whitepaper: {
    title: 'Whitepaper',
    groups: [['Rivers Blockchain whitepaper', ['abstract', 'introduction', 'design-goals', 'architecture', 'consensus', 'validators', 'token', 'finance', 'privacy', 'connect', 'bridge', 'security', 'administration', 'roadmap', 'risks']]],
  },
  docs: {
    title: 'Documentation',
    groups: [
      ['Get started', ['introduction', 'networks', 'concepts', 'quickstart']],
      ['Use Rivers', ['wallet', 'staking', 'swaps', 'lending', 'private-payments', 'token-studio']],
      ['Validators', ['validator-requirements', 'validator-setup', 'validator-operations']],
      ['Build on Rivers', ['sdk', 'transactions', 'reading-data', 'move-packages']],
      ['Reference', ['ref-dex', 'ref-lend', 'ref-shield', 'ref-connect', 'ref-vesting', 'ref-stablecoins', 'events', 'errors', 'indexer-api']],
      ['Institutions', ['connect-integration']],
      ['Bridge', ['bridge']],
    ],
  },
};

const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#05170E"/><path d="M7 11c10 0 11 9 21 9h5" stroke="#1FE58C" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M7 20h26" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><path d="M7 29c10 0 11-9 21-9" stroke="#1FE58C" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" class="i-sun"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></svg><svg viewBox="0 0 24 24" class="i-moon"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';

export function themeButton() { return `<button class="theme-btn" id="themeBtn" aria-label="Switch between light and dark">${SUN}</button>`; }

function renderPage(md) {
  const heads = [];
  const r = new marked.Renderer();
  r.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens);
    const id = slugify(text);
    if (depth === 2 || depth === 3) heads.push({ depth, id, text: text.replace(/<[^>]+>/g, '') });
    return `<h${depth} id="${id}">${depth > 1 ? `<a class="anchor" href="#${id}" aria-label="Link to this section">#</a>` : ''}${text}</h${depth}>`;
  };
  r.blockquote = ({ tokens }) => {
    const inner = marked.Parser.parse(tokens);
    const kind = /^<p><strong>(Warning|Important)/.test(inner) ? 'warn' : 'note';
    return `<div class="callout ${kind}">${inner}</div>`;
  };
  r.code = ({ text, lang }) => `<div class="code"><div class="code-bar"><span>${esc(lang || 'text')}</span><button class="copy" type="button">Copy</button></div><pre><code>${esc(text)}</code></pre></div>`;
  r.table = function (t) { return '<div class="table-wrap">' + marked.Renderer.prototype.table.call(this, t) + '</div>'; };
  const html = marked.parse(md, { renderer: r, gfm: true });
  const title = (md.match(/^# (.+)$/m) || [, 'Rivers'])[1];
  return { html, heads, title };
}

export function buildBooks(linksJs) {
  const search = [];
  for (const [book, def] of Object.entries(BOOKS)) {
    const order = def.groups.flatMap(([, s]) => s);
    const pages = Object.fromEntries(order.map((slug) => [slug, renderPage(readFileSync(`content/${book}/${slug}.md`, 'utf8'))]));
    mkdirSync(`dist/${book}`, { recursive: true });
    order.forEach((slug, i) => {
      const p = pages[slug];
      const prev = order[i - 1], next = order[i + 1];
      const nav = def.groups.map(([g, list]) => `<p class="side-g">${esc(g)}</p><ul>${list.map((s) => `<li><a href="${s}.html"${s === slug ? ' class="on" aria-current="page"' : ''}>${esc(pages[s].title)}</a></li>`).join('')}</ul>`).join('');
      const toc = p.heads.filter((h) => h.depth === 2).map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('');
      const chapter = book === 'whitepaper' ? `<p class="chap">Chapter ${i + 1} of ${order.length}</p>` : '';
      const out = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)} · Rivers ${def.title}</title>
<meta name="description" content="${esc(p.title)} — Rivers Blockchain ${def.title.toLowerCase()}.">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<script src="../theme.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../docs.css">
</head>
<body class="doc">
<header class="dtop">
  <button class="side-btn" id="sideBtn" aria-label="Contents"><span></span><span></span><span></span></button>
  <a class="brand" href="../">${LOGO}<span>Rivers</span></a>
  <nav class="books"><a href="../whitepaper/abstract.html"${book === 'whitepaper' ? ' class="on"' : ''}>Whitepaper</a><a href="../docs/introduction.html"${book === 'docs' ? ' class="on"' : ''}>Docs</a></nav>
  <label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="Search the docs" autocomplete="off"><kbd>/</kbd><div class="results" id="results"></div></label>
  ${themeButton()}
  <a class="dpill" data-link="wallet">Open wallet</a>
</header>
<div class="dwrap">
  <aside class="side" id="side"><nav>${nav}</nav></aside>
  <main class="article">
    ${chapter}
    <article class="md">${p.html}</article>
    <nav class="pn">${prev ? `<a class="prev" href="${prev}.html"><small>Previous</small><b>${esc(pages[prev].title)}</b></a>` : '<span></span>'}${next ? `<a class="next" href="${next}.html"><small>Next</small><b>${esc(pages[next].title)}</b></a>` : '<span></span>'}</nav>
    <p class="edit"><a href="https://github.com/Abiola3625/rivers-blockchain/blob/main/apps/site/content/${book}/${slug}.md" rel="noopener">Edit this page on GitHub</a></p>
  </main>
  <aside class="otp">${toc ? `<p>On this page</p><ul id="otp">${toc}</ul>` : ''}</aside>
</div>
<footer class="dfoot"><span>Rivers Blockchain. Built in Nigeria.</span><span>Rivers is on testnet: test tokens have no value and the network may be reset.</span></footer>
<script src="../config.js"></script>
<script src="../read.js" type="module"></script>
</body>
</html>`;
      writeFileSync(`dist/${book}/${slug}.html`, out);
      search.push({ u: `${book}/${slug}.html`, t: p.title, b: def.title, h: p.heads.map((h) => [h.id, h.text]) });
    });
    writeFileSync(`dist/${book}/index.html`, `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${order[0]}.html"><title>Rivers ${def.title}</title><a href="${order[0]}.html">${def.title}</a>`);
  }
  writeFileSync('dist/search.json', JSON.stringify(search));
  // Old single-page addresses keep working.
  writeFileSync('dist/whitepaper.html', '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=whitepaper/abstract.html"><title>Rivers Whitepaper</title><a href="whitepaper/abstract.html">Whitepaper</a>');
  writeFileSync('dist/docs.html', '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=docs/introduction.html"><title>Rivers Documentation</title><a href="docs/introduction.html">Documentation</a>');
}
