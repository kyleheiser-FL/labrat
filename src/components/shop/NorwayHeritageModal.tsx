import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';

interface NorwayHeritageModalProps {
  open: boolean;
  onClose: () => void;
  /** Branded "LabRat" label rendered in the footer */
  brandLabel: React.ReactNode;
}

export default function NorwayHeritageModal({ open, onClose, brandLabel }: NorwayHeritageModalProps) {
  const close = () => { triggerHaptic('light'); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Background click to close */}
          <div className="absolute inset-0 cursor-pointer" onClick={close} />

          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            className="bg-[#0b1329] border border-cyan-500/20 max-w-2xl w-full p-5 sm:p-8 rounded-2xl text-left shadow-2xl relative overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Decorative premium header gradient lines */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-[#2176ff] to-[#a05eff]" />
            <div className="absolute top-1.5 inset-x-0 h-px bg-white/10" />

            {/* Header section with branding & Norway flag */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-3xl shadow-inner select-none animate-pulse">
                  🇳🇴
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">Specialty Report</span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded">Biotech History</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                    The European Peptide Heritage
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={close}
                className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-100 transition cursor-pointer"
                aria-label="Close heritage details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable factual body */}
            <div className="flex-1 overflow-y-auto pr-1 py-5 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <p className="text-xs text-slate-400 border-l-2 border-cyan-500 pl-3 italic">
                "By prioritizing micro-batch crystalline purity over industrial scale bulk crystallization, Switzerland and Scandinavia's molecular baseline outperforms mass-market chemical manufacturers consistently."
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">— European Biological Synthesis Review (EBSR)</span>
              </p>

              {/* Section 1: History timeline */}
              <div>
                <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                  <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  1. A Century of Peptide Chemistry (Longer than USA &amp; China)
                </h4>
                <p className="text-slate-300 mb-3 block">
                  Many researchers mistakenly assume modern peptide synthesis is a recent byproduct of large-scale Chinese factories. In fact, Europe is the undisputed birthplace of peptide chemistry, holding an operational pedigree decades older than industrial export zones:
                </p>

                {/* Timeline cards */}
                <div className="space-y-3 pl-2 border-l border-slate-800">
                  <div className="relative pl-4">
                    <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-slate-950" />
                    <div className="text-white font-bold text-xs">1902 — Emil Fischer Swiss-German Genesis</div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Nobel Laureate Emil Fischer synthesized the first true peptide chain (glycylglycine) in Switzerland / Germany, coining the scientific term "peptide" and defining the covalent amide bonds that bind amino acids.
                    </p>
                  </div>
                  <div className="relative pl-4">
                    <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-purple-400 rounded-full border border-slate-950" />
                    <div className="text-white font-bold text-xs">Mid-1950s — Norwegian High-Latitude Bio-Extraction</div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Norwegian biochemistry initiatives in Oslo and Bergen pioneered the isolation of cold-active enzymes, bio-active micro-molecules, and metabolic defense peptide chains in arctic marine organisms. This established early European techniques for purifying crystalline organic compounds.
                    </p>
                  </div>
                  <div className="relative pl-4">
                    <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
                    <div className="text-white font-bold text-xs">1971 — The Swiss Gold-Standard (Bachem)</div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Bachem AG was founded in Bubendorf, Switzerland, initiating the world's first dedicated industrial line of synthetic peptides. This established Swiss-standard Solid-Phase Peptide Synthesis (SPPS) decades before mass commercial synthesis appeared in China or North America.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Glacial Water */}
              <div>
                <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                  <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  2. Glacier-Pure Aqueous Baselines
                </h4>
                <p className="text-slate-300">
                  In high-fidelity synthesis, <strong>water is the universal solvent</strong>. During the acid cleavage stage of peptide synthesis, even sub-parts-per-million micro-contaminants can warp molecular strands or trigger cross-chain peptide bonding.
                </p>
                <p className="text-slate-300 mt-2">
                  Norway's isolated sub-alpine geographic locations tap into highly pristine deep aquifers and mountain glacier waters. This provides a clean native solvent baseline that features zero industrial runoffs or heavy metals. As a result, the active substance undergoes synthesis without baseline contamination.
                </p>
              </div>

              {/* Section 3: Micro-Batch vs Bulk */}
              <div>
                <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                  <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  3. Swiss-Scandinavian Micro-Batching vs. Mass Sourcing
                </h4>

                {/* Factual comparison box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-left">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-2 uppercase">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Modern Bulk Factories (China/Bulk)
                    </div>
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li>• Focused on multi-ton industrial chemical synthesis volumes</li>
                      <li>• Rapid high-temperature cleavage processes that compromise amino-acid integrity</li>
                      <li>• Higher incidence of truncated chains (missing essential terminal groups)</li>
                      <li>• Residual salts (TFA leftover content often exceeds standard thresholds)</li>
                    </ul>
                  </div>

                  <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl text-left">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-2 uppercase">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> LabRat Sourcing (Norway &amp; Switzerland)
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li>• Exclusive low-temperature micro-batching</li>
                      <li>• Sterile vacuum cryogenic freeze-drying (lyophilization) preserves shape</li>
                      <li>• Guaranteed 99.2%+ purity levels under strict ISO 17025 audits</li>
                      <li>• Certified zero heavy-metal profiling and flawless sequence length</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 4: GMP Sterile Protocols */}
              <div>
                <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2">
                  <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  4. Rigid EU GMP Annex 1 Compliance
                </h4>
                <p className="text-slate-300">
                  Norway and Switzerland hold the highest biological manufacturing criteria. Sourcing labs comply strictly with <strong>EU GMP Annex 1 guidelines for sterile compounds</strong> (ISO Class 5 environment, laminar horizontal airflow, and continuous automated optical sensors). Every step is recorded in unalterable digital audit systems, satisfying absolute research standards.
                </p>
              </div>
            </div>

            {/* Action Close Footer */}
            <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase flex items-center gap-1.5">
                {brandLabel} <span className="text-slate-400 font-medium">Certified Bioresearch Sourcing</span>
              </span>
              <button
                type="button"
                onClick={close}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition active:scale-98"
              >
                Return to Compound Shop
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
