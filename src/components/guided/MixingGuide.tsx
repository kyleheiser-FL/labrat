import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';

interface MixingGuideProps {
  compoundName: string;
  vialSizeMg?: number;
  bacWaterMl?: number;
  onClose: () => void;
}

// Animated, self-contained reconstitution walkthrough. No external media.
export default function MixingGuide({ compoundName, vialSizeMg, bacWaterMl, onClose }: MixingGuideProps) {
  const ml = bacWaterMl ?? 2;
  const mg = vialSizeMg ?? 10;
  const units = Math.round(ml * 100);

  const steps = [
    {
      title: 'Sanitize everything',
      body: `Wipe the rubber stopper of both your ${compoundName} vial and your bacteriostatic (BAC) water vial with a fresh alcohol swab. Let them air-dry for a few seconds. Work on a clean surface with clean hands.`,
      art: 'swab',
    },
    {
      title: `Draw ${ml} ml of BAC water`,
      body: `Using a syringe, pull ${ml} ml (${units} units on a U-100 insulin syringe) of bacteriostatic water. This is your solvent — it dissolves the powder and keeps it sterile for weeks.`,
      art: 'draw',
    },
    {
      title: 'Add water slowly, down the glass',
      body: `Insert the needle into the ${compoundName} vial and angle it so the BAC water runs slowly down the inside glass wall — never blast it directly onto the powder. A hard stream can damage delicate compounds.`,
      art: 'pour',
    },
    {
      title: 'Swirl gently — never shake',
      body: `Let it sit 30–60 seconds, then swirl the vial gently until the powder fully dissolves and the solution turns clear. Shaking creates foam and can degrade the peptide.`,
      art: 'swirl',
    },
    {
      title: 'Store it cold',
      body: `Your ${mg} mg vial is now ${ml} ml of reconstituted solution (${(mg / ml).toFixed(1)} mg/ml). Keep it refrigerated at 2–8 °C and use within ~28 days. Label it with today's date.`,
      art: 'fridge',
    },
  ];

  const [i, setI] = useState(0);
  const step = steps[i];
  const pct = ((i + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[10001] bg-[#030712]/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="w-full sm:max-w-lg bg-[#0b1222] border border-[#1e293b] sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]/80">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400"><Droplets className="w-4 h-4" /></span>
            <div>
              <p className="text-sm font-bold leading-none">How to mix</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-none">{compoundName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1e293b] transition cursor-pointer" aria-label="Close"><X className="w-4.5 h-4.5" /></button>
        </div>

        {/* progress */}
        <div className="h-1 bg-[#1e293b]">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>

        {/* animated art */}
        <div className="px-5 pt-6 flex justify-center">
          <MixArt kind={step.art} ml={ml} />
        </div>

        {/* copy */}
        <div className="px-6 pb-2 pt-5 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cyan-400 mb-2">Step {i + 1} of {steps.length}</p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{step.title}</h3>
          <p className="text-[13.5px] text-slate-400 leading-relaxed mt-2.5 max-w-sm mx-auto">{step.body}</p>
        </div>

        {/* nav */}
        <div className="flex items-center justify-between gap-3 p-5 mt-auto">
          <button
            onClick={() => setI(v => Math.max(0, v - 1))}
            disabled={i === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-[#1e293b]/60 hover:bg-[#1e293b] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {i < steps.length - 1 ? (
            <button onClick={() => setI(v => v + 1)} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:brightness-110 transition cursor-pointer">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 transition cursor-pointer">
              Got it
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes lr-drip { 0%,100%{transform:translateY(0);opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:translateY(46px);opacity:0} }
        @keyframes lr-swirl { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes lr-fill { 0%{height:8px} 100%{height:38px} }
        @keyframes lr-pulse { 0%,100%{opacity:.45} 50%{opacity:1} }
        @media (prefers-reduced-motion: reduce){ .lr-anim{animation:none !important} }
      `}</style>
    </div>
  );
}

// Simple, on-brand SVG vignettes per step.
function MixArt({ kind, ml }: { kind: string; ml: number }) {
  const box = "w-full max-w-[260px] h-[150px]";
  if (kind === 'swab') {
    return (
      <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
        <Vial x={150} />
        <g className="lr-anim" style={{ animation: 'lr-pulse 1.6s ease-in-out infinite' }}>
          <rect x="70" y="60" width="60" height="10" rx="5" fill="#334155" />
          <rect x="120" y="58" width="26" height="14" rx="4" fill="#38bdf8" />
        </g>
      </svg>
    );
  }
  if (kind === 'draw') {
    return (
      <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
        <Syringe fill={0.7} />
        <text x="130" y="140" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace">{ml} ml BAC water</text>
      </svg>
    );
  }
  if (kind === 'pour') {
    return (
      <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
        <Vial x={150} />
        <line x1="120" y1="30" x2="150" y2="52" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        {[0, 1, 2].map(n => (
          <circle key={n} className="lr-anim" cx="150" cy="56" r="2.6" fill="#38bdf8"
            style={{ animation: `lr-drip 1.4s ${n * 0.45}s linear infinite` }} />
        ))}
      </svg>
    );
  }
  if (kind === 'swirl') {
    return (
      <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
        <g className="lr-anim" style={{ transformOrigin: '150px 90px', animation: 'lr-swirl 2.2s linear infinite' }}>
          <Vial x={150} liquid />
        </g>
      </svg>
    );
  }
  // fridge
  return (
    <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
      <rect x="96" y="24" width="68" height="104" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
      <line x1="130" y1="30" x2="130" y2="122" stroke="#334155" strokeWidth="2" />
      <rect x="120" y="48" width="6" height="16" rx="3" fill="#38bdf8" />
      <Vial x={148} scale={0.7} liquid />
      <g className="lr-anim" style={{ animation: 'lr-pulse 1.6s ease-in-out infinite' }}>
        <path d="M188 60 l6 -6 M191 57 l-6 6 M188 68 l6 -6 M191 65 l-6 6" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Vial({ x = 130, scale = 1, liquid = false }: { x?: number; scale?: number; liquid?: boolean }) {
  return (
    <g transform={`translate(${x} 90) scale(${scale})`}>
      <rect x="-16" y="-46" width="32" height="12" rx="3" fill="#1e3a8a" />
      <rect x="-13" y="-38" width="26" height="8" rx="2" fill="#94a3b8" />
      <rect x="-16" y="-32" width="32" height="64" rx="7" fill="#0b1222" stroke="#334155" strokeWidth="2" />
      {liquid && <rect x="-13" y="4" width="26" height="25" rx="4" fill="#0ea5e9" opacity="0.55" />}
      {!liquid && <rect x="-13" y="16" width="26" height="13" rx="4" fill="#e2e8f0" opacity="0.5" />}
    </g>
  );
}

function Syringe({ fill = 0.6 }: { fill?: number }) {
  const w = 150 * fill;
  return (
    <g transform="translate(35 66)">
      <rect x="0" y="0" width="150" height="20" rx="5" fill="#0b1222" stroke="#334155" strokeWidth="2" />
      <rect x="2" y="3" width={w} height="14" rx="3" fill="#38bdf8" opacity="0.6" />
      <rect x="150" y="6" width="14" height="8" rx="2" fill="#475569" />
      <line x1="164" y1="10" x2="196" y2="10" stroke="#94a3b8" strokeWidth="2" />
      <rect x="-16" y="4" width="16" height="12" rx="3" fill="#475569" />
    </g>
  );
}
