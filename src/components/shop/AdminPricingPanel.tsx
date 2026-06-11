import { useState, useMemo, useEffect, useRef } from 'react';
import { SAMPLE_INVENTORY } from '../../data/shopInventory';
import {
  getKitWholesaleCost,
  getChineseKitWholesaleCost,
  getChineseUsWarehouseCost,
} from '../../lib/shopHelpers';
import { usePricingConfig, savePricingConfig, DEFAULT_PRICING } from '../../lib/pricingConfig';
import type { PriceOverride } from '../../lib/pricingConfig';

type FilterMode = 'all' | 'norway' | 'china' | 'both';

function pctOf(sell: number | null, cost: number | null): number | null {
  if (!sell || !cost) return null;
  return Math.round(((sell - cost) / cost) * 100);
}
function marginColor(p: number | null) {
  if (p === null) return 'text-slate-600';
  if (p >= 60) return 'text-emerald-400';
  if (p >= 30) return 'text-amber-400';
  if (p >= 0)  return 'text-orange-400';
  return 'text-red-400';
}

// ── Markup Slider Card ─────────────────────────────────────────────────────
function MarkupCard({
  flag, label, value, accent, max, step = 1,
  onChange,
}: {
  flag: string; label: string; value: number; accent: string;
  max: number; step?: number; onChange: (v: number) => void;
}) {
  const accentMap: Record<string, { text: string; border: string; track: string }> = {
    blue:   { text: 'text-blue-300',    border: 'border-blue-500/25',   track: '#60a5fa' },
    orange: { text: 'text-orange-300',  border: 'border-orange-500/25', track: '#fb923c' },
    emerald:{ text: 'text-emerald-300', border: 'border-emerald-500/25',track: '#34d399' },
  };
  const c = accentMap[accent] ?? accentMap.blue;
  return (
    <div className={`flex-1 min-w-[140px] bg-slate-900/70 border ${c.border} rounded-xl p-3 flex flex-col gap-2.5`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
          {flag}<br/>{label}
        </span>
        <div className={`flex items-center gap-1 bg-slate-800/80 rounded-lg px-2 py-1 border ${c.border}`}>
          <input
            type="number"
            value={value}
            step={step}
            min={0}
            max={max}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            className={`w-12 bg-transparent text-base font-black text-right focus:outline-none ${c.text}`}
          />
          <span className="text-[10px] text-slate-500 font-bold">%</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700/80"
        style={{ accentColor: c.track }}
      />
      <div className="flex justify-between text-[9px] text-slate-600">
        <span>×{(1 + value / 100).toFixed(3)}</span>
        <span className="text-slate-700">max {max}%</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminPricingPanel() {
  const savedConfig = usePricingConfig();
  const initialized = useRef(false);

  const [norKitPct,     setNorKitPct]     = useState(DEFAULT_PRICING.markups.norKitPct);
  const [chnKitPct,     setChnKitPct]     = useState(DEFAULT_PRICING.markups.chnKitPct);
  const [chnVialUSPct,  setChnVialUSPct]  = useState(DEFAULT_PRICING.markups.chnVialUSPct);
  const [chnVialDirPct, setChnVialDirPct] = useState(DEFAULT_PRICING.markups.chnVialDirPct);
  const [overrides,     setOverrides]     = useState<Record<string, PriceOverride>>({});
  const [filter,        setFilter]        = useState<FilterMode>('all');
  const [search,        setSearch]        = useState('');
  const [editing,       setEditing]       = useState<{ key: string; field: keyof PriceOverride } | null>(null);
  const [editVal,       setEditVal]       = useState('');
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [saveError,     setSaveError]     = useState('');
  const [dirty,         setDirty]         = useState(false);

  // Restore any unsaved draft from localStorage (runs before Firestore loads)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('labrat_pricing_draft');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.overrides && Object.keys(parsed.overrides).length > 0) {
        setOverrides(parsed.overrides);
        if (parsed.markups) {
          if (parsed.markups.norKitPct    !== undefined) setNorKitPct(parsed.markups.norKitPct);
          if (parsed.markups.chnKitPct    !== undefined) setChnKitPct(parsed.markups.chnKitPct);
          if (parsed.markups.chnVialUSPct  !== undefined) setChnVialUSPct(parsed.markups.chnVialUSPct);
          if (parsed.markups.chnVialDirPct !== undefined) setChnVialDirPct(parsed.markups.chnVialDirPct);
        }
        initialized.current = true;
        setDirty(true);
      }
    } catch (e) {
      console.warn('[pricing] Could not restore unsaved pricing draft:', e);
    }
  }, []);

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    if (!dirty) return;
    localStorage.setItem('labrat_pricing_draft', JSON.stringify({
      markups: { norKitPct, chnKitPct, chnVialUSPct, chnVialDirPct },
      overrides,
    }));
  }, [overrides, norKitPct, chnKitPct, chnVialUSPct, chnVialDirPct, dirty]);

  // Load saved config from Firestore (skipped if localStorage draft was found)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const { markups, overrides: o } = savedConfig;
    setNorKitPct(markups.norKitPct);
    setChnKitPct(markups.chnKitPct);
    setChnVialUSPct(markups.chnVialUSPct);
    setChnVialDirPct(markups.chnVialDirPct);
    setOverrides(o);
  }, [savedConfig]);

  function change(setter: (v: number) => void, v: number) {
    setter(v);
    setDirty(true);
    setSaved(false);
  }

  // Compute all prices for a product
  function compute(name: string, listPrice: number) {
    const norW = getKitWholesaleCost(name) || null;
    const usW  = getChineseUsWarehouseCost(name) || null;
    const chnW = usW || (getChineseKitWholesaleCost(name) || null);
    return {
      norW, usW, chnW,
      norKit:  norW  ? Math.round(norW  * (1 + norKitPct  / 100)) : null,
      norVial: listPrice || null,
      chnKit:  chnW  ? Math.round(chnW  * (1 + chnKitPct  / 100)) : null,
      chnVial: usW
        ? Math.round((usW  / 10) * (1 + chnVialUSPct  / 100))
        : chnW ? Math.round((chnW / 10) * (1 + chnVialDirPct / 100)) : null,
    };
  }

  function eff(key: string, field: keyof PriceOverride, comp: number | null) {
    return overrides[key]?.[field] ?? comp;
  }

  function startEdit(key: string, field: keyof PriceOverride, val: number | null) {
    setEditing({ key, field });
    setEditVal(val !== null ? String(val) : '');
  }

  function commitEdit() {
    if (!editing) return;
    const n = parseInt(editVal);
    if (!isNaN(n) && n > 0) {
      setOverrides(prev => ({
        ...prev,
        [editing.key]: { ...(prev[editing.key] || {}), [editing.field]: n },
      }));
      setDirty(true);
      setSaved(false);
    }
    setEditing(null);
  }

  function clearOverride(key: string, field: keyof PriceOverride) {
    setOverrides(prev => {
      const copy = { ...prev };
      if (copy[key]) {
        const o = { ...copy[key] };
        delete o[field];
        if (!Object.keys(o).length) delete copy[key];
        else copy[key] = o;
      }
      return copy;
    });
    setDirty(true);
    setSaved(false);
  }

  function resetAll() {
    setOverrides({});
    setNorKitPct(DEFAULT_PRICING.markups.norKitPct);
    setChnKitPct(DEFAULT_PRICING.markups.chnKitPct);
    setChnVialUSPct(DEFAULT_PRICING.markups.chnVialUSPct);
    setChnVialDirPct(DEFAULT_PRICING.markups.chnVialDirPct);
    setDirty(false);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      await savePricingConfig({ markups: { norKitPct, chnKitPct, chnVialUSPct, chnVialDirPct }, overrides });
      localStorage.removeItem('labrat_pricing_draft');
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  const overrideCount = Object.keys(overrides).length;

  function handleExport() {
    const data = JSON.stringify({ markups: { norKitPct, chnKitPct, chnVialUSPct, chnVialDirPct }, overrides }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pricing-backup.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed.overrides) { setOverrides(parsed.overrides); setDirty(true); setSaved(false); }
          if (parsed.markups) {
            if (parsed.markups.norKitPct    !== undefined) setNorKitPct(parsed.markups.norKitPct);
            if (parsed.markups.chnKitPct    !== undefined) setChnKitPct(parsed.markups.chnKitPct);
            if (parsed.markups.chnVialUSPct  !== undefined) setChnVialUSPct(parsed.markups.chnVialUSPct);
            if (parsed.markups.chnVialDirPct !== undefined) setChnVialDirPct(parsed.markups.chnVialDirPct);
          }
        } catch { setSaveError('Import failed: invalid JSON'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  const visibleProducts = useMemo(() => {
    const q = search.toLowerCase();
    return SAMPLE_INVENTORY.filter(p => {
      const src = p.sourceRestriction || 'neither';
      if (filter === 'norway' && src !== 'norway') return false;
      if (filter === 'china'  && src !== 'china')  return false;
      if (filter === 'both'   && src !== 'norway' && src !== 'china') return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, search]);

  type Groups = Record<string, typeof SAMPLE_INVENTORY>;
  const grouped = useMemo<Groups>(() => {
    const map: Groups = {};
    for (const p of visibleProducts) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }, [visibleProducts]);

  // ── Price cell ───────────────────────────────────────────────────────────
  function PriceCell({
    pk, field, comp, cost, isVial, dim,
  }: {
    pk: string; field: keyof PriceOverride; comp: number | null;
    cost: number | null; isVial: boolean; dim?: boolean;
  }) {
    const effective   = eff(pk, field, comp);
    const isOverride  = overrides[pk]?.[field] !== undefined;
    const isActive    = editing?.key === pk && editing?.field === field;
    const costForPct  = isVial ? (cost ? cost / 10 : null) : cost;
    const margin      = pctOf(effective, costForPct);

    if (dim) return <td className="px-3 py-3 bg-slate-950/20" />;
    if (effective === null) return (
      <td className="px-3 py-3 text-center text-slate-800 text-xs select-none">—</td>
    );

    if (isActive) return (
      <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          type="number"
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(null);
          }}
          className="w-20 bg-slate-900 border-2 border-cyan-400 text-cyan-200 text-sm font-mono rounded-lg px-2 py-1.5 text-right focus:outline-none shadow-[0_0_8px_rgba(6,182,212,0.3)]"
        />
      </td>
    );

    return (
      <td
        className="px-3 py-3 cursor-pointer transition-all hover:bg-slate-700/30 group/cell"
        onClick={() => startEdit(pk, field, effective)}
        onContextMenu={e => { e.preventDefault(); if (isOverride) clearOverride(pk, field); }}
        title={isOverride ? 'Right-click to restore computed price' : 'Click to set custom price'}
      >
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1">
            {isOverride
              ? <span className="text-[8px] text-cyan-500/70 group-hover/cell:text-cyan-400 transition-colors">✎</span>
              : <span className="text-[8px] text-slate-700 group-hover/cell:text-slate-500 transition-colors">✎</span>
            }
            <span className={`text-sm font-black font-mono tracking-tight leading-none ${
              isOverride ? 'text-cyan-300' : 'text-slate-200 group-hover/cell:text-white'
            }`}>
              ${effective}
            </span>
          </div>
          {margin !== null && (
            <span className={`text-[9px] font-bold ${marginColor(margin)}`}>+{margin}%</span>
          )}
        </div>
      </td>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-base font-black text-white tracking-tight">Pricing Manager</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Click any sell price cell to override · Right-click an overridden cell to restore · Changes go live on Save
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {overrideCount > 0 && (
            <div className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1.5 rounded-full font-bold">
              {overrideCount} override{overrideCount !== 1 ? 's' : ''}
            </div>
          )}
          {dirty && !saved && (
            <span className="text-[10px] text-amber-400 font-semibold">● Unsaved changes</span>
          )}
          <button
            onClick={handleImport}
            className="px-3 py-1.5 text-[10px] font-bold border border-slate-700 text-slate-400 rounded-lg hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
          >
            ↓ Import
          </button>
          {overrideCount > 0 && (
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-[10px] font-bold border border-slate-700 text-slate-400 rounded-lg hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
            >
              ↑ Export
            </button>
          )}
          {overrideCount > 0 && (
            <button
              onClick={resetAll}
              className="px-3 py-1.5 text-[10px] font-bold border border-slate-700 text-slate-400 rounded-lg hover:text-red-400 hover:border-red-500/40 transition-all"
            >
              Reset All
            </button>
          )}
          {saveError && <span className="text-[10px] text-red-400 font-semibold">{saveError}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : saving
                ? 'bg-slate-700 text-slate-400 cursor-wait'
                : dirty
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_16px_rgba(6,182,212,0.35)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {saved ? '✓ Saved to Database' : saving ? 'Saving…' : '↑ Save Pricing'}
          </button>
        </div>
      </div>

      {/* ── Markup cards ────────────────────────────────────────────────── */}
      <div className="flex gap-2.5 flex-wrap">
        <MarkupCard flag="🇳🇴" label="Kit Markup" value={norKitPct} accent="blue"
          max={150} step={0.5} onChange={v => change(setNorKitPct, v)} />
        <MarkupCard flag="🇨🇳" label="Kit Markup" value={chnKitPct} accent="orange"
          max={300} onChange={v => change(setChnKitPct, v)} />
        <MarkupCard flag="🇺🇸" label="Vial Markup" value={chnVialUSPct} accent="emerald"
          max={500} onChange={v => change(setChnVialUSPct, v)} />
        <MarkupCard flag="🇨🇳" label="Vial Markup" value={chnVialDirPct} accent="orange"
          max={500} onChange={v => change(setChnVialDirPct, v)} />
      </div>

      {/* ── Filter + search ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all','norway','china','both'] as FilterMode[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-all ${
              filter === f
                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                : 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
            }`}>
            {f === 'all' ? 'All Products' : f === 'norway' ? '🇳🇴 Norway Only' : f === 'china' ? '🇨🇳 China Only' : '🌐 Both Sources'}
          </button>
        ))}
        <div className="flex-1 relative min-w-[180px]">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/60 placeholder:text-slate-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <span className="text-[10px] text-slate-600 font-mono">{visibleProducts.length} products</span>
      </div>

      {/* ── Table — explicit overflow-auto + max-height so sticky headers work ── */}
      <div className="overflow-auto rounded-xl border border-slate-800/80" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <table
          className="w-full text-xs"
          style={{ minWidth: 840, borderCollapse: 'separate', borderSpacing: 0 }}
        >
          {/* Two-row sticky header */}
          <thead>
            {/* Row 1 — group labels */}
            <tr>
              <th
                colSpan={2}
                className="sticky top-0 left-0 z-30 bg-[#0c1322] border-b border-r border-slate-800 px-4 py-2.5 text-left"
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Product</span>
              </th>
              <th
                colSpan={3}
                className="sticky top-0 z-20 bg-[#071829] border-b border-r border-slate-700/50 px-4 py-2.5 text-center"
              >
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">🇳🇴 Norway</span>
              </th>
              <th
                colSpan={3}
                className="sticky top-0 z-20 bg-[#1c0d00] border-b border-slate-700/50 px-4 py-2.5 text-center"
              >
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">🇨🇳 China</span>
              </th>
            </tr>
            {/* Row 2 — column labels */}
            <tr>
              {/* Product name — sticky left */}
              <th
                className="sticky top-[37px] left-0 z-30 bg-[#0c1322] border-b border-r border-slate-800 px-4 py-3 text-left text-[9px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ minWidth: 200 }}
              >
                Name
              </th>
              {/* Source — sticky */}
              <th
                className="sticky top-[37px] z-20 bg-[#0c1322] border-b border-r border-slate-800/70 px-3 py-3 text-center text-[9px] text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ left: 200 }}
              >
                Src
              </th>
              {/* Norway group */}
              <th className="sticky top-[37px] z-10 bg-[#071829] border-b border-slate-700/40 px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                <span className="text-amber-500/60">Wholesale</span>
                <div className="text-[8px] text-slate-600 font-normal normal-case mt-0.5">kit 10×</div>
              </th>
              <th className="sticky top-[37px] z-10 bg-[#071829] border-b border-slate-700/40 px-4 py-3 text-right whitespace-nowrap">
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">Kit Sell</span>
                <div className="text-[8px] text-blue-400/50 font-normal normal-case mt-0.5">10 vials · editable</div>
              </th>
              <th className="sticky top-[37px] z-10 bg-[#071829] border-b border-r border-slate-700/40 px-4 py-3 text-right whitespace-nowrap">
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">Vial List</span>
                <div className="text-[8px] text-blue-400/50 font-normal normal-case mt-0.5">per vial · editable</div>
              </th>
              {/* China group */}
              <th className="sticky top-[37px] z-10 bg-[#1c0d00] border-b border-slate-700/40 px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                <span className="text-amber-500/60">Wholesale</span>
                <div className="text-[8px] text-slate-600 font-normal normal-case mt-0.5">kit 10×</div>
              </th>
              <th className="sticky top-[37px] z-10 bg-[#1c0d00] border-b border-slate-700/40 px-4 py-3 text-right whitespace-nowrap">
                <span className="text-[9px] font-bold text-orange-300 uppercase tracking-wider">Kit Sell</span>
                <div className="text-[8px] text-orange-400/50 font-normal normal-case mt-0.5">10 vials · editable</div>
              </th>
              <th className="sticky top-[37px] z-10 bg-[#1c0d00] border-b border-slate-700/40 px-4 py-3 text-right whitespace-nowrap">
                <span className="text-[9px] font-bold text-orange-300 uppercase tracking-wider">Vial Sell</span>
                <div className="text-[8px] text-orange-400/50 font-normal normal-case mt-0.5">per vial · editable</div>
              </th>
            </tr>
          </thead>

          <tbody>
            {(Object.entries(grouped) as [string, typeof SAMPLE_INVENTORY][]).map(([cat, products]) => (
              <>
                {/* Category header row */}
                <tr key={`cat-${cat}`}>
                  <td colSpan={8} className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                  </td>
                </tr>
                {products.map(p => {
                  const c = compute(p.name, p.price);
                  const pk = p.name;
                  const src = p.sourceRestriction || 'neither';
                  const isNorway = src === 'norway';
                  const isChina  = src === 'china';

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-800/20 hover:bg-slate-800/15 transition-colors group/row"
                    >
                      {/* Product name — sticky left */}
                      <td
                        className="sticky left-0 z-10 bg-[#070d1a] group-hover/row:bg-[#0c1628] transition-colors border-r border-slate-800/40 px-4 py-3"
                        style={{ minWidth: 200 }}
                      >
                        <div className="text-slate-200 font-semibold text-xs leading-tight">
                          {p.name.replace(/ \(.*?\)$/, '')}
                        </div>
                        {p.name.match(/\(([^)]+)\)$/) && (
                          <div className="text-slate-500 text-[9px] font-mono mt-0.5">
                            {p.name.match(/\(([^)]+)\)$/)?.[1]}
                          </div>
                        )}
                      </td>
                      {/* Source badge — sticky */}
                      <td
                        className="sticky z-10 bg-[#070d1a] group-hover/row:bg-[#0c1628] transition-colors border-r border-slate-800/30 px-3 py-3 text-center"
                        style={{ left: 200 }}
                      >
                        {isNorway ? (
                          <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md font-bold">🇳🇴</span>
                        ) : isChina ? (
                          <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md font-bold">🇨🇳</span>
                        ) : (
                          <span className="text-slate-700 text-[9px]">—</span>
                        )}
                      </td>
                      {/* Norway wholesale (readonly) */}
                      <td className={`px-4 py-3 text-right ${isChina ? 'opacity-10' : ''}`}>
                        {c.norW
                          ? <span className="text-xs font-mono text-amber-400/70 font-semibold">${c.norW}</span>
                          : <span className="text-slate-800 text-xs">—</span>
                        }
                      </td>
                      {/* Norway Kit Sell */}
                      <PriceCell pk={pk} field="norKit"  comp={c.norKit}  cost={c.norW} isVial={false} dim={isChina}  />
                      {/* Norway Vial List */}
                      <PriceCell pk={pk} field="norVial" comp={c.norVial} cost={c.norW} isVial={true}  dim={isChina}  />
                      {/* China wholesale (readonly) */}
                      <td className={`px-4 py-3 text-right ${isNorway ? 'opacity-10' : ''}`}>
                        {c.chnW ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs font-mono text-amber-400/70 font-semibold">${c.chnW}</span>
                            {c.usW && <span className="text-[8px] text-emerald-400 font-bold">🇺🇸 US stock</span>}
                          </div>
                        ) : <span className="text-slate-800 text-xs">—</span>}
                      </td>
                      {/* China Kit Sell */}
                      <PriceCell pk={pk} field="chnKit"  comp={c.chnKit}  cost={c.chnW} isVial={false} dim={isNorway} />
                      {/* China Vial Sell */}
                      <PriceCell pk={pk} field="chnVial" comp={c.chnVial} cost={c.chnW} isVial={true}  dim={isNorway} />
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>

        {visibleProducts.length === 0 && (
          <div className="text-center text-slate-600 py-16 text-sm">No products match the current filter</div>
        )}
      </div>
    </div>
  );
}
