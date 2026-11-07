import { build } from 'esbuild';
import { copyFileSync } from 'node:fs';
import { buildApp } from '../shared/build-app.mjs';
await buildApp(import.meta.url, { app: 'wallet', name: 'Rivers Wallet', views: ['src/live-wallet.js'], build });

// Shielded payments: the proving worker, snarkjs (GPL-3.0, kept as its own file) and the testnet
// circuit and proving key from rivers-packages/shield/keys.
await build({ entryPoints: ['src/shield-worker.js'], bundle: true, format: 'iife', minify: true, target: 'es2020', outfile: 'dist/shield-worker.js', nodePaths: [new URL('node_modules', import.meta.url).pathname] });
copyFileSync('node_modules/snarkjs/build/snarkjs.min.js', 'dist/snarkjs.min.js');
copyFileSync('node_modules/snarkjs/COPYING', 'dist/snarkjs-LICENSE.txt');
copyFileSync('../../rivers-packages/shield/keys/transaction.wasm', 'dist/shield.wasm');
copyFileSync('../../rivers-packages/shield/keys/transaction.zkey', 'dist/shield.zkey');
console.log('Shielded payments worker built.');

// Chain check: BLS signature checks for checkpoints, in a worker so phones stay responsive.
await build({ entryPoints: ['src/chain-worker.js'], bundle: true, format: 'iife', minify: true, target: 'es2020', outfile: 'dist/chain-worker.js', nodePaths: [new URL('node_modules', import.meta.url).pathname] });
console.log('Chain check worker built.');
