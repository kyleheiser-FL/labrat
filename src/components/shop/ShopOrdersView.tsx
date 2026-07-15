import React from 'react';
import { ClipboardList, Loader2, MapPin, Truck, RefreshCcw } from 'lucide-react';
import { OrderDetail } from '../../lib/shopTypes';
import { getOrderProgress, getOrderStatusViewModel } from '../../lib/shopViewModels';

interface ShopOrdersViewProps {
  orders: OrderDetail[];
  ordersLoading: boolean;
  actionLoading: string | null;
  currentUserEmail: string | null | undefined;
  onSimulateDeliveryCheck: (orderId: string) => void;
  onReorder?: (items: OrderDetail['items']) => void;
}

export default function ShopOrdersView({
  orders,
  ordersLoading,
  actionLoading,
  currentUserEmail,
  onSimulateDeliveryCheck,
  onReorder,
}: ShopOrdersViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-cyan-400" /> My Physical Dispatch Requests
      </h2>

      {ordersLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#0b1329] border border-[#1e293b]/70 rounded-2xl min-h-[32vh]">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <p className="text-slate-400 text-xs">Loading order dispatch lists...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No active orders placed</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            You have not submitted any dispatch or compound shipping requests yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusVm = getOrderStatusViewModel(order.status);
            const progressSteps = getOrderProgress(order.status);

            return (
            <div key={order.id} className="bg-[#0b1329] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-6 transition-all">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                    {order.id}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${statusVm.toneClassName}`}>
                    {statusVm.label}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>

                {/* List products inside the order */}
                <div className="mt-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800 border-dashed space-y-1 w-full max-w-md">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span>
                        <span className="font-bold text-[#22d3ee] mr-1.5">{item.quantity}x</span>
                        {item.name}
                      </span>
                      <span className="font-semibold text-slate-400">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Dispatch Address: <b className="text-slate-300 font-semibold">{order.shippingInfo.fullName}</b>, {order.shippingInfo.addressLine1}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</span>
                </div>

                {order.shippingInfo.carrier && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5 font-mono">
                    <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      Postage: <b className="text-slate-200 font-semibold">{order.shippingInfo.carrier} {order.shippingInfo.method}</b> (Estimate: <b className="text-cyan-400">{order.shippingInfo.deliveryEstimate}</b>)
                    </span>
                  </div>
                )}

                {/* Order Status Timeline — shown for all orders */}
                <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl max-w-md">
                  {order.trackingNumber && (
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs text-slate-300 font-semibold font-mono">
                          USPS Tracking: <span className="text-cyan-300 font-bold ml-1">{order.trackingNumber}</span>
                        </span>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        order.trackingStatus === 'delivered' || order.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                      }`}>
                        {order.trackingStatus === 'delivered' || order.status === 'completed' ? 'Delivered' : 'In Transit'}
                      </span>
                    </div>
                  )}

                  {/* Horizontal Progress Stepper */}
                  <p className="labrat-shop-body text-[11px] text-slate-400 leading-relaxed mb-3">
                    {statusVm.nextStep}
                  </p>

                  <div className="grid grid-cols-4 gap-1 relative py-1 mb-2">
                    <div className="absolute top-1/2 left-2 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                    {progressSteps.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center relative z-10">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                          step.active
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          {step.active ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[8px] font-bold mt-1 text-center whitespace-nowrap ${
                          step.active ? 'text-white' : 'text-slate-500'
                        }`}>{step.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Auto Delivery Check simulation */}
                  {order.status === 'shipped' && (
                    <div className="mt-3.5 flex justify-end">
                      <button
                        onClick={() => onSimulateDeliveryCheck(order.id)}
                        disabled={actionLoading === `check_${order.id}`}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] rounded-lg tracking-wide hover:text-white transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                      >
                        {actionLoading === `check_${order.id}` ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" /> Connecting USPS...
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5" /> Check Delivery Status
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between items-start md:items-end md:text-right border-t md:border-t-0 border-[#1e293b]/50 pt-4 md:pt-0 shrink-0 text-xs gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {order.paymentStatus === 'paid' ? 'Paid & Verified' : 'Awaiting Email Invoice'}
                  </span>
                  <div className="text-xl font-black text-white mt-0.5">${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</div>

                  <div className="mt-1 flex items-center justify-end gap-1.5">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {order.paymentStatus === 'paid' ? '💳 PAID' : '⏳ UNPAID'}
                    </span>
                  </div>
                </div>

                {order.paymentStatus !== 'paid' ? (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 max-w-xs">
                    ✉️ <span className="text-slate-300 font-semibold">Invoicing Note:</span> A payment guide matching this total has been queued. Look for an email from the administrator at <b className="text-cyan-400">{currentUserEmail}</b> shortly.
                  </div>
                ) : (
                  <div className="bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-400 max-w-xs">
                    ✓ <span className="text-emerald-300 font-semibold">Payment Received:</span> Your sterile research compounds have been placed in processing.
                  </div>
                )}

                {onReorder && (
                  <button
                    onClick={() => onReorder(order.items)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] rounded-xl transition-all cursor-pointer"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Reorder
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
