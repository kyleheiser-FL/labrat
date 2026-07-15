// Realistic, theme-aware SVG art for the guided how-to walkthroughs.
// Scenes are built as SVG strings (designed + validated in a preview harness)
// and injected via dangerouslySetInnerHTML. All colors come from CSS custom
// properties so the same art renders correctly on clinical (dark) and
// clinical-light.

export type LabTheme = 'clinical' | 'clinical-light';

export function guideThemeVars(theme: LabTheme, accent: string): React.CSSProperties {
  const light = theme === 'clinical-light';
  const v: Record<string, string> = light
    ? {
        '--surface': '#ffffff', '--panel': '#eef2f7', '--text': '#0f172a', '--muted': '#516079', '--line': '#c2ccd8',
        '--glass': '#e6ecf3', '--metal': '#aab6c6', '--metalHi': '#ffffff', '--metalD': '#7c8aa0',
        '--stopper': '#9aa7b8', '--plunger': '#8996a8', '--plungerD': '#5f6b7d',
        '--liquid': '#22a7dd', '--liquidHi': '#8fd6f2',
        '--skin': '#eab98f', '--skin2': '#d6a06f', '--fat': '#f4dca6', '--fatHi': '#fbedc8', '--muscle': '#c56b7e', '--muscleHi': '#d68595',
      }
    : {
        '--surface': '#0b1222', '--panel': '#0f172a', '--text': '#e8eefb', '--muted': '#93a7c4', '--line': '#3a4a63',
        '--glass': '#141f36', '--metal': '#d5dce6', '--metalHi': '#f4f7fb', '--metalD': '#6b7a92',
        '--stopper': '#8b98ab', '--plunger': '#4a586e', '--plungerD': '#2f3b4e',
        '--liquid': '#2fb6e6', '--liquidHi': '#7fd8f5',
        '--skin': '#e8b98f', '--skin2': '#d19b6f', '--fat': '#f2d59e', '--fatHi': '#f8e6c2', '--muscle': '#b5566a', '--muscleHi': '#c96f82',
      };
  v['--accent'] = accent;
  return v as React.CSSProperties;
}

export const GUIDE_KEYFRAMES = `
@keyframes lrg-swirl{to{transform:rotate(360deg)}}
@keyframes lrg-attach{0%,100%{transform:translateY(-15px)}55%{transform:translateY(0)}}
@keyframes lrg-rise{0%{transform:translateY(9px);opacity:0}40%{opacity:1}100%{transform:translateY(-14px);opacity:0}}
@keyframes lrg-blink{0%,100%{opacity:.3}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){[class^="lrg-"],[class*=" lrg-"]{animation:none!important}}
`;

