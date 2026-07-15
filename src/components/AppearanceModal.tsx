import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LabRatThemePreference = 'system' | 'clinical' | 'clinical-light';

interface AppearanceModalProps {
  open: boolean;
  onClose: () => void;
  currentTheme: LabRatThemePreference;
  onSelectTheme: (theme: LabRatThemePreference) => void;
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
                <p className="text-xs text-slate-400 mt-1">Follow your phone or choose a manual mode.</p>
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
                onClick={() => onSelectTheme('system')}
                className={`w-full rounded-xl border p-3 text-left transition flex items-center justify-between ${
                  currentTheme === 'system'
                    ? 'border-emerald-500/60 bg-emerald-500/10'
                    : 'border-slate-800 bg-[#030712]/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[linear-gradient(135deg,#f8fafc_0%,#f8fafc_49%,#0f172a_50%,#020617_100%)] border border-emerald-500/50 flex items-center justify-center">
                    <span className="text-xs font-black text-emerald-300">LR</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100">Use System</div>
                    <div className="text-xs text-slate-500">Automatically matches your phone.</div>
                  </div>
                </div>
                {currentTheme === 'system' && <Check className="w-4 h-4 text-emerald-400" />}
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
                    <div className="text-sm font-bold text-slate-100">Dark</div>
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
                    <div className="text-sm font-bold text-slate-100">Light</div>
                    <div className="text-xs text-slate-500">Clean white, minimal, easy to read.</div>
                  </div>
                </div>
                {currentTheme === 'clinical-light' && <Check className="w-4 h-4 text-blue-400" />}
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#030712]/50 p-3 text-[11px] text-slate-400 leading-relaxed">
              System follows your device color setting. Dark and Light are manual overrides, and switching is instant and reversible.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
