import { useState, useMemo } from 'react';
import { SAMPLE_INVENTORY } from '../../data/shopInventory';
import {
  getKitWholesaleCost,
  getChineseKitWholesaleCost,
  getChineseUsWarehouseCost,
  hasUsWarehouseShipping,
} from '../../lib/shopHelpers';

// ─── types ────────────────────────────────────────────────────────────────
interface Markups {
  norKit: number;      // multiplier, e.g. 1.127
  chnKit: number;      // multiplier, e.g. 1.65
  chnVialUS: number;   // multiplier on per-vial US cost
  chnVialDir: number;  // multiplier on per-vial China direct cost
  norSale: number;     // Norway vial list price multiplier (no discount)
}

interface PriceOverride {
  norKit?: number;
  norVial?: number;
  chnKit?: number;
  chnVial?: number;
}

type FilterMode = 'all' | 'norway' | 'china' | 'both';

// ─── helpers ──────────────────────────────────────────────────────────────
function pct(sell: number | null, cost: number | null): number | null {
  if (!sell || !cost) return null;
  return Math.round(((sell - cost) / cost) * 100);
}

function fmt(n: number | null) {
  return n !== null ? `$${n}` : '—';
}

function profitColor(p: number | null): string {
  if (p === null) return 'text-slate-600';
  if (p >= 60) return 'text-emerald-400';
  if (p >= 30) return 'text-amber-400';
  if (p >= 0)  return 'text-orange-400';
  return 'text-red-400';
}

