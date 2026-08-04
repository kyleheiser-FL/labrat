import React from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  Loader2,
  PlusCircle,
  Package,
  Search,
  Sparkles,
  Flame,
  Brain,
  Shield,
  Heart,
  Droplet,
  Moon,
  Dna,
  TrendingUp,
  BadgeCheck,
  Truck,
  ClipboardCheck,
} from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';
import { ShopProduct, CartItem, OrderDetail } from '../../lib/shopTypes';
import {
  getProductBaseAndSize,
  getSecondaryBenefit,
  getSecondaryBenefitStyle,
  getSalePrice,
  getKitSellPrice,
  getChinaKitSellPrice,
  getChinaVialSellPrice,
  getCleanDescription,
  getCategoryBadgeStyle,
  cleanProductName,
} from '../../lib/shopHelpers';
import { usePricingConfig } from '../../lib/pricingConfig';
import { rankSearch, SearchFields } from '../../lib/search';
import { getShopTierViewModel } from '../../lib/shopViewModels';
import ProductVialVisual from './ProductVialVisual';
import PeptideRequestForm from './PeptideRequestForm';

const shopFields = (p: ShopProduct): SearchFields => ({
  name: p.name,
  chemicalName: p.chemicalName,
  aliasKey: getProductBaseAndSize(p.name).baseName
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+(china|us warehouse)\s*$/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''),
  extra: p.description,
});

function getProductAvailableStock(prodId: string, baseInventory: number, allOrdersGlobal: OrderDetail[]): number {
  let stock = baseInventory;

  allOrdersGlobal.forEach(order => {
    const item = order.items?.find((i: any) => i.id === prodId);
    if (item) {
      const orderDate = new Date(order.createdAt);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const isUnpaidAndExpired = order.paymentStatus !== 'paid' && orderDate < fourteenDaysAgo;

      if (!isUnpaidAndExpired) {
        stock -= item.quantity;
      }
    }
  });

  return Math.max(0, stock);
}

