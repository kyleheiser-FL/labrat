const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'src', 'index.css');
if (!fs.existsSync(cssPath)) {
  console.error('Could not find src/index.css. Run this from the LabRat repo root.');
  process.exit(1);
}

let css = fs.readFileSync(cssPath, 'utf8');
const start = '/* LABRAT MOBILE RAT BACKGROUND RESTORE START */';
const end = '/* LABRAT MOBILE RAT BACKGROUND RESTORE END */';
const blockRe = new RegExp(`${start.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\n?`, 'g');
css = css.replace(blockRe, '');

const block = `
${start}
/*
  Keeps the Daily Cockpit card size stable on phones while making the LabRat rat art
  visible as a background layer underneath the text. Neon tablet/desktop layout is not changed.
*/
@media (max-width: 900px) {
  #labrat-command-hero.labrat-command-hero,
  .labrat-command-hero {
    position: relative !important;
    overflow: hidden !important;
    isolation: isolate !important;
  }

  #labrat-command-hero .labrat-command-hero-copy,
  .labrat-command-hero .labrat-command-hero-copy {
    position: relative !important;
    z-index: 3 !important;
  }

  #labrat-command-hero .labrat-command-hero-art,
  .labrat-command-hero .labrat-command-hero-art {
    display: block !important;
    position: absolute !important;
    z-index: 1 !important;
    pointer-events: none !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    inset: 0 !important;
    opacity: 1 !important;
    filter: none !important;
    transform: none !important;
  }

  #labrat-command-hero .labrat-command-hero-art::before,
  .labrat-command-hero .labrat-command-hero-art::before {
    display: none !important;
    content: none !important;
  }

  #labrat-command-hero .labrat-command-hero-art img,
  .labrat-command-hero .labrat-command-hero-art img {
    position: absolute !important;
    width: clamp(260px, 78vw, 390px) !important;
    max-width: none !important;
    max-height: none !important;
    height: auto !important;
    object-fit: contain !important;
    right: clamp(-140px, -20vw, -78px) !important;
    top: clamp(48px, 10vh, 96px) !important;
    transform: none !important;
    opacity: 0.28 !important;
    mix-blend-mode: screen !important;
    filter: grayscale(0.05) saturate(1.05) brightness(0.82) contrast(1.12) !important;
  }

  html[data-labrat-theme="clinical"] #labrat-command-hero .labrat-command-hero-art img,
  html[data-labrat-theme="clinical"] .labrat-command-hero .labrat-command-hero-art img {
    opacity: 0.24 !important;
    mix-blend-mode: screen !important;
    filter: grayscale(0.72) saturate(0.35) brightness(0.68) contrast(1.22) !important;
  }

  html[data-labrat-theme="neon"] #labrat-command-hero .labrat-command-hero-art img,
  html[data-labrat-theme="neon"] .labrat-command-hero .labrat-command-hero-art img {
    opacity: 0.34 !important;
    mix-blend-mode: screen !important;
    filter: saturate(1.35) brightness(0.95) contrast(1.12) drop-shadow(0 0 22px rgba(34, 211, 238, 0.25)) !important;
  }
}

@media (max-width: 480px) {
  #labrat-command-hero .labrat-command-hero-art img,
  .labrat-command-hero .labrat-command-hero-art img {
    width: clamp(250px, 86vw, 360px) !important;
    right: clamp(-150px, -30vw, -92px) !important;
    top: 58px !important;
  }
}
${end}
`;

fs.writeFileSync(cssPath, css.trimEnd() + '\n\n' + block);
console.log('Applied mobile rat background visibility fix to src/index.css');
