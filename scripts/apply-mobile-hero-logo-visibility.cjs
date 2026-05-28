const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'src', 'index.css');
if (!fs.existsSync(cssPath)) {
  console.error('Could not find src/index.css. Run this from the LabRat repo root.');
  process.exit(1);
}

const markerStart = '/* LABRAT mobile cockpit rat visibility patch v1 */';
const markerEnd = '/* END LABRAT mobile cockpit rat visibility patch v1 */';
const block = `${markerStart}
/*
  Phone-only cockpit art fix:
  - Keeps the already-correct Neon tablet/desktop layout untouched.
  - Keeps the cockpit card size/layout stable.
  - Moves the rat art back inside the phone hero as an absolute background layer.
  - Text/metrics stay in the foreground and may overlap the logo cleanly.
*/
@media (max-width: 767px) {
  .labrat-command-hero {
    position: relative !important;
    overflow: hidden !important;
    isolation: isolate !important;
  }

  .labrat-command-hero-copy,
  .labrat-command-eyebrow,
  .labrat-command-hero h2,
  .labrat-command-hero p,
  .labrat-command-metrics {
    position: relative !important;
    z-index: 5 !important;
  }

  .labrat-command-hero-art {
    position: absolute !important;
    inset: 0 !important;
    z-index: 1 !important;
    display: block !important;
    pointer-events: none !important;
    user-select: none !important;
    overflow: hidden !important;
    width: auto !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: none !important;
    max-height: none !important;
  }

  .labrat-command-hero-art::before {
    content: "" !important;
    position: absolute !important;
    right: -4.75rem !important;
    top: 8.25rem !important;
    width: clamp(220px, 76vw, 315px) !important;
    height: clamp(220px, 76vw, 315px) !important;
    border-radius: 999px !important;
    opacity: .34 !important;
    filter: blur(22px) !important;
    background: radial-gradient(circle, rgba(34,211,238,.18), rgba(34,197,94,.12) 42%, transparent 74%) !important;
  }

  .labrat-command-hero-art img {
    position: absolute !important;
    right: -4.25rem !important;
    top: 7.4rem !important;
    bottom: auto !important;
    left: auto !important;
    transform: none !important;
    width: clamp(225px, 76vw, 320px) !important;
    height: auto !important;
    max-width: none !important;
    max-height: none !important;
    object-fit: contain !important;
    pointer-events: none !important;
    user-select: none !important;
  }

  html[data-labrat-theme="clinical"] .labrat-command-hero-art::before {
    right: -5.25rem !important;
    top: 8.75rem !important;
    opacity: .22 !important;
    background: radial-gradient(circle, rgba(148,163,184,.12), rgba(30,41,59,.08) 45%, transparent 76%) !important;
  }

  html[data-labrat-theme="clinical"] .labrat-command-hero-art img {
    right: -4.9rem !important;
    top: 8.15rem !important;
    width: clamp(230px, 78vw, 325px) !important;
    opacity: .32 !important;
    filter: grayscale(.95) saturate(.52) contrast(1.14) brightness(.62) drop-shadow(0 20px 28px rgba(0,0,0,.74)) !important;
  }

  html[data-labrat-theme="neon"] .labrat-command-hero-art::before {
    right: -4.6rem !important;
    top: 8.1rem !important;
    opacity: .45 !important;
    background: radial-gradient(circle, rgba(0,216,255,.24), rgba(57,255,20,.16) 44%, transparent 76%) !important;
  }

  html[data-labrat-theme="neon"] .labrat-command-hero-art img {
    right: -4.15rem !important;
    top: 7.35rem !important;
    width: clamp(225px, 76vw, 320px) !important;
    opacity: .42 !important;
    filter: saturate(1.14) contrast(1.05) drop-shadow(0 0 20px rgba(34,211,238,.28)) drop-shadow(0 0 18px rgba(34,197,94,.14)) !important;
  }
}
${markerEnd}
`;

let css = fs.readFileSync(cssPath, 'utf8');
const start = css.indexOf(markerStart);
if (start !== -1) {
  const end = css.indexOf(markerEnd, start);
  if (end !== -1) {
    css = css.slice(0, start).trimEnd() + '\n\n' + block + css.slice(end + markerEnd.length);
  } else {
    css = css.replace(markerStart, block);
  }
} else {
  css = css.trimEnd() + '\n\n' + block;
}
fs.writeFileSync(cssPath, css);
console.log('Applied mobile cockpit rat visibility patch to src/index.css');
