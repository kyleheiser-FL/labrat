import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Package,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingCart,
  Edit,
  Trash2
} from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';
import { ShopProduct, CartItem, OrderDetail } from '../../lib/shopTypes';
import { getSalePrice, getCleanDescription, getSecondaryBenefit, getSecondaryBenefitStyle, getProductCostPerVial, getKitSellPrice, getChinaKitSellPrice, getChinaVialSellPrice, isChinaVialAvailable } from '../../lib/shopHelpers';
import ProductVialVisual from './ProductVialVisual';

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

interface ProductDrawerModalProps {
  group: {
    baseName: string;
    category: string;
    description: string;
    options: (ShopProduct & { size: string })[];
  };
  selectedOptionId: string;
  onSetSelectedOptionId: (id: string) => void;
  drawerQuantity: number;
  onSetDrawerQuantity: (q: number | ((prev: number) => number)) => void;
  labratTheme: 'neon' | 'clinical';
  cart: CartItem[];
  allOrdersGlobal: OrderDetail[];
  actionLoading: string | null;
  onAddToCartFromDrawer: (product: ShopProduct, quantity: number) => void;
  onClose: () => void;
  isViewingAsAdmin: boolean;
  onSetEditingProduct: (p: ShopProduct | null) => void;
  onSetProductValidationError: (e: string | null) => void;
  onSetProductForm: (f: any) => void;
  onSetShowProductModal: (v: boolean) => void;
  confirmDeleteProductId: string | null;
  onSetConfirmDeleteProductId: (id: string | null) => void;
  onDeleteProduct: (id: string) => Promise<void>;
  isKitPricing?: boolean;
  isChinaKitPricing?: boolean;
  isChinaVialPricing?: boolean;
  isAdminUser?: boolean;
}

