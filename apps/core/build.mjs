import { build } from 'esbuild';
import { buildApp } from '../shared/build-app.mjs';
await buildApp(import.meta.url, { app: 'console', name: 'Rivers Core', views: ['src/live-core.js'], build });
