import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LabRatTheme = 'neon' | 'clinical' | 'clinical-light';

interface AppearanceModalProps {
  open: boolean;
  onClose: () => void;
  currentTheme: LabRatTheme;
  onSelectTheme: (theme: LabRatTheme) => void;
}

export default function AppearanceModal({ open, onClose, currentTheme, onSelectTheme }: AppearanceModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="appearance-settings-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-[#0f172a] border border-slate-700/70 rounded-2xl p-5 sm:p-7 w-full max-w-md shadow-2xl relative space-y-5 my-6 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black tracking-tight">Appearance</h3>
                <p className="text-xs text-slate-400 mt-1">Choose your labrat experience.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
                aria-label="Close appearance settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Theme</span>

              <button
                onClick={() => onSelectTheme('neon')}
                className={`w-full rounded-xl border p-3 text-left transition flex items-center justify-between ${
                  currentTheme === 'neon'
                    ? 'border-cyan-500/60 bg-cyan-500/10'
                    : 'border-slate-800 bg-[#030712]/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src="/labrat_top_left_logo_transparent.png" alt="Neon Lab" className="h-9 w-9 object-contain" />
                  <div>
                    <div className="text-sm font-bold text-slate-100">Neon Lab Command Center</div>
                    <div className="text-xs text-slate-500">Cyberpunk, immersive, high-energy.</div>
                  </div>
                </div>
                {currentTheme === 'neon' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={() => onSelectTheme('clinical')}
                className={`w-full rounded-xl border p-3 text-left transition flex items-center justify-between ${
                  currentTheme === 'clinical'
                    ? 'border-sky-400/60 bg-sky-500/10'
                    : 'border-slate-800 bg-[#030712]/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#0b1220] border border-slate-600 flex items-center justify-center">
                    <span className="text-sm font-black text-slate-100">LR</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100">Clinical Dark</div>
                    <div className="text-xs text-slate-500">OLED black, professional, low-glow.</div>
                  </div>
                </div>
                {currentTheme === 'clinical' && <Check className="w-4 h-4 text-sky-400" />}
              </button>

              <button
                onClick={() => onSelectTheme('clinical-light')}
                className={`w-full rounded-xl border p-3 text-left transition flex items-center justify-between ${
                  currentTheme === 'clinical-light'
                    ? 'border-blue-500/60 bg-blue-500/10'
                    : 'border-slate-800 bg-[#030712]/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center">
                    <span className="text-sm font-black text-blue-700">LR</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100">Clinical Light</div>
                    <div className="text-xs text-slate-500">Clean white, minimal, easy to read.</div>
                  </div>
                </div>
                {currentTheme === 'clinical-light' && <Check className="w-4 h-4 text-blue-400" />}
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#030712]/50 p-3 text-[11px] text-slate-400 leading-relaxed">
              Three modes: <strong>Neon Lab</strong> (cyberpunk), <strong>Clinical Dark</strong> (OLED black), and <strong>Clinical Light</strong> (white/minimal). Switching is instant and reversible.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