// ─── component ────────────────────────────────────────────────────────────
export default function AdminPricingPanel() {
  const [norKitPct,      setNorKitPct]      = useState(15);
  const [chnKitPct,      setChnKitPct]      = useState(65);
  const [chnVialUSPct,   setChnVialUSPct]   = useState(65);
  const [chnVialDirPct,  setChnVialDirPct]  = useState(65);
  const [overrides,      setOverrides]      = useState<Record<string, PriceOverride>>({});
  const [filter,         setFilter]         = useState<FilterMode>('all');
  const [search,         setSearch]         = useState('');
  const [editing,        setEditing]        = useState<{ key: string; field: keyof PriceOverride } | null>(null);
  const [editVal,        setEditVal]        = useState('');
  const [showExport,     setShowExport]     = useState(false);
  const [copied,         setCopied]         = useState(false);

  const markups: Markups = {
    norKit:    1 + norKitPct / 100,
    chnKit:    1 + chnKitPct / 100,
    chnVialUS: 1 + chnVialUSPct / 100,
    chnVialDir:1 + chnVialDirPct / 100,
    norSale:   1,
  };

  // Compute derived prices for a product
  function prices(name: string, listPrice: number) {
    const norW  = getKitWholesaleCost(name) || null;
    const usW   = getChineseUsWarehouseCost(name) || null;
    const chnW  = usW || (getChineseKitWholesaleCost(name) || null);

    const norKitComp  = norW  ? Math.round(norW  * markups.norKit)    : null;
    const norVialComp = listPrice ? Math.round(listPrice * markups.norSale) : null;
    const chnKitComp  = chnW  ? Math.round(chnW  * markups.chnKit)    : null;
    const chnVialComp = usW
      ? Math.round((usW  / 10) * markups.chnVialUS)
      : chnW ? Math.round((chnW / 10) * markups.chnVialDir) : null;

    return { norW, usW, chnW, norKitComp, norVialComp, chnKitComp, chnVialComp };
  }

  // Effective price: override > computed
  function eff(key: string, field: keyof PriceOverride, computed: number | null): number | null {
    return overrides[key]?.[field] ?? computed;
  }

  function startEdit(key: string, field: keyof PriceOverride, current: number | null) {
    setEditing({ key, field });
    setEditVal(current !== null ? String(current) : '');
  }

  function commitEdit() {
    if (!editing) return;
    const n = parseInt(editVal);
    if (!isNaN(n) && n > 0) {
      setOverrides(prev => ({
        ...prev,
        [editing.key]: { ...(prev[editing.key] || {}), [editing.field]: n },
      }));
    }
    setEditing(null);
  }

  function clearOverride(key: string, field: keyof PriceOverride) {
    setOverrides(prev => {
      const copy = { ...prev };
      if (copy[key]) {
        const o = { ...copy[key] };
        delete o[field];
        if (Object.keys(o).length === 0) delete copy[key];
        else copy[key] = o;
      }
      return copy;
    });
  }

  function resetAll() {
    setOverrides({});
    setNorKitPct(15);
    setChnKitPct(65);
    setChnVialUSPct(65);
    setChnVialDirPct(65);
  }

  const exportJson = useMemo(() => {
    const productChanges = Object.entries(overrides)
      .filter(([, v]) => Object.keys(v).length > 0)
      .map(([k, v]) => ({ product: k, ...v }));

    const out: Record<string, unknown> = {
      generatedAt: new Date().toISOString(),
      markups: {
        norwayKitMarkupPct: norKitPct,
        chinaKitMarkupPct: chnKitPct,
        chinaVialUSMarkupPct: chnVialUSPct,
        chinaVialDirectMarkupPct: chnVialDirPct,
        norwayVialSaleDiscountPct: 0,
      },
    };
    if (productChanges.length > 0) out.productOverrides = productChanges;
    return JSON.stringify(out, null, 2);
  }, [overrides, norKitPct, chnKitPct, chnVialUSPct, chnVialDirPct]);

  function copyExport() {
    navigator.clipboard.writeText(exportJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const modCount = Object.keys(overrides).length;

  // Filter + search products
  const visibleProducts = useMemo(() => {
    const q = search.toLowerCase();
    return SAMPLE_INVENTORY.filter(p => {
      const src = p.sourceRestriction || 'neither';
      if (filter === 'norway' && src !== 'norway') return false;
      if (filter === 'china'  && src !== 'china')  return false;
      if (filter === 'both'   && src !== 'norway' && src !== 'china') return false;
      if (q && !p.name.toLowerCase().includes(q))  return false;
      return true;
    });
  }, [filter, search]);

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, typeof SAMPLE_INVENTORY> = {};
    for (const p of visibleProducts) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }, [visibleProducts]);

  // ─── cell component ───────────────────────────────────────────────────
  function PriceCell({
    productKey, field, computed, cost10, isVialCost, dimmed,
  }: {
    productKey: string;
    field: keyof PriceOverride;
    computed: number | null;
    cost10: number | null;
    isVialCost: boolean;
    dimmed?: boolean;
  }) {
    const effective = eff(productKey, field, computed);
    const isOverridden = overrides[productKey]?.[field] !== undefined;
    const isActive = editing?.key === productKey && editing?.field === field;
    const costForPct = isVialCost ? (cost10 ? cost10 / 10 : null) : cost10;
    const p = pct(effective, costForPct);
    const dimClass = dimmed ? 'opacity-20 pointer-events-none' : '';

    if (effective === null) {
      return <td className={`px-2 py-1.5 text-slate-700 text-center text-xs ${dimClass}`}>—</td>;
    }

    if (isActive) {
      return (
        <td className={`px-1 py-1 ${dimClass}`} onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            type="number"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
            className="w-16 bg-slate-900 border border-cyan-400 text-cyan-300 text-xs rounded px-1.5 py-0.5 text-right focus:outline-none"
          />
        </td>
      );
    }

    return (
      <td
        className={`px-2 py-1.5 text-right cursor-pointer group ${dimClass}`}
        onClick={() => !dimmed && startEdit(productKey, field, effective)}
        onContextMenu={e => { e.preventDefault(); if (isOverridden && !dimmed) clearOverride(productKey, field); }}
      >
        <div className="flex flex-col items-end gap-0">
          <span className={`text-xs font-mono ${isOverridden ? 'text-cyan-300' : 'text-emerald-300'}`}>
            ${effective}{isOverridden && <span className="text-[9px] text-cyan-400 ml-0.5">✎</span>}
          </span>
          {p !== null && (
            <span className={`text-[9px] ${profitColor(p)}`}>+{p}%</span>
          )}
        </div>
      </td>
    );
  }

  // ─── render ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Markup controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-3 flex flex-wrap gap-x-4 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">🇳🇴 Kit Markup</span>
          <div className="flex items-center gap-1">
            <input type="number" value={norKitPct} step="0.1" min="0" max="100"
              onChange={e => setNorKitPct(parseFloat(e.target.value) || 0)}
              className="w-14 bg-slate-800 border border-slate-700 text-cyan-300 text-xs rounded px-1.5 py-0.5 text-right focus:outline-none focus:border-cyan-500" />
            <span className="text-[10px] text-slate-500">%</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">🇨🇳 Kit Markup</span>
          <div className="flex items-center gap-1">
            <input type="number" value={chnKitPct} step="1" min="0" max="300"
              onChange={e => setChnKitPct(parseFloat(e.target.value) || 0)}
              className="w-14 bg-slate-800 border border-slate-700 text-orange-300 text-xs rounded px-1.5 py-0.5 text-right focus:outline-none focus:border-orange-400" />
            <span className="text-[10px] text-slate-500">%</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">🇺🇸 Vial Markup</span>
          <div className="flex items-center gap-1">
            <input type="number" value={chnVialUSPct} step="1" min="0" max="500"
              onChange={e => setChnVialUSPct(parseFloat(e.target.value) || 0)}
              className="w-14 bg-slate-800 border border-slate-700 text-emerald-300 text-xs rounded px-1.5 py-0.5 text-right focus:outline-none focus:border-emerald-400" />
            <span className="text-[10px] text-slate-500">%</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">🇨🇳 Vial Markup</span>
          <div className="flex items-center gap-1">
            <input type="number" value={chnVialDirPct} step="1" min="0" max="500"
              onChange={e => setChnVialDirPct(parseFloat(e.target.value) || 0)}
              className="w-14 bg-slate-800 border border-slate-700 text-orange-300 text-xs rounded px-1.5 py-0.5 text-right focus:outline-none focus:border-orange-400" />
            <span className="text-[10px] text-slate-500">%</span>
          </div>
        </div>
      </div>

      {/* Filter + search + actions */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {(['all','norway','china','both'] as FilterMode[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
              filter === f ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 text-slate-500 hover:text-slate-300'
            }`}>
            {f === 'all' ? 'All' : f === 'norway' ? '🇳🇴 Norway' : f === 'china' ? '🇨🇳 China' : '🌐 Both'}
          </button>
        ))}
        <input
          type="text" placeholder="Search…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[120px] bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
        />
        <div className="ml-auto flex items-center gap-2">
          {modCount > 0 && (
            <>
              <span className="text-[10px] text-cyan-400">{modCount} modified</span>
              <button onClick={resetAll}
                className="px-2.5 py-1 text-[10px] border border-slate-700 text-slate-400 rounded-lg hover:text-slate-200 hover:border-slate-500 transition-all">
                Reset
              </button>
            </>
          )}
          <button onClick={() => setShowExport(true)}
            className="px-3 py-1.5 text-[11px] font-bold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition-all">
            Export →
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-[9px] text-slate-600 mb-2">Tap a price cell to override · Right-tap to clear override · Green = computed · Cyan = overridden</p>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs border-collapse" style={{ minWidth: 760 }}>
          <thead className="sticky top-0 z-10 bg-slate-900">
            <tr>
              <th className="text-left px-3 py-2 text-[9px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-800 min-w-[180px]">Product</th>
              <th className="text-center px-2 py-2 text-[9px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-800">Src</th>
              <th className="text-right px-2 py-2 text-[9px] text-blue-400 uppercase tracking-wider font-semibold border-b border-slate-800">🇳🇴 Whsl<br/><span className="text-slate-600 normal-case font-normal">kit 10x</span></th>
              <th className="text-right px-2 py-2 text-[9px] text-orange-400 uppercase tracking-wider font-semibold border-b border-slate-800">🇨🇳 Whsl<br/><span className="text-slate-600 normal-case font-normal">kit 10x</span></th>
              <th className="text-right px-2 py-2 text-[9px] text-blue-400 uppercase tracking-wider font-semibold border-b border-slate-800">🇳🇴 Kit<br/><span className="text-slate-600 normal-case font-normal">sell 10x</span></th>
              <th className="text-right px-2 py-2 text-[9px] text-blue-400 uppercase tracking-wider font-semibold border-b border-slate-800">🇳🇴 Vial<br/><span className="text-slate-600 normal-case font-normal">list px</span></th>
              <th className="text-right px-2 py-2 text-[9px] text-orange-400 uppercase tracking-wider font-semibold border-b border-slate-800">🇨🇳 Kit<br/><span className="text-slate-600 normal-case font-normal">sell 10x</span></th>
              <th className="text-right px-2 py-2 text-[9px] text-orange-400 uppercase tracking-wider font-semibold border-b border-slate-800">🇨🇳 Vial<br/><span className="text-slate-600 normal-case font-normal">per vial</span></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([cat, products]) => (
              <>
                <tr key={`cat-${cat}`}>
                  <td colSpan={8} className="px-3 py-1.5 text-[9px] text-slate-500 uppercase tracking-widest bg-slate-900/50 border-b border-slate-800/50">
                    {cat}
                  </td>
                </tr>
                {products.map(p => {
                  const { norW, usW, chnW, norKitComp, norVialComp, chnKitComp, chnVialComp } = prices(p.name, p.price);
                  const pk = p.name;
                  const src = p.sourceRestriction || 'neither';
                  const isNorway = src === 'norway';
                  const isChina = src === 'china';
                  const isUS = !!usW;
                  const dimNor = isChina;
                  const dimChn = isNorway;

                  return (
                    <tr key={p.id} className="border-b border-slate-800/30 hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-1.5 text-slate-200 font-medium">
                        {p.name.replace(/ \(.*?\)$/, '')}
                        <span className="text-slate-500 ml-1">{p.name.match(/\(([^)]+)\)$/)?.[1]}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {isNorway ? (
                          <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">🇳🇴</span>
                        ) : isChina ? (
                          <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">🇨🇳</span>
                        ) : (
                          <span className="text-slate-700 text-[9px]">—</span>
                        )}
                      </td>
                      {/* Norway wholesale */}
                      <td className={`px-2 py-1.5 text-right font-mono text-xs ${dimNor ? 'opacity-20' : ''}`}>
                        {norW ? <span className="text-amber-400/80">${norW}</span> : <span className="text-slate-700">—</span>}
                      </td>
                      {/* China wholesale */}
                      <td className={`px-2 py-1.5 text-right font-mono text-xs ${dimChn ? 'opacity-20' : ''}`}>
                        {chnW ? (
                          <div className="flex flex-col items-end gap-0">
                            <span className="text-amber-400/80">${chnW}</span>
                            {isUS && <span className="text-[8px] text-emerald-400">🇺🇸 US</span>}
                          </div>
                        ) : <span className="text-slate-700">—</span>}
                      </td>
                      {/* Norway kit sell */}
                      <PriceCell productKey={pk} field="norKit" computed={norKitComp} cost10={norW} isVialCost={false} dimmed={dimNor} />
                      {/* Norway vial sell */}
                      <PriceCell productKey={pk} field="norVial" computed={norVialComp} cost10={norW} isVialCost={true} dimmed={dimNor} />
                      {/* China kit sell */}
                      <PriceCell productKey={pk} field="chnKit" computed={chnKitComp} cost10={chnW} isVialCost={false} dimmed={dimChn} />
                      {/* China vial sell */}
                      <PriceCell productKey={pk} field="chnVial" computed={chnVialComp} cost10={chnW} isVialCost={true} dimmed={dimChn} />
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>

        {visibleProducts.length === 0 && (
          <div className="text-center text-slate-600 py-12 text-sm">No products match filter</div>
        )}
      </div>

      {/* Export modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowExport(false)}>
          <div className="bg-[#0f1624] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-cyan-300 font-bold text-sm">Export Pricing Changes</span>
              <button onClick={() => setShowExport(false)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">✕</button>
            </div>
            <p className="px-4 pt-3 text-[10px] text-slate-500">
              Copy this JSON and paste it in chat — I'll apply the changes to the codebase.
            </p>
            <pre className="flex-1 overflow-auto px-4 py-3 text-[10px] text-emerald-300 font-mono whitespace-pre-wrap break-all">
              {exportJson}
            </pre>
            <div className="flex gap-2 px-4 py-3 border-t border-slate-800">
              <button onClick={copyExport}
                className="flex-1 py-2 text-xs font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-all">
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button onClick={() => setShowExport(false)}
                className="px-4 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
