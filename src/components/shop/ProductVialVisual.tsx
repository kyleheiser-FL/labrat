import React from 'react';

type LabratThemeMode = 'neon' | 'clinical' | 'clinical-light';

function ClinicalLightVial({ name, category, isSolvent, isChina, isUsaWarehouse, isNorway }: {
  name: string; category: string;
  isSolvent: boolean; isChina: boolean; isUsaWarehouse: boolean; isNorway: boolean;
}) {
  const cleanFullName = name.replace(/\(.*?\)/g, '').trim();
  const nameParts = cleanFullName.split(' ');
  const firstWord = nameParts[0] || 'Peptide';
  const remainingWords = nameParts.slice(1).join(' ');

  // Stable unique ID for SVG gradients (multiple on page = conflicting IDs otherwise)
  const uid = (name + category).replace(/[^a-z0-9]/gi, '').slice(0, 10).toLowerCase() || 'vial';

  const labelColor    = isChina ? '#7f1d1d'  : isUsaWarehouse ? '#78350f'  : isSolvent ? '#1e3a8a' : '#1e3a8a';
  const labelMid      = isChina ? '#991b1b'  : isUsaWarehouse ? '#92400e'  : isSolvent ? '#1d4ed8' : '#1d4ed8';
  const accentText    = isChina ? '#fca5a5'  : isUsaWarehouse ? '#fde68a'  : isSolvent ? '#bae6fd' : '#93c5fd';
  const liquidFill    = isChina ? 'rgba(252,165,165,0.22)'  : isUsaWarehouse ? 'rgba(252,211,77,0.18)'   : isSolvent ? 'rgba(186,230,253,0.38)' : 'rgba(147,197,253,0.30)';
  const liquidSurface = isChina ? 'rgba(252,165,165,0.40)'  : isUsaWarehouse ? 'rgba(252,211,77,0.36)'   : isSolvent ? 'rgba(186,230,253,0.60)' : 'rgba(147,197,253,0.50)';
  const bgFrom        = isChina ? '#fff5f5'  : isUsaWarehouse ? '#fffbeb'   : '#f0f9ff';
  const bgTo          = isChina ? '#fef2f2'  : isUsaWarehouse ? '#fef9c3'   : '#eff6ff';

  const typeLabel = isSolvent ? 'SOLVENT' : 'RESEARCH PEPTIDE';

  return (
    <div
      className="w-full min-h-[300px] relative overflow-hidden select-none flex flex-col items-center justify-start border-b border-slate-200"
      style={{ background: `linear-gradient(175deg, ${bgFrom} 0%, ${bgTo} 100%)` }}
    >
      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle, rgba(37,99,235,0.10) 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
      }} />

      {/* Source badge */}
      {!isSolvent && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
          {isUsaWarehouse ? (
            <>
              <span className="text-sm leading-none">🇨🇳</span>
              <span className="text-sm leading-none">🇺🇸</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-amber-800 bg-amber-50 border-amber-300">USA Shipped</span>
            </>
          ) : isChina ? (
            <>
              <span className="text-sm leading-none">🇨🇳</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-red-800 bg-red-50 border-red-300">China Source</span>
            </>
          ) : (
            <>
              <span className="text-sm leading-none">🇳🇴</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-blue-800 bg-blue-50 border-blue-300">Norway Source</span>
            </>
          )}
        </div>
      )}

      {/* SVG Vial */}
      <svg
        viewBox="0 0 200 260"
        className="w-[130px] mt-8 drop-shadow-md"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`glass-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="18%"  stopColor="#dbeafe" stopOpacity="0.55" />
            <stop offset="82%"  stopColor="#eff6ff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.50" />
          </linearGradient>
          <linearGradient id={`cap-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#f8fafc" />
            <stop offset="60%"  stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={`label-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={labelColor} />
            <stop offset="100%" stopColor={labelMid} />
          </linearGradient>
          <linearGradient id={`shadow-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(15,23,42,0.10)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.00)" />
          </linearGradient>
        </defs>

        {/* Drop shadow beneath vial */}
        <ellipse cx="100" cy="244" rx="33" ry="5" fill="url(#shadow-undefined)" opacity="0.5" />
        <ellipse cx="100" cy="244" rx="33" ry="5" fill={`url(#shadow-${uid})`} />

        {/* Cap */}
        <rect x="62" y="28" width="76" height="24" rx="5"
          fill={`url(#cap-${uid})`} stroke="#94a3b8" strokeWidth="1" />
        {/* Crimp ring */}
        <rect x="66" y="49" width="68" height="6" rx="1.5"
          fill="#94a3b8" opacity="0.7" />

        {/* Neck */}
        <rect x="71" y="53" width="58" height="10" rx="3"
          fill={`url(#glass-${uid})`} stroke="#cbd5e1" strokeWidth="1" />

        {/* Vial body — glass */}
        <rect x="62" y="61" width="76" height="157" rx="7"
          fill={`url(#glass-${uid})`} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Label band */}
        <rect x="62" y="64" width="76" height="66"
          fill={`url(#label-${uid})`} rx="0" />

        {/* LABRAT text */}
        <text x="100" y="83" textAnchor="middle"
          fontSize="9.5" fontWeight="800" letterSpacing="2.5" fill="white"
          fontFamily="system-ui, -apple-system, sans-serif">LABRAT</text>

        {/* Divider */}
        <line x1="72" y1="88" x2="128" y2="88" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />

        {/* Type label */}
        <text x="100" y="100" textAnchor="middle"
          fontSize="6.5" fontWeight="700" letterSpacing="1" fill={accentText}
          fontFamily="system-ui, -apple-system, sans-serif">{typeLabel.split(' ')[0]}</text>
        {typeLabel.includes(' ') && (
          <text x="100" y="111" textAnchor="middle"
            fontSize="6.5" fontWeight="700" letterSpacing="1" fill="rgba(255,255,255,0.6)"
            fontFamily="system-ui, -apple-system, sans-serif">{typeLabel.split(' ').slice(1).join(' ')}</text>
        )}

        {/* Liquid fill in body below label */}
        <rect x="63.5" y="136" width="73" height="76" fill={liquidFill} />
        {/* Meniscus surface */}
        <ellipse cx="100" cy="136" rx="36.5" ry="4" fill={liquidSurface} />

        {/* Left glass reflection highlight */}
        <rect x="67" y="64" width="5" height="148" rx="2.5"
          fill="white" opacity="0.45" />

        {/* Right subtle highlight */}
        <rect x="127" y="68" width="3" height="44" rx="1.5"
          fill="white" opacity="0.25" />

        {/* Bottom rounded glass */}
        <ellipse cx="100" cy="218" rx="38" ry="6" fill={liquidFill} opacity="0.6" />
      </svg>

      {/* Info strip */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-white/95 via-white/80 to-transparent">
        <div className="text-[8px] font-black uppercase tracking-widest text-blue-600">LABRAT</div>
        <div className="text-sm font-black text-slate-900 leading-tight">{firstWord}</div>
        <div className="text-[11px] text-slate-500 truncate">{remainingWords || category}</div>
      </div>
    </div>
  );
}

