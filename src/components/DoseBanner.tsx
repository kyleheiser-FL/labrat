import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Syringe, AlertTriangle, X, CheckCheck } from 'lucide-react';

export interface BannerItem {
  id: string;
  type: 'reminder' | 'missed';
  title: string;
  body: string;
  onLog?: () => void;
  onDismiss: () => void;
  autoDismissMs?: number;
}

interface DoseBannerProps {
  banners: BannerItem[];
}

function Banner({ item }: { item: BannerItem }) {
  const ms = item.autoDismissMs ?? 8000;
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => item.onDismiss(), ms);
    if (progressRef.current) {
      progressRef.current.style.transition = `width ${ms}ms linear`;
      // kick off after paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (progressRef.current) progressRef.current.style.width = '0%';
        });
      });
    }
    return () => clearTimeout(timer);
  }, [ms, item]);

  const isReminder = item.type === 'reminder';
  const accent = isReminder ? 'cyan' : 'amber';

  return (
    <motion.div
      layout
      initial={{ y: -90, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -90, opacity: 0, scale: 0.97, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className={`w-full overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border ${
        isReminder
          ? 'bg-[#071a2e]/95 border-cyan-500/30'
          : 'bg-[#1a1200]/95 border-amber-500/30'
      } backdrop-blur-xl`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
          isReminder
            ? 'bg-cyan-500/15 border border-cyan-500/30'
            : 'bg-amber-500/15 border border-amber-500/30'
        }`}>
          {isReminder
            ? <Syringe className="w-4 h-4 text-cyan-400" />
            : <AlertTriangle className="w-4 h-4 text-amber-400" />
          }
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-bold tracking-widest uppercase font-mono ${
            isReminder ? 'text-cyan-400' : 'text-amber-400'
          }`}>
            {isReminder ? 'Dose Reminder' : 'Missed Dose'}
          </p>
          <p className="text-sm font-bold text-white leading-tight truncate">{item.title}</p>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">{item.body}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {item.onLog && (
            <button
              onClick={() => { item.onLog?.(); item.onDismiss(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                isReminder
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300'
              }`}
            >
              <CheckCheck className="w-3 h-3" />
              Log
            </button>
          )}
          <button
            onClick={item.onDismiss}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className={`h-[2px] ${isReminder ? 'bg-slate-800' : 'bg-slate-800'}`}>
        <div
          ref={progressRef}
          className={`h-full w-full ${isReminder ? 'bg-cyan-500/60' : 'bg-amber-500/60'}`}
          style={{ width: '100%' }}
        />
      </div>
    </motion.div>
  );
}

export default function DoseBanner({ banners }: DoseBannerProps) {
  if (banners.length === 0) return null;

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[150] px-3 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="sync">
        {banners.slice(0, 3).map((b) => (
          <div key={b.id} className="pointer-events-auto">
            <Banner item={b} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
