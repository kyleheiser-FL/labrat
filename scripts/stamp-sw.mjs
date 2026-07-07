// Replace the __SW_BUILD__ placeholder in the built service worker with a
// unique id per deploy. Runs after `vite build` (see package.json build).
// A changed sw.js is what triggers the browser's SW update flow — without
// this, deploys never fire controllerchange and the Update banner never shows.
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/sw.js';
const version =
  (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 10) ||
  Date.now().toString(36);

const src = readFileSync(file, 'utf8');
if (!src.includes('__SW_BUILD__')) {
  console.warn('[stamp-sw] placeholder __SW_BUILD__ not found in', file);
} else {
  writeFileSync(file, src.replaceAll('__SW_BUILD__', version));
  console.log(`[stamp-sw] stamped ${file} with build id ${version}`);
}
