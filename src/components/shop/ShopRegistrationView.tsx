import React from 'react';
import { ShoppingBag, CheckCircle, Loader2, Send } from 'lucide-react';

export interface JoinFormState {
  shippingAddress: string;
  phone: string;
  pricingPreference: 'vial' | 'kit';
  source: 'norway' | 'china';
  selectedProducts: string[];
}

export interface RegistrationProductGroup {
  category: string;
  products: { name: string; availableNorway: boolean; availableChina: boolean }[];
}

interface ShopRegistrationViewProps {
  email: string;
  joinForm: JoinFormState;
  onSetJoinForm: React.Dispatch<React.SetStateAction<JoinFormState>>;
  registrationProductGroups: RegistrationProductGroup[];
  actionLoading: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ShopRegistrationView({
  email,
  joinForm,
  onSetJoinForm,
  registrationProductGroups,
  actionLoading,
  onSubmit,
}: ShopRegistrationViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="shop-registration-lobby">
      <div className="bg-[#0f172a]/50 border border-[#1e293b]/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl self-start mb-4 w-fit">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Request Member Shopping Access</h2>
          <p className="text-slate-400 text-sm mt-3 leading-linear">
            Our materials are formulated and reserved for registered biochemical researchers.
            Applying is free. The administrator will review your contact credentials and approve your account, granting access to premium items.
          </p>

          <ul className="mt-5 space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              No direct credit card upfront. Payments handled afterwards via verified email invoices.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              Premium logistics tracking directly on your dashboard.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              Priority stock reservation matching active planned compounds.
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-[#0b1329]/70 border border-[#1e293b] p-6 sm:p-8 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-4">Researcher Address Registry</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-email">Verified Email</label>
            <input
              type="email"
              disabled
              value={email}
              id="reg-email"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-address">Full Shipping Address</label>
            <textarea
              required
              rows={2}
              id="reg-address"
              placeholder="Street Address, City, State, ZIP"
              value={joinForm.shippingAddress}
              onChange={(e) => onSetJoinForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-sm focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-phone">Contact Phone Number</label>
            <input
              type="tel"
              required
              id="reg-phone"
              placeholder="(+1) 555-0199"
              value={joinForm.phone}
              onChange={(e) => onSetJoinForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Source Selection */}
          <div className="border-t border-slate-800 pt-4 mt-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Sourcing Preference</label>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">This affects pricing, compound availability, and documentation.</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => onSetJoinForm(prev => ({ ...prev, source: 'norway' }))}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${joinForm.source === 'norway' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-bold ${joinForm.source === 'norway' ? 'text-cyan-300' : 'text-slate-300'}`}>🇳🇴 Norway · Swiss Premium</span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">Recommended</span>
                </div>
                <ul className="space-y-0.5 text-[10px] text-slate-400">
                  <li>✓ GMP-certified Scandinavian &amp; Swiss synthesis</li>
                  <li>✓ HPLC purity certificate included per batch</li>
                  <li>✓ Sub-1 EU/mg endotoxin levels</li>
                  <li>✓ Full compound selection available</li>
                </ul>
                <p className="mt-2 text-[10px] text-slate-500 italic">Higher price point — premium QC documentation</p>
                {joinForm.source === 'norway' && <span className="mt-2 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Selected</span>}
              </button>
              <button
                type="button"
                onClick={() => onSetJoinForm(prev => ({ ...prev, source: 'china' }))}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${joinForm.source === 'china' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
              >
                <span className={`text-xs font-bold mb-1.5 ${joinForm.source === 'china' ? 'text-orange-300' : 'text-slate-300'}`}>🇨🇳 China · Budget Tier</span>
                <ul className="space-y-0.5 text-[10px] text-slate-400">
                  <li>✓ Industrial-scale synthesis</li>
                  <li>✓ Competitive per-vial pricing</li>
                  <li>✓ Standard QC</li>
                  <li className="text-slate-500">⚠ Limited compound selection (not all peptides available)</li>
                  <li className="text-slate-500">⚠ No HPLC certificate included</li>
                </ul>
                <p className="mt-2 text-[10px] text-slate-500 italic">Lower price — select compounds only</p>
                {joinForm.source === 'china' && <span className="mt-2 text-[9px] font-bold text-orange-400 uppercase tracking-wider">Selected</span>}
              </button>
            </div>
          </div>

          {/* Product Interest (Wishlist) */}
          <div className="border-t border-slate-800 pt-4 mt-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Peptides of Interest</label>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">Select everything you're interested in. Kit pricing = 10 vials per compound.</p>
            {joinForm.selectedProducts.length > 0 && (
              <p className="text-[11px] text-cyan-400 font-semibold mb-3">
                {joinForm.selectedProducts.length} compound{joinForm.selectedProducts.length !== 1 ? 's' : ''} selected · Kit: 10 vials each
              </p>
            )}
            <div className="space-y-4">
              {registrationProductGroups.map(group => (
                <div key={group.category}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{group.category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.products.map(product => {
                      const isSelected = joinForm.selectedProducts.includes(product.name);
                      const isAvailable = joinForm.source === 'norway' ? product.availableNorway : product.availableChina;
                      const unavailableLabel = !isAvailable ? (joinForm.source === 'norway' ? 'China only' : 'Norway only') : null;
                      return (
                        <button
                          key={product.name}
                          type="button"
                          onClick={() => onSetJoinForm(prev => ({
                            ...prev,
                            selectedProducts: prev.selectedProducts.includes(product.name)
                              ? prev.selectedProducts.filter(p => p !== product.name)
                              : [...prev.selectedProducts, product.name]
                          }))}
                          className={`flex flex-col items-start px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                          } ${!isAvailable ? 'opacity-50' : ''}`}
                        >
                          <span className="text-[11px]">{product.name}</span>
                          {unavailableLabel && (
                            <span className="text-[9px] text-slate-500 mt-0.5">{unavailableLabel}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Preference */}
          <div className="border-t border-slate-800 pt-4 mt-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Preferred Pricing Model</label>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">How would you like to purchase? Per-vial lets you order any quantity; kit pricing is 10 vials at a time at a lower rate.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSetJoinForm(prev => ({ ...prev, pricingPreference: 'vial' }))}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${joinForm.pricingPreference === 'vial' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
              >
                <span className={`text-xs font-bold mb-1 ${joinForm.pricingPreference === 'vial' ? 'text-cyan-300' : 'text-slate-300'}`}>Per Vial</span>
                <span className="text-[10px] text-slate-500 leading-normal">Order any quantity at standard single-vial pricing.</span>
                {joinForm.pricingPreference === 'vial' && <span className="mt-2 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Selected</span>}
              </button>
              <button
                type="button"
                onClick={() => onSetJoinForm(prev => ({ ...prev, pricingPreference: 'kit' }))}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${joinForm.pricingPreference === 'kit' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
              >
                <span className={`text-xs font-bold mb-1 ${joinForm.pricingPreference === 'kit' ? 'text-cyan-300' : 'text-slate-300'}`}>Kit Pricing</span>
                <span className="text-[10px] text-slate-500 leading-normal">10 vials per order at a reduced kit rate. Best value for regular use.</span>
                {joinForm.pricingPreference === 'kit' && <span className="mt-2 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Selected</span>}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading === 'join'}
            className="w-full py-3 bg-cyan-500 disabled:bg-cyan-500/40 text-slate-950 font-bold text-sm rounded-xl cursor-pointer hover:bg-cyan-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {actionLoading === 'join' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Retail Access Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
