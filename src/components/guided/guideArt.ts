// Realistic, theme-aware SVG art for the guided how-to walkthroughs.
// Scenes are built as SVG strings (validated in a preview harness) and injected
// via dangerouslySetInnerHTML. Colors come from CSS custom properties so the
// same art works on neon, clinical (dark) and clinical-light.

export type LabTheme = 'neon' | 'clinical' | 'clinical-light';

export function guideThemeVars(theme: LabTheme, accent: string): React.CSSProperties {
  const light = theme === 'clinical-light';
  const v: Record<string, string> = light
    ? {
        '--surface': '#ffffff', '--panel': '#eef2f7', '--text': '#0f172a', '--muted': '#516079',
        '--line': '#c2ccd8', '--glass': 'rgba(15,23,42,.05)', '--metal': '#9aa7b8', '--metalD': '#64748b',
        '--stopper': '#8b98ab', '--plunger': '#7c8aa0', '--liquid': '#0ea5e9',
        '--skin': '#eab993', '--skin2': '#d6a578', '--fat': '#f6ddb0', '--muscle': '#c77c88',
      }
    : {
        '--surface': '#0b1222', '--panel': '#0f172a', '--text': '#e8eefb', '--muted': '#93a7c4',
        '--line': '#3a4a63', '--glass': 'rgba(148,180,214,.10)', '--metal': '#cbd5e1', '--metalD': '#64748b',
        '--stopper': '#7c8aa3', '--plunger': '#526176', '--liquid': '#38bdf8',
        '--skin': '#e6b48c', '--skin2': '#caa176', '--fat': '#f4d9a8', '--muscle': '#c76b7a',
      };
  v['--accent'] = accent;
  return v as React.CSSProperties;
}

export const GUIDE_KEYFRAMES = `
@keyframes lrg-pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes lrg-swirl{to{transform:rotate(360deg)}}
@keyframes lrg-attach{0%,100%{transform:translateY(-15px)}55%{transform:translateY(0)}}
@keyframes lrg-rise{0%{transform:translateY(9px);opacity:0}40%{opacity:1}100%{transform:translateY(-14px);opacity:0}}
@keyframes lrg-blink{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes lrg-plunge{0%,100%{transform:translateY(0)}50%{transform:translateY(9px)}}
@media (prefers-reduced-motion:reduce){[class^="lrg-"],[class*=" lrg-"]{animation:none!important}}
`;

