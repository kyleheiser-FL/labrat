import React from 'react';

type LabratThemeMode = 'neon' | 'clinical';

export default function ProductVialVisual({ name, category, theme = 'neon' }: { name: string; category: string; theme?: LabratThemeMode }) {
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  const isSolvent = lowerCat.includes('reconstitution') || lowerCat.includes('solvent') || lowerName.includes('water') || lowerName.includes('bacteriostatic');
  const isChina = !isSolvent && (lowerName.includes(' china') || lowerCat.includes('china'));
  const isUsaWarehouse = !isSolvent && (lowerName.includes('us warehouse') || lowerName.includes('warehouse') || lowerCat === 'usa fast ship');
  const isNorway = !isSolvent && !isChina && !isUsaWarehouse;

  const cleanFullName = name.replace(/\(.*?\)/g, '').trim();
  const nameParts = cleanFullName.split(' ');
  const firstWord = nameParts[0] || 'Peptide';
  const remainingWords = nameParts.slice(1).join(' ');

  const imageSrc = theme === 'clinical'
    ? (isSolvent ? '/shop/labrat-professional-vial-solvent.png' : '/shop/labrat-professional-vial-peptide.png')
    : (isSolvent ? '/shop/labrat-real-vial-solvent.png' : '/shop/labrat-real-vial-peptide.png');

  let glowClass = 'labrat-real-vial-visual--peptide';
  if (isSolvent) glowClass = 'labrat-real-vial-visual--solvent';
  else if (isChina) glowClass = 'labrat-real-vial-visual--china';
  else if (isUsaWarehouse) glowClass = 'labrat-real-vial-visual--usa';

  const borderColor = isChina ? 'border-red-500/15' : isUsaWarehouse ? 'border-amber-500/15' : 'border-cyan-400/10';

  return (
    <div className={`labrat-real-vial-visual ${glowClass} w-full min-h-[300px] border-b ${borderColor} p-4 relative overflow-hidden select-none`}>
      <div className="labrat-real-vial-grid" aria-hidden="true" />
      <div className="labrat-real-vial-orb" aria-hidden="true" />

      {/* Source badge — top-left corner */}
      {!isSolvent && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
          {isUsaWarehouse ? (
            <>
              <span className="text-base leading-none">🇨🇳</span>
              <span className="text-base leading-none">🇺🇸</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-amber-300 bg-amber-950/60 border-amber-500/30">
                USA Shipped
              </span>
            </>
          ) : isChina ? (
            <>
              <span className="text-base leading-none">🇨🇳</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-red-300 bg-red-950/60 border-red-500/30">
                China Source
              </span>
            </>
          ) : isNorway ? (
            <>
              <span className="text-base leading-none">🇳🇴</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border text-blue-300 bg-blue-950/60 border-blue-500/30">
                Norway Source
              </span>
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