interface ShopCatalogViewProps {
  products: ShopProduct[];
  catalogLoading: boolean;
  searchQuery: string;
  onSetSearchQuery: (q: string) => void;
  selectedCategory: string;
  onSetSelectedCategory: (c: string) => void;
  showShopSuggestions: boolean;
  onSetShowShopSuggestions: (v: boolean) => void;
  selectedProductIds: Record<string, string>;
  onSetSelectedProductIds: (ids: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  cart: CartItem[];
  labratTheme: 'clinical' | 'clinical-light';
  isViewingAsAdmin: boolean;
  isAdminUser: boolean;
  actionLoading: string | null;
  onAddToCart: (product: ShopProduct) => void;
  onSetSelectedParentProductGroup: (group: { baseName: string; category: string; description: string; options: (ShopProduct & { size: string })[] } | null) => void;
  onSetSelectedOptionIdInDrawer: (id: string) => void;
  onSetDrawerQuantity: (q: number) => void;
  onSeedDatabase: () => void;
  onSetView: (v: string) => void;
  onSetShowProductModal: (v: boolean) => void;
  onSetEditingProduct: (p: ShopProduct | null) => void;
  onSetProductForm: (f: any) => void;
  onSetProductValidationError: (e: string | null) => void;
  onSetSelectedCertKey: (k: string | null) => void;
  allOrdersGlobal: OrderDetail[];
  isKitPricing?: boolean;
  isChinaKitPricing?: boolean;
  isChinaVialPricing?: boolean;
  isApprovedVialPricing?: boolean;
}

export default function ShopCatalogView({
  products,
  catalogLoading,
  searchQuery,
  onSetSearchQuery,
  selectedCategory,
  onSetSelectedCategory,
  showShopSuggestions,
  onSetShowShopSuggestions,
  selectedProductIds,
  onSetSelectedProductIds,
  cart,
  labratTheme,
  isViewingAsAdmin,
  isAdminUser,
  actionLoading,
  onAddToCart,
  onSetSelectedParentProductGroup,
  onSetSelectedOptionIdInDrawer,
  onSetDrawerQuantity,
  onSeedDatabase,
  onSetView,
  onSetShowProductModal,
  onSetEditingProduct,
  onSetProductForm,
  onSetProductValidationError,
  onSetSelectedCertKey,
  allOrdersGlobal,
  isKitPricing = false,
  isChinaKitPricing = false,
  isChinaVialPricing = false,
  isApprovedVialPricing = false,
}: ShopCatalogViewProps) {
  const pc = usePricingConfig();
  const isUnlimitedStockTier = isKitPricing || isChinaKitPricing || isChinaVialPricing || isApprovedVialPricing;
  // BAC water / solvents are offered only as a checkout add-on, never in the
  // main catalog grid or category chips.
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(c => c !== 'Reconstitution Solvents')))];

  const isChinaTier = isChinaKitPricing || isChinaVialPricing;
  const tierVm = getShopTierViewModel({
    isViewingAsAdmin,
    isKitPricing,
    isChinaKitPricing,
    isChinaVialPricing,
    isApprovedVialPricing,
  });

  const searchMatchIds = searchQuery.trim()
    ? new Set(rankSearch(searchQuery, products, shopFields).map(p => p.id))
    : null;
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchMatchIds || searchMatchIds.has(p.id);
    if (!matchesCategory || !matchesSearch) return false;

    // Quick Ship (Retatrutide, US warehouse) lives only in the featured strip
    // above — never in the main store grid, so it never shows twice.
    if (p.category === 'USA Fast Ship') return false;

    // BAC water / solvents are a checkout add-on only, not a catalog product.
    if (p.category === 'Reconstitution Solvents') return false;

    // Hide out-of-stock items only from non-approved viewers.
    if (!isUnlimitedStockTier && !isApprovedVialPricing && !isViewingAsAdmin) {
      const stock = getProductAvailableStock(p.id, p.inventory, allOrdersGlobal);
      if (stock <= 0) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6">

      <div id="shop-pricing-notice-banner" className={`labrat-shop-premium-header rounded-2xl border ${tierVm.panelClassName} p-4 sm:p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.2)]`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${tierVm.iconToneClassName}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {tierVm.badge}
              </span>
              <span className="labrat-shop-muted text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tierVm.sourceLine}</span>
            </div>
            <h3 className="labrat-shop-title text-lg sm:text-xl font-black text-white tracking-tight">{tierVm.title}</h3>
            <p className="labrat-shop-body mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              <span className="font-bold text-cyan-300">{tierVm.priceBasis}</span>. {tierVm.trustLine}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:w-64 shrink-0">
            {[
              { icon: Package, label: 'Pricing', value: tierVm.priceBasis },
              { icon: Truck, label: 'Shipping', value: tierVm.shippingPromise },
              { icon: BadgeCheck, label: 'Verification', value: 'COA-backed listings' },
            ].map(({ icon: IconComponent, label, value }) => (
              <div key={label} className="labrat-shop-mini-surface bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2.5 min-w-0">
                <div className="labrat-shop-muted flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <IconComponent className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  {label}
                </div>
                <div className="labrat-shop-title text-[11px] font-bold text-slate-200 mt-1 leading-snug">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 && !catalogLoading && (
        <div className="labrat-shop-mini-surface rounded-2xl border border-slate-800/80 bg-slate-950/35 p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: ClipboardCheck, label: 'Curated catalog', value: `${filteredProducts.length} visible listings` },
              { icon: BadgeCheck, label: 'Documented sourcing', value: 'COA and SOP cues included' },
              { icon: ShoppingBag, label: 'Request checkout', value: 'Manual invoice after review' },
            ].map(({ icon: IconComponent, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-950/45 px-3 py-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <IconComponent className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="labrat-shop-title text-xs font-black text-slate-100 truncate">{label}</div>
                  <div className="labrat-shop-body text-[10px] font-semibold text-slate-400 truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Ship — featured strip (all members + admin) */}
      {(isChinaVialPricing || isChinaKitPricing || isViewingAsAdmin) && (() => {
        const usaProducts = products.filter(p => p.category === 'USA Fast Ship');
        if (usaProducts.length === 0) return null;
        return (
          <div className="bg-gradient-to-r from-slate-900 via-[#0d1220] to-slate-900 border border-amber-500/25 rounded-2xl p-4 text-left">
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">⚡</span>
                <span className="text-xs font-black text-white uppercase tracking-wider">Quick Ship — Retatrutide</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Delivered within a week</span>
                <span className="text-[10px] text-slate-500">No international transit wait</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {usaProducts.map(p => {
                // Always show the real customer per-vial price (admin overrides +
                // markup, applied server-side) — never the raw inventory fallback.
                const displayPrice = isChinaKitPricing
                  ? (getChinaKitSellPrice(p.name, pc) || p.price)
                  : (getChinaVialSellPrice(p.name, pc) || p.price);
                const { size } = getProductBaseAndSize(p.name);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      const group = {
                        baseName: 'Retatrutide US Warehouse',
                        category: 'USA Fast Ship',
                        description: p.description,
                        options: usaProducts.map(u => ({ ...u, size: getProductBaseAndSize(u.name).size })),
                      };
                      onSetSelectedParentProductGroup(group);
                      onSetSelectedOptionIdInDrawer(p.id);
                      onSetDrawerQuantity(1);
                      onSetShowProductModal(false);
                    }}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 flex flex-col items-center gap-1 transition-all cursor-pointer hover:bg-slate-900 active:scale-[0.97]"
                  >
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">{size}</span>
                    <span className="text-sm font-black text-white">${displayPrice}</span>
                    <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-0.5 whitespace-nowrap">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block shrink-0"></span> In Stock
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Product Filtering and Search actions */}
      <div className="space-y-4">
        {/* Search Bar & Admin Actions */}
        <div id="shop-search-filter-bar" className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 p-3 sm:px-4 rounded-xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search high-purity chemical or peptide sequence..."
              value={searchQuery}
              onChange={(e) => {
                onSetSearchQuery(e.target.value);
                onSetShowShopSuggestions(true);
              }}
              onFocus={() => onSetShowShopSuggestions(true)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-lg text-xs focus:outline-none focus:border-cyan-500 transition-all"
            />

            {/* Backdrop clickcatcher to dismiss list easily */}
            {showShopSuggestions && searchQuery.trim().length > 0 && (
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => onSetShowShopSuggestions(false)}
              />
            )}

            {/* High-fidelity autocomplete popup dropdown */}
            {showShopSuggestions && searchQuery.trim().length > 0 && (() => {
              const shopSuggestions = rankSearch(searchQuery, products, shopFields).slice(0, 5);

              return (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0b1329]/95 border border-cyan-500/45 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden z-50 divide-y divide-slate-800/80 backdrop-blur-md"
                  id="shop-suggestions-dropdown"
                >
                  {shopSuggestions.length > 0 ? (
                    <div className="py-1">
                      <div className="px-3 py-1.5 text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-[#131e38]/70 flex justify-between items-center border-b border-slate-800/60">
                        <span>Suggested Products ({shopSuggestions.length})</span>
                        <span className="text-[8px] text-slate-500 font-normal">Tap to filter</span>
                      </div>
                      {shopSuggestions.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            onSetSearchQuery(prod.name);
                            onSetSelectedCategory('All');
                            onSetShowShopSuggestions(false);
                            setTimeout(() => {
                              const anchor = document.getElementById('shop-viewport-anchor');
                              if (anchor) {
                                anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-[#1e293b]/90 active:bg-slate-800/90 transition flex items-center justify-between gap-2 text-slate-200 cursor-pointer select-none border-0 group/shop-suggest"
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-bold text-[11px] text-white group-hover/shop-suggest:text-cyan-400 transition-colors truncate">
                              {cleanProductName(prod.name)}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate mt-0.5 max-w-[180px] sm:max-w-[200px]">
                              {prod.description}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono text-slate-400 shrink-0 select-none bg-slate-900 border border-slate-800 uppercase">
                            {prod.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-[10px] text-slate-400 text-center flex flex-col items-center">
                      <span>No suggested items matching</span>
                      <span className="text-[9px] text-slate-500 font-mono italic">&ldquo;{searchQuery}&rdquo;</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {isViewingAsAdmin && (
            <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => { triggerHaptic('light'); onSetEditingProduct(null); onSetProductValidationError(null); onSetProductForm({ name: '', description: '', category: '', price: 0, inventory: 50, sourceRestriction: '' }); onSetShowProductModal(true); }}
                className="px-3.5 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Product
              </button>
              <button
                onClick={onSeedDatabase}
                disabled={actionLoading === 'seed'}
                className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 hover:text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                title="Overwrites or resets catalog with updated 99% pure certified stock titles"
              >
                {actionLoading === 'seed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />} Reset Catalog
              </button>
            </div>
          )}
        </div>

        {/* Advanced Category Visual Tabs Deck */}
        <div id="shop-categories-deck" className="bg-[#0b1329]/40 border border-slate-850 p-3 sm:p-4 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between px-1 select-none">
            <span className="text-[9px] font-black tracking-widest text-[#22d3ee] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> Sourcing Categories
            </span>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => { triggerHaptic('light'); onSetSelectedCategory('All'); }}
                className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer hover:underline transition"
              >
                Clear Filter ({selectedCategory})
              </button>
            )}
          </div>

          <div className="relative w-full overflow-hidden select-none">
            {/* Left-right soft shadows representing fade on overflow scroll */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 select-none scrollbar-none">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                const count = cat === 'All'
                  ? products.filter(p => p.category !== 'USA Fast Ship' && p.category !== 'Reconstitution Solvents').length
                  : products.filter(p => p.category === cat).length;

                // Icon mapping
                let IconComponent = ShoppingBag;
                let iconColor = 'text-cyan-400';
                let activeBg = 'from-cyan-500/15 to-blue-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.12)]';
                let iconBg = 'bg-cyan-950/75 border-cyan-500/20';

                if (cat === 'Muscle Growth') {
                  IconComponent = Flame;
                  iconColor = 'text-red-400';
                  activeBg = 'from-red-500/15 to-orange-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.12)]';
                  iconBg = 'bg-red-950/75 border-red-500/20';
                } else if (cat === 'Weight Loss') {
                  IconComponent = TrendingUp;
                  iconColor = 'text-amber-400';
                  activeBg = 'from-amber-500/15 to-yellow-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]';
                  iconBg = 'bg-amber-950/75 border-amber-500/20';
                } else if (cat === 'Healing & Repair') {
                  IconComponent = Heart;
                  iconColor = 'text-emerald-400';
                  activeBg = 'from-emerald-500/15 to-teal-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.12)]';
                  iconBg = 'bg-emerald-950/75 border-emerald-500/20';
                } else if (cat === 'Beauty & Radiance') {
                  IconComponent = Sparkles;
                  iconColor = 'text-pink-400';
                  activeBg = 'from-pink-500/15 to-fuchsia-500/10 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.12)]';
                  iconBg = 'bg-pink-950/75 border-pink-500/20';
                } else if (cat === 'Cognitive & Focus') {
                  IconComponent = Brain;
                  iconColor = 'text-purple-400';
                  activeBg = 'from-purple-500/15 to-indigo-500/10 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.12)]';
                  iconBg = 'bg-purple-950/75 border-purple-500/20';
                } else if (cat === 'Longevity & Cellular') {
                  IconComponent = Dna;
                  iconColor = 'text-teal-400';
                  activeBg = 'from-teal-500/15 to-emerald-500/10 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.12)]';
                  iconBg = 'bg-teal-950/75 border-teal-500/20';
                } else if (cat === 'Immune & Health') {
                  IconComponent = Shield;
                  iconColor = 'text-blue-400';
                  activeBg = 'from-blue-500/15 to-cyan-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.12)]';
                  iconBg = 'bg-blue-950/75 border-blue-500/20';
                } else if (cat === 'Sleep & Recovery') {
                  IconComponent = Moon;
                  iconColor = 'text-violet-400';
                  activeBg = 'from-violet-500/15 to-fuchsia-500/10 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.12)]';
                  iconBg = 'bg-violet-950/75 border-violet-500/20';
                } else if (cat === 'Reconstitution Solvents') {
                  IconComponent = Droplet;
                  iconColor = 'text-sky-400';
                  activeBg = 'from-sky-500/15 to-cyan-500/10 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.12)]';
                  iconBg = 'bg-sky-950/75 border-sky-500/20';
                }

                return (
                  <button
                    key={cat}
                    onClick={() => { triggerHaptic('light'); onSetSelectedCategory(cat); }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px] font-bold cursor-pointer whitespace-nowrap transition-all duration-300 border focus:outline-none select-none relative group/cat-btn ${
                      isActive
                        ? `bg-gradient-to-br ${activeBg} text-white`
                        : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Accent bottom bar for the active tab */}
                    {isActive && (
                      <span className="absolute inset-x-4 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
                    )}

                    {/* Rounded Icon Ring */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isActive ? iconBg : 'bg-slate-900/40 border-slate-800/80 group-hover/cat-btn:border-slate-700'
                    }`}>
                      <IconComponent className={`w-3.5 h-3.5 ${isActive ? iconColor : 'text-slate-500 group-hover/cat-btn:text-slate-400'}`} />
                    </div>

                    {/* Label and Count Badge */}
                    <div className="flex items-center gap-2 font-sans overflow-hidden">
                      <span>{cat}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md leading-none border transition-colors ${
                        isActive
                          ? 'bg-slate-950/40 border-cyan-500/20 text-cyan-400 font-extrabold'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS LISTING */}
      {catalogLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading catalog">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0b1329] border border-[#1e293b] rounded-2xl overflow-hidden">
              <div className="lr-skeleton h-44 w-full" />
              <div className="p-5 space-y-3">
                <div className="lr-skeleton h-3 w-20 rounded-full" />
                <div className="lr-skeleton h-4 w-3/4 rounded-md" />
                <div className="lr-skeleton h-3 w-full rounded-md" />
                <div className="lr-skeleton h-3 w-2/3 rounded-md" />
                <div className="flex items-center justify-between pt-2">
                  <div className="lr-skeleton h-6 w-16 rounded-md" />
                  <div className="lr-skeleton h-9 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No biochemical products available</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {isViewingAsAdmin ? 'Add new products above or seed the database catalog to start.' : 'There are currently no products under the selected categories.'}
          </p>
        </div>
      ) : (
        (() => {
          const groupedDisplayItems: {
            baseName: string;
            category: string;
            options: (ShopProduct & { size: string })[];
          }[] = [];

          filteredProducts.forEach(prod => {
            const { baseName, size } = getProductBaseAndSize(prod.name);
            let group = groupedDisplayItems.find(g => g.baseName === baseName);
            if (!group) {
              group = {
                baseName,
                category: prod.category,
                options: []
              };
              groupedDisplayItems.push(group);
            }
            group.options.push({ ...prod, size });
          });

          // Sort options (smallest/cheapest size first)
          groupedDisplayItems.forEach(group => {
            group.options.sort((a, b) => {
              const numA = parseFloat(a.size) || 0;
              const numB = parseFloat(b.size) || 0;
              if (numA !== numB) return numA - numB;
              return a.price - b.price;
            });
          });

          // Sort groups to put in-stock products at the top always, with alphabetical sub-sort
          groupedDisplayItems.sort((a, b) => {
            const stockA = a.options.reduce((sum, o) => sum + getProductAvailableStock(o.id, o.inventory, allOrdersGlobal), 0);
            const stockB = b.options.reduce((sum, o) => sum + getProductAvailableStock(o.id, o.inventory, allOrdersGlobal), 0);
            const hasStockA = stockA > 0 ? 1 : 0;
            const hasStockB = stockB > 0 ? 1 : 0;
            if (hasStockA !== hasStockB) {
              return hasStockB - hasStockA; // In-stock comes first
            }
            return a.baseName.localeCompare(b.baseName);
          });

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedDisplayItems.map((group, cardIdx) => {
                const prices = group.options.map(o => o.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const totalStock = group.options.reduce((sum, o) => sum + getProductAvailableStock(o.id, o.inventory, allOrdersGlobal), 0);
                const hasStock = totalStock > 0;
                const firstOption = group.options[0];
                const inStockOption = isUnlimitedStockTier
                  ? firstOption
                  : group.options.find(o => getProductAvailableStock(o.id, o.inventory, allOrdersGlobal) > 0);
                const preferredDefault = inStockOption || firstOption;
                const activeProdId = selectedProductIds[group.baseName] || preferredDefault?.id;

                return (
                  <motion.div
                    key={group.baseName}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(cardIdx * 0.045, 0.45), ease: 'easeOut' }}
                    className="labrat-shop-product-card bg-[#0b1329] border border-[#1e293b] hover:border-cyan-500/30 rounded-2xl flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.04)] transition-all overflow-hidden group text-left"
                  >
                    {/* Tap image to open drawer */}
                    <div
                      onClick={() => {
                        triggerHaptic('light');
                        onSetSelectedParentProductGroup({
                          baseName: group.baseName,
                          category: group.category,
                          description: firstOption?.description || '',
                          options: group.options
                        });
                        onSetSelectedOptionIdInDrawer(activeProdId || firstOption?.id || '');
                        onSetDrawerQuantity(1);
                      }}
                      className="cursor-pointer hover:opacity-95 transition-opacity"
                    >
                      <ProductVialVisual name={group.baseName} category={group.category} theme={labratTheme} />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      {/* Tap text to open drawer */}
                      <div
                        onClick={() => {
                          triggerHaptic('light');
                          onSetSelectedParentProductGroup({
                            baseName: group.baseName,
                            category: group.category,
                            description: firstOption?.description || '',
                            options: group.options
                          });
                          onSetSelectedOptionIdInDrawer(activeProdId || firstOption?.id || '');
                          onSetDrawerQuantity(1);
                        }}
                        className="cursor-pointer hover:opacity-95 transition-opacity"
                      >
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider uppercase ${getCategoryBadgeStyle(group.category)}`}>
                            {group.category}
                          </span>
                          {(() => {
                            const benefit = getSecondaryBenefit(group.baseName, group.category);
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${getSecondaryBenefitStyle(benefit)}`}>
                                {benefit}
                              </span>
                            );
                          })()}
                          <span className="text-[11px] ml-auto">
                            {(() => {
                              return (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1 whitespace-nowrap">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span> In Stock
                                </span>
                              );
                            })()}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-100 tracking-tight group-hover:text-cyan-400 transition-colors">
                          {cleanProductName(group.baseName)}
                        </h4>

                        <p className="text-xs text-slate-400 mt-2 leading-normal min-h-[54px] line-clamp-3">
                          {getCleanDescription(firstOption?.description)}
                        </p>
                      </div>

                      <div className="border-t border-slate-800/50 pt-3 mt-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Available Strengths:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.options.map(opt => {
                            const isSelected = activeProdId === opt.id;
                            const isInStock = true;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation(); // Avoid triggering details drawer
                                  triggerHaptic('light');
                                  onSetSelectedProductIds((prev: Record<string, string>) => ({
                                    ...prev,
                                    [group.baseName]: opt.id
                                  }));
                                }}
                                className={`px-2.5 py-1.5 transition-all duration-100 font-mono text-[10.5px] font-bold rounded uppercase tracking-wider block shadow-sm cursor-pointer hover:scale-[1.05] active:scale-[0.95] border ${
                                  isSelected
                                    ? isInStock
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                      : 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                                    : isInStock
                                      ? 'bg-slate-950 text-emerald-400 border-emerald-950/40 hover:bg-emerald-950/20 hover:border-emerald-500/30'
                                      : 'bg-slate-950 text-amber-400 border-amber-950/40 hover:bg-amber-950/20 hover:border-amber-500/30'
                                }`}
                              >
                                {opt.size || '10mg'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const activeProduct = group.options.find(o => o.id === activeProdId) || firstOption;
                      if (!activeProduct) return null;
                      const isOutOfStock = false;

                      return (
                        <div className="bg-slate-950 border-t border-[#1e293b]/70 p-4 flex items-center justify-between gap-4">
                          <div className="flex flex-col text-left flex-1 min-w-0 pr-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate block">
                              {(isKitPricing || isChinaKitPricing) ? `Kit Price · 10 vials (${getProductBaseAndSize(activeProduct.name).size || 'each'})` : `Research Price (${getProductBaseAndSize(activeProduct.name).size || 'each'})`}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Single price model: kit tiers use kit sell price, everyone
                                  else (customers + admin) shows the customer per-vial price. */}
                              <span className="text-sm font-black text-cyan-400">
                                ${(isKitPricing
                                    ? getKitSellPrice(activeProduct.name, pc)
                                    : isChinaKitPricing
                                    ? getChinaKitSellPrice(activeProduct.name, pc)
                                    : getChinaVialSellPrice(activeProduct.name, pc)) || activeProduct.price}.00
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isOutOfStock) return;
                              triggerHaptic('medium');
                              onAddToCart(activeProduct);
                            }}
                            className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer shrink-0 whitespace-nowrap ${
                              isOutOfStock
                                ? 'bg-slate-850 text-slate-500 border border-slate-800/40 cursor-not-allowed'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                            }`}
                          >
                            {isOutOfStock ? 'Manufacturing Phase' : 'Add to Cart'} <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}
                  </motion.div>
                );
              })}
            </div>
          );
        })()
      )}

      {/* Peptide Request Form — always visible at bottom of catalog */}
      <div className="mt-4">
        <PeptideRequestForm />
      </div>
    </div>
  );
}
