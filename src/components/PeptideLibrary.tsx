import { useState } from 'react';
import { Search, Info, ShieldAlert, CheckCircle, ArrowUpRight, BookOpen, Clock, Layers, Apple, Dumbbell } from 'lucide-react';
import { PEPTIDE_LIBRARY } from '../data/peptides';
import { LibraryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PeptideLibraryProps {
  onAddToCycle: (item: LibraryItem) => void;
  visibility?: { filters: boolean; };
}

const CATEGORIES: { value: string; label: string; color: string }[] = [
  { value: 'all', label: 'All Compounds', color: 'bg-slate-500/10 text-slate-300 border-slate-700/50' },
  { value: 'healing', label: 'Tendon & Joint Healing', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'weight_loss', label: 'Weight & Appetite Control', color: 'bg-amber-400/10 text-amber-300 border-amber-400/30' },
  { value: 'longevity', label: 'Longevity & Cellular Repair', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { value: 'cognitive', label: 'Nootropics & Cognitive', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  { value: 'muscle', label: 'Muscle Development', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { value: 'lifestyle', label: 'Tanning & Vitality', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { value: 'sexual_health', label: 'Sexual Health & Libido', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'hormones', label: 'Hormones & Optimization', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  { value: 'immune', label: 'Immune & Gut Resilience', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  { value: 'supplements', label: 'Vitamins & Supplements', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
];

export default function PeptideLibrary({ onAddToCycle, visibility = { filters: true } }: PeptideLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Suggested matches list based on keyword matches (name, synonym or benefit)
  // Sort so exact/prefix name matches appear before substring matches
  const suggestions = searchTerm.trim()
    ? (() => {
        const q = searchTerm.toLowerCase();
        const matched = PEPTIDE_LIBRARY.filter((item) =>
          item.name.toLowerCase().includes(q) ||
          item.chemicalName?.toLowerCase().includes(q)
        );
        matched.sort((a, b) => {
          const aNameStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
          const bNameStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
          return aNameStart - bNameStart;
        });
        return matched.slice(0, 6);
      })()
    : [];

  const handleSelectSuggestion = (item: LibraryItem) => {
    setSearchTerm(item.name);
    setSelectedCategory('all');
    setExpandedId(item.id);
    setShowSuggestions(false);

    // Dynamic scroll-and-glow highlighter
    setTimeout(() => {
      const element = document.getElementById(`peptide-card-${item.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Glow impact animation
        element.classList.add('ring-2', 'ring-cyan-400', 'shadow-[0_0_25px_rgba(6,182,212,0.2)]', 'border-cyan-400');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-cyan-400', 'shadow-[0_0_25px_rgba(6,182,212,0.2)]', 'border-cyan-400');
        }, 2200);
      }
    }, 150);
  };

  // Filter items for main view list
  const filteredItems = PEPTIDE_LIBRARY.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.chemicalName?.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="peptide-library-container">
      {/* Search and Category Filter Controls */}
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-lg backdrop-blur-md" id="library-controls">
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

            {/* Transparent click-outside backplate to close dropdown easily */}
            {showSuggestions && searchTerm.trim().length > 0 && (
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setShowSuggestions(false)} 
              />
            )}

            {/* High-fidelity autocomplete popup dropdown */}
            {showSuggestions && searchTerm.trim().length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-[#0b1329]/95 border border-cyan-500/40 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden z-50 divide-y divide-slate-800/80 backdrop-blur-md"
                id="library-suggestions-dropdown"
              >
                {suggestions.length > 0 ? (
                  <div className="py-1">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-[#131e38]/70 flex justify-between items-center border-b border-slate-800/60">
                      <span>Suggested Matches ({suggestions.length})</span>
                      <span className="text-[9px] text-slate-500 font-normal">Tap to expand and view</span>
                    </div>
                    {suggestions.map((item) => {
                      const categoryBadge = CATEGORIES.find(c => c.value === item.category);
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
                              {item.chemicalName && (
                                <span className="text-[10px] text-slate-400 font-mono font-normal truncate">({item.chemicalName})</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[220px] sm:max-w-md">
                              {item.benefits.join(' • ')}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase shrink-0 font-sans ${categoryBadge?.color || 'bg-slate-700/50 text-slate-300'}`}>
                            {categoryBadge?.label.split(' & ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-xs text-slate-400 text-center flex flex-col items-center gap-1">
                    <span>No suggested compounds matches</span>
                    <span className="text-[10px] text-slate-500 font-mono">&ldquo;{searchTerm}&rdquo;</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Categories Carousel / Chips list */}
        {visibility.filters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#1e293b]/50" id="library-categories-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition ${
                selectedCategory === cat.value
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50'
                  : 'bg-[#1e293b]/30 text-slate-400 border-transparent hover:border-[#1e293b] hover:text-slate-200'
              }`}
              id={`cat-btn-${cat.value}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Library Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-[#0f172a]/40 border border-slate-800 rounded-2xl">
          <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-slate-300 font-medium">No matching compounds</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Try resetting your category filters or typing a more general chemical search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="library-list-grid">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const categoryBadge = CATEGORIES.find(c => c.value === item.category);

            return (
              <div
                key={item.id}
                className={`bg-[#0f172a]/70 border rounded-2xl transition-all duration-300 h-fit ${
                  isExpanded 
                    ? 'border-cyan-500/55 shadow-[0_0_20px_rgba(34,211,238,0.06)] ring-1 ring-cyan-500/10' 
                    : 'border-[#1e293b]/80 hover:border-slate-700/80 shadow-md hover:shadow-lg'
                }`}
                id={`peptide-card-${item.id}`}
              >
                {/* Header Brief Section */}
                <div className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          {item.name}
                          {item.chemicalName && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal">({item.chemicalName})</span>
                          )}
                        </h4>
                        
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.deliveryForm === 'peptide' && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wide bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                              🧪 Peptide (BAC Water Mix Needed)
                            </span>
                          )}
                          {item.deliveryForm === 'oil' && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                              💧 Injectable Oil Suspension
                            </span>
                          )}
                          {item.deliveryForm === 'pill' && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                              💊 Oral Tablet / Pill
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${categoryBadge?.color || 'bg-slate-700 text-slate-300'}`}>
                        {categoryBadge?.label.split(' & ')[0]}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#1e293b]/25 border border-slate-800/85 p-2 rounded-xl mt-4 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Half-Life</span>
                      <span className="text-slate-300 font-semibold">{item.halfLife}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Dose Scope</span>
                      <span className="text-slate-300 font-semibold truncate block" title={item.typicalDosage}>{item.typicalDosage.split('twice')[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Frequency</span>
                      <span className="text-slate-300 font-semibold truncate block" title={item.frequencyText}>{item.frequencyText.split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#1e293b]/40">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                      id={`expand-details-${item.id}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {isExpanded ? 'Collapse research' : 'View full research'}
                    </button>

                    <button
                      onClick={() => onAddToCycle(item)}
                      className="py-1.5 px-3 bg-[#1e293b] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                      id={`add-to-cycle-btn-${item.id}`}
                    >
                      Add to active cycle
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Scientific Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-[#1e293b]"
                    >
                      <div className="p-5 bg-slate-950/20 space-y-4 text-xs leading-relaxed">
                        {/* Clinical Study Summary */}
                        <div className="bg-[#1e293b]/20 p-3.5 rounded-xl border border-slate-800/80">
                          <h5 className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Scientific & Recombinant Context
                          </h5>
                          <p className="text-slate-300 text-xs text-justify">
                            {item.clinicalResearch}
                          </p>
                        </div>

                        {/* Peer-Reviewed Journal Studies */}
                        {item.clinicalStudies && item.clinicalStudies.length > 0 && (
                          <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10 space-y-3" id={`clinical-studies-container-${item.id}`}>
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-extrabold flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> Peer-Reviewed Journal Studies & Clinical Trials
                            </h5>
                            <div className="space-y-3">
                              {item.clinicalStudies.map((study, idx) => (
                                <div key={`study-${item.id}-${idx}`} className="bg-[#0f172a]/60 border border-[#1e293b]/60 p-3 rounded-lg space-y-1">
                                  <div className="flex justify-between items-start gap-1.5 flex-wrap sm:flex-nowrap">
                                    <h6 className="text-[11px] font-bold text-slate-100 leading-snug">{study.studyTitle}</h6>
                                    <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/20 shrink-0">
                                      CITED STUDY
                                    </span>
                                  </div>
                                  <div className="text-[9px] font-mono text-slate-500 italic">{study.citation}</div>
                                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed bg-[#1e293b]/20 p-2 rounded-md border border-slate-800/30">
                                    <span className="text-cyan-400 font-bold font-mono text-[10px] uppercase mr-1">Finding:</span>
                                    {study.keyFinding}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Realistic Gains & Performance Expectations */}
                        {item.realisticGains && (
                          <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 space-y-2 mt-3" id={`gains-container-${item.id}`}>
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-extrabold flex items-center gap-1.5 matches-title-styling">
                              <Dumbbell className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Realistic Gains & Performance Expectations
                            </h5>
                            <p className="text-slate-300 text-xs leading-relaxed bg-[#1e293b]/10 p-3 rounded-lg border border-slate-800/40">
                              {item.realisticGains}
                            </p>
                          </div>
                        )}

                        {/* Food, Nutrition & Dietary Protocols */}
                        {item.dietaryInteraction && (
                          <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 space-y-2 mt-3" id={`dietary-container-${item.id}`}>
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-extrabold flex items-center gap-1.5 matches-title-styling">
                              <Apple className="w-3.5 h-3.5 text-emerald-500" /> Food, Nutrition & Dietary Protocols
                            </h5>
                            <p className="text-slate-300 text-xs leading-relaxed bg-[#1e293b]/10 p-3 rounded-lg border border-slate-800/40">
                              {item.dietaryInteraction}
                            </p>
                          </div>
                        )}

                        {/* Reconstitution Guide */}
                        {item.reconstitutionText && (
                          <div>
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 mb-1">Reconstitution Advice</h5>
                            <p className="text-slate-300 bg-indigo-950/10 border border-indigo-900/10 p-2.5 rounded-lg text-[11px]">
                              {item.reconstitutionText}
                            </p>
                          </div>
                        )}

                        {/* Standard Cycle Timeline scope */}
                        <div className="flex gap-4 items-center">
                          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px]">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span><strong>Cycle Standard:</strong> {item.suggestedCycleWeeks}</span>
                          </div>
                        </div>

                        {/* Benefits and Warnings Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {/* Benefits */}
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">Key Benefits & Applications</h5>
                            <ul className="space-y-1">
                              {item.benefits.map((benefit, idx) => (
                                <li key={`b-${idx}`} className="flex items-start gap-1.5 text-[#e2e8f0]/95">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Side Effects */}
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold">Adverse Effects & Risks</h5>
                            <ul className="space-y-1">
                              {item.sideEffects.map((sideEffect, idx) => (
                                <li key={`s-${idx}`} className="flex items-start gap-1.5 text-[#e2e8f0]/95">
                                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                  <span>{sideEffect}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
