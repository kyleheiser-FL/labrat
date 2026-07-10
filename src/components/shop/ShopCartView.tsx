import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';
import { CartItem } from '../../lib/shopTypes';
import { getSalePrice, getKitSellPrice, getChinaKitSellPrice, getChinaVialSellPrice, getChinaFlatShipping, NORWAY_KIT_FLAT_SHIPPING, cleanProductName } from '../../lib/shopHelpers';
import { usePricingConfig } from '../../lib/pricingConfig';

interface ShopCartViewProps {
  cart: CartItem[];
  subtotal: number;
  totalQty: number;
  shippingForm: {
    state: string;
    [key: string]: string;
  };
  isKitPricing?: boolean;
  isChinaKitPricing?: boolean;
  isChinaVialPricing?: boolean;
  bacWaterQty?: number;
  onSetBacWaterQty?: (qty: number) => void;
  onAdjustQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onSetView: (v: string) => void;
}

export default function ShopCartView({
  cart,
  subtotal,
  totalQty,
  shippingForm,
  isKitPricing = false,
  isChinaKitPricing = false,
  isChinaVialPricing = false,
  bacWaterQty = 0,
  onSetBacWaterQty,
  onAdjustQuantity,
  onRemoveFromCart,
  onSetView,
}: ShopCartViewProps) {
  const pc = usePricingConfig();
  const effectivePrice = (item: CartItem) =>
    isKitPricing ? (getKitSellPrice(item.product.name, pc) || item.product.price) :
    isChinaKitPricing ? (getChinaKitSellPrice(item.product.name, pc) || item.product.price) :
    isChinaVialPricing ? (getChinaVialSellPrice(item.product.name, pc) || getSalePrice(item.product.price, item.product.name, pc)) :
    getSalePrice(item.product.price, item.product.name, pc);
  return (
    <div id="shop-cart-view" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* CART ITEMS LIST */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" /> Vials &amp; Materials Selected ({cart.length})
          </h2>
          <button
            onClick={() => { triggerHaptic('light'); onSetView('catalog'); }}
            className="text-xs text-cyan-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Your Shopping Cart is Empty</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              Explore the materials catalog to reserve biochemical compounds.
            </p>
            <button
              onClick={() => { triggerHaptic('light'); onSetView('catalog'); }}
              className="mt-4 px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="bg-[#10172a]/40 border border-[#1e293b]/80 rounded-2xl divide-y divide-[#1e293b]/50">
            {cart.map(item => (
              <div key={item.product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="max-w-xs text-left">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.product.category}</span>
                  <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">{cleanProductName(item.product.name)}</h4>
                  <div className="flex items-center gap-1.5 mt-1 sm:mt-0.5 flex-wrap">
                    <span className="text-xs text-cyan-400 font-semibold inline-block mt-0.5">
                      ${effectivePrice(item)}.00 {(isKitPricing || isChinaKitPricing) ? 'per kit · 10 vials' : 'per vial'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantities Adjustment Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => onAdjustQuantity(item.product.id, -1)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-extrabold text-slate-200">{item.quantity}</span>
                    <button
                      onClick={() => onAdjustQuantity(item.product.id, 1)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-extrabold text-white w-16 text-right">
                      ${effectivePrice(item) * item.quantity}.00
                    </span>
                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
                      title="Discard compound"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHECKOUT PRICING SUMMARY */}
      <div className="lg:col-span-1">
        {cart.length > 0 && (() => {
          const nonBacItems = cart.filter(item => item.product.id !== 'prod_bac_water_10ml');
          const nonBacSubtotal = nonBacItems.reduce((sum, item) => sum + (effectivePrice(item) * item.quantity), 0);
          const isFreeShippingEligible = nonBacSubtotal >= 100;
          const isFlorida = shippingForm.state.trim().toLowerCase() === 'fl' || shippingForm.state.trim().toLowerCase() === 'florida';
          const salesTaxRate = 0.06;
          const bacWaterCost = bacWaterQty * 7;
          const salesTax = isFlorida ? Math.round((subtotal + bacWaterCost) * salesTaxRate * 100) / 100 : 0;

          // Free shipping for everyone, on every order.
          const shippingDisplay = 'Free';
          const orderTotal = subtotal + bacWaterCost + salesTax;

          return (
            <div className="space-y-4 sticky top-6 text-left">
              {/* Shipping info card — free for everyone */}
              <div className="bg-[#0b1329] p-5 rounded-2xl shadow-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Free Shipping</span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Free</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Every order ships <span className="text-emerald-400 font-semibold">free</span> — no minimum, no shipping charges.
                </p>
              </div>

              {/* BAC Water Add-On */}
              <div className="bg-[#0b1329] border border-slate-700/60 rounded-2xl p-4">
                <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest font-mono mb-2">Checkout Add-On</div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-200 leading-tight">BAC Water (10ml)</div>
                    <div className="text-[10px] text-slate-400">$7.00 per vial</div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => { triggerHaptic('light'); onSetBacWaterQty?.(Math.max(0, bacWaterQty - 1)); }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-all cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-extrabold text-slate-200">{bacWaterQty}</span>
                    <button
                      type="button"
                      onClick={() => { triggerHaptic('light'); onSetBacWaterQty?.(bacWaterQty + 1); }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div id="cart-order-summary-card" className="bg-[#0b1329] border border-[#1e293b] p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#1e293b]">
                  Order Summary
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Physical Vials ({totalQty})</span>
                    <span className="font-semibold text-slate-200">${subtotal}.00</span>
                  </div>
                  {bacWaterQty > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>BAC Water ({bacWaterQty}×$7)</span>
                      <span className="font-semibold text-slate-200">+${bacWaterCost}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className={`font-semibold ${isFreeShippingEligible && !knownShipping ? 'text-emerald-400' : knownShipping ? 'text-slate-200' : 'text-slate-500 italic'}`}>
                      {shippingDisplay}
                    </span>
                  </div>
                  {isFlorida ? (
                    <div className="flex justify-between text-slate-400">
                      <span>Florida Sales Tax (6.0%)</span>
                      <span className="font-semibold text-slate-200">${salesTax.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-slate-400">
                      <span>Estimated Sales Tax</span>
                      <span className="font-semibold text-slate-500">$0.00</span>
                    </div>
                  )}
                  <div className="h-px bg-[#1e293b] my-4" />
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-white">Estimated Total</span>
                    <span className="font-black text-cyan-400 text-lg">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-400/90 rounded-xl p-3.5 mt-5 leading-normal">
                  🤝 <span className="font-bold text-cyan-300">No Payment Details Required:</span> Checkout is completed without providing banking or debit information. The administrator handles invoicing manually by verified email.
                </div>

                <button
                  id="cart-checkout-btn"
                  onClick={() => { triggerHaptic('light'); onSetView('checkout'); }}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase mt-5 active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  Go to Delivery Options <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
