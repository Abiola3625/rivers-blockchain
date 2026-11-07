// Builds one Rivers interface (Wallet, Connect, Core or Validator) as its own static site. Every
// interface shares the agreed design (apps/scan/design), the live chain engine and the wallet, and adds
// its own live views. The output is dist/ in the interface's folder.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const here = new URL('./', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, here), 'utf8');
const DESIGN = ['core.js', 'xchain.js', 'explorer.js', 'wallet.js', 'inst.js', 'console.js', 'views2.js', 'polish.js'].map((f) => '../scan/design/' + f);
const SHARED = ['../scan/src/scanlive.js', '../scan/src/scanwallet.js', '../scan/src/scanindex.js', '../scan/src/studio-template.js', '../scan/src/scanstudio.js', '../scan/src/scandex.js'];

// `build` is esbuild's build function, passed in because esbuild is installed in each interface's folder.
export async function buildApp(appUrl, { app, name, views, build }) {
  const at = (p) => new URL(p, appUrl);
  let js = `const RV_APP=${JSON.stringify(app)};\n`;
  js += [...DESIGN, 'invest.js', 'links.js', 'appshell.js', ...SHARED, 'live-common.js'].map(read).join('\n');
  js += '\n' + views.map((v) => readFileSync(at(v), 'utf8')).join('\n') + '\nboot();\n';
  js = js
    .replace('if(window.spawnParticle&&!reduce)', "if(typeof spawnParticle==='function'&&!reduce)")
    .replace('if(window.updateView)updateView();', "if(typeof updateView==='function')updateView();");
  mkdirSync(at('dist/'), { recursive: true });
  writeFileSync(at('dist/.app-core.js'), [
    "import { SuiGrpcClient } from '@mysten/sui/grpc';",
    "import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';",
    "import { Transaction, coinWithBalance } from '@mysten/sui/transactions';",
    "import { bcs } from '@mysten/sui/bcs';",
    "import initMbt, { update_identifiers as updateIdentifiers, update_constants as updateConstants } from '@mysten/move-bytecode-template';",
    "import { generateMnemonic, validateMnemonic } from '@scure/bip39';",
    "import { wordlist as bip39en } from '@scure/bip39/wordlists/english.js';",
  ].join('\n') + '\n(function(){\n"use strict";\n' + js + '\n})();\n');
  await build({ entryPoints: [at('dist/.app-core.js').pathname], bundle: true, format: 'esm', minify: true, target: 'es2020',
    outfile: at('dist/app.js').pathname, nodePaths: [at('node_modules').pathname] });
  writeFileSync(at('dist/styles.css'), read('../scan/design/styles.css') + '\n' + read('../scan/src/scan.css') + '\n' + read('app.css'));
  writeFileSync(at('dist/index.html'), read('index.html').replaceAll('{{NAME}}', name).replaceAll('{{APP}}', app));
  copyFileSync(new URL('_headers', here), at('dist/_headers'));
  copyFileSync(at('node_modules/@mysten/move-bytecode-template/web/move_bytecode_template_bg.wasm'), at('dist/mbt.wasm'));
  console.log(name + ' built.');
}
