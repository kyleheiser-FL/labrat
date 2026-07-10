import { useState, useMemo, useEffect, useRef } from 'react';
import { SAMPLE_INVENTORY } from '../../data/shopInventory';
import { fetchWholesaleBook, type WholesaleBook } from '../../lib/wholesale';
import { usePricingConfig, savePricingConfig, DEFAULT_PRICING } from '../../lib/pricingConfig';
import type { PriceOverride, PricingMarkups } from '../../lib/pricingConfig';

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

// ── Main component ─────────────────────────────────────────────────────────
// Single customer price list: every product is sold as one individual vial.
// Customer price = supply (kit) cost ÷ 10 × markup. Admins can override any
// single price. Kit/Norway/US tiers are retired — there is one list now.
export default function AdminPricingPanel() {
  const savedConfig = usePricingConfig();

  const [vialPct,   setVialPct]   = useState(DEFAULT_PRICING.markups.chnVialDirPct);
  // Retained (not shown) so the saved config keeps working server-side.
  const otherMarkups = useRef<Omit<PricingMarkups, 'chnVialDirPct'>>({
    norKitPct: DEFAULT_PRICING.markups.norKitPct,
    norVialPct: DEFAULT_PRICING.markups.norVialPct,
    chnKitPct: DEFAULT_PRICING.markups.chnKitPct,
    chnVialUSPct: DEFAULT_PRICING.markups.chnVialUSPct,
  });

  const [overrides, setOverrides] = useState<Record<string, PriceOverride>>({});
  const [search,    setSearch]    = useState('');
  const [editing,   setEditing]   = useState<string | null>(null);
  const [editVal,   setEditVal]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [dirty,     setDirty]     = useState(false);
  const [wholesale, setWholesale] = useState<WholesaleBook>({});

  useEffect(() => {
    fetchWholesaleBook()
      .then(setWholesale)
      .catch(e => console.error('[pricing] Failed to load wholesale costs:', e));
  }, []);

  // Recover any unsaved draft first — survives the Firestore load race and
  // brings back in-progress pricing if the page reloaded mid-edit.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('labrat_pricing_draft');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.overrides && Object.keys(parsed.overrides).length > 0) {
        setOverrides(parsed.overrides);
        if (parsed.markups?.chnVialDirPct !== undefined) setVialPct(parsed.markups.chnVialDirPct);
        if (parsed.markups) otherMarkups.current = { ...otherMarkups.current, ...parsed.markups };
        setDirty(true);
      }
    } catch { /* ignore corrupt draft */ }
  }, []);

  // Sync from the saved Firestore config whenever there are NO unsaved edits.
  // Runs on every savedConfig change (not once) so the real config always wins
  // over the initial defaults — and never clobbers the admin's live edits.
  useEffect(() => {
    if (dirty) return;
    const markups = { ...DEFAULT_PRICING.markups, ...(savedConfig.markups || {}) };
    const o = savedConfig.overrides || {};
    setVialPct(markups.chnVialDirPct);
    otherMarkups.current = {
      norKitPct: markups.norKitPct,
      norVialPct: markups.norVialPct,
      chnKitPct: markups.chnKitPct,
      chnVialUSPct: markups.chnVialUSPct,
    };
    setOverrides(o);
  }, [savedConfig, dirty]);

  // Persist unsaved edits locally so a reload/crash can't lose pricing work.
  useEffect(() => {
    if (!dirty) return;
    try {
      localStorage.setItem('labrat_pricing_draft', JSON.stringify({ markups: buildMarkups(), overrides }));
    } catch { /* storage full / blocked */ }
  }, [overrides, vialPct, dirty]);

  function buildMarkups(): PricingMarkups {
    return { ...otherMarkups.current, chnVialDirPct: vialPct };
  }

  // Customer per-vial price for a product
  function compute(name: string, listPrice: number) {
    const w = wholesale[name];
    const usW = w?.usW || null;
    const chnW = usW || (w?.chnW || null);
    const pct = usW ? (otherMarkups.current.chnVialUSPct ?? vialPct) : vialPct;
    const cost = chnW;
    const price = cost ? Math.round((cost / 10) * (1 + pct / 100)) : (listPrice || null);
    return { cost, price };
  }

  function startEdit(key: string, val: number | null) {
    setEditing(key);
    setEditVal(val !== null ? String(val) : '');
  }
  function commitEdit() {
    if (!editing) return;
    const n = parseInt(editVal);
    if (!isNaN(n) && n > 0) {
      setOverrides(prev => ({ ...prev, [editing]: { ...(prev[editing] || {}), chnVial: n } }));
      setDirty(true); setSaved(false);
    }
    setEditing(null);
  }
  function clearOverride(key: string) {
    setOverrides(prev => {
      const copy = { ...prev };
      if (copy[key]) {
        const o = { ...copy[key] };
        delete o.chnVial;
        if (!Object.keys(o).length) delete copy[key]; else copy[key] = o;
      }
      return copy;
    });
    setDirty(true); setSaved(false);
  }

  function resetAll() {
    setOverrides({});
    setVialPct(DEFAULT_PRICING.markups.chnVialDirPct);
    setDirty(true); setSaved(false);
  }

  async function handleSave() {
    setSaving(true); setSaveError('');
    try {
      await savePricingConfig({ markups: buildMarkups(), overrides });
      try { localStorage.removeItem('labrat_pricing_draft'); } catch { /* ignore */ }
      setSaved(true); setDirty(false);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      setSaveError(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  const overrideCount = Object.keys(overrides).filter(k => overrides[k]?.chnVial !== undefined).length;

  const visibleProducts = useMemo(() => {
    const q = search.toLowerCase();
    return SAMPLE_INVENTORY.filter(p => !q || p.name.toLowerCase().includes(q));
  }, [search]);

  type Groups = Record<string, typeof SAMPLE_INVENTORY>;
  const grouped = useMemo<Groups>(() => {
    const map: Groups = {};
    for (const p of visibleProducts) {
      (map[p.category] ||= []).push(p);
    }
    return map;
  }, [visibleProducts]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-base font-black text-white tracking-tight">Pricing Manager</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            One customer price per product · Click a price to set a custom value · Right-click to restore · Changes go live on Save
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {overrideCount > 0 && (
            <div className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1.5 rounded-full font-bold">
              {overrideCount} custom price{overrideCount !== 1 ? 's' : ''}
            </div>
          )}
          {dirty && !saved && <span className="text-[10px] text-amber-400 font-semibold">● Unsaved changes</span>}
          {overrideCount > 0 && (
            <button onClick={resetAll}
              className="px-3 py-1.5 text-[10px] font-bold border border-slate-700 text-slate-400 rounded-lg hover:text-red-400 hover:border-red-500/40 transition-all">
              Reset All
            </button>
          )}
          {saveError && <span className="text-[10px] text-red-400 font-semibold">{saveError}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              saved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : saving ? 'bg-slate-700 text-slate-400 cursor-wait'
              : dirty ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_16px_rgba(6,182,212,0.35)]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {saved ? '✓ Saved' : saving ? 'Saving…' : '↑ Save Pricing'}
          </button>
        </div>
      </div>

      {/* Single markup control */}
      <div className="bg-slate-900/70 border border-cyan-500/20 rounded-xl p-4 flex flex-col gap-2.5 max-w-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Vial markup on supply cost</span>
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg px-2 py-1 border border-cyan-500/25">
            <input
              type="number" value={vialPct} step={1} min={0} max={500}
              onChange={e => { setVialPct(parseFloat(e.target.value) || 0); setDirty(true); setSaved(false); }}
              className="w-14 bg-transparent text-base font-black text-right focus:outline-none text-cyan-300"
            />
            <span className="text-[10px] text-slate-500 font-bold">%</span>
          </div>
        </div>
        <input
          type="range" min={0} max={500} step={1} value={vialPct}
          onChange={e => { setVialPct(parseFloat(e.target.value)); setDirty(true); setSaved(false); }}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700/80"
          style={{ accentColor: '#22d3ee' }}
        />
        <div className="flex justify-between text-[9px] text-slate-600">
          <span>customer pays ×{(1 + vialPct / 100).toFixed(2)} of per-vial cost</span>
          <span className="text-slate-700">max 500%</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[180px]">
          <input
            type="text" placeholder="Search products…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/60 placeholder:text-slate-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">✕</button>
          )}
        </div>
        <span className="text-[10px] text-slate-600 font-mono">{visibleProducts.length} products</span>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-slate-800/80" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <table className="w-full text-xs" style={{ minWidth: 340, borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-30 bg-[#0c1322] border-b border-r border-slate-800 px-2.5 py-3 text-left text-[9px] text-slate-400 font-semibold uppercase tracking-wider" style={{ minWidth: 116 }}>
                Product
              </th>
              <th className="sticky top-0 z-10 bg-[#0c1322] border-b border-slate-800 px-2.5 py-3 text-right text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                <span className="text-amber-500/60">Supply cost</span>
                <div className="text-[8px] text-slate-600 font-normal normal-case mt-0.5">kit &amp; per-vial</div>
              </th>
              <th className="sticky top-0 z-10 bg-[#0c1322] border-b border-slate-800 px-2.5 py-3 text-right whitespace-nowrap">
                <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">Customer</span>
                <div className="text-[8px] text-cyan-400/50 font-normal normal-case mt-0.5">per vial · tap to edit</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(grouped) as [string, typeof SAMPLE_INVENTORY][]).map(([cat, products]) => (
              <>
                <tr key={`cat-${cat}`}>
                  <td colSpan={3} className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                  </td>
                </tr>
                {products.map(p => {
                  const c = compute(p.name, p.price);
                  const pk = p.name;
                  const override = overrides[pk]?.chnVial;
                  const effective = override ?? c.price;
                  const isOverride = override !== undefined;
                  const isActive = editing === pk;
                  const margin = pctOf(effective, c.cost ? c.cost / 10 : null);

                  return (
                    <tr key={p.id} className="border-b border-slate-800/20 hover:bg-slate-800/15 transition-colors group/row">
                      <td className="sticky left-0 z-10 bg-[#070d1a] group-hover/row:bg-[#0c1628] transition-colors border-r border-slate-800/40 px-2.5 py-3" style={{ minWidth: 116 }}>
                        <div className="text-slate-200 font-semibold text-[11px] leading-tight">{p.name.replace(/ \(.*?\)$/, '')}</div>
                        {p.name.match(/\(([^)]+)\)$/) && (
                          <div className="text-slate-500 text-[9px] font-mono mt-0.5">{p.name.match(/\(([^)]+)\)$/)?.[1]}</div>
                        )}
                      </td>
                      <td className="px-2.5 py-3 text-right">
                        {c.cost ? (
                          <div className="flex flex-col items-end leading-tight">
                            <span className="text-xs font-mono text-amber-400/80 font-semibold">${c.cost} <span className="text-[8px] text-slate-500">kit</span></span>
                            <span className="text-[10px] font-mono text-amber-400/40">${(c.cost / 10).toFixed(2)} <span className="text-[8px] text-slate-600">/vial</span></span>
                          </div>
                        ) : <span className="text-slate-800 text-xs">—</span>}
                      </td>
                      {isActive ? (
                        <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus type="number" value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
                            className="w-20 bg-slate-900 border-2 border-cyan-400 text-cyan-200 text-sm font-mono rounded-lg px-2 py-1.5 text-right focus:outline-none shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                          />
                        </td>
                      ) : effective === null ? (
                        <td className="px-3 py-3 text-center text-slate-800 text-xs select-none">—</td>
                      ) : (
                        <td
                          className="px-3 py-3 cursor-pointer transition-all hover:bg-slate-700/30 group/cell"
                          onClick={() => startEdit(pk, effective)}
                          onContextMenu={e => { e.preventDefault(); if (isOverride) clearOverride(pk); }}
                          title={isOverride ? 'Right-click to restore computed price' : 'Click to set custom price'}
                        >
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1">
                              <span className={`text-[8px] transition-colors ${isOverride ? 'text-cyan-500/70 group-hover/cell:text-cyan-400' : 'text-slate-700 group-hover/cell:text-slate-500'}`}>✎</span>
                              <span className={`text-sm font-black font-mono tracking-tight leading-none ${isOverride ? 'text-cyan-300' : 'text-slate-200 group-hover/cell:text-white'}`}>${effective}</span>
                            </div>
                            {margin !== null && <span className={`text-[9px] font-bold ${marginColor(margin)}`}>+{margin}%</span>}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
        {visibleProducts.length === 0 && (
          <div className="text-center text-slate-600 py-16 text-sm">No products match your search</div>
        )}
      </div>
    </div>
  );
}
