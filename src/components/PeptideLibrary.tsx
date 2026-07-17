import { useEffect, useMemo, useState } from 'react';
import {
  Search, Info, ShieldAlert, CheckCircle, ArrowUpRight, BookOpen, Clock, Layers,
  Apple, Dumbbell, ChevronDown, ShoppingBag, Beaker, FlaskConical, ArrowLeft,
} from 'lucide-react';
import { PEPTIDE_LIBRARY } from '../data/peptides';
import { LibraryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '../lib/haptics';
import { rankSearch, SearchFields } from '../lib/search';
import { findShopProductMatches, getProductBaseAndSize } from '../lib/shopHelpers';
import type { ShopProduct } from '../lib/shopTypes';

const libraryFields = (item: LibraryItem): SearchFields => ({
  name: item.name,
  chemicalName: item.chemicalName,
  aliasKey: item.id,
  extra: `${item.description} ${item.benefits.join(' ')}`,
});

type ResearchSection = 'overview' | 'dosing' | 'studies' | 'safety';

interface PeptideLibraryProps {
  onAddToCycle?: (item: LibraryItem) => void;
  onViewInStore?: (productName: string) => void;
  onBackToShop?: () => void;
  visibility?: { filters: boolean };
}

const CATEGORIES: { value: string; label: string; shortLabel: string; color: string }[] = [
  { value: 'all', label: 'All Compounds', shortLabel: 'All', color: 'bg-slate-500/10 text-slate-300 border-slate-700/50' },
  { value: 'healing', label: 'Tendon & Joint Healing', shortLabel: 'Healing', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'weight_loss', label: 'Weight & Appetite Control', shortLabel: 'Weight', color: 'bg-amber-400/10 text-amber-300 border-amber-400/30' },
  { value: 'longevity', label: 'Longevity & Cellular Repair', shortLabel: 'Longevity', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { value: 'cognitive', label: 'Nootropics & Cognitive', shortLabel: 'Cognitive', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  { value: 'muscle', label: 'Muscle Development', shortLabel: 'Muscle', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { value: 'lifestyle', label: 'Tanning & Vitality', shortLabel: 'Lifestyle', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { value: 'sexual_health', label: 'Sexual Health & Libido', shortLabel: 'Sexual', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'hormones', label: 'Hormones & Optimization', shortLabel: 'Hormones', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  { value: 'immune', label: 'Immune & Gut Resilience', shortLabel: 'Immune', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  { value: 'supplements', label: 'Vitamins & Supplements', shortLabel: 'Supps', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
];

const SECTION_TABS: { id: ResearchSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'dosing', label: 'Dosing' },
  { id: 'studies', label: 'Studies' },
  { id: 'safety', label: 'Safety' },
];

function deliveryBadge(form?: LibraryItem['deliveryForm']) {
  if (form === 'peptide') {
    return {
      label: 'Peptide · BAC mix',
      className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
      icon: <Beaker className="w-3 h-3" />,
    };
  }
  if (form === 'oil') {
    return {
      label: 'Injectable oil',
      className: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
      icon: <FlaskConical className="w-3 h-3" />,
    };
  }
  if (form === 'pill') {
    return {
      label: 'Oral tablet',
      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
      icon: <CheckCircle className="w-3 h-3" />,
    };
  }
  return null;
}

function StoreLinkPanel({
  matches,
  onViewInStore,
}: {
  matches: ShopProduct[];
  onViewInStore?: (productName: string) => void;
}) {
  if (!onViewInStore) return null;

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 px-3.5 py-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <span>Not currently listed in the store catalog.</span>
        </div>
      </div>
    );
  }

  const primary = matches[0];
  const { baseName } = getProductBaseAndSize(primary.name);
  const sizes = matches
    .map((p) => getProductBaseAndSize(p.name).size)
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
            <ShoppingBag className="w-3.5 h-3.5" />
            Available in store
          </div>
          <div className="mt-1 text-sm font-bold text-white truncate">{baseName}</div>
          {sizes.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-950/50 border border-cyan-500/20 text-cyan-100/90"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onViewInStore(primary.name);
          }}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-black transition cursor-pointer"
          id={`view-store-${primary.id}`}
        >
          View in store
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
      {matches.length > 1 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-cyan-500/15">
          {matches.map((product) => {
            const size = getProductBaseAndSize(product.name).size || product.name;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onViewInStore(product.name);
                }}
                className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-700/70 bg-slate-950/40 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition cursor-pointer"
              >
                {size}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResearchDetail({
  item,
  section,
  setSection,
  storeMatches,
  onViewInStore,
}: {
  item: LibraryItem;
  section: ResearchSection;
  setSection: (s: ResearchSection) => void;
  storeMatches: ShopProduct[];
  onViewInStore?: (productName: string) => void;
}) {
  return (
    <div className="border-t border-[#1e293b] bg-slate-950/25">
      <div className="px-4 pt-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-thin">
        {SECTION_TABS.map((tab) => {
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSection(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer border ${
                active
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 pt-2 space-y-3 text-sm leading-relaxed">
        {section === 'overview' && (
          <>
            <section className="rounded-xl border border-slate-800/80 bg-[#0f172a]/50 p-3.5 space-y-2">
              <h5 className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                What it is
              </h5>
              <p className="text-slate-300 text-[13px] leading-relaxed">{item.description}</p>
            </section>

            <section className="rounded-xl border border-slate-800/80 bg-[#0f172a]/50 p-3.5 space-y-2">
              <h5 className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Research snapshot
              </h5>
              <p className="text-slate-300 text-[13px] leading-relaxed">{item.clinicalResearch}</p>
            </section>

            {item.realisticGains && (
              <section className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3.5 space-y-2">
                <h5 className="text-[10px] uppercase font-mono tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  What to expect
                </h5>
                <p className="text-slate-300 text-[13px] leading-relaxed">{item.realisticGains}</p>
              </section>
            )}

            <section className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3.5 space-y-2">
              <h5 className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                Key benefits
              </h5>
              <ul className="space-y-1.5">
                {item.benefits.map((benefit, idx) => (
                  <li key={`b-${item.id}-${idx}`} className="flex items-start gap-2 text-[13px] text-slate-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            <StoreLinkPanel matches={storeMatches} onViewInStore={onViewInStore} />
          </>
        )}

        {section === 'dosing' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-slate-800/80 bg-[#0f172a]/50 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Typical dose</div>
                <div className="text-[13px] font-semibold text-slate-100 leading-snug">{item.typicalDosage}</div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-[#0f172a]/50 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Frequency</div>
                <div className="text-[13px] font-semibold text-slate-100 leading-snug">{item.frequencyText}</div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-[#0f172a]/50 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Half-life
                </div>
                <div className="text-[13px] font-semibold text-slate-100 leading-snug">{item.halfLife}</div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-[#0f172a]/50 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Cycle length</div>
                <div className="text-[13px] font-semibold text-slate-100 leading-snug">{item.suggestedCycleWeeks}</div>
              </div>
            </div>

            {item.reconstitutionText && (
              <section className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 space-y-2">
                <h5 className="text-[10px] uppercase font-mono tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Beaker className="w-3.5 h-3.5" />
                  Reconstitution
                </h5>
                <p className="text-slate-300 text-[13px] leading-relaxed">{item.reconstitutionText}</p>
                {item.reconstitutionSolvent && item.reconstitutionSolvent !== 'bac_water' && (
                  <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                    Solvent note: {item.reconstitutionSolvent.replace(/_/g, ' ')}
                  </div>
                )}
              </section>
            )}

            {item.dietaryInteraction && (
              <section className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3.5 space-y-2">
                <h5 className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5" />
                  Food & nutrition notes
                </h5>
                <p className="text-slate-300 text-[13px] leading-relaxed">{item.dietaryInteraction}</p>
              </section>
            )}

            <StoreLinkPanel matches={storeMatches} onViewInStore={onViewInStore} />
          </>
        )}

        {section === 'studies' && (
          <>
            <section className="rounded-xl border border-slate-800/80 bg-[#0f172a]/50 p-3.5 space-y-2">
              <h5 className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Clinical context
              </h5>
              <p className="text-slate-300 text-[13px] leading-relaxed">{item.clinicalResearch}</p>
            </section>

            {item.clinicalStudies && item.clinicalStudies.length > 0 ? (
              <div className="space-y-2.5">
                {item.clinicalStudies.map((study, idx) => (
                  <article
                    key={`study-${item.id}-${idx}`}
                    className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h6 className="text-[13px] font-bold text-slate-100 leading-snug">{study.studyTitle}</h6>
                      <span className="shrink-0 text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30">
                        STUDY
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 italic">{study.citation}</div>
                    <p className="text-[13px] text-slate-300 leading-relaxed">
                      <span className="text-cyan-400 font-bold text-[10px] uppercase tracking-wide mr-1.5">Finding</span>
                      {study.keyFinding}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 px-3.5 py-4 text-[13px] text-slate-500 text-center">
                No peer-reviewed study cards are attached for this compound yet.
              </div>
            )}
          </>
        )}

        {section === 'safety' && (
          <>
            <section className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
              <h5 className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Adverse effects & risks
              </h5>
              <ul className="space-y-1.5">
                {item.sideEffects.map((sideEffect, idx) => (
                  <li key={`s-${item.id}-${idx}`} className="flex items-start gap-2 text-[13px] text-slate-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{sideEffect}</span>
                  </li>
                ))}
              </ul>
            </section>

            {item.dietaryInteraction && (
              <section className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3.5 space-y-2">
                <h5 className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5" />
                  Interaction notes
                </h5>
                <p className="text-slate-300 text-[13px] leading-relaxed">{item.dietaryInteraction}</p>
              </section>
            )}

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-3 text-[12px] text-amber-100/90 leading-relaxed">
              Educational research content only. Not medical advice, diagnosis, or a recommendation to use any substance.
            </div>

            <StoreLinkPanel matches={storeMatches} onViewInStore={onViewInStore} />
          </>
        )}
      </div>
    </div>
  );
}

export default function PeptideLibrary({
  onViewInStore,
  onBackToShop,
  visibility = { filters: true },
}: PeptideLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ResearchSection>('overview');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = searchTerm.trim()
    ? rankSearch(searchTerm, PEPTIDE_LIBRARY, libraryFields).slice(0, 6)
    : [];

  const handleSelectSuggestion = (item: LibraryItem) => {
    setSearchTerm(item.name);
    setSelectedCategory('all');
    setExpandedId(item.id);
    setActiveSection('overview');
    setShowSuggestions(false);

    setTimeout(() => {
      const element = document.getElementById(`peptide-card-${item.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-cyan-400', 'shadow-[0_0_25px_rgba(6,182,212,0.2)]', 'border-cyan-400');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-cyan-400', 'shadow-[0_0_25px_rgba(6,182,212,0.2)]', 'border-cyan-400');
        }, 2200);
      }
    }, 150);
  };

  const categoryItems = PEPTIDE_LIBRARY.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory,
  );
  const filteredItems = rankSearch(searchTerm, categoryItems, libraryFields);

  const PAGE_SIZE = 16;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const remainingCount = filteredItems.length - visibleItems.length;

  const storeMatchMap = useMemo(() => {
    const map = new Map<string, ShopProduct[]>();
    for (const item of PEPTIDE_LIBRARY) {
      map.set(item.id, findShopProductMatches(item.name));
    }
    return map;
  }, []);

  return (
    <div className="space-y-5" id="peptide-library-container">
      <div className="rounded-2xl border border-[#1e293b]/80 bg-[#0f172a]/70 p-4 sm:p-5 shadow-lg backdrop-blur-md" id="library-controls">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="min-w-0">
            {onBackToShop && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onBackToShop();
                }}
                className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to shop
              </button>
            )}
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Compound Research
            </h2>
            <p className="mt-1 text-[12px] sm:text-[13px] text-slate-400 max-w-2xl leading-relaxed">
              Clean, scannable compound briefs — dosing, half-life, studies, and safety — with direct links to matching store items when available.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Library</div>
            <div className="text-sm font-black text-slate-100 font-mono">{filteredItems.length} compounds</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search compound name or chemical name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
              id="library-search-input"
            />

            {showSuggestions && searchTerm.trim().length > 0 && (
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowSuggestions(false)}
              />
            )}

            {showSuggestions && searchTerm.trim().length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-[#0b1329]/95 border border-cyan-500/40 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden z-50 divide-y divide-slate-800/80 backdrop-blur-md"
                id="library-suggestions-dropdown"
              >
                {suggestions.length > 0 ? (
                  <div className="py-1">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-[#131e38]/70 flex justify-between items-center border-b border-slate-800/60">
                      <span>Suggested Matches ({suggestions.length})</span>
                      <span className="text-[9px] text-slate-500 font-normal">Tap to expand</span>
                    </div>
                    {suggestions.map((item) => {
                      const categoryBadge = CATEGORIES.find((c) => c.value === item.category);
                      const inStore = (storeMatchMap.get(item.id) || []).length > 0;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full text-left px-3.5 py-3 hover:bg-[#1e293b]/90 active:bg-slate-800/90 transition flex items-center justify-between gap-3 text-slate-200 cursor-pointer select-none border-0 group/suggest"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-white group-hover/suggest:text-cyan-400 flex items-center gap-1.5 transition-colors">
                              <span>{item.name}</span>
                              {inStore && (
                                <span className="text-[9px] font-bold uppercase tracking-wide text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                                  In store
                                </span>
                              )}
                              {item.chemicalName && (
                                <span className="text-[10px] text-slate-400 font-mono font-normal truncate">
                                  ({item.chemicalName})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[220px] sm:max-w-md">
                              {item.benefits.slice(0, 2).join(' • ')}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase shrink-0 font-sans ${categoryBadge?.color || 'bg-slate-700/50 text-slate-300'}`}>
                            {categoryBadge?.shortLabel || categoryBadge?.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-xs text-slate-400 text-center flex flex-col items-center gap-1">
                    <span>No suggested compound matches</span>
                    <span className="text-[10px] text-slate-500 font-mono">&ldquo;{searchTerm}&rdquo;</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {visibility.filters && (
          <div className="mt-4 pt-4 border-t border-[#1e293b]/50" id="library-categories-list">
            {/* One compact horizontal row on phones so filters don't stack into a long list. */}
            <div className="-mx-1 px-1 flex gap-1.5 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat.value);
                  }}
                  title={cat.label}
                  className={`snap-start shrink-0 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border cursor-pointer transition whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50'
                      : 'bg-[#1e293b]/30 text-slate-400 border-slate-800/60 hover:border-[#1e293b] hover:text-slate-200'
                  }`}
                  id={`cat-btn-${cat.value}`}
                >
                  <span className="sm:hidden">{cat.shortLabel}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-[#0f172a]/40 border border-slate-800 rounded-2xl">
          <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-slate-300 font-medium">No matching compounds</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try resetting your category filters or typing a more general chemical search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" id="library-list-grid">
          {visibleItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const categoryBadge = CATEGORIES.find((c) => c.value === item.category);
            const badge = deliveryBadge(item.deliveryForm);
            const storeMatches = storeMatchMap.get(item.id) || [];
            const inStore = storeMatches.length > 0;

            return (
              <div
                key={item.id}
                className={`bg-[#0f172a]/70 border rounded-2xl transition-all duration-300 h-fit overflow-hidden ${
                  isExpanded
                    ? 'border-cyan-500/55 shadow-[0_0_20px_rgba(34,211,238,0.06)] ring-1 ring-cyan-500/10'
                    : 'border-[#1e293b]/80 hover:border-slate-700/80 shadow-md hover:shadow-lg'
                }`}
                id={`peptide-card-${item.id}`}
              >
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                        {item.name}
                      </h4>
                      {item.chemicalName && (
                        <div className="mt-0.5 text-[11px] text-slate-400 font-mono truncate">
                          {item.chemicalName}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {badge && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide border uppercase ${badge.className}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        )}
                        {inStore && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide border uppercase bg-cyan-500/10 text-cyan-300 border-cyan-500/25">
                            <ShoppingBag className="w-3 h-3" />
                            In store
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider shrink-0 ${categoryBadge?.color || 'bg-slate-700 text-slate-300'}`}>
                      {categoryBadge?.shortLabel || categoryBadge?.label}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-[#1e293b]/25 border border-slate-800/85 p-2.5 rounded-xl text-[11px]">
                    <div>
                      <span className="text-slate-500 block mb-0.5 text-[10px]">Half-life</span>
                      <span className="text-slate-200 font-semibold leading-snug block">{item.halfLife}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5 text-[10px]">Dose</span>
                      <span className="text-slate-200 font-semibold leading-snug block line-clamp-2" title={item.typicalDosage}>
                        {item.typicalDosage}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5 text-[10px]">Frequency</span>
                      <span className="text-slate-200 font-semibold leading-snug block line-clamp-2" title={item.frequencyText}>
                        {item.frequencyText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1e293b]/50">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        if (isExpanded) {
                          setExpandedId(null);
                        } else {
                          setExpandedId(item.id);
                          setActiveSection('overview');
                        }
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                      id={`expand-details-${item.id}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {isExpanded ? 'Collapse research' : 'Read research'}
                    </button>

                    {inStore && onViewInStore ? (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          onViewInStore(storeMatches[0].name);
                        }}
                        className="py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-400/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        id={`view-in-store-btn-${item.id}`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        View in store
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="py-1.5 px-3 text-[11px] font-semibold text-slate-500 border border-slate-800/80 rounded-xl">
                        Not in store
                      </span>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <ResearchDetail
                        item={item}
                        section={activeSection}
                        setSection={setActiveSection}
                        storeMatches={storeMatches}
                        onViewInStore={onViewInStore}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {remainingCount > 0 && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => {
              triggerHaptic('light');
              setVisibleCount((c) => c + PAGE_SIZE);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0f172a]/70 hover:bg-[#1e293b]/70 border border-[#1e293b] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            id="library-load-more"
          >
            <ChevronDown className="w-4 h-4" />
            Show more compounds ({remainingCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