// ── parts ───────────────────────────────────────────────────────────────────
// Syringe pointing DOWN; origin at needle tip. plunger 0..1 = liquid fraction.
function syringe(plunger = 0.4, withNeedle = true, tx = 0, ty = 0, s = 1): string {
  const h = plunger * 100;
  const sealY = -48 - h;
  const thumbY = -150 - 6 - plunger * 44;
  let grads = '';
  for (let y = -58; y >= -144; y -= 11) grads += `<line x1="7" y1="${y}" x2="11" y2="${y}" stroke="var(--metalD)" stroke-width="1"/>`;
  const needle = withNeedle
    ? `<rect x="-1" y="-30" width="2" height="30" fill="var(--metal)"/><path d="M-1 -1 L1 -1 L0 2.5 Z" fill="var(--metal)"/><path d="M-4 -30 L4 -30 L7 -42 L-7 -42 Z" fill="var(--metalD)"/>`
    : '';
  return `<g transform="translate(${tx} ${ty}) scale(${s})">${needle}
    <rect x="-9" y="-48" width="18" height="7" rx="2" fill="var(--metal)"/>
    <rect x="-11" y="-47" width="2" height="5" fill="var(--metalD)"/><rect x="9" y="-47" width="2" height="5" fill="var(--metalD)"/>
    <rect x="-12" y="-150" width="24" height="102" rx="4" fill="var(--glass)" stroke="var(--line)" stroke-width="1.5"/>${grads}
    <rect x="-10" y="${sealY}" width="20" height="${h}" rx="2" fill="var(--liquid)" opacity="0.5"/>
    <rect x="-11" y="${sealY - 3}" width="22" height="6" rx="1.5" fill="var(--plunger)"/>
    <rect x="-2.5" y="${thumbY}" width="5" height="${(sealY - 3) - thumbY}" fill="var(--plunger)"/>
    <rect x="-16" y="${thumbY - 5}" width="32" height="6" rx="2" fill="var(--plunger)"/>
    <rect x="-22" y="-151" width="10" height="5" rx="2" fill="var(--plunger)"/><rect x="12" y="-151" width="10" height="5" rx="2" fill="var(--plunger)"/></g>`;
}
// Vial. origin at center. flip=true → inverted (cap down, liquid pooled at stopper).
let vialUid = 0;
function vial(liquid = 0.55, flip = false, tx = 0, ty = 0, s = 1): string {
  const lh = liquid * 66;
  const id = `vc${vialUid++}`;
  const inner = `
    <path d="M-18 -30 Q-18 -34 -14 -36 L14 -36 Q18 -34 18 -30 L18 40 Q18 46 12 46 L-12 46 Q-18 46 -18 40 Z" fill="var(--glass)" stroke="var(--line)" stroke-width="1.5"/>
    <clipPath id="${id}"><path d="M-18 -30 Q-18 -34 -14 -36 L14 -36 Q18 -34 18 -30 L18 40 Q18 46 12 46 L-12 46 Q-18 46 -18 40 Z"/></clipPath>
    <g clip-path="url(#${id})"><rect x="-18" y="${46 - lh}" width="36" height="${lh}" fill="var(--liquid)" opacity="0.5"/><ellipse cx="0" cy="${46 - lh}" rx="18" ry="2.5" fill="var(--liquid)" opacity="0.7"/></g>
    <rect x="-18" y="6" width="36" height="22" rx="2" fill="var(--panel)" opacity="0.92"/>
    <rect x="-13" y="11" width="26" height="2.4" rx="1" fill="var(--accent)" opacity=".85"/>
    <rect x="-13" y="16" width="18" height="2" rx="1" fill="var(--muted)" opacity=".5"/>
    <rect x="-13" y="20" width="22" height="2" rx="1" fill="var(--muted)" opacity=".5"/>
    <rect x="-11" y="-44" width="22" height="10" fill="var(--glass)" stroke="var(--line)" stroke-width="1.2"/>
    <rect x="-11" y="-50" width="22" height="7" rx="1" fill="var(--stopper)"/>
    <rect x="-3.5" y="-49.5" width="7" height="3" rx="1" fill="var(--metalD)"/>
    <rect x="-14" y="-58" width="28" height="10" rx="2" fill="var(--metal)"/>
    <rect x="-14" y="-54" width="28" height="2" fill="var(--metalD)" opacity=".5"/>
    <ellipse cx="0" cy="-58" rx="5.5" ry="2.4" fill="var(--metalD)"/>`;
  return `<g transform="translate(${tx} ${ty}) scale(${s}) ${flip ? 'rotate(180)' : ''}">${inner}</g>`;
}
function skinBlock(): string {
  return `
    <path d="M20 78 Q80 60 120 74 Q160 88 220 78 L220 132 L20 132 Z" fill="var(--muscle)" opacity=".55"/>
    <path d="M20 66 Q80 44 120 60 Q160 76 220 66 L220 92 Q160 100 120 88 Q80 74 20 92 Z" fill="var(--fat)" opacity=".9"/>
    <path d="M20 60 Q80 38 120 54 Q160 70 220 60 L220 66 Q160 76 120 60 Q80 44 20 66 Z" fill="var(--skin2)"/>
    <path d="M20 58 Q80 36 120 52 Q160 68 220 58 L220 61 Q160 71 120 55 Q80 39 20 63 Z" fill="var(--skin)"/>`;
}

