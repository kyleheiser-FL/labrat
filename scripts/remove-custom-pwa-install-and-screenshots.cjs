#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appPath = path.join(root, 'src', 'App.tsx');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, text) { fs.writeFileSync(file, text); }

if (!fs.existsSync(appPath)) {
  console.error('Could not find src/App.tsx. Run this from the LabRat repo root.');
  process.exit(1);
}

let app = read(appPath);

const oldHandle = `const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };`;

const newHandle = `const handleInstallApp = async () => {
    // Use the browser's native PWA install prompt only.
    // Do not show LabRat's custom install sheet or screenshot panel.
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return;
    }

    triggerNotification(
      'Use Browser Install',
      'Open your browser menu and choose Install App or Add to Home Screen to install LabRat.',
      'info',
      false
    );
  };`;

if (app.includes(oldHandle)) {
  app = app.replace(oldHandle, newHandle);
} else if (app.includes('setShowInstallModal(true);')) {
  app = app.replace('setShowInstallModal(true);', `triggerNotification(\n      'Use Browser Install',\n      'Open your browser menu and choose Install App or Add to Home Screen to install LabRat.',\n      'info',\n      false\n    );`);
} else {
  console.warn('No custom install modal trigger found in App.tsx. It may already be removed.');
}

// Hard-disable the custom modal if any other future path toggles it on.
app = app.replace(
  /const \[showInstallModal, setShowInstallModal\] = useState\([^)]*\);/,
  `const [showInstallModal, setShowInstallModal] = useState(false);`
);

write(appPath, app);

for (const rel of ['manifest.json', path.join('public', 'manifest.json')]) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  try {
    const data = JSON.parse(read(file));
    if (Array.isArray(data.screenshots)) {
      delete data.screenshots;
      write(file, JSON.stringify(data, null, 2) + '\n');
      console.log(`Removed screenshots from ${rel}`);
    } else {
      console.log(`No screenshots array in ${rel}`);
    }
  } catch (err) {
    console.warn(`Could not parse ${rel}; leaving it unchanged: ${err.message}`);
  }
}

console.log('LabRat now uses the native browser PWA install prompt only.');
