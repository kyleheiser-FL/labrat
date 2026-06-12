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

// Category → label band hue (matches the catalog badge color system)
const CATEGORY_HUES: Record<string, { band: string; bandText: string }> = {
  'Muscle Growth':           { band: '#9f1239', bandText: '#fecdd3' },
  'Weight Loss':             { band: '#92400e', bandText: '#fde68a' },
  'Healing & Repair':        { band: '#065f46', bandText: '#a7f3d0' },
  'Beauty & Radiance':       { band: '#115e59', bandText: '#99f6e4' },
  'Cognitive & Focus':       { band: '#075985', bandText: '#bae6fd' },
  'Longevity & Cellular':    { band: '#3730a3', bandText: '#c7d2fe' },
  'Immune & Health':         { band: '#86198f', bandText: '#f5d0fe' },
  'Sleep & Recovery':        { band: '#5b21b6', bandText: '#ddd6fe' },
  'Sexual Health':           { band: '#9d174d', bandText: '#fbcfe8' },
  'Reconstitution Solvents': { band: '#1e3a8a', bandText: '#bfdbfe' },
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
  const nameSize = longest > 14 ? 9.5 : longest > 11 ? 11 : 13;
  const LABEL_TEXT_MAX = 72;
  const fit = (text: string) => {
    const est = text.length * nameSize * 0.62;
    return est > LABEL_TEXT_MAX ? { textLength: LABEL_TEXT_MAX, lengthAdjust: 'spacingAndGlyphs' as const } : {};
  };

  const hue = CATEGORY_HUES[category] || { band: '#0e7490', bandText: '#a5f3fc' };
  const capColor  = isSolvent ? '#0ea5e9' : isChina ? '#dc2626' : isUsaWarehouse ? '#d97706' : '#2563eb';
  const capDark   = isSolvent ? '#0369a1' : isChina ? '#991b1b' : isUsaWarehouse ? '#92400e' : '#1e40af';
  const uid = (name + category).replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase() || 'vial';

  return (
    <svg viewBox="0 0 220 300" className="w-[150px] drop-shadow-xl" aria-hidden="true">
      <defs>
        {/* Borosilicate glass */}
        <linearGradient id={`g-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor={light ? '#e2e8f0' : '#64748b'} stopOpacity="0.55" />
          <stop offset="10%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="30%" stopColor={light ? '#f1f5f9' : '#94a3b8'} stopOpacity="0.25" />
          <stop offset="75%" stopColor={light ? '#e2e8f0' : '#64748b'} stopOpacity="0.30" />
          <stop offset="92%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor={light ? '#cbd5e1' : '#475569'} stopOpacity="0.6" />
        </linearGradient>
        {/* Flip-top plastic cap */}
        <linearGradient id={`c-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={capColor} />
          <stop offset="55%" stopColor={capColor} />
          <stop offset="100%" stopColor={capDark} />
        </linearGradient>
        {/* Aluminum crimp */}
        <linearGradient id={`a-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="25%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="75%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        {/* Label paper */}
        <linearGradient id={`p-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e8e6e0" />
          <stop offset="12%" stopColor="#fdfcf9" />
          <stop offset="55%" stopColor="#f6f4ee" />
          <stop offset="90%" stopColor="#fbfaf6" />
          <stop offset="100%" stopColor="#dcd9d0" />
        </linearGradient>
        {/* Powder cake */}
        <linearGradient id={`w-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={light ? '#e2e8f0' : '#cbd5e1'} />
        </linearGradient>
        {/* Liquid (solvent) */}
        <linearGradient id={`l-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="110" cy="285" rx="44" ry="6" fill="#000" opacity={light ? 0.12 : 0.45} />

      {/* Flip-top cap */}
      <rect x="76" y="14" width="68" height="17" rx="4" fill={`url(#c-${uid})`} />
      <ellipse cx="110" cy="15.5" rx="34" ry="4.5" fill={capColor} />
      <ellipse cx="110" cy="15.5" rx="22" ry="2.8" fill="#ffffff" opacity="0.28" />
      {/* Aluminum crimp collar */}
      <rect x="73" y="30" width="74" height="16" rx="3" fill={`url(#a-${uid})`} />
      <rect x="73" y="42" width="74" height="2.5" fill="#475569" opacity="0.5" />

      {/* Neck */}
      <path d="M80 46 L80 56 Q80 60 84 61 L136 61 Q140 60 140 56 L140 46 Z" fill={`url(#g-${uid})`} />

      {/* Body */}
      <rect x="68" y="61" width="84" height="212" rx="10" fill={`url(#g-${uid})`}
        stroke={light ? '#cbd5e1' : '#1e293b'} strokeWidth="1" />

      {/* Contents: powder cake for peptides, liquid for solvents */}
      {isSolvent ? (
        <>
          <rect x="70" y="92" width="80" height="176" rx="9" fill={`url(#l-${uid})`} />
          <ellipse cx="110" cy="92" rx="40" ry="4" fill="#bae6fd" opacity="0.65" />
        </>
      ) : (
        <>
          <rect x="70" y="238" width="80" height="30" rx="6" fill={`url(#w-${uid})`} opacity="0.95" />
          <ellipse cx="110" cy="238" rx="40" ry="4.5" fill="#ffffff" opacity="0.95" />
          <ellipse cx="96" cy="244" rx="10" ry="2" fill="#ffffff" opacity="0.7" />
        </>
      )}

      {/* ── Wrapped paper label (the product IS the label) ── */}
      <g>
        <rect x="68" y="78" width="84" height="120" fill={`url(#p-${uid})`} />
        {/* Category color band */}
        <rect x="68" y="78" width="84" height="20" fill={hue.band} />
        <text x="110" y="87.5" textAnchor="middle" fontSize="7.5" fontWeight="900" letterSpacing="2.2"
          fill="#ffffff" fontFamily="'Space Grotesk', system-ui, sans-serif">LABRAT</text>
        <text x="110" y="95" textAnchor="middle" fontSize="4.6" fontWeight="700" letterSpacing="1.4"
          fill={hue.bandText} fontFamily="system-ui, sans-serif">RESEARCH COMPOUND</text>

        {/* Product name printed on the label */}
        {line2 ? (
          <>
            <text x="110" y="116" textAnchor="middle" fontSize={nameSize} fontWeight="800"
              fill="#111827" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line1)}>{line1}</text>
            <text x="110" y={116 + nameSize + 2} textAnchor="middle" fontSize={nameSize} fontWeight="800"
              fill="#111827" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line2)}>{line2}</text>
          </>
        ) : (
          <text x="110" y="122" textAnchor="middle" fontSize={nameSize} fontWeight="800"
            fill="#111827" fontFamily="'Space Grotesk', system-ui, sans-serif" {...fit(line1)}>{line1}</text>
        )}

        {/* Strength pill */}
        {strength && (
          <>
            <rect x={110 - (strength.length * 3.2 + 10) / 2} y="138" width={strength.length * 3.2 + 10} height="13" rx="6.5"
              fill={hue.band} opacity="0.92" />
            <text x="110" y="147" textAnchor="middle" fontSize="7.5" fontWeight="900" letterSpacing="0.5"
              fill="#ffffff" fontFamily="system-ui, sans-serif">{strength}</text>
          </>
        )}

        {/* Fine print */}
        <text x="110" y={strength ? 162 : 150} textAnchor="middle" fontSize="4.8" fontWeight="600"
          fill="#6b7280" fontFamily="system-ui, sans-serif">
          {isSolvent ? 'Sterile Reconstitution Solvent' : 'Lyophilized · 3ml Glass Vial'}
        </text>
        <text x="110" y={strength ? 170 : 158} textAnchor="middle" fontSize="4.8" fontWeight="600"
          fill="#9ca3af" fontFamily="system-ui, sans-serif">For Laboratory Research Use Only</text>

        {/* Barcode */}
        <g opacity="0.8">
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i => (
            <rect key={i} x={78 + i * 3.6} y="180" width={i % 3 === 0 ? 2 : 1.2} height="11" fill="#374151" />
          ))}
        </g>
        {/* Label edge shadows for wrap illusion */}
        <rect x="68" y="78" width="5" height="120" fill="#000" opacity="0.10" />
        <rect x="147" y="78" width="5" height="120" fill="#000" opacity="0.12" />
      </g>

      {/* Glass highlights over everything */}
      <rect x="74" y="64" width="6" height="200" rx="3" fill="#ffffff" opacity={light ? 0.65 : 0.5} />
      <rect x="140" y="70" width="3.5" height="120" rx="1.75" fill="#ffffff" opacity="0.3" />
      <ellipse cx="110" cy="270" rx="40" ry="5" fill="#ffffff" opacity="0.12" />
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
