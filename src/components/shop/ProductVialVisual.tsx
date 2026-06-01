import React from 'react';

type LabratThemeMode = 'neon' | 'clinical';

export default function ProductVialVisual({ name, category, theme = 'neon' }: { name: string; category: string; theme?: LabratThemeMode }) {
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  const isSolvent = lowerCat.includes('reconstitution') || lowerCat.includes('solvent') || lowerName.includes('water') || lowerName.includes('bacteriostatic');

  const cleanFullName = name.replace(/\(.*?\)/g, '').trim();
  const nameParts = cleanFullName.split(' ');
  const firstWord = nameParts[0] || 'Peptide';
  const remainingWords = nameParts.slice(1).join(' ');

  const imageSrc = isSolvent ? '/shop/labrat-real-vial-solvent.png' : '/shop/labrat-real-vial-peptide.png';
  const glowClass = isSolvent ? 'labrat-real-vial-visual--solvent' : 'labrat-real-vial-visual--peptide';

  return (
    <div className={`labrat-real-vial-visual ${glowClass} w-full min-h-[300px] border-b border-cyan-400/10 p-4 relative overflow-hidden select-none`}>
      <div className="labrat-real-vial-grid" aria-hidden="true" />
      <div className="labrat-real-vial-orb" aria-hidden="true" />

      <div className="labrat-real-vial-photo-shell">
        <div className="labrat-real-vial-photo-frame">
          <img
            src={imageSrc}
            alt={`${cleanFullName} LabRat branded research vial`}
            className="labrat-real-vial-photo"
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
