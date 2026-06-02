import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';

interface ToastContainerProps {
  toasts: AppNotification[];
}

const DOT: Record<string, string> = {
  success:  'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
  warning:  'bg-amber-500  shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  info:     'bg-cyan-500   shadow-[0_0_8px_rgba(6,182,212,0.8)]',
  reminder: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]',
};

const BORDER: Record<string, string> = {
  success:  'border-emerald-500/40',
  warning:  'border-amber-500/40',
  info:     'border-cyan-500/40',
  reminder: 'border-indigo-500/40',
};

export default function ToastContainer({ toasts }: ToastContainerProps) {
  const visible = toasts.slice(0, 3);

  return (
    <div
      className="fixed bottom-6 left-0 right-0 z-[120] flex flex-col items-center gap-2 pointer-events-none px-4"
      id="toasters-wrapper"
    >
      <AnimatePresence initial={false}>
        {visible.map((toast, i) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1 - i * 0.15, y: 0, scale: 1 - i * 0.03 }}
            exit={{ opacity: 0, y: 16, scale: 0.93, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className={`w-full max-w-[400px] pointer-events-auto bg-[#0b1220]/95 border ${
              BORDER[toast.type] ?? 'border-slate-700/50'
            } rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center gap-3`}
          >
            <div className={`shrink-0 w-2 h-2 rounded-full ${DOT[toast.type] ?? 'bg-slate-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 leading-tight truncate">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{toast.message}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