export default function ProductVialVisual({ name, category, theme = 'neon' }: { name: string; category: string; theme?: LabratThemeMode }) {
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  const isSolvent = lowerCat.includes('reconstitution') || lowerCat.includes('solvent') || lowerName.includes('water') || lowerName.includes('bacteriostatic');
  const isChina = !isSolvent && (lowerName.includes(' china') || lowerCat.includes('china'));
  const isUsaWarehouse = !isSolvent && (lowerName.includes('us warehouse') || lowerName.includes('warehouse') || lowerCat === 'usa fast ship');
  const isNorway = !isSolvent && !isChina && !isUsaWarehouse;
  const isLight = theme === 'clinical-light';

  const cleanFullName = name.replace(/\(.*?\)/g, '').trim();
  const nameParts = cleanFullName.split(' ');
  const firstWord = nameParts[0] || 'Peptide';
  const remainingWords = nameParts.slice(1).join(' ');

  // both clinical themes use professional dark photos; neon uses generic real-vial style
  const imageSrc = (theme === 'clinical' || theme === 'clinical-light')
    ? (isSolvent ? '/shop/labrat-professional-vial-solvent.png' : '/shop/labrat-professional-vial-peptide.png')
    : (isSolvent ? '/shop/labrat-real-vial-solvent.png' : '/shop/labrat-real-vial-peptide.png');

  if (isLight) {
    const frameBorder = isChina ? '#fecaca' : isUsaWarehouse ? '#fde68a' : '#bfdbfe';
    return (
      <div className="w-full min-h-[300px] bg-white flex flex-col relative overflow-hidden select-none border-b border-slate-200">
        {/* Source badge */}
        {!isSolvent && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1">
            {isUsaWarehouse ? (
              <>
                <span className="text-sm leading-none">🇨🇳</span>
                <span className="text-sm leading-none">🇺🇸</span>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-amber-800 bg-amber-50 border-amber-300">USA Shipped</span>
              </>
            ) : isChina ? (
              <>
                <span className="text-sm leading-none">🇨🇳</span>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-red-800 bg-red-50 border-red-300">China Source</span>
              </>
            ) : (
              <>
                <span className="text-sm leading-none">🇳🇴</span>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-blue-800 bg-blue-50 border-blue-300">Norway Source</span>
              </>
            )}
          </div>
        )}
        {/* Photo in contained frame with product name overlay */}
        <div className="mx-3 mt-10 mb-0 rounded-2xl overflow-hidden shadow-sm relative"
          style={{ border: `2px solid ${frameBorder}`, background: '#0a0e1a' }}>
          <img
            src={imageSrc}
            alt={`${cleanFullName} LabRat branded research vial`}
            className={`w-full object-cover${isChina ? ' hue-rotate-[330deg] saturate-[1.2]' : isUsaWarehouse ? ' sepia-[0.3] saturate-[1.3]' : ''}`}
            loading="lazy"
          />
          {/* Solid white bar starts just above Klow label (~58% down); photo fully visible above it */}
          <div className="absolute left-0 right-0 bottom-0 px-3 pb-2.5 flex flex-col justify-end"
            style={{ top: '58%', background: 'rgba(248,250,252,0.99)' }}>
            <div style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#2563eb' }}>LABRAT</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3 }}>{firstWord}</div>
            <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{remainingWords || category}</div>
          </div>
        </div>
      </div>
    );
  }

  let glowClass = 'labrat-real-vial-visual--peptide';
  if (isSolvent) glowClass = 'labrat-real-vial-visual--solvent';
  else if (isChina) glowClass = 'labrat-real-vial-visual--china';
  else if (isUsaWarehouse) glowClass = 'labrat-real-vial-visual--usa';

  const borderColor = isChina ? 'border-red-500/15' : isUsaWarehouse ? 'border-amber-500/15' : 'border-cyan-400/10';

  return (
    <div className={`labrat-real-vial-visual ${glowClass} w-full min-h-[300px] border-b ${borderColor} p-4 relative overflow-hidden select-none`}>
      <div className="labrat-real-vial-grid" aria-hidden="true" />
      <div className="labrat-real-vial-orb" aria-hidden="true" />

      {!isSolvent && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
          {isUsaWarehouse ? (
            <>
              <span className="text-base leading-none">🇨🇳</span>
              <span className="text-base leading-none">🇺🇸</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-amber-300 bg-amber-950/60 border-amber-500/30">USA Shipped</span>
            </>
          ) : isChina ? (
            <>
              <span className="text-base leading-none">🇨🇳</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-red-300 bg-red-950/60 border-red-500/30">China Source</span>
            </>
          ) : isNorway ? (
            <>
              <span className="text-base leading-none">🇳🇴</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-blue-300 bg-blue-950/60 border-blue-500/30">Norway Source</span>
            </>
          ) : null}
        </div>
      )}

      <div className="labrat-real-vial-photo-shell">
        <div className="labrat-real-vial-photo-frame">
          <img
            src={imageSrc}
            alt={`${cleanFullName} LabRat branded research vial`}
            className={`labrat-real-vial-photo${isChina ? ' brightness-90 hue-rotate-[330deg] saturate-[1.2]' : isUsaWarehouse ? ' brightness-90 sepia-[0.3] saturate-[1.3]' : ''}`}
            loading="lazy"
          />
          <div className="labrat-real-vial-overlay-card">
            <div className="labrat-real-vial-overlay-brand">LABRAT</div>
            <div className="labrat-real-vial-overlay-name">{firstWord}</div>
            <div className="labrat-real-vial-overlay-sub">{remainingWords || category}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
