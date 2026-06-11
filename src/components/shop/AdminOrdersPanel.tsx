import React, { useEffect, useState } from 'react';
import { ClipboardList, Loader2, Mail, Trash2 } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';
import { OrderDetail } from '../../lib/shopTypes';
import { fetchWholesaleBook, getProductCostPerVial, type WholesaleBook } from '../../lib/wholesale';

interface AdminOrdersPanelProps {
  adminOrdersList: OrderDetail[];
  ordersLoading: boolean;
  actionLoading: string | null;
  newOrderCount: number;
  confirmDeleteOrderId: string | null;
  onMarkAsPaid: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onShipOrder: (orderId: string, trackingNumber: string) => void;
  onSimulateDeliveryCheck: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onSetConfirmDeleteOrderId: (id: string | null) => void;
}

export default function AdminOrdersPanel({
  adminOrdersList,
  ordersLoading,
  actionLoading,
  newOrderCount,
  confirmDeleteOrderId,
  onMarkAsPaid,
  onUpdateOrderStatus,
  onShipOrder,
  onSimulateDeliveryCheck,
  onDeleteOrder,
  onSetConfirmDeleteOrderId,
}: AdminOrdersPanelProps) {
  const [wholesale, setWholesale] = useState<WholesaleBook>({});

  useEffect(() => {
    const names = [...new Set(adminOrdersList.flatMap(o => o.items.map(i => i.name)))];
    fetchWholesaleBook(names)
      .then(setWholesale)
      .catch(e => console.error('[orders] Failed to load wholesale costs for profit display:', e));
  }, [adminOrdersList]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4 mb-2">
        <div>
          <h2 className="text-lg font-bold text-red-300 flex flex-wrap items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-red-500 animate-pulse" /> Master Retail Partner Orders Console
            {newOrderCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-200">
                {newOrderCount} new
              </span>
            )}
          </h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Verify physical payments, dispatch compounds, and manage cold-chain tracking.
          </div>
        </div>
      </div>

      {ordersLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#0b1329] border border-[#1e293b]/70 rounded-2xl min-h-[32vh]">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <p className="text-slate-400 text-xs">Loading all orders...</p>
        </div>
      ) : adminOrdersList.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
          <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No orders placed on the network</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Retail accounts have not requested compound dispatch yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {adminOrdersList.map(order => (
            <div key={order.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-6 transition-all">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded border border-[#ef4444]/25">
                    {order.id}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                    order.status === 'placed' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    order.status === 'processing' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                    order.status === 'shipped' ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20' :
                    order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    'bg-red-500/10 text-red-300 border border-red-500/20'
                  }`}>
                    {order.status}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
                  }`}>
                    {order.paymentStatus === 'paid' ? '💳 PAID' : '⏳ UNPAID'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Placed: {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Customer overview */}
                <div className="text-xs text-slate-300 space-y-1">
                  <p>👤 Buyer: <b className="text-white">{order.displayName}</b> ({order.email})</p>
                  <p>📍 Address: {order.shippingInfo.fullName}, {order.shippingInfo.addressLine1}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                  <p>📞 Phone: {order.shippingInfo.phone}</p>
                  {order.shippingInfo.notes && (
                    <p className="italic text-slate-500 mt-1">📝 Notes: "{order.shippingInfo.notes}"</p>
                  )}
                </div>

                {/* Items list */}
                <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 max-w-lg">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Ordered Compounds Detail</div>
                  {order.items.map((item, idx) => {
                    const costPerVial = getProductCostPerVial(item.name, item.price / 0.85, wholesale);
                    const itemProfit = item.price - costPerVial;
                    const totalProfitForLine = itemProfit * item.quantity;
                    return (
                      <div key={idx} className="flex flex-col border-b border-slate-800/30 pb-1.5 last:border-0 last:pb-0">
                        <div className="flex justify-between text-xs font-mono text-slate-300">
                          <span>
                            <span className="font-bold text-[#ef4444] mr-2">{item.quantity}x</span>
                            {item.name}
                          </span>
                          <span className="text-slate-400 font-semibold">${item.price * item.quantity}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                          <span>Cost per Vial: ${costPerVial.toFixed(2)}</span>
                          <span>Line Profit: <span className="text-emerald-400/90 font-semibold">${totalProfitForLine.toFixed(2)}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking Input interface for Admin */}
                {order.status === 'processing' && (
                  <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor={`track_input_${order.id}`}>Fulfillment Carrier Tracking</label>
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        placeholder="e.g. USPS9400100..."
                        id={`track_input_${order.id}`}
                        defaultValue={order.trackingNumber || ''}
                        className="bg-slate-950 px-2 py-1 text-xs text-white border border-slate-800 rounded focus:border-cyan-500 focus:outline-none flex-1 font-mono"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`track_input_${order.id}`) as HTMLInputElement;
                          const val = input?.value?.trim() || 'USPS94001' + Math.floor(100000 + Math.random() * 900000);
                          onShipOrder(order.id, val);
                        }}
                        disabled={actionLoading !== null}
                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded cursor-pointer"
                      >
                        Ship &amp; Notify
                      </button>
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm text-xs space-y-1 ml-0.5">
                    <p className="font-mono text-[10px] text-slate-400">📦 Tracking: <span className="text-cyan-400 font-bold">{order.trackingNumber}</span></p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      Tracking Status:
                      <span className={`font-extrabold uppercase px-1.5 py-0.5 rounded text-[8px] ${order.trackingStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'}`}>
                        {order.trackingStatus || 'shipped'}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Control transitions & Email Actions */}
              <div className="flex flex-col justify-between items-start md:items-end shrink-0 select-none">
                <div className="md:text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bill Total</span>
                  <div className="text-2xl font-black text-rose-300 mt-0.5">
                    ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                  </div>
                  {(() => {
                    const shippingCost = order.shippingInfo?.cost || 0;
                    const taxAmount = order.tax || 0;
                    const orderCost = order.items.reduce((sum, item) => sum + (getProductCostPerVial(item.name, item.price / 0.85, wholesale) * item.quantity), 0);
                    const orderProfit = order.total - orderCost - shippingCost - taxAmount;
                    return (
                      <div className="mt-2 text-right font-mono text-[10px] space-y-0.5 border-t border-slate-900 pt-1.5">
                        <div className="text-slate-400">Products Cost: <span className="text-slate-300">${orderCost.toFixed(2)}</span></div>
                        {shippingCost > 0 && (
                          <div className="text-slate-400">Postage Cost: <span className="text-slate-300">${shippingCost.toFixed(2)}</span></div>
                        )}
                        {taxAmount > 0 && (
                          <div className="text-slate-400">Florida Tax (6%): <span className="text-slate-300">${taxAmount.toFixed(2)}</span></div>
                        )}
                        <div className="text-emerald-400 font-semibold">Net Profit: <span className="font-extrabold text-emerald-300">${orderProfit.toFixed(2)}</span></div>
                      </div>
                    );
                  })()}
                </div>

                {/* Action buttons for orders */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {order.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => onMarkAsPaid(order.id)}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                    >
                      💵 Mark as Paid
                    </button>
                  )}

                  {order.status === 'placed' && order.paymentStatus === 'paid' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'processing')}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-blue-500 text-slate-950 hover:bg-blue-400 font-bold text-[10px] rounded cursor-pointer"
                    >
                      Process Order
                    </button>
                  )}

                  {order.status === 'processing' && (
                    <button
                      onClick={() => {
                        const input = document.getElementById(`track_input_${order.id}`) as HTMLInputElement;
                        const val = input?.value?.trim() || 'USPS94001' + Math.floor(100000 + Math.random() * 900000);
                        onShipOrder(order.id, val);
                      }}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-[10px] rounded cursor-pointer animate-pulse"
                    >
                      Dispatch Shipping
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <div className="flex flex-col gap-1.5 items-end">
                      <button
                        onClick={() => onSimulateDeliveryCheck(order.id)}
                        disabled={actionLoading !== null}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                      >
                        🚚 Mark as Delivered (Simulate)
                      </button>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                        disabled={actionLoading !== null}
                        className="px-2 py-1 bg-[#10172a] text-slate-400 hover:text-white text-[9px] font-bold rounded cursor-pointer border border-slate-800"
                      >
                        Direct Complete
                      </button>
                    </div>
                  )}

                  {['placed', 'processing'].includes(order.status) && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-red-400 text-[10px] rounded border border-slate-800 cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}

                  {confirmDeleteOrderId === order.id ? (
                    <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/40 p-1.5 rounded-xl text-[10px]">
                      <span className="text-rose-400 font-bold font-mono uppercase tracking-widest text-[9px] px-1">Delete order?</span>
                      <button
                        type="button"
                        onClick={async () => {
                          onSetConfirmDeleteOrderId(null);
                          await onDeleteOrder(order.id);
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-550 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetConfirmDeleteOrderId(null)}
                        className="px-2.5 py-1 bg-[#1e293b] hover:bg-slate-800 text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        onSetConfirmDeleteOrderId(order.id);
                      }}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-slate-900 text-rose-400/95 hover:text-rose-300 hover:bg-red-950/20 text-[10px] rounded border border-slate-800 hover:border-red-500/30 cursor-pointer transition-all flex items-center gap-1"
                    >
                      🗑️ Delete Order
                    </button>
                  )}
                </div>

                <a
                  href={`mailto:${order.email}?subject=LabRat Order Invoicing ${order.id}&body=Hi ${order.displayName}, %0D%0A%0D%0AYour standard biochemical request (${order.id}) totalling $${typeof order.total === 'number' ? order.total.toFixed(2) : order.total} has been registered on the LabRat console.%0D%0A%0D%0APlease follow these payment instructions: [Insert payment/email links]%0D%0A%0D%0AThank you, %0D%0ALabRat Operations`}
                  className="mt-3 text-rose-300 hover:text-rose-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Generate payment email invoice"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Invoice instructions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
