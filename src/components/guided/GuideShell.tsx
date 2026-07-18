import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { guideThemeVars, LabTheme } from './guideArt';

export interface GuideStep {
  title: string;
  body: string;
  /** Clinical still photo under /images/guides/ */
  image?: string;
}

interface GuideShellProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  theme: LabTheme;
  steps: GuideStep[];
  finishLabel?: string;
  onClose: () => void;
}

export default function GuideShell({
  title, subtitle, icon, accent, theme, steps, finishLabel = 'Got it', onClose,
}: GuideShellProps) {
  const [i, setI] = useState(0);
  const step = steps[i];
  const pct = ((i + 1) / steps.length) * 100;
  const vars = guideThemeVars(theme, accent);

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      style={{ ...vars, background: theme === 'clinical-light' ? 'rgba(15,23,42,0.35)' : 'rgba(3,7,18,0.95)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92vh] border"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--text)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: `${accent}22`, color: accent }}>{icon}</span>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: 'var(--text)' }}>{title}</p>
              <p className="text-[11px] mt-1 leading-none" style={{ color: 'var(--muted)' }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition cursor-pointer hover:opacity-70" style={{ color: 'var(--muted)' }} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-1" style={{ background: 'var(--line)' }}>
          <div className="h-full transition-[width] duration-300" style={{ width: `${pct}%`, background: accent }} />
        </div>

        <div className="px-5 pt-5">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: 'var(--line)',
              background: theme === 'clinical-light'
                ? 'radial-gradient(120% 100% at 50% 0%, rgba(15,23,42,0.05), rgba(15,23,42,0.015))'
                : 'radial-gradient(120% 100% at 50% 0%, rgba(148,180,214,0.07), rgba(148,180,214,0.02))',
            }}
          >
            {step.image ? (
              <img
                src={step.image}
                alt=""
                className="w-full aspect-[4/3] object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center text-[12px]" style={{ color: 'var(--muted)' }}>
                Step visual
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-2 pt-4 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>
            Step {i + 1} of {steps.length}
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance" style={{ color: 'var(--text)' }}>{step.title}</h3>
          <p className="text-[13.5px] leading-relaxed mt-2.5 max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>{step.body}</p>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 mt-auto">
          <button
            onClick={() => setI(v => Math.max(0, v - 1))}
            disabled={i === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            style={{ background: 'var(--panel)', color: 'var(--text)' }}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => (i < steps.length - 1 ? setI(v => v + 1) : onClose())}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-white transition cursor-pointer hover:brightness-110"
            style={{ background: accent }}
          >
            {i < steps.length - 1 ? <>Next <ChevronRight className="w-4 h-4" /></> : finishLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
