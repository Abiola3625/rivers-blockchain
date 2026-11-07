import { build } from 'esbuild';
import { buildApp } from '../shared/build-app.mjs';
await buildApp(import.meta.url, { app: 'validator', name: 'Rivers Validator', views: ['src/live-validator.js'], build });
