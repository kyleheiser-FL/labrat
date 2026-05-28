const fs = require('fs');
const path = require('path');

const root = process.cwd();
const indexPath = path.join(root, 'index.html');
const publicIndexPath = path.join(root, 'public', 'index.html');
const targetIndex = fs.existsSync(indexPath) ? indexPath : publicIndexPath;

if (!fs.existsSync(targetIndex)) {
  console.error('Could not find index.html in this repo root. Run from the LabRat project root.');
  process.exit(1);
}

let html = fs.readFileSync(targetIndex, 'utf8');

const newRoot = String.raw`<div id="root">
    <div class="labrat-initial-loader" aria-label="Loading LabRat">
      <script>
        (function () {
          try {
            var keys = [
              'labrat_theme',
              'labratTheme',
              'labrat_selected_theme',
              'labrat-pwa-icon-theme',
              'labrat_pwa_icon_theme'
            ];
            var value = '';
            for (var i = 0; i < keys.length; i++) {
              value = window.localStorage.getItem(keys[i]) || value;
            }
            var normalized = String(value || '').toLowerCase();
            document.documentElement.setAttribute(
              'data-loader-theme',
              normalized.indexOf('neon') >= 0 ? 'neon' : 'clinical'
            );
          } catch (e) {
            document.documentElement.setAttribute('data-loader-theme', 'clinical');
          }
        })();
      </script>
      <style>
        .labrat-initial-loader {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 18px;
          background:
            radial-gradient(circle at 50% 42%, rgba(14, 165, 233, 0.13), transparent 34%),
            radial-gradient(circle at 50% 58%, rgba(34, 197, 94, 0.08), transparent 38%),
            #000;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #e5edf8;
          z-index: 999999;
          user-select: none;
          overflow: hidden;
        }

        .labrat-initial-loader::before {
          content: "";
          position: absolute;
          inset: -30%;
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: radial-gradient(circle at center, black 0%, transparent 62%);
          opacity: 0.55;
          transform: rotate(-6deg);
        }

        .labrat-loader-card {
          position: relative;
          width: 132px;
          height: 132px;
          border-radius: 34px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.28);
          box-shadow:
            0 24px 60px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.10);
          overflow: hidden;
        }

        .labrat-loader-card::after {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          border: 2px solid rgba(59, 130, 246, 0.45);
          filter: blur(7px);
          opacity: 0.75;
          animation: labrat-loader-glow 1.8s ease-in-out infinite alternate;
        }

        html[data-loader-theme="neon"] .labrat-loader-card::after {
          border-color: rgba(34, 211, 238, 0.74);
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.34), 0 0 45px rgba(34, 197, 94, 0.22);
        }

        .labrat-loader-icon {
          position: relative;
          z-index: 2;
          width: 104px;
          height: 104px;
          object-fit: contain;
          filter: drop-shadow(0 0 18px rgba(125, 211, 252, 0.22));
        }

        html[data-loader-theme="clinical"] .labrat-loader-icon-neon,
        html[data-loader-theme="neon"] .labrat-loader-icon-clinical {
          display: none;
        }

        .labrat-loader-wordmark {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(2rem, 6vw, 3.25rem);
          font-weight: 950;
          line-height: 0.9;
          letter-spacing: -0.08em;
          text-transform: uppercase;
          color: #f8fafc;
          text-shadow: 0 0 28px rgba(148, 163, 184, 0.18);
        }

        html[data-loader-theme="neon"] .labrat-loader-wordmark {
          background: linear-gradient(90deg, #22d3ee 0%, #38bdf8 42%, #22c55e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 28px rgba(34, 211, 238, 0.34);
        }

        .labrat-loader-status {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          min-width: 220px;
        }

        .labrat-loader-bar {
          width: min(280px, 58vw);
          height: 5px;
          border-radius: 999px;
          background: rgba(30, 41, 59, 0.9);
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.14);
        }

        .labrat-loader-bar::before {
          content: "";
          display: block;
          width: 46%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #60a5fa, #93c5fd);
          animation: labrat-loader-progress 1.45s ease-in-out infinite;
        }

        html[data-loader-theme="neon"] .labrat-loader-bar::before {
          background: linear-gradient(90deg, #06b6d4, #22d3ee, #22c55e);
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.55);
        }

        .labrat-loader-caption {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        html[data-loader-theme="neon"] .labrat-loader-caption {
          color: #67e8f9;
          text-shadow: 0 0 16px rgba(34, 211, 238, 0.38);
        }

        @keyframes labrat-loader-glow {
          from { opacity: 0.42; transform: scale(0.985); }
          to { opacity: 0.92; transform: scale(1.015); }
        }

        @keyframes labrat-loader-progress {
          0% { transform: translateX(-115%); }
          50% { transform: translateX(58%); }
          100% { transform: translateX(235%); }
        }
      </style>

      <div class="labrat-loader-card">
        <img class="labrat-loader-icon labrat-loader-icon-clinical" src="/pwa-icons/lr-clinical-512.png" alt="LabRat clinical LR logo" onerror="this.onerror=null;this.src='/icon_512.png';" />
        <img class="labrat-loader-icon labrat-loader-icon-neon" src="/pwa-icons/lr-neon-512.png" alt="LabRat neon LR logo" onerror="this.onerror=null;this.src='/labrat_top_left_logo_transparent.png';" />
      </div>
      <div class="labrat-loader-wordmark">LABRAT</div>
      <div class="labrat-loader-status">
        <div class="labrat-loader-bar"></div>
        <div class="labrat-loader-caption">Loading biochemical command center</div>
      </div>
    </div>
  </div>`;

const rootBlockPattern = /<div id="root">[\s\S]*?<\/div>\s*<script type="module" src="\/src\/main\.tsx"><\/script>/;
if (!rootBlockPattern.test(html)) {
  console.error('Could not find the initial #root loader block in index.html. No changes made.');
  process.exit(1);
}

html = html.replace(rootBlockPattern, `${newRoot}\n\n  <script type="module" src="/src/main.tsx"></script>`);
fs.writeFileSync(targetIndex, html);

// Keep the new loader icons available for offline/PWA startups when sw.js exists.
const swPath = path.join(root, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  const urls = [
    '/pwa-icons/lr-clinical-512.png',
    '/pwa-icons/lr-clinical-192.png',
    '/pwa-icons/lr-neon-512.png',
    '/pwa-icons/lr-neon-192.png'
  ];
  for (const url of urls) {
    if (!sw.includes(url)) {
      const cacheArrayMatch = sw.match(/(const\s+(?:CORE_ASSETS|STATIC_ASSETS|APP_SHELL|PRECACHE_URLS|urlsToCache)\s*=\s*\[)([\s\S]*?)(\];)/);
      if (cacheArrayMatch) {
        sw = sw.replace(cacheArrayMatch[0], `${cacheArrayMatch[1]}${cacheArrayMatch[2]}\n  '${url}',${cacheArrayMatch[3]}`);
      }
    }
  }
  fs.writeFileSync(swPath, sw);
}

console.log('✅ Replaced the old loading screen with the LabRat LR branded loader.');
console.log('✅ Loader is theme-aware: clinical LR for Clinical Dark, neon LR for Neon when saved in localStorage.');
