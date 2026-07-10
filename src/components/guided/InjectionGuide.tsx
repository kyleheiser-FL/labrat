import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Syringe as SyringeIcon } from 'lucide-react';

interface InjectionGuideProps {
  compoundName: string;
  doseUnits?: number;   // syringe units for one dose, if known
  onClose: () => void;
}

// Animated luer-lock draw + subcutaneous injection walkthrough. Self-contained.
export default function InjectionGuide({ compoundName, doseUnits, onClose }: InjectionGuideProps) {
  const u = doseUnits && doseUnits > 0 ? Math.round(doseUnits) : null;
  const drawLabel = u ? `${u} units` : 'your prescribed dose';

  const steps = [
    {
      title: 'Assemble the luer-lock syringe',
      body: 'Screw the needle firmly onto the luer-lock syringe until snug — the twist-lock stops it popping off under pressure. Wipe the vial stopper with a fresh alcohol swab and let it dry.',
      art: 'assemble',
    },
    {
      title: 'Draw air equal to your dose',
      body: `Before touching the liquid, pull the plunger back to ${drawLabel} of air. Injecting this air into the vial first equalizes the pressure so the dose draws smoothly instead of fighting a vacuum.`,
      art: 'air',
    },
    {
      title: 'Inject the air into the vial',
      body: 'With the vial upright, push the needle through the stopper and press the plunger to push all that air into the space above the liquid. Keep the needle above the liquid line while you do this.',
      art: 'pushair',
    },
    {
      title: 'Invert and draw your dose',
      body: `Flip the vial upside-down so the needle tip sits in the liquid. Slowly pull back to exactly ${drawLabel}. Draw a touch extra if you need to clear bubbles, then push back to the exact mark.`,
      art: 'draw',
    },
    {
      title: 'Clear the air bubbles',
      body: 'Keep the vial inverted, tap the syringe barrel so bubbles rise to the top, then gently push the plunger until a tiny bead appears at the needle tip. Re-check your dose is still on the line.',
      art: 'tap',
    },
    {
      title: 'Pick a subcutaneous site',
      body: 'Rotate between fatty areas: lower belly (a couple inches either side of the navel), love handles, or the front of the thigh. Rotate sites each dose so tissue stays healthy. Swab the spot and let it dry.',
      art: 'sites',
    },
    {
      title: 'Pinch, insert, inject slow',
      body: 'Pinch a fold of skin, insert the short needle at 45–90°, release the pinch, then press the plunger slowly and steadily. Withdraw, apply light pressure with a clean swab — do not rub.',
      art: 'inject',
    },
    {
      title: 'Dispose safely',
      body: 'Drop the used needle straight into a sharps container — never re-cap by hand and never reuse a needle. Return your vial to the fridge.',
      art: 'dispose',
    },
  ];

  const [i, setI] = useState(0);
  const step = steps[i];
  const pct = ((i + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[10001] bg-[#030712]/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="w-full sm:max-w-lg bg-[#0b1222] border border-[#1e293b] sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]/80">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-300"><SyringeIcon className="w-4 h-4" /></span>
            <div>
              <p className="text-sm font-bold leading-none">How to draw &amp; inject</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-none">{compoundName} · luer-lock</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1e293b] transition cursor-pointer" aria-label="Close"><X className="w-4.5 h-4.5" /></button>
        </div>

        <div className="h-1 bg-[#1e293b]">
          <div className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>

        <div className="px-5 pt-6 flex justify-center">
          <InjectArt kind={step.art} units={u} />
        </div>

        <div className="px-6 pb-2 pt-5 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-300 mb-2">Step {i + 1} of {steps.length}</p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{step.title}</h3>
          <p className="text-[13.5px] text-slate-400 leading-relaxed mt-2.5 max-w-sm mx-auto">{step.body}</p>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 mt-auto">
          <button onClick={() => setI(v => Math.max(0, v - 1))} disabled={i === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-[#1e293b]/60 hover:bg-[#1e293b] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {i < steps.length - 1 ? (
            <button onClick={() => setI(v => v + 1)} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-slate-950 bg-gradient-to-r from-indigo-400 to-cyan-400 hover:brightness-110 transition cursor-pointer">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 transition cursor-pointer">
              Done
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes lr-plunge { 0%,100%{transform:translateX(0)} 50%{transform:translateX(18px)} }
        @keyframes lr-rise { 0%{transform:translateY(6px);opacity:0} 40%{opacity:1} 100%{transform:translateY(-10px);opacity:0} }
        @keyframes lr-blink { 0%,100%{opacity:.35} 50%{opacity:1} }
        @media (prefers-reduced-motion: reduce){ .lr-anim{animation:none !important} }
      `}</style>
    </div>
  );
}

function InjectArt({ kind, units }: { kind: string; units: number | null }) {
  const box = "w-full max-w-[260px] h-[150px]";

  if (kind === 'sites') {
    // simple torso with subcutaneous injection zones
    return (
      <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
        <path d="M110 20 q20 -8 40 0 l6 40 q4 40 -6 70 l-40 0 q-10 -30 -6 -70 z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <circle cx="130" cy="78" r="3" fill="#64748b" />
        {[[112, 92], [148, 92], [120, 112], [140, 112], [130, 128]].map(([x, y], n) => (
          <circle key={n} className="lr-anim" cx={x} cy={y} r="6" fill="none" stroke="#22d3ee" strokeWidth="2"
            style={{ animation: `lr-blink 1.6s ${n * 0.2}s ease-in-out infinite` }} />
        ))}
        <text x="130" y="16" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">rotate sites</text>
      </svg>
    );
  }

  if (kind === 'inject') {
    return (
      <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
        <rect x="40" y="96" width="180" height="34" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <path d="M120 96 q10 -10 20 0" fill="none" stroke="#475569" strokeWidth="3" />
        <g className="lr-anim" style={{ transformOrigin: '130px 70px', animation: 'lr-plunge 1.8s ease-in-out infinite' }}>
          <line x1="130" y1="88" x2="130" y2="70" stroke="#94a3b8" strokeWidth="2" />
          <rect x="110" y="40" width="40" height="30" rx="5" fill="#0b1222" stroke="#334155" strokeWidth="2" transform="rotate(0 130 55)" />
          <rect x="112" y="43" width="24" height="24" rx="3" fill="#818cf8" opacity="0.55" />
        </g>
      </svg>
    );
  }

  // syringe-based steps (assemble/air/pushair/draw/tap/dispose) share a syringe motif
  const fill = kind === 'air' ? 0.35 : kind === 'draw' ? 0.62 : kind === 'tap' ? 0.6 : kind === 'pushair' ? 0.05 : 0.4;
  const showVial = kind === 'pushair' || kind === 'draw' || kind === 'tap';
  const inverted = kind === 'draw' || kind === 'tap';

  return (
    <svg viewBox="0 0 260 150" className={box} aria-hidden="true">
      {showVial && (
        <g transform={inverted ? 'translate(205 96) rotate(180 0 -20)' : 'translate(205 40)'}>
          <rect x="-16" y="-10" width="32" height="12" rx="3" fill="#3730a3" />
          <rect x="-16" y="0" width="32" height="60" rx="7" fill="#0b1222" stroke="#334155" strokeWidth="2" />
          <rect x="-13" y="28" width="26" height="30" rx="4" fill="#6366f1" opacity="0.5" />
        </g>
      )}
      <g className="lr-anim" style={kind === 'pushair' ? { transformOrigin: '120px 75px', animation: 'lr-plunge 1.8s ease-in-out infinite' } : undefined}>
        <rect x="35" y="66" width="150" height="20" rx="5" fill="#0b1222" stroke="#334155" strokeWidth="2" />
        <rect x="37" y="69" width={150 * fill} height="14" rx="3" fill="#818cf8" opacity="0.6" />
        <rect x="185" y="72" width="12" height="8" rx="2" fill="#475569" />
        <line x1="197" y1="76" x2="224" y2="76" stroke="#94a3b8" strokeWidth="2" />
        <rect x="19" y="70" width="16" height="12" rx="3" fill="#475569" />
      </g>
      {kind === 'tap' && [0, 1].map(n => (
        <circle key={n} className="lr-anim" cx="150" cy="76" r="2.4" fill="#c7d2fe"
          style={{ animation: `lr-rise 1.3s ${n * 0.4}s ease-in-out infinite` }} />
      ))}
      {units && (kind === 'air' || kind === 'draw') && (
        <text x="110" y="108" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace">{units} units</text>
      )}
    </svg>
  );
}
