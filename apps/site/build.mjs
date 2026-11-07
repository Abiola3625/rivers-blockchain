// Builds the Rivers website into dist/: bundles src/main.js, copies public/, and writes config.js
// with the product links from apps/shared/links.js and the optional indexer address.
import { build } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });
await build({ entryPoints: ['src/main.js', 'src/read.js'], bundle: true, minify: true, format: 'esm', target: 'es2020', outdir: 'dist', splitting: true, chunkNames: 'chunk-[hash]', legalComments: 'eof' });

const ctx = {};
vm.runInNewContext(readFileSync('../shared/links.js', 'utf8') + ';this.L=RV_LINKS;', ctx);
const indexer = (process.env.RIVERS_INDEXER || '').replace(/\/+$/, '');
writeFileSync('dist/config.js', 'window.RV_LINKS=' + JSON.stringify(ctx.L) + ';window.RV_INDEXER=' + JSON.stringify(indexer) + ';\n');
console.log('site built', ctx.L, indexer || '(no indexer)');
