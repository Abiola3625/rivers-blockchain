import { build } from 'esbuild';
import { buildApp } from '../shared/build-app.mjs';
await buildApp(import.meta.url, { app: 'institutions', name: 'Rivers Connect', views: ['src/live-connect.js'], build });
