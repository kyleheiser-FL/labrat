#!/usr/bin/env node
const fs = require('fs');
const path = 'src/App.tsx';
if (!fs.existsSync(path)) {
  console.error('Could not find src/App.tsx');
  process.exit(1);
}
let s = fs.readFileSync(path, 'utf8');
if (!s.includes('labratProtocolIconFallback')) {
  const lines = s.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  const importLine = 'import "./labratProtocolIconFallback";';
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
  else lines.unshift(importLine);
  s = lines.join('\n');
  fs.writeFileSync(path, s);
  console.log('Added LABRAT protocol icon fallback import to src/App.tsx');
} else {
  console.log('LABRAT protocol icon fallback already imported.');
}
