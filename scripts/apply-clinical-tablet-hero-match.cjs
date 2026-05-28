const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'src', 'index.css');
if (!fs.existsSync(cssPath)) {
  console.error('Could not find src/index.css. Run this from the LabRat repo root.');
  process.exit(1);
}

const markerStart = '/* LABRAT clinical tablet hero logo match patch v1 */';
const markerEnd = '/* END LABRAT clinical tablet hero logo match patch v1 */';
const block = `${markerStart}
/*
  Goal: keep the already-correct Neon tablet hero untouched, and make only
  Clinical Dark tablet/desktop use the same right-side rat size + position.
*/
@media (min-width: 901px) {
  html[data-labrat-theme="clinical"] .labrat-command-hero {
    overflow: hidden !important;
    isolation: isolate !important;
  }

  html[data-labrat-theme="clinical"] .labrat-command-hero-copy {
    position: relative !important;
    z-index: 4 !important;
    max-width: min(760px, 62%) !important;
  }

  html[data-labrat-theme="clinical"] .labrat-command-hero-art {
    position: absolute !important;
    inset: 0 !important;
    z-index: 1 !important;
    display: block !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }

  html[data-labrat-theme="clinical"] .labrat-command-hero-art::before {
    content: "" !important;
    position: absolute !important;
    right: clamp(-7.25rem, -3.5vw, -2rem) !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: clamp(300px, 39vw, 540px) !important;
    height: clamp(300px, 39vw, 540px) !important;
    border-radius: 999px !important;
    opacity: .42 !important;
    filter: blur(18px) !important;
    background: radial-gradient(circle, rgba(148,163,184,.12), rgba(30,41,59,.08) 46%, transparent 72%) !important;
  }

  html[data-labrat-theme="clinical"] .labrat-command-hero-art img {
    position: absolute !important;
    right: clamp(-7.25rem, -3.5vw, -2rem) !important;
    top: 50% !important;
    bottom: auto !important;
    transform: translateY(-50%) !important;
    width: clamp(300px, 39vw, 540px) !important;
    max-width: none !important;
    max-height: none !important;
    height: auto !important;
    object-fit: contain !important;
    opacity: .46 !important;
    filter: grayscale(.95) saturate(.58) contrast(1.18) brightness(.58) drop-shadow(0 24px 36px rgba(0,0,0,.68)) !important;
    pointer-events: none !important;
    user-select: none !important;
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
console.log('Applied clinical tablet hero logo match patch to src/index.css');