// ── parts ───────────────────────────────────────────────────────────────────
function grads(): string {
  let s = ''; let n = 0;
  for (let y = -58; y >= -150; y -= 9) { const maj = n % 2 === 0; s += `<line x1="${maj ? 5 : 7.5}" y1="${y}" x2="10.5" y2="${y}" stroke="var(--metalD)" stroke-width="${maj ? 1.1 : 0.8}" opacity="${maj ? 0.85 : 0.5}"/>`; n++; }
  return s;
}
// Luer-lock syringe pointing DOWN; origin at needle tip. plunger 0..1 = fill.
function syringe(plunger = 0.4, withNeedle = true, tx = 0, ty = 0, s = 1): string {
  const bTop = -150, bBot = -52;
  const lh = plunger * 94; const sealY = bBot - lh;
  const thumbY = bTop - 6 - plunger * 30;
  const needle = withNeedle
    ? `<rect x="-1.2" y="-34" width="2.4" height="34" rx="1.2" fill="var(--metalD)"/><rect x="-1.2" y="-34" width="1.1" height="34" rx="1" fill="var(--metalHi)" opacity=".7"/><path d="M-1.2 -2 L1.2 -2 L0 2.2 Z" fill="var(--metalHi)"/>`
    : '';
  const hub = `<path d="M-4.5 -34 L4.5 -34 L7 -47 L-7 -47 Z" fill="var(--metalD)"/><path d="M-4.5 -34 L-1.5 -34 L-4 -47 L-7 -47 Z" fill="var(--metalHi)" opacity=".28"/>`;
  const collar = `<rect x="-9.5" y="-53" width="19" height="8" rx="2.5" fill="var(--metal)"/><rect x="-9.5" y="-53" width="19" height="2.4" rx="2" fill="var(--metalHi)" opacity=".55"/><rect x="-12" y="-51.5" width="3" height="5" rx="1.4" fill="var(--metalD)"/><rect x="9" y="-51.5" width="3" height="5" rx="1.4" fill="var(--metalD)"/>`;
  return `<g transform="translate(${tx} ${ty}) scale(${s})">${needle}${hub}${collar}
    <rect x="-12.5" y="${bTop}" width="25" height="${bBot - bTop}" rx="6" fill="var(--glass)" stroke="var(--line)" stroke-width="1.4"/>
    <rect x="-11" y="${bTop + 3}" width="4.5" height="${bBot - bTop - 6}" rx="2.2" fill="var(--metalHi)" opacity=".10"/>
    <rect x="8" y="${bTop + 3}" width="3.4" height="${bBot - bTop - 6}" rx="2" fill="#000" opacity=".14"/>${grads()}
    <rect x="-10.5" y="${sealY}" width="21" height="${lh}" rx="2.5" fill="var(--liquid)" opacity=".62"/>
    <rect x="-10.5" y="${sealY}" width="4.5" height="${lh}" rx="2.5" fill="var(--liquidHi)" opacity=".5"/>
    <rect x="-10.5" y="${sealY}" width="21" height="3.5" rx="2" fill="var(--liquidHi)" opacity=".65"/>
    <rect x="-10.8" y="${sealY - 7}" width="21.6" height="8" rx="3" fill="var(--plunger)"/>
    <rect x="-10.8" y="${sealY - 7}" width="21.6" height="2.2" rx="2.4" fill="var(--metalHi)" opacity=".14"/>
    <rect x="-10.8" y="${sealY - 3.6}" width="21.6" height="1.5" fill="var(--plungerD)"/>
    <rect x="-2" y="${thumbY}" width="4" height="${(sealY - 7) - thumbY}" fill="var(--plunger)"/>
    <rect x="-0.6" y="${thumbY}" width="1.3" height="${(sealY - 7) - thumbY}" fill="var(--metalHi)" opacity=".22"/>
    <ellipse cx="0" cy="${thumbY}" rx="16" ry="5" fill="var(--plunger)"/>
    <ellipse cx="0" cy="${thumbY - 1.4}" rx="16" ry="3.6" fill="var(--metalHi)" opacity=".16"/>
    <path d="M-12.5 ${bTop + 2} L-22 ${bTop + 5} L-22 ${bTop + 10} L-12.5 ${bTop + 7} Z" fill="var(--plunger)"/>
    <path d="M12.5 ${bTop + 2} L22 ${bTop + 5} L22 ${bTop + 10} L12.5 ${bTop + 7} Z" fill="var(--plunger)"/></g>`;
}
let vu = 0;
// Upright vial, origin at center.
function vial(liquid = 0.55, tx = 0, ty = 0, s = 1): string {
  const id = 'v' + (vu++); const lh = liquid * 60;
  return `<g transform="translate(${tx} ${ty}) scale(${s})">
    <path d="M-17 -26 Q-17 -33 -12 -35 L12 -35 Q17 -33 17 -26 L17 40 Q17 46 11 46 L-11 46 Q-17 46 -17 40 Z" fill="var(--glass)" stroke="var(--line)" stroke-width="1.4"/>
    <clipPath id="${id}"><path d="M-17 -26 Q-17 -33 -12 -35 L12 -35 Q17 -33 17 -26 L17 40 Q17 46 11 46 L-11 46 Q-17 46 -17 40 Z"/></clipPath>
    <g clip-path="url(#${id})"><rect x="-17" y="${46 - lh}" width="34" height="${lh}" fill="var(--liquid)" opacity=".58"/><rect x="-17" y="${46 - lh}" width="34" height="3.5" fill="var(--liquidHi)" opacity=".6"/><ellipse cx="0" cy="${46 - lh}" rx="17" ry="2.6" fill="var(--liquidHi)" opacity=".55"/><rect x="-15" y="-33" width="4.5" height="76" rx="2" fill="var(--metalHi)" opacity=".09"/><rect x="12" y="-33" width="3.5" height="76" rx="2" fill="#000" opacity=".12"/></g>
    <rect x="-17" y="4" width="34" height="24" rx="2.5" fill="var(--panel)"/><rect x="-17" y="4" width="34" height="24" rx="2.5" fill="none" stroke="var(--line)" stroke-width=".8"/>
    <rect x="-12" y="9" width="24" height="2.6" rx="1.3" fill="var(--accent)"/><rect x="-12" y="14.5" width="17" height="2" rx="1" fill="var(--muted)" opacity=".55"/><rect x="-12" y="19" width="21" height="2" rx="1" fill="var(--muted)" opacity=".55"/>
    <rect x="-10.5" y="-42" width="21" height="9" fill="var(--glass)" stroke="var(--line)" stroke-width="1"/>
    <rect x="-11" y="-49" width="22" height="8" rx="1.5" fill="var(--stopper)"/><rect x="-11" y="-49" width="22" height="2.4" rx="1.5" fill="var(--metalHi)" opacity=".18"/><rect x="-4" y="-49" width="8" height="3" rx="1.2" fill="var(--plungerD)" opacity=".5"/>
    <rect x="-13.5" y="-58" width="27" height="10" rx="2.5" fill="var(--metal)"/><rect x="-13.5" y="-58" width="27" height="2.6" rx="2.5" fill="var(--metalHi)" opacity=".5"/><rect x="-13.5" y="-52.5" width="27" height="1.4" fill="var(--metalD)" opacity=".55"/>
    <ellipse cx="0" cy="-58" rx="6" ry="2.6" fill="var(--accent)"/><ellipse cx="0" cy="-58.6" rx="6" ry="1.6" fill="var(--metalHi)" opacity=".35"/></g>`;
}
// Inverted vial (cap + stopper at the bottom), liquid pooled at the stopper.
function vialInv(liquid = 0.55, tx = 120, s = 1): string {
  const id = 'vi' + (vu++); const lh = liquid * 46;
  return `<g transform="translate(${tx} 0) scale(${s})">
    <path d="M-17 12 Q-17 6 -11 6 L11 6 Q17 6 17 12 L17 66 Q17 72 12 74 L-12 74 Q-17 72 -17 66 Z" fill="var(--glass)" stroke="var(--line)" stroke-width="1.4"/>
    <clipPath id="${id}"><path d="M-17 12 Q-17 6 -11 6 L11 6 Q17 6 17 12 L17 66 Q17 72 12 74 L-12 74 Q-17 72 -17 66 Z"/></clipPath>
    <g clip-path="url(#${id})"><rect x="-17" y="${74 - lh}" width="34" height="${lh}" fill="var(--liquid)" opacity=".58"/><rect x="-17" y="${74 - lh}" width="34" height="3.5" fill="var(--liquidHi)" opacity=".55"/><ellipse cx="0" cy="${74 - lh}" rx="17" ry="2.6" fill="var(--liquidHi)" opacity=".5"/><rect x="-15" y="8" width="4.5" height="64" rx="2" fill="var(--metalHi)" opacity=".09"/></g>
    <rect x="-17" y="18" width="34" height="18" rx="2.5" fill="var(--panel)"/><rect x="-12" y="23" width="24" height="2.4" rx="1.2" fill="var(--accent)"/><rect x="-12" y="28" width="16" height="2" rx="1" fill="var(--muted)" opacity=".55"/>
    <rect x="-10.5" y="74" width="21" height="9" fill="var(--glass)" stroke="var(--line)" stroke-width="1"/>
    <rect x="-11" y="83" width="22" height="8" rx="1.5" fill="var(--stopper)"/>
    <rect x="-13.5" y="89" width="27" height="9" rx="2.5" fill="var(--metal)"/><rect x="-13.5" y="95.5" width="27" height="1.4" fill="var(--metalD)" opacity=".55"/>
    <ellipse cx="0" cy="98" rx="6" ry="2.6" fill="var(--accent)"/></g>`;
}
function skinBlock(): string {
  return `<path d="M18 82 Q78 62 120 76 Q162 90 222 80 L222 134 L18 134 Z" fill="var(--muscle)"/>
    <path d="M18 80 Q78 60 120 74 Q162 88 222 78 L222 84 Q162 94 120 80 Q78 66 18 86 Z" fill="var(--muscleHi)" opacity=".5"/>
    <path d="M18 66 Q78 44 120 60 Q162 76 222 66 L222 92 Q162 100 120 88 Q78 74 18 92 Z" fill="var(--fat)"/>
    <path d="M18 64 Q78 42 120 58 Q162 74 222 64 L222 70 Q162 80 120 64 Q78 48 18 70 Z" fill="var(--fatHi)" opacity=".7"/>
    <path d="M18 60 Q78 38 120 54 Q162 70 222 60 L222 66 Q162 76 120 60 Q78 44 18 66 Z" fill="var(--skin2)"/>
    <path d="M18 58 Q78 36 120 52 Q162 68 222 58 L222 61 Q162 71 120 55 Q78 39 18 63 Z" fill="var(--skin)"/>`;
}

