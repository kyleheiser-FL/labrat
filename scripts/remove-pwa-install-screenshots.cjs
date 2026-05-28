#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const manifestCandidates = [
  'manifest.json',
  'public/manifest.json',
  'public/manifest-neon.json',
  'public/manifest-clinical.json',
  'manifest-neon.json',
  'manifest-clinical.json',
  'dist/manifest.json',
  'dist/manifest-neon.json',
  'dist/manifest-clinical.json'
];

let changed = 0;
for (const rel of manifestCandidates) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(raw);
    let touched = false;
    if (Object.prototype.hasOwnProperty.call(json, 'screenshots')) {
      delete json.screenshots;
      touched = true;
    }
    // Remove any custom screenshot helper fields some previous patches may have added.
    for (const key of ['screenshot', 'screenShots', 'theme_screenshots', 'themeScreenshots']) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        delete json[key];
        touched = true;
      }
    }
    if (touched) {
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
      console.log(`Removed manifest screenshots from ${rel}`);
      changed++;
    }
  } catch (err) {
    console.warn(`Skipped ${rel}: ${err.message}`);
  }
}

// Keep the snippet file out of future accidental manifest merges.
const snippetFiles = ['manifest-screenshots-snippet.json', 'public/manifest-screenshots-snippet.json'];
for (const rel of snippetFiles) {
  const file = path.join(root, rel);
  if (fs.existsSync(file)) {
    fs.writeFileSync(file, '{\n  "screenshots": []\n}\n');
    console.log(`Disabled screenshot snippet ${rel}`);
    changed++;
  }
}

// Remove generated screenshot assets from the repo if they exist; ignore if not present.
const screenshotDirs = [
  'public/pwa-screenshots',
  'public/screenshots',
  'pwa-screenshots',
  'screenshots'
];
for (const rel of screenshotDirs) {
  const dir = path.join(root, rel);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    for (const entry of fs.readdirSync(dir)) {
      if (/\.(png|jpe?g|webp)$/i.test(entry)) {
        fs.rmSync(path.join(dir, entry), { force: true });
        console.log(`Removed ${rel}/${entry}`);
        changed++;
      }
    }
  }
}

console.log(changed ? `Done. ${changed} screenshot/install-preview items removed or disabled.` : 'No manifest screenshots found. Nothing changed.');
