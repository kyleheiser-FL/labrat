import React, { useState, useMemo } from 'react';
import {
  Sparkles, Plus, Check, Search, ShoppingBag, Settings as SettingsIcon,
  Droplets, Syringe as SyringeIcon, CalendarCheck, GraduationCap, ChevronRight, X, Trash2, RotateCcw,
} from 'lucide-react';
import { Compound, DoseLog } from '../../types';
import { LibraryItem } from '../../types';
import { PEPTIDE_LIBRARY } from '../../data/peptides';
import { getDoseScheduleForDate } from '../../lib/schedule';
import { deriveProtocol, INTENSITY_TIERS, Intensity } from '../../lib/experience';
import { LabTheme } from './guideArt';
import { triggerHaptic } from '../../lib/haptics';
import MixingGuide from './MixingGuide';
import InjectionGuide from './InjectionGuide';

interface GuidedExperienceProps {
  compounds: Compound[];
  logs: DoseLog[];
  purchasedItems: LibraryItem[];
  theme: LabTheme;
  onAddProtocols: (comps: Compound[]) => void;
  onLogDose: (log: DoseLog) => void;
  onUndoDose: (logId: string) => void;
  onDeleteCompound: (id: string) => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];

function syringeUnits(c: Compound): number | undefined {
  if (!c.vialSizeMg || !c.bacWaterMl) return undefined;
  const mcg = c.doseUnit === 'mg' ? c.doseAmount * 1000 : c.doseAmount;
  return Math.round((mcg / ((c.vialSizeMg * 1000) / (c.bacWaterMl * 100))) * 10) / 10;
}

const FREQ_LABEL: Record<string, string> = {
  daily: 'every day', eod: 'every other day', twice_weekly: 'twice a week', weekly: 'once a week', custom: 'custom schedule',
};

export default function GuidedExperience({
  compounds, logs, purchasedItems, theme, onAddProtocols, onLogDose, onUndoDose, onDeleteCompound, onOpenShop, onOpenSettings,
}: GuidedExperienceProps) {
  const active = compounds.filter(c => !c.isCompleted);
  // Always land on Home — even empty. The home shows an "Add peptide" button
  // rather than dropping the user straight into the add flow.
  const [view, setView] = useState<'home' | 'setup'>('home');
  const [guide, setGuide] = useState<{ kind: 'mix' | 'inject'; comp: Compound } | null>(null);

  return (
    <div className="max-w-3xl mx-auto" id="guided-experience">
      {view === 'setup' ? (
        <SetupFlow
          purchasedItems={purchasedItems}
          existing={active}
          onDone={(comps) => { onAddProtocols(comps); setView('home'); }}
          onSkipToHome={() => setView('home')}
          onOpenShop={onOpenShop}
        />
      ) : (
        <Home
          compounds={active}
          logs={logs}
          onLogDose={onLogDose}
          onUndoDose={onUndoDose}
          onDeleteCompound={onDeleteCompound}
          onAddMore={() => setView('setup')}
          onOpenShop={onOpenShop}
          onOpenSettings={onOpenSettings}
          onGuide={(kind, comp) => setGuide({ kind, comp })}
        />
      )}

      {guide?.kind === 'mix' && (
        <MixingGuide compoundName={guide.comp.name} vialSizeMg={guide.comp.vialSizeMg} bacWaterMl={guide.comp.bacWaterMl} theme={theme} onClose={() => setGuide(null)} />
      )}
      {guide?.kind === 'inject' && (
        <InjectionGuide compoundName={guide.comp.name} doseUnits={syringeUnits(guide.comp)} theme={theme} onClose={() => setGuide(null)} />
      )}
    </div>
  );
}