// ── scenes ──────────────────────────────────────────────────────────────────
export interface SceneOpts { ml?: number; units?: number | null; }

export function sceneSvg(kind: string, o: SceneOpts = {}): string {
  vialUid = 0; // deterministic clip ids per render
  const u = o.units ?? null;
  switch (kind) {
    // mixing
    case 'swab':
      return `${vial(0, false, 150, 96, 1)}<g class="lrg-a" style="animation:lrg-pulse 1.6s infinite"><rect x="66" y="40" width="40" height="14" rx="3" fill="var(--plunger)"/><rect x="100" y="36" width="20" height="22" rx="3" fill="var(--accent)"/></g>`;
    case 'draw':
      return `${syringe(0.72, true, 120, 150)}`;
    case 'pour':
      return `${vial(0.15, false, 150, 104, 1)}${syringe(0.2, true, 150, 54, 0.62)}`;
    case 'swirl':
      return `<g class="lrg-a" style="transform-origin:150px 96px;animation:lrg-swirl 2.4s linear infinite">${vial(0.55, false, 150, 96, 1)}</g>`;
    case 'store':
      return `<rect x="92" y="26" width="70" height="104" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><line x1="127" y1="30" x2="127" y2="126" stroke="var(--line)" stroke-width="2"/>${vial(0.5, false, 148, 92, 0.62)}`;

    // injection
    case 'attach':
      return `${syringe(0.3, false, 120, 150)}<g class="lrg-a" style="animation:lrg-attach 1.8s ease-in-out infinite"><rect x="118" y="118" width="4" height="26" fill="var(--metal)"/><path d="M116 118 L124 118 L127 108 L113 108 Z" fill="var(--metalD)"/><path d="M119 144 L121 144 L120 148 Z" fill="var(--metal)"/></g>`;
    case 'air':
      return `${syringe(0.28, true, 120, 150)}${u ? `<text x="150" y="150" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="monospace">${u} units air</text>` : ''}`;
    case 'pushair':
      return `${vial(0.62, false, 150, 118, 0.92)}<g class="lrg-a" style="transform-origin:150px 74px;animation:lrg-plunge 1.9s ease-in-out infinite">${syringe(0.05, true, 150, 74, 0.6)}</g>`;
    case 'invert':
      return `${vial(0.55, true, 150, 52, 0.9)}${syringe(0.6, true, 150, 150, 0.62)}${u ? `<text x="150" y="150" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="monospace">${u} units</text>` : ''}`;
    case 'bubbles':
      return `<g transform="rotate(180 120 82)">${syringe(0.55, true, 120, 150)}</g><g class="lrg-a" style="animation:lrg-rise 1.3s infinite"><circle cx="120" cy="60" r="3" fill="var(--text)" opacity=".7"/></g>`;
    case 'sites':
      return `<path d="M108 18 q22 -8 44 0 l8 44 q4 44 -8 74 l-44 0 q-12 -30 -8 -74 z" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><circle cx="130" cy="78" r="3" fill="var(--muted)"/>${[[112, 92], [148, 92], [120, 112], [140, 112], [130, 128]].map(([x, y], n) => `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="var(--accent)" stroke-width="2" class="lrg-a" style="animation:lrg-blink 1.6s ${n * 0.2}s infinite"/>`).join('')}`;
    case 'inject':
      return `${skinBlock()}<g transform="rotate(-38 120 58)">${syringe(0.5, true, 120, 58, 0.6)}</g>`;
    case 'dispose':
      return `<rect x="96" y="52" width="64" height="78" rx="6" fill="#b91c1c" opacity=".85"/><rect x="96" y="52" width="64" height="16" rx="6" fill="#7f1d1d"/><rect x="118" y="44" width="20" height="12" rx="3" fill="var(--panel)"/><text x="128" y="100" text-anchor="middle" fill="#fff" font-size="9" font-family="monospace">SHARPS</text>`;
    default:
      return '';
  }
}
