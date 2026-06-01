import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, BadgeCheck } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';
import { OrderDetail } from '../../lib/shopTypes';

interface OrderSuccessModalProps {
  lastPlacedOrder: OrderDetail;
  onClose: () => void;
  onDismiss: () => void;
}

export default function OrderSuccessModal({ lastPlacedOrder, onClose, onDismiss }: OrderSuccessModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0b1329] border border-cyan-500/30 max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center relative"
        >
          <div className="absolute top-4 right-4">
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
            >
              <XCircle className="w-5 h-5 animate-pulse" />
            </button>
          </div>

          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full w-fit mx-auto mb-4">
            <BadgeCheck className="w-12 h-12" />
          </div>

          <h3 className="text-lg font-bold text-white">Compound Dispatch Successful</h3>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Order ID: <span className="text-cyan-400 font-bold">{lastPlacedOrder.id}</span>
          </p>

          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            Your compound reservation request has been processed! No credit card checkout was requested.
            Our laboratory administrative team will email manual invoicing instructions to <b className="text-white">{lastPlacedOrder.email}</b> shortly.
          </p>

          {lastPlacedOrder.shippingInfo?.carrier && (
            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-left text-slate-300 font-mono space-y-1.5 mx-auto max-w-sm">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Selected Carrier:</span>
                <b className="text-[#22d3ee]">{lastPlacedOrder.shippingInfo.carrier} {lastPlacedOrder.shippingInfo.method}</b>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Est. Arrival:</span>
                <b className="text-white">{lastPlacedOrder.shippingInfo.deliveryEstimate}</b>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-1.5 mt-1 font-bold">
                <span className="text-slate-400 text-xs">Invoice Total:</span>
                <b className="text-emerald-400 text-xs font-mono">${lastPlacedOrder.total.toFixed(2)}</b>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onClose();
              }}
              className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider cursor-pointer transition-colors active:scale-[0.98]"
            >
              View My Orders
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                onDismiss();
              }}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer transition-colors border border-slate-800/85 active:scale-[0.98]"
            >
              Catalog
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
