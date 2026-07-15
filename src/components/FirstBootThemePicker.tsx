import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

type LabRatThemePreference = 'system' | 'clinical' | 'clinical-light';

interface FirstBootThemePickerProps {
  open: boolean;
  onSelectTheme: (theme: LabRatThemePreference) => void;
}

export default function FirstBootThemePicker({ open, onSelectTheme }: FirstBootThemePickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="first-boot-theme-picker"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-5 sm:p-7 w-full max-w-lg shadow-2xl relative space-y-5 my-6 text-slate-200"
          >
            <div className="text-center space-y-2">
              <div className="mx-auto h-20 w-20 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_22px_rgba(34,211,238,0.28)]">
                <img src="/labrat_top_left_logo_transparent.png" alt="labrat" className="h-full w-full object-contain" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Welcome to labrat</h2>
              <p className="text-sm text-slate-400">
                Choose your preferred experience. You can change this anytime in Settings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onSelectTheme('system')}
                className="group text-left rounded-2xl border border-emerald-500/30 bg-[#030712]/70 p-4 hover:border-emerald-400/70 hover:bg-emerald-500/10 transition-all cursor-pointer"
              >
                <div className="h-24 rounded-xl bg-[linear-gradient(135deg,#f8fafc_0%,#f8fafc_49%,#0f172a_50%,#020617_100%)] border border-emerald-500/20 mb-4 flex items-center justify-center overflow-hidden">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500 border border-emerald-300/70 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-black text-slate-950 tracking-tighter">LR</span>
                  </div>
                </div>
                <h3 className="text-emerald-300 font-black uppercase tracking-wider text-sm">Use System</h3>
                <p className="text-xs text-slate-400 mt-1">Matches your phone automatically.</p>
              </button>

              <button
                onClick={() => onSelectTheme('clinical')}
                className="group text-left rounded-2xl border border-slate-700/70 bg-[#111827]/80 p-4 hover:border-sky-400/60 hover:bg-sky-500/10 transition-all cursor-pointer"
              >
                <div className="h-24 rounded-xl bg-[#111827] border border-slate-600/60 mb-4 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-2xl bg-[#0b1220] border border-slate-500/60 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-black text-slate-100 tracking-tighter">LR</span>
                  </div>
                </div>
                <h3 className="text-slate-100 font-black uppercase tracking-wider text-sm">Dark</h3>
                <p className="text-xs text-slate-400 mt-1">OLED black, professional, low-glow.</p>
              </button>

              <button
                onClick={() => onSelectTheme('clinical-light')}
                className="group text-left rounded-2xl border border-slate-300/60 bg-white/10 p-4 hover:border-blue-400/60 hover:bg-blue-500/10 transition-all cursor-pointer"
              >
                <div className="h-24 rounded-xl bg-white border border-slate-200 mb-4 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-md">
                    <span className="text-xl font-black text-blue-700 tracking-tighter">LR</span>
                  </div>
                </div>
                <h3 className="text-blue-300 font-black uppercase tracking-wider text-sm">Light</h3>
                <p className="text-xs text-slate-400 mt-1">White, clean, minimal interface.</p>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              This only changes appearance. Your compounds, logs, shop stock, bloodwork analyzer, recommendations, and sync data remain unchanged.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
