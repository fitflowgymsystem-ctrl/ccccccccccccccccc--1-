
import React, { useState } from 'react';
import { Package, X, Tag, DollarSign, Box, AlertTriangle, ScanBarcode, Save } from 'lucide-react';
import { Product } from '../../types';
import { Language, translations } from '../../utils/translations';

interface ProductManagementModalProps {
  editingId: number | null;
  initialData: Partial<Product>;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
  lang: Language;
}

export const ProductManagementModal: React.FC<ProductManagementModalProps> = ({ editingId, initialData, onClose, onSave, lang }) => {
  const t = translations[lang];
  const [formData, setFormData] = useState({
    ...initialData,
    buyPrice: initialData.buyPrice || undefined,
    sellPrice: initialData.sellPrice || undefined,
    stock: initialData.stock || undefined,
    minStockAlert: initialData.minStockAlert || undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      buyPrice: formData.buyPrice || 0,
      sellPrice: formData.sellPrice || 0,
      stock: formData.stock || 0,
      minStockAlert: formData.minStockAlert || 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 cursor-pointer" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm md:max-w-2xl border dark:border-slate-700 animate-scale-in overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            <h3 className="font-black text-lg uppercase tracking-widest dark:text-white">{editingId ? t.edit_product : t.add_product}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 p-1 hover:text-gray-600 transition-all"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.product_name}</label>
            <div className="relative">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text" required placeholder="Product Name..." value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.buy_price}</label>
              <input
                type="number" required placeholder="--" value={formData.buyPrice ?? ''}
                onChange={e => setFormData({ ...formData, buyPrice: e.target.value === '' ? undefined : Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold dark:text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.sell_price}</label>
              <input
                type="number" required placeholder="--" value={formData.sellPrice ?? ''}
                onChange={e => setFormData({ ...formData, sellPrice: e.target.value === '' ? undefined : Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-black text-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.stock}</label>
              <input
                type="number" required placeholder="--" value={formData.stock ?? ''}
                onChange={e => setFormData({ ...formData, stock: e.target.value === '' ? undefined : Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold dark:text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.min_stock}</label>
              <input
                type="number" required placeholder="--" value={formData.minStockAlert ?? ''}
                onChange={e => setFormData({ ...formData, minStockAlert: e.target.value === '' ? undefined : Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.barcode}</label>
            <div className="relative">
              <ScanBarcode className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text" placeholder="Scan or type..."
                value={formData.barcode || ''} onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-mono font-bold dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-sm font-black uppercase tracking-widest text-gray-400 rounded-xl active:scale-95 transition-all">{t.cancel}</button>
            <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Save size={14} /> {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