// ── scenes ──────────────────────────────────────────────────────────────────
export interface SceneOpts { ml?: number; units?: number | null; }

export function sceneSvg(kind: string, o: SceneOpts = {}): string {
  vu = 0; void o;
  switch (kind) {
    // mixing
    case 'draw':
      return syringe(0.66, true, 120, 152, 0.78);
    case 'pour':
      return `${vial(0.16, 120, 108, 1)}${syringe(0.22, true, 120, 58, 0.56)}`;
    case 'swirl':
      return `<g class="lrg-a" style="transform-origin:120px 92px;animation:lrg-swirl 2.4s linear infinite">${vial(0.5, 120, 92, 1)}</g>`;
    case 'store':
      return `<rect x="86" y="20" width="68" height="118" rx="12" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><line x1="120" y1="24" x2="120" y2="134" stroke="var(--line)" stroke-width="2"/><rect x="112" y="46" width="5" height="18" rx="2.5" fill="var(--metalD)"/>${vial(0.5, 132, 86, 0.6)}`;

    // injection
    case 'attach': {
      // Syringe (no needle) with the collar exposed; a fresh needle rises up to
      // lock onto it, with a small spark to signal "click".
      const nd = `<g><path d="M-4.5 0 L4.5 0 L7 -12 L-7 -12 Z" fill="var(--metalD)"/><rect x="-1.2" y="0" width="2.4" height="30" rx="1.2" fill="var(--metalD)"/><rect x="-1.2" y="0" width="1.1" height="30" fill="var(--metalHi)" opacity=".7"/><path d="M-1.2 30 L1.2 30 L0 33 Z" fill="var(--metalHi)"/></g>`;
      return `${syringe(0.3, false, 120, 148, 0.78)}<g class="lrg-a" transform="translate(120 108)" style="animation:lrg-attach 1.9s ease-in-out infinite">${nd}</g><path d="M136 104 l5 -5 M139 99 l-5 5" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" class="lrg-a" style="animation:lrg-blink 1.9s ease-in-out infinite"/>`;
    }
    case 'air':
      return syringe(0.3, true, 120, 152, 0.78);
    case 'pushair':
      return `${vial(0.6, 120, 112, 0.98)}${syringe(0.06, true, 120, 60, 0.62)}`;
    case 'invert':
      return `${vialInv(0.6, 120, 0.92)}<g transform="rotate(180 120 58)">${syringe(0.55, true, 120, 58, 0.64)}</g>`;
    case 'bubbles':
      return `<g transform="rotate(180 120 88)">${syringe(0.55, true, 120, 150, 0.78)}</g><g class="lrg-a" style="animation:lrg-rise 1.3s infinite"><circle cx="120" cy="66" r="3" fill="var(--liquidHi)" opacity=".8"/></g>`;
    case 'swap': {
      // Syringe (dose drawn, no needle) in the centre; the used draw-needle
      // detaching to the left, a fresh needle locking on from the right.
      const needle = (tx: number, ty: number, rot: number, used: boolean) => `<g transform="translate(${tx} ${ty}) rotate(${rot})" opacity="${used ? 0.55 : 1}"><path d="M-4.5 0 L4.5 0 L7 -12 L-7 -12 Z" fill="var(--metalD)"/><rect x="-1.2" y="0" width="2.4" height="30" rx="1.2" fill="var(--metalD)"/><rect x="-1.2" y="0" width="1.1" height="30" fill="var(--metalHi)" opacity=".7"/><path d="M-1.2 30 L1.2 30 L0 33 Z" fill="var(--metalHi)"/></g>`;
      return `${syringe(0.55, false, 120, 120, 0.74)}
        <g class="lrg-a" style="transform-origin:70px 118px;animation:lrg-rise 2s ease-in-out infinite">${needle(70, 108, -28, true)}</g>
        <path d="M84 118 q-10 4 -18 -2" fill="none" stroke="var(--muted)" stroke-width="1.4" marker-end=""/><path d="M66 116 l-3 0 l1.5 3 Z" fill="var(--muted)"/>
        <g class="lrg-a" style="transform-origin:170px 118px;animation:lrg-attach 1.9s ease-in-out infinite">${needle(170, 106, 26, false)}<path d="M162 96 l4 -4 M164 92 l-4 4" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"/></g>`;
    }
    case 'sites':
      return `<path d="M104 20 q26 -9 52 0 l9 46 q5 46 -9 78 l-52 0 q-14 -32 -9 -78 z" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><ellipse cx="130" cy="78" rx="3.5" ry="4" fill="none" stroke="var(--muted)" stroke-width="1.4"/>${[[112, 94], [148, 94], [120, 116], [140, 116], [130, 134]].map(([x, y], n) => `<circle cx="${x}" cy="${y}" r="6.5" fill="var(--accent)" opacity=".18"/><circle cx="${x}" cy="${y}" r="6.5" fill="none" stroke="var(--accent)" stroke-width="2" class="lrg-a" style="animation:lrg-blink 1.6s ${n * 0.2}s infinite"/>`).join('')}`;
    case 'inject':
      return `${skinBlock()}<g transform="rotate(-40 120 60)">${syringe(0.45, true, 120, 60, 0.62)}</g>`;
    case 'dispose':
      return `<rect x="90" y="46" width="60" height="88" rx="8" fill="#c0392b"/><rect x="90" y="46" width="60" height="18" rx="8" fill="#8e2b20"/><rect x="90" y="60" width="60" height="4" fill="#7a2018"/><rect x="112" y="36" width="16" height="12" rx="3" fill="var(--panel)"/><text x="120" y="98" text-anchor="middle" fill="#fff" font-size="10" font-family="monospace" opacity=".9">SHARPS</text>`;
    default:
      return '';
  }
}
