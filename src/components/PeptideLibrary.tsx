import { useState } from 'react';
import { Search, Filter, Info, ShieldAlert, CheckCircle, Zap, ArrowUpRight, BookOpen, Clock, Layers } from 'lucide-react';
import { PEPTIDE_LIBRARY } from '../data/peptides';
import { LibraryItem, Compound } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PeptideLibraryProps {
  onAddToCycle: (item: LibraryItem) => void;
}

const CATEGORIES: { value: string; label: string; color: string }[] = [
  { value: 'all', label: 'All Compounds', color: 'bg-slate-500/10 text-slate-300 border-slate-700/50' },
  { value: 'healing', label: 'Tendon & Joint Healing', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'weight_loss', label: 'Weight & Appetite Control', color: 'bg-amber-400/10 text-amber-300 border-amber-400/30' },
  { value: 'longevity', label: 'Longevity & Cellular Repair', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { value: 'cognitive', label: 'Nootropics & Cognitive', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  { value: 'muscle', label: 'Muscle Development', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { value: 'lifestyle', label: 'Tanning & Vitality', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
];

export default function PeptideLibrary({ onAddToCycle }: PeptideLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter items
  const filteredItems = PEPTIDE_LIBRARY.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chemicalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.benefits.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
              placeholder="Search by name, synonym, or physiological benefit (e.g., joint, satiety)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
              id="library-search-input"
            />
          </div>
        </div>

        {/* Categories Carousel / Chips list */}
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
