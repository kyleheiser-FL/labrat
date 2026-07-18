import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, BadgeCheck } from 'lucide-react';
import { ShopProduct } from '../../lib/shopTypes';
import { getSalePrice } from '../../lib/shopHelpers';
import { getProductCostPerVial, type WholesaleBook } from '../../lib/wholesale';

export interface ProductFormState {
  name: string;
  description: string;
  category: string;
  price: number;
  inventory: number;
  sourceRestriction: '' | 'china' | 'norway';
}

interface AdminProductFormModalProps {
  open: boolean;
  editingProduct: ShopProduct | null;
  productForm: ProductFormState;
  onSetProductForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  validationError: string | null;
  actionLoading: string | null;
  wholesaleBook: WholesaleBook;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AdminProductFormModal({
  open,
  editingProduct,
  productForm,
  onSetProductForm,
  validationError,
  actionLoading,
  wholesaleBook,
  onSubmit,
  onClose,
}: AdminProductFormModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0b1329] border border-slate-800 max-w-md w-full p-6 rounded-2xl text-left"
          >
            <h3 className="text-base font-bold text-white mb-4">
              {editingProduct ? 'Modify Product Parameters' : 'Register New Compound / Supply'}
            </h3>

            <form onSubmit={onSubmit} className="space-y-4">
              {validationError && (
                <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl p-3 text-[11px] font-medium leading-relaxed">
                  ⚠️ {validationError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-name">Product Name</label>
                <input
                  type="text"
                  required
                  id="prod-name"
                  placeholder="E.g. TB-500 Pure Powder"
                  value={productForm.name}
                  onChange={(e) => onSetProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-desc">Description</label>
                <textarea
                  required
                  rows={2}
                  id="prod-desc"
                  placeholder="Biochemical mechanisms, dosage volumes..."
                  value={productForm.description}
                  onChange={(e) => onSetProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-cat">Category</label>
                  <input
                    type="text"
                    required
                    id="prod-cat"
                    placeholder="E.g. Healing"
                    value={productForm.category}
                    onChange={(e) => onSetProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-price">Research Price ($)</label>
                  <input
                    type="number"
                    required
                    id="prod-price"
                    min={0}
                    placeholder="125"
                    value={productForm.price || ''}
                    onChange={(e) => onSetProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-inventory">Stock Inventory (Vials/Sets)</label>
                  <input
                    type="number"
                    required
                    id="prod-inventory"
                    placeholder="30"
                    min={0}
                    value={productForm.inventory}
                    onChange={(e) => onSetProductForm(prev => ({ ...prev, inventory: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>
              </div>

              {productForm.name && productForm.price > 0 && (
                <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="text-cyan-400 font-bold uppercase tracking-wider text-[9px] mb-1">Financial Estimates (KaosLabs.eu)</div>
                  <div className="flex justify-between">
                    <span>Estimated Cost/Vial (incl. avg shipping):</span>
                    <span className="text-white font-semibold">${getProductCostPerVial(productForm.name, productForm.price || 0, wholesaleBook).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sell Price:</span>
                    <span className="text-emerald-400 font-semibold">${productForm.price || 0}.00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/50 pt-1.5 mt-1 font-bold">
                    <span>Estimated Profit per Vial:</span>
                    {(() => {
                      const cost = getProductCostPerVial(productForm.name, productForm.price || 0, wholesaleBook);
                      const sale = getSalePrice(productForm.price || 0);
                      const profit = sale - cost;
                      return <span className={profit >= 0 ? "text-amber-300" : "text-rose-400"}>${profit.toFixed(2)}</span>;
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {actionLoading === 'save_product' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />} {editingProduct ? 'Apply Edit' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
