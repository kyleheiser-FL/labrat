import React from 'react';
import { MapPin, Truck, Loader2, Send, BadgeCheck, Minus, Plus } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';
import { CartItem, ShippingOption } from '../../lib/shopTypes';
import { getSalePrice, getKitSellPrice, getChinaKitSellPrice, getChinaVialSellPrice, getShippingOptions, getChinaFlatShipping, NORWAY_KIT_FLAT_SHIPPING, cleanProductName } from '../../lib/shopHelpers';
import { usePricingConfig } from '../../lib/pricingConfig';

interface ShippingFormState {
  fullName: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  notes: string;
}

interface ShopCheckoutViewProps {
  cart: CartItem[];
  subtotal: number;
  shippingForm: ShippingFormState;
  selectedShippingOptionId: string;
  shippingCarrierFilter: 'ALL' | 'USPS' | 'UPS';
  actionLoading: string | null;
  isKitPricing?: boolean;
  isChinaKitPricing?: boolean;
  isChinaVialPricing?: boolean;
  bacWaterQty?: number;
  onSetBacWaterQty?: (qty: number) => void;
  onSetShippingForm: (updater: (prev: ShippingFormState) => ShippingFormState) => void;
  onSetShippingCarrierFilter: (carrier: 'ALL' | 'USPS' | 'UPS') => void;
  onSetSelectedShippingOptionId: (id: string) => void;
  onSetView: (v: string) => void;
  onPlaceOrder: (e: React.FormEvent) => void;
}

