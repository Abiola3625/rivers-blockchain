import { build } from 'esbuild';
import { buildApp } from '../shared/build-app.mjs';
await buildApp(import.meta.url, { app: 'wallet', name: 'Rivers Wallet', views: ['src/live-wallet.js'], build });
