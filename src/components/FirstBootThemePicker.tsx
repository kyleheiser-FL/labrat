import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

type LabRatTheme = 'neon' | 'clinical';

interface FirstBootThemePickerProps {
  open: boolean;
  onSelectTheme: (theme: LabRatTheme) => void;
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
                Choose your preferred experience. You can change this anytime under Me → Appearance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onSelectTheme('neon')}
                className="group text-left rounded-2xl border border-cyan-500/30 bg-[#030712]/70 p-4 hover:border-cyan-400/70 hover:bg-cyan-500/10 transition-all cursor-pointer"
              >
                <div className="h-28 rounded-xl bg-[radial-gradient(circle_at_top_right,rgba(160,94,255,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.28),transparent_45%),#050816] border border-cyan-500/20 mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src="/labrat_top_left_logo_transparent.png"
                    alt="Neon Lab"
                    className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]"
                  />
                </div>
                <h3 className="text-cyan-300 font-black uppercase tracking-wider text-sm">Neon Lab</h3>
                <p className="text-xs text-slate-400 mt-1">Cyberpunk, high-energy, immersive command center.</p>
              </button>

              <button
                onClick={() => onSelectTheme('clinical')}
                className="group text-left rounded-2xl border border-slate-700/70 bg-[#111827]/80 p-4 hover:border-sky-400/60 hover:bg-sky-500/10 transition-all cursor-pointer"
              >
                <div className="h-28 rounded-xl bg-[#111827] border border-slate-600/60 mb-4 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-[#0b1220] border border-slate-500/60 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-black text-slate-100 tracking-tighter">LR</span>
                  </div>
                </div>
                <h3 className="text-slate-100 font-black uppercase tracking-wider text-sm">Clinical Dark</h3>
                <p className="text-xs text-slate-400 mt-1">Clean, professional, low-glow clinical interface.</p>
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
