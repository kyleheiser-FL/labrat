const fs = require('fs');
const path = require('path');

const appPath = path.join(process.cwd(), 'src', 'App.tsx');
if (!fs.existsSync(appPath)) {
  console.error('Could not find src/App.tsx. Run this from the LabRat repo root.');
  process.exit(1);
}

let src = fs.readFileSync(appPath, 'utf8');
const original = src;

// Remove the custom install modal state. The normal browser PWA prompt remains via beforeinstallprompt.
src = src.replace(/\n\s*const \[showInstallModal, setShowInstallModal\] = useState\(false\);/g, '');

// Replace any fallback that opened the custom modal with a lightweight notification only.
src = src.replace(
  /\}\s*else\s*\{\s*setShowInstallModal\(true\);\s*\}/g,
  `} else {\n      triggerNotification(\n        'Install LabRat',\n        'Use your browser address-bar install icon or browser menu to install LabRat.',\n        'info',\n        false\n      );\n    }`
);

// Remove the full custom Progressive Web App install guide modal JSX block.
src = src.replace(
  /\n\s*\{\/\* Progressive Web App \(PWA\) Install Guide Modal \*\/\}\s*\n\s*<AnimatePresence>[\s\S]*?<\/AnimatePresence>\s*\n\s*\{\/\* First Boot Theme Picker \*\/\}/,
  `\n\n      {/* First Boot Theme Picker */}`
);

// Clean up accidental double blank lines around the removed area.
src = src.replace(/\n{4,}/g, '\n\n\n');

if (src === original) {
  console.log('No custom PWA install modal changes were needed.');
} else {
  fs.writeFileSync(appPath, src);
  console.log('Removed custom PWA install screen and kept the native browser PWA install prompt.');
}