export default function ShopCheckoutView({
  cart,
  subtotal,
  shippingForm,
  selectedShippingOptionId,
  shippingCarrierFilter,
  actionLoading,
  isKitPricing = false,
  isChinaKitPricing = false,
  isChinaVialPricing = false,
  bacWaterQty = 0,
  onSetBacWaterQty,
  onSetShippingForm,
  onSetShippingCarrierFilter,
  onSetSelectedShippingOptionId,
  onSetView,
  onPlaceOrder,
}: ShopCheckoutViewProps) {
  const pc = usePricingConfig();
  const totalVials = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Check if shipping address details have been fully entered
  const isAddressProvided = !!(
    shippingForm.fullName.trim() &&
    shippingForm.addressLine1.trim() &&
    shippingForm.city.trim() &&
    shippingForm.state.trim() &&
    shippingForm.zipCode.trim().length >= 5
  );

  const shippingDetails = getShippingOptions(shippingForm.zipCode, totalVials, cart);
  const selectedOption = isAddressProvided
    ? (shippingDetails.options.find(o => o.id === selectedShippingOptionId) || shippingDetails.options[0])
    : null;
  const isChinaPricing = isChinaKitPricing || isChinaVialPricing;
  const chinaFlatShipping = getChinaFlatShipping(cart.map(i => ({ name: i.product.name })));
  const shippingCost = isKitPricing
    ? NORWAY_KIT_FLAT_SHIPPING
    : isChinaPricing ? chinaFlatShipping : (selectedOption ? selectedOption.cost : 0);
  const isFlorida = shippingForm.state.trim().toLowerCase() === 'fl' || shippingForm.state.trim().toLowerCase() === 'florida';
  const salesTaxRate = 0.06;
  const bacWaterCost = bacWaterQty * 7;
  const salesTax = isFlorida ? Math.round((subtotal + bacWaterCost) * salesTaxRate * 100) / 100 : 0;
  const finalInvoiceTotal = subtotal + bacWaterCost + shippingCost + salesTax;

  return (
    <div id="shop-checkout-view" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* DELIVERY DATA INPUTS */}
      <div className="lg:col-span-2">
        <div className="bg-[#0b1329]/70 border border-[#1e293b] p-6 sm:p-8 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> Laboratory Delivery Dispatch Address
          </h3>

          <form onSubmit={onPlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-name">Full Dispatch Name</label>
              <input
                type="text"
                required
                id="ship-name"
                autoComplete="name"
                placeholder="John Thompson"
                value={shippingForm.fullName}
                onChange={(e) => onSetShippingForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-address">Shipping Address</label>
                <input
                  type="text"
                  required
                  id="ship-address"
                  autoComplete="street-address"
                  placeholder="Terminal Wharf Road, Building #1A"
                  value={shippingForm.addressLine1}
                  onChange={(e) => onSetShippingForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-city">City</label>
                <input
                  type="text"
                  required
                  id="ship-city"
                  autoComplete="address-level2"
                  placeholder="Boston"
                  value={shippingForm.city}
                  onChange={(e) => onSetShippingForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-state">State / Province</label>
                <input
                  type="text"
                  required
                  id="ship-state"
                  autoComplete="address-level1"
                  placeholder="MA"
                  value={shippingForm.state}
                  onChange={(e) => onSetShippingForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-zip">Zip / Postal Code</label>
                <input
                  type="text"
                  required
                  id="ship-zip"
                  autoComplete="postal-code"
                  placeholder="34609"
                  value={shippingForm.zipCode}
                  onChange={(e) => onSetShippingForm(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-phone">Contact Phone</label>
                <input
                  type="tel"
                  required
                  id="ship-phone"
                  autoComplete="tel"
                  placeholder="(+1) 555-0104"
                  value={shippingForm.phone}
                  onChange={(e) => onSetShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* DISPATCH ORIGIN HIGHLIGHT WIDGET */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 text-cyan-400 rounded-lg border border-slate-800">
                  <Truck className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-left font-sans">
                  <span className="text-[9px] uppercase font-black text-slate-500 font-mono tracking-widest block">Dispatch Hub Origin</span>
                  <span className="font-extrabold text-slate-200">
                    {isKitPricing ? 'Oslo, Norway' : isChinaKitPricing ? 'Beijing, China' : 'Greater Tampa Bay'}
                  </span>
                </div>
              </div>
              <span className="text-[9.5px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 px-2.5 py-1 rounded-md font-mono select-none uppercase tracking-wide shrink-0">
                {isKitPricing ? '🇳🇴 Norway Warehouse' : isChinaKitPricing ? '🇨🇳 China Warehouse' : '📍 USA Shipping Facility'}
              </span>
            </div>

            {/* POSTAGE CARRIER & SHIPPING SERVICE SELECTOR */}
            {(isKitPricing || isChinaKitPricing || isChinaVialPricing) ? (
              <div className={`p-4 rounded-xl border my-4 text-left flex items-center gap-4 ${
                isChinaPricing && chinaFlatShipping === 0 ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-cyan-950/20 border-cyan-500/20'
              }`}>
                <div className={`p-2 bg-slate-950 rounded-lg border shrink-0 ${
                  isChinaPricing && chinaFlatShipping === 0 ? 'border-emerald-500/20' : 'border-cyan-500/20'
                }`}>
                  <Truck className={`w-5 h-5 ${isChinaPricing && chinaFlatShipping === 0 ? 'text-emerald-400' : 'text-cyan-400'}`} />
                </div>
                <div>
                  {isChinaPricing && chinaFlatShipping === 0 ? (
                    <>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block font-mono">USA Warehouse — Free Shipping</span>
                      <p className="text-xs text-slate-300 mt-0.5">Every item in this order ships from our <span className="text-emerald-400 font-black">USA warehouse</span> with <span className="text-emerald-400 font-black">FREE shipping</span>.</p>
                    </>
                  ) : isChinaPricing ? (
                    <>
                      <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest block font-mono">China — Flat Rate Shipping</span>
                      <p className="text-xs text-slate-300 mt-0.5">A flat <span className="text-cyan-400 font-black">$25.00</span> international shipping fee applies. Orders containing only USA-warehouse items ship free.</p>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest block font-mono">Norway Kit — Flat Rate Shipping</span>
                      <p className="text-xs text-slate-300 mt-0.5">A flat <span className="text-cyan-400 font-black">$30.00</span> shipping fee applies to all kit orders. Carrier and method will be selected at time of dispatch.</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 my-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block font-mono">POSTAGE & IN-TRANSIT RATES</span>
                    <h4 className="text-xs font-black text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-cyan-400" /> Carrier Dispatch Estimates
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                      📦 Weight: <b className="text-slate-300 font-bold">{shippingDetails.weightLbs} lbs</b>
                    </span>
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                      📍 {isAddressProvided ? shippingDetails.zoneName : 'Pending Address'}
                    </span>
                  </div>
                </div>

                {isAddressProvided ? (
                  <>
                    {/* Carrier Filters */}
                    <div className="flex gap-2 mb-4">
                      {(['ALL', 'USPS', 'UPS'] as const).map(carrier => (
                        <button
                          key={carrier}
                          type="button"
                          onClick={() => { triggerHaptic('light'); onSetShippingCarrierFilter(carrier); }}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                            shippingCarrierFilter === carrier
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          {carrier === 'ALL' ? 'All Services' : carrier}
                        </button>
                      ))}
                    </div>

                    {/* Options List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {shippingDetails.options
                        .filter(opt => shippingCarrierFilter === 'ALL' || opt.carrier === shippingCarrierFilter)
                        .map(opt => {
                          const isSelected = selectedShippingOptionId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => { triggerHaptic('light'); onSetSelectedShippingOptionId(opt.id); }}
                              className={`border rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group select-none min-h-[92px] ${
                                isSelected
                                  ? 'bg-cyan-950/25 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.06)]'
                                  : 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded ${
                                    opt.carrier === 'USPS'
                                      ? 'bg-blue-600/20 text-blue-400'
                                      : 'bg-amber-600/20 text-amber-500'
                                  }`}>
                                    {opt.carrier}
                                  </span>
                                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                                    {opt.name.replace('USPS ', '').replace('UPS® ', '')}
                                  </span>
                                </div>
                                <span className={`text-xs font-black font-mono select-all ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                                  ${opt.cost.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-end justify-between mt-3 text-[10px] font-mono">
                                <div className="space-y-0.5">
                                  <div className="text-slate-500 text-[9.5px]">Est: {opt.transitDaysMin === opt.transitDaysMax ? `${opt.transitDaysMin} Business Day` : `${opt.transitDaysMin}-${opt.transitDaysMax} Business Days`}</div>
                                  <div className="text-cyan-400/85">📅 {opt.estimatedDeliveryDate}</div>
                                </div>
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-slate-700'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <MapPin className="w-7 h-7 text-slate-600" />
                    <div className="space-y-1 max-w-sm">
                      <p className="font-bold text-slate-300">Awaiting Dispatch Address Details</p>
                      <p className="text-[10.5px] text-slate-500 leading-normal">
                        Enter your full dispatch name, street address, city, state, and complete 5-digit ZIP code above to calculate shipping options instantly.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-notes">Special Dispatch / Delivery Instructions</label>
              <textarea
                rows={2}
                id="ship-notes"
                placeholder="Leave at front porch, keep upright, or special requests..."
                value={shippingForm.notes}
                onChange={(e) => onSetShippingForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-xs transition-all focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                id="shop-checkout-adjust-btn"
                type="button"
                onClick={() => { triggerHaptic('light'); onSetView('cart'); }}
                className="px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 font-bold text-xs rounded-xl cursor-pointer"
              >
                Adjust Cart
              </button>
              <button
                type="submit"
                disabled={actionLoading === 'checkout'}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 text-slate-950 font-black text-xs rounded-xl uppercase transition-all tracking-wider active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {actionLoading === 'checkout' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Dispatching Request...
                  </>
                ) : (
                  <>
                    Confirm Dispatch Order &amp; Invoice Request <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MINI CART SUMMARY */}
      <div className="lg:col-span-1">
        <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-2xl sticky top-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-3">Vials Reserved</h3>
          <div className="divide-y divide-[#1e293b]/50 max-h-[160px] overflow-y-auto mb-4 scrollbar-none pr-1">
            {cart.map(item => (
              <div key={item.product.id} className="py-2.5 flex justify-between text-xs text-left">
                <div className="text-slate-400">
                  <span className="font-extrabold text-[#22d3ee] mr-1">{item.quantity}x</span>
                  {cleanProductName(item.product.name)}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-slate-200">
                    ${(isKitPricing
                      ? (getKitSellPrice(item.product.name, pc) || item.product.price)
                      : isChinaKitPricing
                      ? (getChinaKitSellPrice(item.product.name, pc) || item.product.price)
                      : isChinaVialPricing
                      ? (getChinaVialSellPrice(item.product.name, pc) || getSalePrice(item.product.price, item.product.name, pc))
                      : getSalePrice(item.product.price, item.product.name, pc)) * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-slate-800 my-3" />

          {/* BAC Water Add-On */}
          <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-2.5 mb-3">
              <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest font-mono mb-1.5">Checkout Add-On</div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200 leading-tight">BAC Water (10ml)</div>
                  <div className="text-[10px] text-slate-400">$7.00 per vial</div>
                </div>
                <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSetBacWaterQty?.(Math.max(0, bacWaterQty - 1))}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-all cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-extrabold text-slate-200">{bacWaterQty}</span>
                  <button
                    type="button"
                    onClick={() => onSetBacWaterQty?.(bacWaterQty + 1)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
          </div>

          {/* Detailed Invoice Breakdown */}
          <div className="space-y-2 text-xs border-b border-slate-800/60 pb-3 mb-3">
            <div className="flex justify-between items-center text-slate-400 leading-none">
              <span>Research Subtotal:</span>
              <span className="font-semibold text-slate-300 font-mono">${subtotal}.00</span>
            </div>
            {bacWaterQty > 0 && (
              <div className="flex justify-between items-center text-slate-400 leading-none">
                <span>BAC Water ({bacWaterQty}×$7):</span>
                <span className="font-semibold text-slate-300 font-mono">+${bacWaterCost}.00</span>
              </div>
            )}
            <div className="flex justify-between items-start text-slate-400 leading-none">
              <div className="text-left">
                <span>Postage Dispatch:</span>
                <span className="block text-[9.5px] text-slate-500 font-mono">
                  {isKitPricing
                    ? 'Norway Kit Flat Rate'
                    : isChinaPricing
                    ? (chinaFlatShipping === 0 ? 'USA Warehouse — Free Shipping' : 'China Flat Rate')
                    : (selectedOption ? `${selectedOption.carrier} ${selectedOption.name.replace('USPS ', '').replace('UPS® ', '')}` : 'Pending Address')}
                </span>
              </div>
              <span className="font-semibold text-slate-300 font-mono">
                {isKitPricing
                  ? `+$${NORWAY_KIT_FLAT_SHIPPING}.00`
                  : isChinaPricing
                  ? (chinaFlatShipping === 0 ? 'FREE' : `+$${chinaFlatShipping}.00`)
                  : (selectedOption ? `+$${shippingCost.toFixed(2)}` : '--')}
              </span>
            </div>
            {isFlorida && (
              <div className="flex justify-between items-center text-slate-400 leading-none">
                <span className="flex items-center gap-1">Florida Sales Tax (6.0%):</span>
                <span className="font-semibold text-emerald-400 font-mono">
                  +${salesTax.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wide">Invoice Total:</span>
            <span className="text-lg font-black text-cyan-400 font-mono">${finalInvoiceTotal.toFixed(2)}</span>
          </div>

          <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 text-[10px] text-emerald-300/90 leading-tight flex items-start gap-1.5">
            <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><b>Manual Transfer:</b> Invoicing totals arrive via email inclusive of your chosen carrier postage.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