export default function ProductDrawerModal({
  group,
  selectedOptionId,
  onSetSelectedOptionId,
  drawerQuantity,
  onSetDrawerQuantity,
  labratTheme,
  cart,
  allOrdersGlobal,
  actionLoading,
  onAddToCartFromDrawer,
  onClose,
  isViewingAsAdmin,
  onSetEditingProduct,
  onSetProductValidationError,
  onSetProductForm,
  onSetShowProductModal,
  confirmDeleteProductId,
  onSetConfirmDeleteProductId,
  onDeleteProduct,
  isKitPricing = false,
  isChinaKitPricing = false,
  isChinaVialPricing = false,
  isAdminUser = false,
}: ProductDrawerModalProps) {
  const isChineseSource = isChinaKitPricing || isChinaVialPricing;
  const selectedParentProductGroup = group;
  const selectedOptionIdInDrawer = selectedOptionId;
  const setSelectedOptionIdInDrawer = onSetSelectedOptionId;
  const setDrawerQuantity = onSetDrawerQuantity;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9990] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-[#070d19] border border-slate-800 max-w-lg md:max-w-4xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
        >
          <div className="relative p-5 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
            <div className="text-left flex-1 min-w-0 pr-4">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-bold tracking-wider uppercase">
                  {selectedParentProductGroup.category}
                </span>
                {(() => {
                  const benefit = getSecondaryBenefit(selectedParentProductGroup.baseName, selectedParentProductGroup.category);
                  return (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${getSecondaryBenefitStyle(benefit)}`}>
                      {benefit}
                    </span>
                  );
                })()}
              </div>
              <h3 className="text-lg font-black text-white leading-tight tracking-tight text-left">
                {selectedParentProductGroup.baseName} Options
              </h3>
            </div>
            <button
              type="button"
              onClick={() => { triggerHaptic('light'); onClose(); }}
              className="p-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Product Detail Header */}
            <div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center bg-slate-950/60 p-4 rounded-xl border border-slate-900">
              <div className="w-full md:w-[22rem] lg:w-[24rem] shrink-0">
                {(() => {
                  const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
                  return <ProductVialVisual name={activeOpt ? activeOpt.name : selectedParentProductGroup.baseName} category={selectedParentProductGroup.category} theme={labratTheme} />;
                })()}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {getCleanDescription(selectedParentProductGroup.description)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-1 rounded border border-amber-500/20 font-black">
                    {selectedParentProductGroup.category === 'Reconstitution Solvents' ? 'Volume: 30ml Bottle' : 'Volume: 3ml Vial'}
                  </span>
                  {!isChineseSource ? (
                    <>
                      <span className="flex items-center gap-1 bg-[#0b1329] px-2 py-1 rounded border border-slate-800">
                        Purity: 99%+
                      </span>
                      <span className="flex items-center gap-1 bg-[#0b1329] px-2 py-1 rounded border border-slate-800">
                        Sourced: Certified Labs
                      </span>
                      <span className="flex items-center gap-1 bg-[#0b1329] px-2 py-1 rounded border border-slate-800 text-cyan-400">
                        COA Certified
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 text-red-300">
                      🇨🇳 China Source
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Option / Dosage Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                Select Milligrams (Dosage Strength):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedParentProductGroup.options.map(opt => {
                  const isSelected = selectedOptionIdInDrawer === opt.id;
                  const isInStock = isChineseSource || isKitPricing || getProductAvailableStock(opt.id, opt.inventory, allOrdersGlobal) > 0;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedOptionIdInDrawer(opt.id);
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
                        isSelected
                          ? isInStock
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : isInStock
                            ? 'bg-slate-950 text-emerald-400/70 border-emerald-950 hover:border-emerald-800 hover:text-emerald-300'
                            : 'bg-slate-950 text-amber-400/70 border-amber-950 hover:border-amber-800 hover:text-amber-300'
                      }`}
                    >
                      <span className="font-mono text-sm font-black tracking-wide">{opt.size || '10mg'}</span>
                      <div className="flex flex-col items-center mt-1 scale-90">
                        {isChinaKitPricing ? (
                          <>
                            <span className="text-[8px] text-red-400 font-bold uppercase">🇨🇳 kit · 10 vials</span>
                            <span className="text-xs text-red-300 font-bold">${getChinaKitSellPrice(opt.name) || opt.price}</span>
                          </>
                        ) : isChinaVialPricing ? (
                          <>
                            <span className="text-[8px] text-orange-400 font-bold uppercase">🇨🇳 per vial</span>
                            <span className="text-xs text-orange-300 font-bold">${getChinaVialSellPrice(opt.name) || opt.price}</span>
                          </>
                        ) : isKitPricing ? (
                          <>
                            <span className="text-[8px] text-cyan-500 font-bold uppercase">kit · 10 vials</span>
                            <span className="text-xs text-cyan-400 font-bold">${getKitSellPrice(opt.name) || opt.price}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] text-slate-600 line-through">${opt.price}</span>
                            <span className="text-xs text-cyan-400 font-bold">${getSalePrice(opt.price)}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Item Stock & Specs */}
            {(() => {
              const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
              if (!activeOpt) return null;

              return (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Research Specification</div>
                    <div className="text-xs font-mono text-slate-300 mt-1 font-bold">
                      Ref: <span className="text-cyan-400">{activeOpt.id.replace('prod_', '').toUpperCase()}</span>
                    </div>
                  </div>

                  {(() => {
                    const available = (isKitPricing || isChineseSource) ? 999 : getProductAvailableStock(activeOpt.id, activeOpt.inventory, allOrdersGlobal);
                    const shipOrigin = isChinaKitPricing
                      ? '🇨🇳 Ships from China'
                      : isChinaVialPricing
                      ? (isChinaVialAvailable(activeOpt.name) ? '🇺🇸 Ships from USA' : '🇨🇳 Ships from China')
                      : null;
                    return (
                      <div className="flex items-center gap-1.5 text-xs flex-wrap">
                        <span className="text-slate-400">Availability:</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold text-[10px]">
                          {available > 0 ? 'In Stock' : 'Manufacturing Phase'}
                        </span>
                        {shipOrigin && (
                          <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                            {shipOrigin}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {isAdminUser && (() => {
              const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
              if (!activeOpt) return null;

              if (isChinaKitPricing || isChinaVialPricing) {
                const chinaKitSell = getChinaKitSellPrice(activeOpt.name);
                const chinaVialSell = getChinaVialSellPrice(activeOpt.name);

                if (isChinaKitPricing) {
                  const chinaKitRawCost = chinaKitSell > 0 ? Math.round(chinaKitSell / 1.25) : 0;
                  const chinaKitProfit = chinaKitSell - chinaKitRawCost;
                  return (
                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/15 text-left font-mono text-xs space-y-1.5 text-red-200">
                      <div className="text-red-400 font-extrabold uppercase tracking-wider text-[10px]">🇨🇳 China Kit — Admin Financial Highlights</div>
                      <div className="flex justify-between">
                        <span>China Source Cost (10 vials):</span>
                        <span className="text-slate-300 font-bold">${chinaKitRawCost || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>China Kit Sell Price (10 vials):</span>
                        <span className="text-red-300 font-bold">${chinaKitSell || '—'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-red-200">
                        <span>China Kit Profit:</span>
                        <span>${chinaKitProfit} (<span className="text-emerald-400">+25%</span>)</span>
                      </div>
                    </div>
                  );
                }

                const chinaVialRawCost = chinaVialSell > 0 ? Math.round(chinaVialSell / 1.35) : 0;
                const chinaVialProfit = chinaVialSell - chinaVialRawCost;
                return (
                  <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/15 text-left font-mono text-xs space-y-1.5 text-orange-200">
                    <div className="text-orange-400 font-extrabold uppercase tracking-wider text-[10px]">🇨🇳 China Vial — Admin Financial Highlights</div>
                    <div className="flex justify-between">
                      <span>China Vial Source Cost:</span>
                      <span className="text-slate-300 font-bold">${chinaVialRawCost || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>China Vial Sell Price:</span>
                      <span className="text-orange-300 font-bold">${chinaVialSell || '—'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-orange-200">
                      <span>China Vial Profit:</span>
                      <span>${chinaVialProfit} (<span className="text-emerald-400">+35%</span>)</span>
                    </div>
                  </div>
                );
              }

              // Norway financials
              const estimatedCost = getProductCostPerVial(activeOpt.name, activeOpt.price);
              const kaosKitCost = Math.round((estimatedCost - 3.50) * 10);
              const kitSellPrice = getKitSellPrice(activeOpt.name);
              const kitProfit = kitSellPrice - kaosKitCost;
              const kitMarkupPct = kaosKitCost > 0 ? Math.round((kitProfit / kaosKitCost) * 100) : 0;
              const salePrice = getSalePrice(activeOpt.price);
              const vialProfit = salePrice - estimatedCost;
              const vialMarkupPct = Math.round((vialProfit / estimatedCost) * 100);

              return (
                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/15 text-left font-mono text-xs space-y-1.5 text-amber-200">
                  <div className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">🇳🇴 Norway — Admin Financial Highlights</div>
                  <div className="flex justify-between">
                    <span>KaosLabs Kit Cost (10 vials):</span>
                    <span className="text-slate-300 font-bold">${kaosKitCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KaosLabs Cost per Vial:</span>
                    <span className="text-slate-300 font-bold">${estimatedCost.toFixed(2)} <span className="text-[10px] text-slate-500">(+$3.50 ship)</span></span>
                  </div>
                  {kitSellPrice > 0 && (
                    <div className="flex justify-between border-t border-amber-500/10 pt-1.5 mt-0.5">
                      <span>Kit Sell Price (10 vials):</span>
                      <span className="text-cyan-300 font-bold">${kitSellPrice}</span>
                    </div>
                  )}
                  {kitSellPrice > 0 && (
                    <div className="flex justify-between font-bold text-cyan-200">
                      <span>Kit Profit:</span>
                      <span>${kitProfit} (<span className="text-emerald-400">+{kitMarkupPct}%</span>)</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-amber-500/10 pt-1.5 mt-0.5">
                    <span>Vial Sale Price (-15%):</span>
                    <span className="text-slate-300 font-bold">${salePrice}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-300">
                    <span>Vial Profit:</span>
                    <span>${vialProfit.toFixed(2)} (<span className="text-emerald-400">+{vialMarkupPct}%</span>)</span>
                  </div>
                </div>
              );
            })()}

            {/* Quantity Ticker */}
            <div className="flex items-center justify-between border-t border-slate-900 pt-4">
              <div className="text-left font-bold">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Purchase Volume:
                </label>
                <p className="text-[10px] text-cyan-400 mt-0.5 normal-case font-semibold flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-cyan-500 inline" />
                  {isChinaKitPricing
                    ? '🇨🇳 China Kit Rate (price = 10 vials per kit)'
                    : isChinaVialPricing
                    ? '🇨🇳 China Vial Rate (per individual vial)'
                    : isKitPricing
                    ? 'Kit Rate (price = 10 vials per kit)'
                    : 'Single-Vial Rate (All prices are per individual vial)'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setDrawerQuantity((prev: number) => Math.max(1, prev - 1));
                  }}
                  className="p-1 px-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-black font-mono text-white">
                  {drawerQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    if (isChineseSource || isKitPricing) {
                      setDrawerQuantity((prev: number) => prev + 1);
                    } else {
                      const activeOpt = selectedParentProductGroup?.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup?.options[0];
                      const available = activeOpt ? getProductAvailableStock(activeOpt.id, activeOpt.inventory, allOrdersGlobal) : 0;
                      setDrawerQuantity((prev: number) => Math.min(available, prev + 1));
                    }
                  }}
                  className="p-1 px-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Footer Area with Checkout Summary and CTA */}
          <div className="p-5 bg-slate-950/80 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            {(() => {
              const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
              if (!activeOpt) return null;

              const canAdd = isChineseSource || isKitPricing || getProductAvailableStock(activeOpt.id, activeOpt.inventory, allOrdersGlobal) > 0;

              let displayPrice: number;
              let totalSum: number;
              let priceLabel: string;
              let strikePrice: number | null = null;

              if (isChinaKitPricing) {
                displayPrice = getChinaKitSellPrice(activeOpt.name) || activeOpt.price;
                totalSum = displayPrice * drawerQuantity;
                priceLabel = '🇨🇳 China Kit Total';
              } else if (isChinaVialPricing) {
                displayPrice = getChinaVialSellPrice(activeOpt.name) || activeOpt.price;
                totalSum = displayPrice * drawerQuantity;
                priceLabel = '🇨🇳 China Vial Total';
              } else if (isKitPricing) {
                displayPrice = getKitSellPrice(activeOpt.name) || activeOpt.price;
                totalSum = displayPrice * drawerQuantity;
                priceLabel = '🇳🇴 Norway Kit Total';
              } else {
                displayPrice = getSalePrice(activeOpt.price);
                totalSum = displayPrice * drawerQuantity;
                strikePrice = activeOpt.price * drawerQuantity;
                priceLabel = 'Estimated Total (15% Sale Applied)';
              }

              return (
                <>
                  <div className="text-left w-full sm:w-auto">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{priceLabel}</span>
                    <div className="flex items-baseline gap-2">
                      {strikePrice !== null && (
                        <span className="text-xs text-slate-500 line-through">${strikePrice}.00</span>
                      )}
                      <div className={`text-xl font-black ${isChinaKitPricing ? 'text-red-400' : isChinaVialPricing ? 'text-orange-400' : 'text-cyan-400'}`}>
                        ${totalSum}.00
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto justify-end">
                    {isViewingAsAdmin ? (
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onClose();
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 order-2 sm:order-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
                        </button>
                        <div className="flex gap-2 flex-1 order-1 sm:order-2">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              onClose();
                              onSetEditingProduct(activeOpt);
                              onSetProductValidationError(null);
                              onSetProductForm({
                                name: activeOpt.name,
                                description: activeOpt.description,
                                category: activeOpt.category,
                                price: activeOpt.price,
                                inventory: activeOpt.inventory
                              });
                              onSetShowProductModal(true);
                            }}
                            className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl border border-slate-800 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit Parameters
                          </button>
                          {confirmDeleteProductId === activeOpt.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/20 border border-rose-500/30 p-1 rounded-xl text-[10px]" id={`confirm-shop-delete-${activeOpt.id}`}>
                              <span className="text-rose-400 font-bold font-mono uppercase tracking-widest text-[9px] px-1">Delete item?</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  triggerHaptic('medium');
                                  onSetConfirmDeleteProductId(null);
                                  onClose();
                                  await onDeleteProduct(activeOpt.id);
                                }}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 active:scale-[0.95] text-white rounded text-[9px] font-bold uppercase transition"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => onSetConfirmDeleteProductId(null)}
                                className="px-2 py-1 bg-[#1e293b] hover:bg-slate-800 active:scale-[0.95] text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                onSetConfirmDeleteProductId(activeOpt.id);
                              }}
                              className="px-3.5 py-2 bg-slate-900 hover:bg-red-500/10 text-red-400 rounded-xl border border-slate-800 cursor-pointer text-xs flex items-center justify-center font-bold"
                              title="Delete Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onClose();
                          }}
                          className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 order-2 sm:order-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
                        </button>
                        <button
                          type="button"
                          disabled={!canAdd}
                          onClick={() => {
                            triggerHaptic('medium');
                            onAddToCartFromDrawer(activeOpt, drawerQuantity);
                            onClose();
                          }}
                          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer order-1 sm:order-2 flex-1 ${
                            canAdd
                              ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.97]'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canAdd ? (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              {isChinaKitPricing
                                ? `Add ${drawerQuantity} Kit${drawerQuantity > 1 ? 's' : ''} to Cart`
                                : `Add ${drawerQuantity} Vial${drawerQuantity > 1 ? 's' : ''} to Cart`}
                            </>
                          ) : (
                            'Manufacturing Phase'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
