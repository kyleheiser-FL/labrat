import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';

interface ToastContainerProps {
  toasts: AppNotification[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2.5 max-w-[340px] pointer-events-none" id="toasters-wrapper">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 shadow-2xl flex items-start gap-3 backdrop-blur-md"
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></div>}
              {toast.type === 'warning' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"></div>}
              {toast.type === 'info' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.7)]"></div>}
              {toast.type === 'reminder' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"></div>}
            </div>
            <div className="flex-1">
              <h6 className="text-xs font-bold text-slate-100 font-sans tracking-tight">{toast.title}</h6>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
