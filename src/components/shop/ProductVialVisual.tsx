import React from 'react';

type LabratThemeMode = 'neon' | 'clinical';

// Product Vial Visual Component using photo-real branded vial assets for both Neon and Clinical themes
export default function ProductVialVisual({ name, category, theme = 'neon' }: { name: string; category: string; theme?: LabratThemeMode }) {
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  const isSolvent = lowerCat.includes('reconstitution') || lowerCat.includes('solvent') || lowerName.includes('water') || lowerName.includes('bacteriostatic');

  const cleanFullName = name.replace(/\(.*?\)/g, '').trim();
  const nameParts = cleanFullName.split(' ');
  const firstWord = nameParts[0] || 'Peptide';
  const remainingWords = nameParts.slice(1).join(' ');
  const sizeMatch = name.match(/(\d+\s*m?g|\d+\s*m?l)/i);
  const sizeValue = sizeMatch ? sizeMatch[1].trim() : (isSolvent ? '30 ml' : '10 mg');
  const neonImageSrc = isSolvent ? '/shop/labrat-real-vial-solvent.png' : '/shop/labrat-real-vial-peptide.png';
  const glowClass = isSolvent ? 'labrat-real-vial-visual--solvent' : 'labrat-real-vial-visual--peptide';

  if (theme === 'clinical') {
    const professionalVialSrc = isSolvent ? '/shop/labrat-professional-vial-solvent.png' : '/shop/labrat-professional-vial-peptide.png';

    return (
      <div className="w-full min-h-[300px] border-b border-slate-700/40 p-4 relative overflow-hidden select-none bg-gradient-to-br from-slate-950 via-[#0b1628] to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:1.35rem_1.35rem] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(96,165,250,0.11),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(148,163,184,0.08),transparent_32%)]" />

        <div className="relative z-10 mx-auto max-w-[300px] min-h-[238px] rounded-[1.35rem] overflow-hidden border border-slate-600/50 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_24px_55px_rgba(2,6,23,0.42)]">
          <img
            src={professionalVialSrc}
            alt={`${cleanFullName} professional LabRat vial presentation`}
            className="absolute inset-0 w-full h-full object-contain object-top p-2.5"
            loading="lazy"
          />

          <div className="absolute left-3 right-3 bottom-3 rounded-xl border border-slate-300/75 bg-white/88 backdrop-blur-sm shadow-[0_10px_20px_rgba(15,23,42,0.16)] px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[9px] font-black tracking-[0.24em] uppercase text-sky-700">LABRAT</div>
                <div className="mt-0.5 text-base leading-none font-black text-slate-950 tracking-tight truncate">{firstWord}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-slate-600 truncate">{remainingWords || category}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">{isSolvent ? 'Solvent' : 'Peptide'}</div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 whitespace-nowrap">{sizeValue.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className={`labrat-real-vial-visual ${glowClass} w-full min-h-[300px] border-b border-cyan-400/10 p-4 relative overflow-hidden select-none`}>
      <div className="labrat-real-vial-grid" aria-hidden="true" />
      <div className="labrat-real-vial-orb" aria-hidden="true" />


      <div className="labrat-real-vial-photo-shell">
        <div className="labrat-real-vial-photo-frame">
          <img
            src={neonImageSrc}
            alt={`${cleanFullName} LabRat branded research vial`}
            className="labrat-real-vial-photo"
            loading="lazy"
          />
          <div className="labrat-real-vial-overlay-card">
            <div className="labrat-real-vial-overlay-brand">LABRAT</div>
            <div className="labrat-real-vial-overlay-name">{firstWord}</div>
            <div className="labrat-real-vial-overlay-sub">{remainingWords || category}</div>
            <div className="labrat-real-vial-overlay-meta">
              <span>{isSolvent ? 'Sterile Diluent' : 'Research Peptide'}</span>
              <strong>{sizeValue.toUpperCase()}</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
