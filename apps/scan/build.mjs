// Builds Rivers Scan: the agreed interface (design/) driven by live chain data (src/scanlive.js).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { build } from 'esbuild';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const design = ['core.js', 'xchain.js', 'explorer.js', 'wallet.js', 'inst.js', 'console.js', 'views2.js', 'polish.js'];
let js = design.map((f) => read('design/' + f)).join('\n');
js += '\n' + read('../shared/links.js') + '\n' + read('src/scanshell.js') + '\n' + read('src/scanlive.js') + '\n' + read('src/scanwallet.js') + '\n' + read('src/scanindex.js') + '\n' + read('src/studio-template.js') + '\n' + read('src/scanstudio.js') + '\n' + read('src/scandex.js') + '\nboot();\n';
js = js
  .replace('if(window.spawnParticle&&!reduce)', "if(typeof spawnParticle==='function'&&!reduce)")
  .replace('if(window.updateView)updateView();', "if(typeof updateView==='function')updateView();");
mkdirSync(new URL('dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('dist/.scan-core.js', import.meta.url), [
  "import { SuiGrpcClient } from '@mysten/sui/grpc';",
  "import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';",
  "import { Transaction, coinWithBalance } from '@mysten/sui/transactions';",
  "import { bcs } from '@mysten/sui/bcs';",
  "import initMbt, { update_identifiers as updateIdentifiers, update_constants as updateConstants } from '@mysten/move-bytecode-template';",
  "import { generateMnemonic, validateMnemonic } from '@scure/bip39';",
  "import { wordlist as bip39en } from '@scure/bip39/wordlists/english.js';",
].join('\n') + "\n(function(){\n\"use strict\";\n" + js + '\n})();\n');
await build({ entryPoints: [new URL('dist/.scan-core.js', import.meta.url).pathname], bundle: true, format: 'esm', minify: true, target: 'es2020', outfile: new URL('dist/app.js', import.meta.url).pathname, nodePaths: [new URL('node_modules', import.meta.url).pathname] });
writeFileSync(new URL('dist/styles.css', import.meta.url), read('design/styles.css') + '\n' + read('src/scan.css'));
for (const f of ['index.html', '_headers']) copyFileSync(new URL('public/' + f, import.meta.url), new URL('dist/' + f, import.meta.url));
// Token Studio patches the Move template in the browser with this WebAssembly module.
copyFileSync(new URL('node_modules/@mysten/move-bytecode-template/web/move_bytecode_template_bg.wasm', import.meta.url), new URL('dist/mbt.wasm', import.meta.url));
console.log('Rivers Scan built.');
