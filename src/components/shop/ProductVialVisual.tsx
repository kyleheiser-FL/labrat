import React from 'react';
import { getProductBaseAndSize } from '../../lib/shopHelpers';

type LabratThemeMode = 'neon' | 'clinical' | 'clinical-light';

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

export function productPhotoSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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

// ── Photorealistic 3ml vial with the product printed on its label ──────────
function RealisticVial({ name, category, flags, light }: {
  name: string; category: string; flags: VialFlags; light: boolean;
}) {
  const { isSolvent, isChina, isUsaWarehouse } = flags;
  const { baseName, size } = getProductBaseAndSize(name);
  const cleanBase = baseName
    .replace(/\(.*?\)/g, ' ')                      // drop parentheticals: "(Without DAC)"
    .replace(/\s+(china|us warehouse)\s*$/i, '')   // source suffix lives on the badge, not the label
    .replace(/\s{2,}/g, ' ')
    .trim();
  const strength = (size || '').toUpperCase().replace('MG', ' MG').replace('ML', ' ML').trim();

  // Fit the name onto the label: split long names over two lines, then squeeze
  // any still-long line into the label width via SVG textLength
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
  const LABEL_TEXT_MAX = 78;
  const fit = (text: string) => {
    const est = text.length * nameSize * 0.62;
    return est > LABEL_TEXT_MAX ? { textLength: LABEL_TEXT_MAX, lengthAdjust: 'spacingAndGlyphs' as const } : {};
  };

  const hue = CATEGORY_HUES[category] || { band: '#2563eb', bandText: '#bfdbfe' };
  const capColor  = isSolvent ? '#0ea5e9' : isChina ? '#dc2626' : isUsaWarehouse ? '#d97706' : '#2563eb';
  const capDark   = isSolvent ? '#0369a1' : isChina ? '#991b1b' : isUsaWarehouse ? '#92400e' : '#1e40af';
  const capLite   = isSolvent ? '#7dd3fc' : isChina ? '#f87171' : isUsaWarehouse ? '#fbbf24' : '#60a5fa';
  const uid = (name + category).replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase() || 'vial';

  // Reconstituted/lyophilized contents color. Research: nearly every peptide is
  // a white powder / clear solution — copper peptides (GHK-Cu, AHK-Cu) and any
  // blend containing them (e.g. KLOW) are the exception, appearing cobalt blue
  // from the bound copper(II) ion.
  const isCopper = /\bghk\b|\bahk\b|klow|copper/i.test(name);
  const powderTop     = isCopper ? '#60a5fa' : '#ffffff';
  const powderBottom  = isCopper ? '#1d4ed8' : (light ? '#e2e8f0' : '#cbd5e1');
  const powderSurface = isCopper ? '#bfdbfe' : '#ffffff';
  const liquidFill    = isCopper ? '#3b82f6' : '#bae6fd';
  const liquidSurface = isCopper ? '#93c5fd' : '#bae6fd';

  // Label geometry — dark gunmetal stock wrapped around the squat 3ml body
  const LABEL_TOP = 80, LABEL_BOTTOM = 210;
  const nameBaseline = line2 ? 112 : 117;

  // True 3ml vial proportions: squat, wide body (~1.5:1 h/w) with rounded shoulders
  return (
    <svg viewBox="0 0 220 250" className="w-[150px] drop-shadow-xl" aria-hidden="true">
      <defs>
        {/* Borosilicate glass — bright vertical core with darker refracting edges */}
        <linearGradient id={`g-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor={light ? '#cbd5e1' : '#475569'} stopOpacity="0.7" />
          <stop offset="7%"  stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="22%" stopColor={light ? '#eef2f7' : '#94a3b8'} stopOpacity="0.25" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="78%" stopColor={light ? '#e2e8f0' : '#64748b'} stopOpacity="0.28" />
          <stop offset="93%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor={light ? '#cbd5e1' : '#334155'} stopOpacity="0.72" />
        </linearGradient>
        {/* Plastic flip-cap dome — radial so it reads as a glossy moulded button */}
        <radialGradient id={`cd-${uid}`} cx="42%" cy="28%" r="85%">
          <stop offset="0%"  stopColor={capLite} />
          <stop offset="55%" stopColor={capColor} />
          <stop offset="100%" stopColor={capDark} />
        </radialGradient>
        {/* Brushed aluminum crimp collar */}
        <linearGradient id={`a-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="14%" stopColor="#f1f5f9" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="86%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        {/* Dark gunmetal label stock */}
        <linearGradient id={`p-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#1e293b" />
          <stop offset="48%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        {/* Iridescent holographic foil for the wordmark + accents */}
        <linearGradient id={`holo-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#22d3ee" />
          <stop offset="22%"  stopColor="#a78bfa" />
          <stop offset="44%"  stopColor="#f472b6" />
          <stop offset="64%"  stopColor="#fbbf24" />
          <stop offset="84%"  stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`w-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={powderTop} />
          <stop offset="100%" stopColor={powderBottom} />
        </linearGradient>
        <linearGradient id={`l-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={liquidFill} stopOpacity={isCopper ? 0.6 : 0.5} />
          <stop offset="100%" stopColor={isCopper ? '#1d4ed8' : '#7dd3fc'} stopOpacity={isCopper ? 0.5 : 0.35} />
        </linearGradient>
        {/* Cylinder roundness — dark refracting edges, transparent core (wraps glass + label as one) */}
        <linearGradient id={`cyl-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#000000" stopOpacity="0.5" />
          <stop offset="7%"   stopColor="#000000" stopOpacity="0.14" />
          <stop offset="16%"  stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="34%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="66%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="85%"  stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </linearGradient>
        {/* Soft contact shadow + powder grain */}
        <filter id={`sh-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.6" />
        </filter>
        <filter id={`tex-${uid}`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0" result="a" />
          <feComposite operator="in" in2="SourceAlpha" />
        </filter>
        <clipPath id={`body-${uid}`}>
          <path d="M78 43 L78 47 Q68 50 66 55 Q65 58 65 66 L65 218 Q65 230 77 230 L143 230 Q155 230 155 218 L155 66 Q155 58 154 55 Q152 50 142 47 L142 43 Z" />
        </clipPath>
      </defs>

      {/* Soft, blurred contact shadow on the surface */}
      <ellipse cx="111" cy="241" rx="47" ry="7.5" fill="#000" opacity={light ? 0.16 : 0.5} filter={`url(#sh-${uid})`} />

      {/* ── Aluminum crimp collar ── */}
      <rect x="72" y="29" width="76" height="15" rx="2.5" fill={`url(#a-${uid})`} />
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <rect key={`r${i}`} x={75 + i * 8} y="30" width="0.9" height="13" fill="#1e293b" opacity="0.13" />
      ))}
      <rect x="72" y="29.4" width="76" height="1" fill="#ffffff" opacity="0.45" />
      <rect x="72" y="41.4" width="76" height="2.4" rx="1" fill="#334155" opacity="0.55" />

      {/* ── Blue plastic flip-off cap dome ── */}
      <rect x="76" y="13" width="68" height="19" rx="6" fill={`url(#cd-${uid})`} />
      <ellipse cx="110" cy="13.5" rx="34" ry="6" fill={`url(#cd-${uid})`} />
      <ellipse cx="110" cy="13.5" rx="16" ry="3.4" fill={capDark} opacity="0.5" />
      <ellipse cx="110" cy="13" rx="13" ry="2.4" fill={capLite} opacity="0.7" />
      <ellipse cx="101" cy="11.4" rx="11" ry="2.6" fill="#ffffff" opacity="0.4" />
      <rect x="79" y="16" width="4" height="13" rx="2" fill="#ffffff" opacity="0.22" />

      {/* ── Glass body silhouette ── */}
      <path
        d="M78 43 L78 47 Q68 50 66 55 Q65 58 65 66 L65 218 Q65 230 77 230 L143 230 Q155 230 155 218 L155 66 Q155 58 154 55 Q152 50 142 47 L142 43 Z"
        fill={`url(#g-${uid})`} stroke={light ? '#cbd5e1' : '#0f172a'} strokeWidth="1.1"
      />
      {/* Glass thickness at the base + headspace tint */}
      <path d="M65 214 L155 214 L155 218 Q155 230 143 230 L77 230 Q65 230 65 218 Z" fill="#000" opacity="0.10" />
      <ellipse cx="110" cy="49" rx="32" ry="5" fill={light ? '#f8fafc' : '#cbd5e1'} opacity="0.35" />

      {/* Contents — visible above (neck) and below the wrapped label.
          Powder color is data-driven: copper peptides (GHK-Cu / KLOW) read blue. */}
      <g clipPath={`url(#body-${uid})`}>
        {isSolvent ? (
          <>
            <rect x="65" y="54" width="90" height="176" fill={`url(#l-${uid})`} />
            <ellipse cx="110" cy="54" rx="45" ry="4.5" fill={liquidSurface} opacity="0.7" />
            <ellipse cx="110" cy="54" rx="45" ry="2.2" fill="#ffffff" opacity="0.4" />
          </>
        ) : (
          <>
            <rect x="65" y="200" width="90" height="30" fill={`url(#w-${uid})`} opacity="0.98" />
            <ellipse cx="110" cy="201" rx="45" ry="5" fill={powderSurface} opacity="0.95" />
            <ellipse cx="110" cy="201" rx="45" ry="5" fill="#000" opacity="0.12" filter={`url(#tex-${uid})`} />
            <rect x="65" y="200" width="90" height="30" fill={isCopper ? '#1e3a8a' : '#475569'} opacity="0.18" filter={`url(#tex-${uid})`} />
          </>
        )}
      </g>

      {/* ── Wrapped dark LABRAT label (the product IS the label) ── */}
      <g>
        <rect x="65" y={LABEL_TOP} width="90" height={LABEL_BOTTOM - LABEL_TOP} fill={`url(#p-${uid})`} />
        {/* Holographic sheen wash + top/bottom foil hairlines */}
        <rect x="65" y={LABEL_TOP} width="90" height={LABEL_BOTTOM - LABEL_TOP} fill={`url(#holo-${uid})`} opacity="0.12" />
        <rect x="65" y={LABEL_TOP} width="90" height="2" fill={`url(#holo-${uid})`} opacity="0.9" />

        {/* Brand header */}
        <text x="110" y="92" textAnchor="middle" fontSize="11" fontWeight="900" letterSpacing="2.2"
          fill={`url(#holo-${uid})`} fontFamily="'Space Grotesk', system-ui, sans-serif">LABRAT</text>
        <text x="110" y="98.5" textAnchor="middle" fontSize="3.6" fontWeight="700" letterSpacing="3"
          fill="#94a3b8" fontFamily="system-ui, sans-serif">P E P T I D E S</text>
        <rect x="80" y="101.5" width="60" height="0.8" fill={`url(#holo-${uid})`} opacity="0.7" />

        {/* Product name printed on the label */}
        {line2 ? (
          <>
            <text x="110" y={nameBaseline} textAnchor="middle" fontSize={nameSize} fontWeight="800"
              fill="#f8fafc" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line1)}>{line1}</text>
            <text x="110" y={nameBaseline + nameSize + 2} textAnchor="middle" fontSize={nameSize} fontWeight="800"
              fill="#f8fafc" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line2)}>{line2}</text>
          </>
        ) : (
          <text x="110" y={nameBaseline} textAnchor="middle" fontSize={nameSize} fontWeight="800"
            fill="#f8fafc" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line1)}>{line1}</text>
        )}

        {/* Strength block */}
        {strength && (
          <>
            <rect x={110 - (strength.length * 4.2 + 14) / 2} y="130" width={strength.length * 4.2 + 14} height="15" rx="4"
              fill={hue.band} />
            <text x="110" y="140.5" textAnchor="middle" fontSize="8.5" fontWeight="900" letterSpacing="0.5"
              fill="#ffffff" fontFamily="system-ui, sans-serif">{strength}</text>
          </>
        )}

        {/* Purity flash */}
        <text x="110" y={strength ? 156 : 150} textAnchor="middle" fontSize="6" fontWeight="900" letterSpacing="0.6"
          fill={hue.bandText} fontFamily="system-ui, sans-serif">
          &gt;99% PURITY
        </text>

        {/* Research pictograms (recreated from the physical LABRAT labels) */}
        <g transform="translate(0,168)" fill="none" stroke="#cbd5e1" strokeWidth="1.1">
          {/* not for human consumption */}
          <g transform="translate(86,0)">
            <circle cx="0" cy="0" r="6.5" />
            <line x1="-4.6" y1="-4.6" x2="4.6" y2="4.6" />
            <circle cx="0" cy="-2.1" r="1.4" fill="#cbd5e1" stroke="none" />
            <path d="M-2.4 3 Q0 -0.6 2.4 3" />
          </g>
          {/* research only (flask) */}
          <g transform="translate(110,0)">
            <path d="M-2.4 -6 L-2.4 -1.8 L-6 4.8 Q-6.6 6.6 -4.2 6.6 L4.2 6.6 Q6.6 6.6 6 4.8 L2.4 -1.8 L2.4 -6" />
            <line x1="-3.6" y1="-6" x2="3.6" y2="-6" />
            <line x1="-4.2" y1="2.4" x2="4.2" y2="2.4" />
          </g>
          {/* store cold 2-8°C (thermometer) */}
          <g transform="translate(134,0)">
            <path d="M0 -6 a1.8 1.8 0 0 1 1.8 1.8 L1.8 2.4 a2.7 2.7 0 1 1 -3.6 0 L-1.8 -4.2 a1.8 1.8 0 0 1 1.8 -1.8 Z" />
            <circle cx="0" cy="4.2" r="1.5" fill="#cbd5e1" stroke="none" />
          </g>
        </g>
        <g fontFamily="system-ui, sans-serif" fontSize="2.9" fontWeight="700" fill="#94a3b8" textAnchor="middle" letterSpacing="0.15">
          <text x="86"  y="182">NOT FOR</text>
          <text x="86"  y="185.6">HUMAN USE</text>
          <text x="110" y="182">RESEARCH</text>
          <text x="110" y="185.6">USE ONLY</text>
          <text x="134" y="182">STORE</text>
          <text x="134" y="185.6">2–8°C</text>
        </g>

        {/* Red use banner */}
        <rect x="65" y="192" width="90" height="13" fill="#b91c1c" />
        <rect x="65" y="192" width="90" height="1" fill="#ef4444" opacity="0.6" />
        <text x="110" y="200.5" textAnchor="middle" fontSize="5.4" fontWeight="900" letterSpacing="1.1"
          fill="#ffffff" fontFamily="system-ui, sans-serif">FOR RESEARCH USE ONLY</text>

        {/* Label edges curl into the glass */}
        <rect x="65" y={LABEL_TOP - 0.6} width="90" height="0.7" fill="#ffffff" opacity="0.16" />
        <rect x="65" y={LABEL_BOTTOM - 1.2} width="90" height="1.6" fill="#000" opacity="0.32" />
      </g>

      {/* Cylinder roundness wraps glass + label as one curved surface */}
      <g clipPath={`url(#body-${uid})`}>
        <rect x="65" y="43" width="90" height="190" fill={`url(#cyl-${uid})`} />
        {/* crisp front specular streak + softer secondary reflections */}
        <rect x="72" y="58" width="4.5" height="166" rx="2.25" fill="#ffffff" opacity={light ? 0.5 : 0.42} />
        <rect x="80" y="60" width="1.8" height="150" rx="0.9" fill="#ffffff" opacity="0.18" />
        <rect x="144" y="66" width="3.4" height="96" rx="1.7" fill="#ffffff" opacity="0.2" />
      </g>
      {/* Inner reflection pooled at the rounded base */}
      <ellipse cx="110" cy="225" rx="37" ry="3.5" fill="#ffffff" opacity="0.12" />
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
      {isUsaWarehouse ? (
        <>
          <span className="text-sm leading-none">🇨🇳</span>
          <span className="text-sm leading-none">🇺🇸</span>
          {chip('USA Shipped', light ? 'text-amber-800 bg-amber-50 border-amber-300' : 'text-amber-300 bg-amber-950/60 border-amber-500/30')}
        </>
      ) : isChina ? (
        <>
          <span className="text-sm leading-none">🇨🇳</span>
          {chip('China Source', light ? 'text-red-800 bg-red-50 border-red-300' : 'text-red-300 bg-red-950/60 border-red-500/30')}
        </>
      ) : (
        <>
          <span className="text-sm leading-none">🇳🇴</span>
          {chip('Norway Source', light ? 'text-blue-800 bg-blue-50 border-blue-300' : 'text-blue-300 bg-blue-950/60 border-blue-500/30')}
        </>
      )}
    </div>
  );
}

export default function ProductVialVisual({ name, category, theme = 'neon' }: { name: string; category: string; theme?: LabratThemeMode }) {
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  const isSolvent = lowerCat.includes('reconstitution') || lowerCat.includes('solvent') || lowerName.includes('water') || lowerName.includes('bacteriostatic');
  const isChina = !isSolvent && (lowerName.includes(' china') || lowerCat.includes('china'));
  const isUsaWarehouse = !isSolvent && (lowerName.includes('us warehouse') || lowerName.includes('warehouse') || lowerCat === 'usa fast ship');
  const flags: VialFlags = { isSolvent, isChina, isUsaWarehouse };
  const light = theme === 'clinical-light';

  // Real per-product photo wins when one has been added to assets
  const photo = PRODUCT_PHOTOS[productPhotoSlug(name)];

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
