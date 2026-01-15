
import React, { useRef, useEffect } from 'react';
import { Plus, ScanBarcode, AlertTriangle } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { ProductCatalog } from '../components/pos/ProductCatalog';
import { CartSidebar } from '../components/pos/CartSidebar';
import { ProductManagementModal } from '../components/pos/ProductManagementModal';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { usePOS } from '../hooks/usePOS';

interface POSProps {
  lang: Language;
  onUpdate?: () => void;
}

export const POS: React.FC<POSProps> = ({ lang, onUpdate }) => {
  const t = translations[lang];
  const { state, actions } = usePOS(onUpdate);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchRef.current && window.innerWidth >= 1024) searchRef.current.focus();
  }, []);

  return (
    <>
      <div className="lg:h-[calc(100vh-100px)] h-auto flex flex-col lg:flex-row gap-4 sm:gap-6 animate-fade-in pb-10 lg:pb-0">
        <div className="flex-1 flex flex-col bg-transparent lg:overflow-hidden min-h-0">
          <header className="mb-4 sm:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0 px-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white tracking-tight">{t.pos_title}</h2>
              <p className="text-[10px] sm:text-sm text-gray-400 font-bold uppercase mt-1 tracking-widest">{t.pos_subtitle}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <ScanBarcode className="absolute start-3 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input ref={searchRef} type="text" placeholder={t.barcode + "..."} value={state.search} onChange={e => actions.setSearch(e.target.value)} className="w-full ps-10 pe-4 py-2 rounded-xl bg-white dark:bg-slate-950 border dark:border-slate-700 outline-none text-xs shadow-sm" />
              </div>
              <button onClick={() => { actions.setEditingId(null); actions.setActiveModal('FORM'); }} className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 hover:bg-blue-700 transition-all flex items-center justify-center"><Plus size={20} /></button>
            </div>
          </header>

          <div className="flex-1 lg:overflow-y-auto pr-0 lg:pr-2 code-scroll px-1">
            <ProductCatalog products={state.products} onAddToCart={actions.addToCart} onEdit={(e, p) => { actions.setEditingId(p.id); actions.setNewProduct(p); actions.setActiveModal('FORM'); }} onDelete={(id) => { actions.setProductToDelete(id); actions.setActiveModal('DELETE'); }} lang={lang} />
          </div>
        </div>

        <CartSidebar cart={state.cart} onUpdateQty={actions.updateQty} onClearCart={actions.clearCart} onCheckout={() => actions.setActiveModal('CHECKOUT')} lang={lang} />
      </div>

      {/* Modals خارج div المتحرك */}
      {state.activeModal === 'FORM' && (
        <ProductManagementModal editingId={state.editingId} initialData={state.newProduct} onClose={() => actions.setActiveModal('NONE')} onSave={actions.handleSaveProduct} lang={lang} />
      )}

      {state.activeModal === 'CHECKOUT' && (
        <CheckoutModal total={state.total} onConfirm={actions.handleCheckout} onClose={() => actions.setActiveModal('NONE')} lang={lang} />
      )}

      {state.activeModal === 'DELETE' && state.productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-sm border dark:border-slate-700 text-center shadow-2xl animate-scale-in">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div>
            <h3 className="text-lg font-black dark:text-white mb-2 uppercase tracking-tighter">{t.delete_product}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6">{t.delete_product_confirm}</p>
            <div className="flex gap-3">
              <button onClick={() => actions.setActiveModal('NONE')} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Cancel</button>
              <button onClick={() => actions.handleDeleteProduct(state.productToDelete!)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