/* ─────────────────────────── SETUP ─────────────────────────── */
function SetupFlow({
  purchasedItems, existing, onDone, onSkipToHome, onOpenShop,
}: {
  purchasedItems: LibraryItem[];
  existing: Compound[];
  onDone: (comps: Compound[]) => void;
  onSkipToHome?: () => void;
  onOpenShop: () => void;
}) {
  const existingNames = new Set(existing.map(c => c.name.toLowerCase()));
  const [selected, setSelected] = useState<Record<string, LibraryItem>>(() => {
    const init: Record<string, LibraryItem> = {};
    purchasedItems.forEach(i => { if (!existingNames.has(i.name.toLowerCase())) init[i.id] = i; });
    return init;
  });
  const [intensity, setIntensity] = useState<Intensity>('recommended');
  const [query, setQuery] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const selectedList = Object.values(selected);
  const toggle = (item: LibraryItem) => {
    triggerHaptic('light');
    setSelected(prev => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id]; else next[item.id] = item;
      return next;
    });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PEPTIDE_LIBRARY
      .filter(i => !q || i.name.toLowerCase().includes(q) || (i.chemicalName || '').toLowerCase().includes(q))
      .slice(0, 40);
  }, [query]);

  const build = () => {
    triggerHaptic('success');
    const comps: Compound[] = selectedList.map((item, idx) => {
      const g = deriveProtocol(item, intensity, existing.length + idx);
      return { ...g.compound, id: crypto.randomUUID() };
    });
    onDone(comps);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="text-center pt-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] uppercase text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" /> Guided setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-3 text-balance">Let's build your protocol</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">Confirm what you have and pick a pace — we'll handle the doses, schedule, and mixing math.</p>
      </div>

      {/* Step 1 — compounds */}
      <section className="bg-[#0b1222] border border-[#1e293b]/80 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-400 font-mono text-xs font-bold">1</span>
          <h2 className="font-bold text-[15px]">What do you have?</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {purchasedItems.length > 0 ? 'Pulled from your orders — add anything else you own.' : 'Add the compounds you currently have on hand.'}
        </p>

        {selectedList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedList.map(item => (
              <button key={item.id} onClick={() => toggle(item)}
                className="group inline-flex items-center gap-1.5 bg-cyan-500/12 border border-cyan-500/30 text-cyan-200 text-[13px] font-semibold pl-3 pr-2 py-1.5 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition">
                {item.name}
                <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}

        {!showPicker ? (
          <button onClick={() => setShowPicker(true)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-xl transition cursor-pointer">
            <Plus className="w-4 h-4" /> Add a compound
          </button>
        ) : (
          <div className="border border-[#1e293b] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e293b] bg-[#0f172a]/60">
              <Search className="w-4 h-4 text-slate-500" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search compounds…"
                className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-600" />
              <button onClick={() => { setShowPicker(false); setQuery(''); }} className="text-slate-500 hover:text-slate-300 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-[#1e293b]/60">
              {results.map(item => {
                const on = !!selected[item.id];
                return (
                  <button key={item.id} onClick={() => toggle(item)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-[#0f172a]/60 transition cursor-pointer">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-slate-100 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.chemicalName || item.category}</p>
                    </div>
                    <span className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center ${on ? 'bg-cyan-500 border-cyan-500' : 'border-[#334155]'}`}>
                      {on && <Check className="w-3.5 h-3.5 text-slate-950" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={onOpenShop} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition cursor-pointer">
          <ShoppingBag className="w-3.5 h-3.5" /> Don't have anything yet? Browse the store →
        </button>
      </section>

      {/* Step 2 — intensity */}
      <section className="bg-[#0b1222] border border-[#1e293b]/80 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-400 font-mono text-xs font-bold">2</span>
          <h2 className="font-bold text-[15px]">Pick your pace</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {INTENSITY_TIERS.map(t => {
            const on = intensity === t.key;
            const accent = t.key === 'slow' ? '#10b981' : t.key === 'full' ? '#f43f5e' : '#22d3ee';
            return (
              <button key={t.key} onClick={() => { triggerHaptic('light'); setIntensity(t.key); }}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${on ? 'bg-[#0f172a]' : 'bg-[#0b1222]/60 border-[#1e293b] hover:border-[#334155]'}`}
                style={on ? { borderColor: 'transparent', boxShadow: `0 0 0 2px ${accent}` } : undefined}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-black tracking-tight" style={{ color: on ? accent : '#e2e8f0' }}>{t.label}</span>
                  {on && <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: accent }}><Check className="w-2.5 h-2.5 text-slate-950" /></span>}
                </div>
                <p className="text-[11.5px] text-slate-400 leading-snug">{t.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col items-center gap-3">
        <button onClick={build} disabled={selectedList.length === 0}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm px-8 py-3.5 rounded-xl transition-all cursor-pointer ${
            selectedList.length ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-[0_14px_30px_-14px_rgba(34,211,238,0.7)]' : 'bg-[#1e293b] text-slate-500 cursor-not-allowed'}`}>
          {selectedList.length ? `Build my protocol (${selectedList.length})` : 'Add a compound to continue'}
          {selectedList.length > 0 && <ChevronRight className="w-4 h-4" />}
        </button>
        {onSkipToHome && (
          <button onClick={onSkipToHome} className="text-xs font-semibold text-slate-500 hover:text-slate-300 cursor-pointer">Back to my protocol</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── HOME ─────────────────────────── */
function Home({
  compounds, logs, onLogDose, onUndoDose, onDeleteCompound, onAddMore, onOpenShop, onOpenSettings, onGuide,
}: {
  compounds: Compound[];
  logs: DoseLog[];
  onLogDose: (log: DoseLog) => void;
  onUndoDose: (logId: string) => void;
  onDeleteCompound: (id: string) => void;
  onAddMore: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onGuide: (kind: 'mix' | 'inject', comp: Compound) => void;
}) {
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const today = todayStr();

  const undoToday = (c: Compound) => {
    const log = logs.find(l => l.compoundId === c.id && l.date === today);
    if (log) { triggerHaptic('warning'); onUndoDose(log.id); }
  };
  const dueToday = compounds.filter(c => getDoseScheduleForDate(c, today).isDue);
  const isLogged = (c: Compound) => logs.some(l => l.compoundId === c.id && l.date === today);

  const quickLog = (c: Compound) => {
    triggerHaptic('success');
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const units = syringeUnits(c);
    onLogDose({
      id: crypto.randomUUID(),
      compoundId: c.id,
      compoundName: c.name,
      date: today,
      time,
      doseAmount: c.doseAmount,
      doseUnit: c.doseUnit,
      reconstitutedRatio: c.vialSizeMg && c.bacWaterMl && units != null
        ? { vialSizeMg: c.vialSizeMg, bacWaterMl: c.bacWaterMl, syringeUnits: units } : undefined,
    });
  };

  const remaining = dueToday.filter(c => !isLogged(c)).length;

  if (compounds.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={onOpenShop} title="Store" className="p-2.5 rounded-xl bg-[#0f172a]/60 border border-[#1e293b] text-slate-400 hover:text-cyan-300 transition cursor-pointer"><ShoppingBag className="w-4 h-4" /></button>
          <button onClick={onOpenSettings} title="Settings" className="p-2.5 rounded-xl bg-[#0f172a]/60 border border-[#1e293b] text-slate-400 hover:text-cyan-300 transition cursor-pointer"><SettingsIcon className="w-4 h-4" /></button>
        </div>
        <div className="bg-[#0b1222] border border-[#1e293b]/80 rounded-2xl px-6 py-12 text-center flex flex-col items-center gap-4">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/12 text-cyan-400"><Sparkles className="w-7 h-7" /></span>
          <div>
            <h1 className="text-xl font-black tracking-tight">Let's start your protocol</h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xs mx-auto">Add a peptide you have on hand and we'll build the doses, schedule and how-to for you.</p>
          </div>
          <button onClick={onAddMore}
            className="flex items-center gap-2 font-black uppercase tracking-wider text-sm px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-[0_14px_30px_-14px_rgba(34,211,238,0.7)] transition cursor-pointer">
            <Plus className="w-4 h-4" /> Add peptide
          </button>
          <button onClick={onOpenShop} className="text-xs font-semibold text-slate-500 hover:text-cyan-300 transition cursor-pointer">Don't have any yet? Browse the store →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-cyan-400">Your protocol</span>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            {remaining === 0 ? "You're all caught up 🎉" : `${remaining} dose${remaining === 1 ? '' : 's'} to go today`}
          </h1>
        </div>
        <div className="flex gap-1.5">
          <button onClick={onOpenShop} title="Store" className="p-2.5 rounded-xl bg-[#0f172a]/60 border border-[#1e293b] text-slate-400 hover:text-cyan-300 transition cursor-pointer"><ShoppingBag className="w-4 h-4" /></button>
          <button onClick={onOpenSettings} title="Settings" className="p-2.5 rounded-xl bg-[#0f172a]/60 border border-[#1e293b] text-slate-400 hover:text-cyan-300 transition cursor-pointer"><SettingsIcon className="w-4 h-4" /></button>
        </div>
      </div>

      {/* today */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          <CalendarCheck className="w-4 h-4 text-cyan-400" /> Today
        </h2>
        {dueToday.length === 0 ? (
          <div className="bg-[#0b1222] border border-[#1e293b]/80 rounded-2xl p-6 text-center text-sm text-slate-400">Nothing scheduled for today. Enjoy the rest day.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {dueToday.map(c => {
              const logged = isLogged(c);
              const units = syringeUnits(c);
              return (
                <div key={c.id} className="bg-[#0b1222] border border-[#1e293b]/80 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[15px] text-slate-100 truncate flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />{c.name}
                      </p>
                      <p className="text-[12.5px] text-slate-400 mt-0.5">
                        {c.doseAmount} {c.doseUnit}{units != null ? ` · draw ${units} units` : ''}
                      </p>
                    </div>
                    {logged ? (
                      <button onClick={() => undoToday(c)} title="Tap to undo"
                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-black uppercase tracking-wide bg-emerald-500/15 text-emerald-400 hover:bg-rose-500/15 hover:text-rose-300 transition cursor-pointer group">
                        <Check className="w-4 h-4 group-hover:hidden" />
                        <RotateCcw className="w-4 h-4 hidden group-hover:inline" />
                        <span className="group-hover:hidden">Done</span>
                        <span className="hidden group-hover:inline">Undo</span>
                      </button>
                    ) : (
                      <button onClick={() => quickLog(c)}
                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-black uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 transition cursor-pointer">
                        Log dose
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {c.type === 'peptide' && (
                      <button onClick={() => onGuide('mix', c)} className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold text-cyan-300 bg-cyan-500/8 hover:bg-cyan-500/15 border border-cyan-500/20 py-2 rounded-lg transition cursor-pointer">
                        <Droplets className="w-3.5 h-3.5" /> How to mix
                      </button>
                    )}
                    <button onClick={() => onGuide('inject', c)} className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold text-indigo-300 bg-indigo-500/8 hover:bg-indigo-500/15 border border-indigo-500/20 py-2 rounded-lg transition cursor-pointer">
                      <SyringeIcon className="w-3.5 h-3.5" /> How to inject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* simple compound list — plain English, no jargon */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          <GraduationCap className="w-4 h-4 text-cyan-400" /> Your compounds
        </h2>
        <div className="flex flex-col gap-2">
          {compounds.map(c => (
            <div key={c.id} className="bg-[#0b1222] border border-[#1e293b]/80 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <p className="font-bold text-[14px] text-slate-100 flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="truncate">{c.name}</span>
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-[12.5px] text-slate-400">{c.doseAmount} {c.doseUnit} · {FREQ_LABEL[c.frequency] || c.frequency}</p>
                {confirmDel === c.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { triggerHaptic('warning'); onDeleteCompound(c.id); setConfirmDel(null); }}
                      className="text-[11px] font-black uppercase tracking-wide text-white bg-rose-500 hover:bg-rose-400 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      Remove
                    </button>
                    <button onClick={() => setConfirmDel(null)} className="text-[11px] font-bold text-slate-400 hover:text-slate-200 px-1.5 py-1 cursor-pointer">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { triggerHaptic('light'); setConfirmDel(c.id); }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    aria-label={`Remove ${c.name}`}
                    title="Remove from cycle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onAddMore}
          className="mt-3 w-full flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-[0_14px_30px_-14px_rgba(34,211,238,0.7)] transition cursor-pointer">
          <Plus className="w-5 h-5" /> Add peptide
        </button>
      </section>

      <p className="text-center font-mono text-[10px] tracking-[0.14em] uppercase text-slate-600">Research use only · Not medical advice</p>
    </div>
  );
}
