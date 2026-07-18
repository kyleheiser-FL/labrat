import React, { useState } from 'react';
import { ShoppingBag, Activity, Check, ChevronRight } from 'lucide-react';
import { ExperienceMode } from '../lib/experience';
import { triggerHaptic } from '../lib/haptics';

interface ExperienceGateProps {
  onSelect: (mode: ExperienceMode) => void;
}

const OPTIONS: {
  mode: ExperienceMode;
  icon: React.ReactNode;
  title: string;
  tag: string;
  points: string[];
  accent: string;
}[] = [
  {
    mode: 'store',
    icon: <ShoppingBag className="w-6 h-6" />,
    title: 'Store only',
    tag: 'Shop',
    accent: '#a855f7',
    points: [
      'Straight to the members catalog',
      'No daily tracking or protocol tools',
      'Turn on tracking anytime in Settings',
    ],
  },
  {
    mode: 'tracking',
    icon: <Activity className="w-6 h-6" />,
    title: 'Protocol tracking + Store',
    tag: 'Daily + Protocol + Shop',
    accent: '#22d3ee',
    points: [
      'Log doses on Daily and manage protocols',
      'Full shop + Compound Research included',
      'How-to mix & inject guides when you need them',
    ],
  },
];

export default function ExperienceGate({ onSelect }: ExperienceGateProps) {
  const [picked, setPicked] = useState<ExperienceMode | null>(null);

  const confirm = () => {
    if (!picked) return;
    triggerHaptic('success');
    onSelect(picked);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto bg-[#030712] text-slate-100"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your experience"
      id="experience-gate"
    >
      <div className="pointer-events-none fixed top-[-120px] left-1/3 w-[520px] h-[520px] bg-cyan-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none fixed bottom-[-120px] right-1/4 w-[440px] h-[440px] bg-violet-500/10 blur-[130px] rounded-full" />

      <div className="relative max-w-3xl mx-auto px-5 py-10 sm:py-14 flex flex-col min-h-full">
        <div className="text-center mb-8 sm:mb-10">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-cyan-400 mb-3">Welcome to labrat</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-balance">What do you want to do?</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Pick a starting focus. You can switch anytime in Settings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 flex-1 content-start">
          {OPTIONS.map(opt => {
            const active = picked === opt.mode;
            return (
              <button
                key={opt.mode}
                onClick={() => { triggerHaptic('light'); setPicked(opt.mode); }}
                className={`relative text-left rounded-2xl border p-5 transition-all cursor-pointer flex flex-col gap-4 ${
                  active
                    ? 'border-transparent bg-[#0b1222] shadow-[0_0_0_2px_var(--a),0_18px_40px_-20px_var(--a)]'
                    : 'border-[#1e293b]/80 bg-[#0b1222]/60 hover:bg-[#0f172a]/70 hover:border-[#334155]'
                }`}
                style={{ ['--a' as any]: opt.accent }}
                id={`exp-opt-${opt.mode}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-xl"
                    style={{ background: `${opt.accent}1f`, color: opt.accent }}
                  >
                    {opt.icon}
                  </span>
                  <span
                    className="font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-md"
                    style={{ background: `${opt.accent}17`, color: opt.accent }}
                  >
                    {opt.tag}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight leading-snug">{opt.title}</h2>
                </div>
                <ul className="flex flex-col gap-2 mt-auto">
                  {opt.points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-[13px] text-slate-300 leading-snug">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: opt.accent }} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                {active && (
                  <span
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: opt.accent }}
                  >
                    <Check className="w-3 h-3 text-slate-950" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={confirm}
            disabled={!picked}
            className={`flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm px-8 py-3.5 rounded-xl transition-all cursor-pointer ${
              picked
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-[0_14px_30px_-14px_rgba(34,211,238,0.8)] hover:brightness-110'
                : 'bg-[#1e293b] text-slate-500 cursor-not-allowed'
            }`}
            id="exp-continue"
          >
            {picked ? 'Continue' : 'Pick one to continue'}
            {picked && <ChevronRight className="w-4 h-4" />}
          </button>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-slate-600">Research use only · Not medical advice</p>
        </div>
      </div>
    </div>
  );
}
