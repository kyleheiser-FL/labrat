import React from 'react';
import { getProductBaseAndSize } from '../../lib/shopHelpers';

type LabratThemeMode = 'clinical' | 'clinical-light';

// ─────────────────────────────────────────────────────────────────────────────
// Per-product photography (optional): drop AI-generated or studio photos into
// src/assets/product-photos/ named by product slug, e.g.
//   "bpc-157-10mg.png" for "BPC-157 (10mg)"
// Any file present is used automatically; products without a photo fall back
// to the procedural vial render below.
// ─────────────────────────────────────────────────────────────────────────────
const photoModules = import.meta.glob('../../assets/product-photos/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const PRODUCT_PHOTOS: Record<string, string> = {};
for (const [path, url] of Object.entries(photoModules)) {
  const slug = path.split('/').pop()!.replace(/\.(png|jpe?g|webp)$/i, '');
  PRODUCT_PHOTOS[slug] = url;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type archetype photos (optional): one ultra-realistic studio shot per vial
// type, used for every product of that type that lacks its own per-product photo.
// Powder color follows the chemistry: copper peptides (GHK-Cu / KLOW) are blue,
// other peptides are white powder, solvents are a clear liquid. Drop files named:
//   _archetype-peptide-copper.png  → copper peptides (blue powder)
//   _archetype-peptide-white.png   → normal peptides (white powder)
//   _archetype-solvent.png         → reconstitution solvents (clear liquid)
// Per-product photos still win; if an archetype file is absent the procedural
// vial render is used.
// ─────────────────────────────────────────────────────────────────────────────
const ARCHETYPE_PHOTOS = {
  copper: PRODUCT_PHOTOS['_archetype-peptide-copper'],
  white: PRODUCT_PHOTOS['_archetype-peptide-white'],
  solvent: PRODUCT_PHOTOS['_archetype-solvent'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Compound photos: one branded shot per peptide compound, shared by all
// strengths/sources, vendored in src/assets/product-photos/. Two variants:
//   _compound-<slug>-cutout.png — transparent-background cutout (preferred,
//                                 used on every theme)
//   _compound-<slug>.png        — dark studio shot (fallback)
// Re-download with scripts/fetch-compound-photos.sh and
// scripts/fetch-compound-cutouts.sh.
// ─────────────────────────────────────────────────────────────────────────────

export function productPhotoSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Base-compound slug shared by all strengths/sources of one peptide:
// "Tirzepatide China (30mg)" → "tirzepatide", "SS-31 (Elamipretide) (10mg)" → "ss-31".
// Compound photos live at _compound-<slug>.png and cover every SKU of that
// compound that lacks its own per-product photo.
export function compoundPhotoSlug(name: string): string {
  const { baseName } = getProductBaseAndSize(name);
  const cleanBase = baseName
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+(china|us warehouse)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return productPhotoSlug(cleanBase);
}

// Category → accent hue used for the strength block + purity flash on the
// dark gunmetal LABRAT label (mirrors the catalog badge color system)
const CATEGORY_HUES: Record<string, { band: string; bandText: string }> = {
  'Muscle Growth':           { band: '#e11d48', bandText: '#fecdd3' },
  'Weight Loss':             { band: '#d97706', bandText: '#fde68a' },
  'Healing & Repair':        { band: '#059669', bandText: '#a7f3d0' },
  'Beauty & Radiance':       { band: '#0d9488', bandText: '#99f6e4' },
  'Cognitive & Focus':       { band: '#0284c7', bandText: '#bae6fd' },
  'Longevity & Cellular':    { band: '#4f46e5', bandText: '#c7d2fe' },
  'Immune & Health':         { band: '#c026d3', bandText: '#f5d0fe' },
  'Sleep & Recovery':        { band: '#7c3aed', bandText: '#ddd6fe' },
  'Sexual Health':           { band: '#db2777', bandText: '#fbcfe8' },
  'Reconstitution Solvents': { band: '#2563eb', bandText: '#bfdbfe' },
};

interface VialFlags {
  isSolvent: boolean;
  isChina: boolean;
  isUsaWarehouse: boolean;
}

// ── Photoreal 3ml vial: lighting-filter glass, studio softbox reflection,
//    floor reflection, and the LABRAT label wrapped around the body ──────────
function RealisticVial({ name, category, flags, light }: {
  name: string; category: string; flags: VialFlags; light: boolean;
}) {
  const { isSolvent, isChina, isUsaWarehouse } = flags;
  const { baseName, size } = getProductBaseAndSize(name);
  const cleanBase = baseName
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+(china|us warehouse)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const strength = (size || '').toUpperCase().replace('MG', ' MG').replace('ML', ' ML').trim();

  const words = cleanBase.split(' ');
  let line1 = cleanBase, line2 = '';
  if (cleanBase.length > 13 && words.length > 1) {
    let split = Math.ceil(words.length / 2);
    line1 = words.slice(0, split).join(' ');
    line2 = words.slice(split).join(' ');
    if (line1.length - line2.length > 4 && split > 1) {
      split -= 1;
      line1 = words.slice(0, split).join(' ');
      line2 = words.slice(split).join(' ');
    }
  }
  const longest = Math.max(line1.length, line2.length);
  const nameSize = longest > 15 ? 11 : longest > 12 ? 12.5 : 14;
  const LABEL_TEXT_MAX = 76;
  const fit = (text: string) => {
    const est = text.length * nameSize * 0.62;
    return est > LABEL_TEXT_MAX ? { textLength: LABEL_TEXT_MAX, lengthAdjust: 'spacingAndGlyphs' as const } : {};
  };

  const hue = CATEGORY_HUES[category] || { band: '#2563eb', bandText: '#bfdbfe' };
  const capColor = isSolvent ? '#0ea5e9' : isChina ? '#dc2626' : isUsaWarehouse ? '#d97706' : '#2563eb';
  const capDark  = isSolvent ? '#075985' : isChina ? '#7f1d1d' : isUsaWarehouse ? '#78350f' : '#172554';
  const capLite  = isSolvent ? '#7dd3fc' : isChina ? '#f87171' : isUsaWarehouse ? '#fbbf24' : '#60a5fa';
  const uid = (name + category).replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase() || 'vial';

  // Contents color — research: copper peptides (GHK-Cu / KLOW) are blue, the rest white/clear.
  const isCopper = /\bghk\b|\bahk\b|klow|glow|copper/i.test(name);
  const powderTop  = isCopper ? '#93c5fd' : '#fdfdfd';
  const powderBot  = isCopper ? '#1e40af' : '#9aa6b8';
  const powderSurf = isCopper ? '#dbeafe' : '#ffffff';
  const liqFill    = isCopper ? '#3b82f6' : '#cfeefe';
  const liqSurf    = isCopper ? '#bfdbfe' : '#e0f5ff';

  const LT = 82, LB = 206;
  const nb = line2 ? 112 : 117;
  const BODY = 'M80 44 L80 48 Q70 51 67.5 56 Q66 59 66 67 L66 214 Q66 228 80 228 L140 228 Q154 228 154 214 L154 67 Q154 59 152.5 56 Q150 51 140 48 L140 44 Z';

  // The whole vial, drawn once and reused (flipped + faded) for the floor reflection.
  // `lite` skips the expensive lighting filters for the reflected copy.
  const renderVial = (lite: boolean) => (
    <>
      {/* Aluminum crimp collar */}
      <rect x="73" y="30" width="74" height="15" rx="2.5" fill={`url(#crimp-${uid})`} />
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={`r${i}`} x={77 + i * 8.4} y="31" width="0.9" height="13" fill="#1e293b" opacity="0.15" />
      ))}
      <rect x="73" y="30.3" width="74" height="1" fill="#ffffff" opacity="0.5" />
      <rect x="73" y="42.4" width="74" height="2.4" rx="1" fill="#334155" opacity="0.6" />

      {/* Plastic flip-off cap */}
      {lite ? (
        <>
          <rect x="77" y="13" width="66" height="19" rx="6" fill={capColor} />
          <ellipse cx="110" cy="13.5" rx="33" ry="6" fill={capColor} />
        </>
      ) : (
        <g filter={`url(#caplight-${uid})`}>
          <rect x="77" y="13" width="66" height="19" rx="6" fill={capColor} />
          <ellipse cx="110" cy="13.5" rx="33" ry="6" fill={capColor} />
        </g>
      )}
      <ellipse cx="110" cy="13.5" rx="15" ry="3.2" fill={capDark} opacity="0.55" />
      <ellipse cx="103" cy="11.4" rx="10" ry="2.3" fill="#ffffff" opacity="0.5" />

      {/* Glass body + contents + label, all clipped to the body silhouette */}
      <g clipPath={`url(#body-${uid})`}>
        <rect x="66" y="44" width="88" height="186" fill={`url(#glassbase-${uid})`} />

        {isSolvent ? (
          <>
            <rect x="66" y="56" width="88" height="172" fill={`url(#liq-${uid})`} />
            <ellipse cx="110" cy="56" rx="44" ry="4.5" fill={liqSurf} />
            <ellipse cx="110" cy="56" rx="44" ry="2" fill="#ffffff" opacity="0.5" />
          </>
        ) : (
          <>
            <rect x="66" y="196" width="88" height="32" fill={`url(#pw-${uid})`} />
            <ellipse cx="110" cy="197" rx="44" ry="5.5" fill={powderSurf} />
            {!lite && <ellipse cx="110" cy="198" rx="44" ry="4" fill="#000" opacity="0.1" filter={`url(#grain-${uid})`} />}
            {!lite && <rect x="66" y="196" width="88" height="32" fill={isCopper ? '#1e3a8a' : '#64748b'} opacity="0.16" filter={`url(#grain-${uid})`} />}
          </>
        )}

        {/* ── LABRAT label ── */}
        <rect x="66" y={LT} width="88" height={LB - LT} fill={`url(#stock-${uid})`} />
        <rect x="66" y={LT} width="88" height={LB - LT} fill={`url(#holo-${uid})`} opacity="0.13" />
        <rect x="66" y={LT} width="88" height="1.8" fill={`url(#holo-${uid})`} opacity="0.9" />
        <text x="110" y="93" textAnchor="middle" fontSize="11" fontWeight="900" letterSpacing="2.2"
          fill={`url(#holo-${uid})`} fontFamily="'Space Grotesk', system-ui, sans-serif">LABRAT</text>
        <text x="110" y="99" textAnchor="middle" fontSize="3.5" fontWeight="700" letterSpacing="3"
          fill="#94a3b8" fontFamily="system-ui, sans-serif">P E P T I D E S</text>
        <rect x="82" y="102" width="56" height="0.7" fill={`url(#holo-${uid})`} opacity="0.7" />
        {line2 ? (
          <>
            <text x="110" y={nb} textAnchor="middle" fontSize={nameSize} fontWeight="800"
              fill="#f8fafc" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line1)}>{line1}</text>
            <text x="110" y={nb + nameSize + 2} textAnchor="middle" fontSize={nameSize} fontWeight="800"
              fill="#f8fafc" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line2)}>{line2}</text>
          </>
        ) : (
          <text x="110" y={nb} textAnchor="middle" fontSize={nameSize} fontWeight="800"
            fill="#f8fafc" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line1)}>{line1}</text>
        )}
        {strength && (
          <>
            <rect x={110 - (strength.length * 4.2 + 14) / 2} y="130" width={strength.length * 4.2 + 14} height="15" rx="4" fill={hue.band} />
            <text x="110" y="140.5" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#ffffff" fontFamily="system-ui, sans-serif">{strength}</text>
          </>
        )}
        <text x="110" y={strength ? 156 : 150} textAnchor="middle" fontSize="6" fontWeight="900"
          fill={hue.bandText} fontFamily="system-ui, sans-serif">&gt;99% PURITY</text>
        <g transform="translate(0,168)" fill="none" stroke="#cbd5e1" strokeWidth="1.1">
          <g transform="translate(87,0)">
            <circle cx="0" cy="0" r="6" />
            <line x1="-4.2" y1="-4.2" x2="4.2" y2="4.2" />
            <circle cx="0" cy="-2" r="1.3" fill="#cbd5e1" stroke="none" />
            <path d="M-2.2 2.8 Q0 -0.5 2.2 2.8" />
          </g>
          <g transform="translate(110,0)">
            <path d="M-2.2 -5.6 L-2.2 -1.6 L-5.6 4.4 Q-6.2 6 -4 6 L4 6 Q6.2 6 5.6 4.4 L2.2 -1.6 L2.2 -5.6" />
            <line x1="-3.4" y1="-5.6" x2="3.4" y2="-5.6" />
            <line x1="-3.9" y1="2.2" x2="3.9" y2="2.2" />
          </g>
          <g transform="translate(133,0)">
            <path d="M0 -5.6 a1.7 1.7 0 0 1 1.7 1.7 L1.7 2.2 a2.5 2.5 0 1 1 -3.4 0 L-1.7 -3.9 a1.7 1.7 0 0 1 1.7 -1.7 Z" />
            <circle cx="0" cy="3.9" r="1.4" fill="#cbd5e1" stroke="none" />
          </g>
        </g>
        <g fontFamily="system-ui, sans-serif" fontSize="2.85" fontWeight="700" fill="#94a3b8" textAnchor="middle">
          <text x="87" y="181">NOT FOR</text><text x="87" y="184.5">HUMAN USE</text>
          <text x="110" y="181">RESEARCH</text><text x="110" y="184.5">USE ONLY</text>
          <text x="133" y="181">STORE</text><text x="133" y="184.5">2–8°C</text>
        </g>
        <rect x="66" y="190" width="88" height="13" fill="#b91c1c" />
        <rect x="66" y="190" width="88" height="1" fill="#ef4444" opacity="0.6" />
        <text x="110" y="198.5" textAnchor="middle" fontSize="5.3" fontWeight="900" letterSpacing="1"
          fill="#ffffff" fontFamily="system-ui, sans-serif">FOR RESEARCH USE ONLY</text>

        {/* Cylinder edge darkening + glossy specular sheen */}
        <rect x="66" y="44" width="88" height="186" fill={`url(#edge-${uid})`} />
        {!lite && <rect x="66" y="44" width="88" height="186" fill={`url(#abump-${uid})`} filter={`url(#spec-${uid})`} opacity="0.95" />}
        <rect x="142" y="62" width="3" height="92" rx="1.5" fill="#ffffff" opacity="0.22" />
      </g>

      <path d={BODY} fill="none" stroke="#0b1220" strokeWidth="1.2" opacity="0.55" />
    </>
  );

  return (
    <svg viewBox="0 0 220 248" className="w-[150px]" aria-hidden="true">
      <defs>
        <linearGradient id={`glassbase-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={light ? '#cdd6e2' : '#3c4858'} />
          <stop offset="50%" stopColor={light ? '#f3f6fa' : '#aab6c6'} />
          <stop offset="100%" stopColor={light ? '#c2ccd9' : '#2b3543'} />
        </linearGradient>
        <linearGradient id={`crimp-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748b" /><stop offset="13%" stopColor="#f1f5f9" />
          <stop offset="30%" stopColor="#94a3b8" /><stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#8794a6" /><stop offset="87%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#3f4856" />
        </linearGradient>
        <linearGradient id={`stock-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" /><stop offset="48%" stopColor="#0f172a" /><stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={`holo-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" /><stop offset="22%" stopColor="#a78bfa" /><stop offset="44%" stopColor="#f472b6" />
          <stop offset="64%" stopColor="#fbbf24" /><stop offset="84%" stopColor="#34d399" /><stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`pw-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={powderTop} /><stop offset="100%" stopColor={powderBot} />
        </linearGradient>
        <linearGradient id={`liq-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liqFill} stopOpacity={isCopper ? 0.75 : 0.6} />
          <stop offset="100%" stopColor={isCopper ? '#1d4ed8' : '#7dd3fc'} stopOpacity={isCopper ? 0.65 : 0.45} />
        </linearGradient>
        <linearGradient id={`edge-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" /><stop offset="9%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="22%" stopColor="#000" stopOpacity="0" /><stop offset="78%" stopColor="#000" stopOpacity="0" />
          <stop offset="91%" stopColor="#000" stopOpacity="0.16" /><stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`abump-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="28%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="46%" stopColor="#fff" stopOpacity="1" /><stop offset="56%" stopColor="#fff" stopOpacity="1" />
          <stop offset="74%" stopColor="#fff" stopOpacity="0.35" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`body-${uid}`}><path d={BODY} /></clipPath>
        <filter id={`spec-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b" />
          <feSpecularLighting in="b" surfaceScale="9" specularConstant="1.05" specularExponent="18" lightingColor="#ffffff" result="s">
            <feDistantLight azimuth="240" elevation="55" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id={`caplight-${uid}`} x="-20%" y="-40%" width="140%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
          <feSpecularLighting in="b" surfaceScale="4" specularConstant="0.8" specularExponent="14" lightingColor="#ffffff" result="s">
            <fePointLight x="92" y="2" z="40" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="sc" /></feMerge>
        </filter>
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0" />
          <feComposite operator="in" in2="SourceAlpha" />
        </filter>
        <filter id={`softsh-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
      </defs>

      {/* Soft drop shadow beneath the vial */}
      <ellipse cx="111" cy="234" rx="44" ry="6.5" fill="#000" opacity={light ? 0.16 : 0.42} filter={`url(#softsh-${uid})`} />

      {/* The vial */}
      {renderVial(false)}

      {/* Studio softbox window reflection on the glass front */}
      <g clipPath={`url(#body-${uid})`}>
        <rect x="120" y="54" width="20" height="58" rx="4" fill="#ffffff" opacity="0.16" />
        <rect x="123" y="57" width="6" height="52" rx="3" fill="#ffffff" opacity="0.22" />
      </g>
    </svg>
  );
}

function SourceBadge({ flags, light }: { flags: VialFlags; light: boolean }) {
  const { isSolvent, isChina, isUsaWarehouse } = flags;
  if (isSolvent) return null;
  const chip = (txt: string, cls: string) => (
    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${cls}`}>{txt}</span>
  );
  return (
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
      {isUsaWarehouse && chip('⚡ Quick Ship', light ? 'text-amber-800 bg-amber-50 border-amber-300' : 'text-amber-300 bg-amber-950/60 border-amber-500/30')}
    </div>
  );
}

export default function ProductVialVisual({ name, category, theme = 'clinical' }: { name: string; category: string; theme?: LabratThemeMode }) {
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  const isSolvent = lowerCat.includes('reconstitution') || lowerCat.includes('solvent') || lowerName.includes('water') || lowerName.includes('bacteriostatic');
  const isChina = !isSolvent && (lowerName.includes(' china') || lowerCat.includes('china'));
  const isUsaWarehouse = !isSolvent && (lowerName.includes('us warehouse') || lowerName.includes('warehouse') || lowerCat === 'usa fast ship');
  const flags: VialFlags = { isSolvent, isChina, isUsaWarehouse };
  const light = theme === 'clinical-light';

  // Contents color follows the chemistry: copper peptides (GHK-Cu / KLOW) carry
  // a vivid blue lyophilized powder; every other peptide is white powder.
  const isCopper = /\bghk\b|\bahk\b|klow|glow|copper/i.test(name);

  // Photo resolution: exact per-product photo → compound cutout (transparent
  // background, used on every theme so the vial sits directly on the card) →
  // compound studio shot → type archetype (copper → blue, normal → white,
  // solvent → clear) → procedural render.
  const cSlug = compoundPhotoSlug(name);
  // Only use a *compound-specific* photo. When one doesn't exist we render the
  // procedural vial (which draws the compound's own name + correct powder color)
  // rather than a generic archetype photo that looks identical across products.
  const photo = PRODUCT_PHOTOS[productPhotoSlug(name)]
    || PRODUCT_PHOTOS[`_compound-${cSlug}-cutout`]
    || PRODUCT_PHOTOS[`_compound-${cSlug}`]
    || null;

  const glowClass = isSolvent ? 'labrat-real-vial-visual--solvent'
    : isChina ? 'labrat-real-vial-visual--china'
    : isUsaWarehouse ? 'labrat-real-vial-visual--usa'
    : 'labrat-real-vial-visual--peptide';
  const borderColor = isChina ? 'border-red-500/15' : isUsaWarehouse ? 'border-amber-500/15' : 'border-cyan-400/10';

  if (light) {
    return (
      <div className="w-full min-h-[300px] relative overflow-hidden select-none flex items-center justify-center border-b border-slate-200"
        style={{ background: 'linear-gradient(175deg, #f8fafc 0%, #eef2f7 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }} />
        <SourceBadge flags={flags} light />
        {photo
          ? <img src={photo} alt={`${name} research vial`} loading="lazy" className="max-h-[280px] object-contain py-3" />
          : <div className="pt-6"><RealisticVial name={name} category={category} flags={flags} light /></div>}
      </div>
    );
  }

  return (
    <div className={`labrat-real-vial-visual ${glowClass} w-full min-h-[300px] border-b ${borderColor} p-4 relative overflow-hidden select-none flex items-center justify-center`}>
      <div className="labrat-real-vial-grid" aria-hidden="true" />
      <div className="labrat-real-vial-orb" aria-hidden="true" />
      <SourceBadge flags={flags} light={false} />
      {photo
        ? <img src={photo} alt={`${name} research vial`} loading="lazy" className="max-h-[280px] object-contain py-3 relative z-[1]" />
        : <div className="pt-4 relative z-[1]"><RealisticVial name={name} category={category} flags={flags} light={false} /></div>}
    </div>
  );
}
