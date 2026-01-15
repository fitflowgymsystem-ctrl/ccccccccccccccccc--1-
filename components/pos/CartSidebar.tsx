
import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { Product } from '../../types';
import { Language, translations } from '../../utils/translations';

interface CartSidebarProps {
  cart: { product: Product, qty: number }[];
  onUpdateQty: (id: number, delta: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  lang: Language;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ cart, onUpdateQty, onClearCart, onCheckout, lang }) => {
  const t = translations[lang];
  const subtotal = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.qty), 0);

  return (
    <div className="w-full lg:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex flex-col border dark:border-slate-700 shrink-0 lg:h-full min-h-[300px]">
      <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 rounded-t-[1.5rem]">
        <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest dark:text-white"><ShoppingCart size={18} className="text-blue-600" /> {t.checkout}</h2>
        {cart.length > 0 && <button onClick={onClearCart} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1"><Trash2 size={12} /> {t.clear_cart}</button>}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 code-scroll">
        {cart.length > 0 ? cart.map(item => (
          <div key={item.product.id} className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border dark:border-slate-800 shadow-sm transition-all hover:border-blue-100">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-black dark:text-white text-xs truncate uppercase tracking-tighter">{item.product.name}</p>
                <p className="text-xs font-black dark:text-white">${(item.product.sellPrice * item.qty).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-end mt-1">
                <p className="text-[10px] font-bold text-gray-400">${item.product.sellPrice}</p>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button onClick={() => onUpdateQty(item.product.id, -1)} className="p-1"><Minus size={10}/></button>
                  <span className="text-[10px] font-black w-4 text-center dark:text-white">{item.qty}</span>
                  <button onClick={() => onUpdateQty(item.product.id, 1)} className="p-1"><Plus size={10}/></button>
                </div>
              </div>
            </div>
          </div>
        )) : <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10"><ShoppingCart size={40} className="opacity-20 mb-2" /><p className="text-[10px] font-black uppercase">{t.cart_empty}</p></div>}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t dark:border-slate-700 rounded-b-[1.5rem] space-y-3">
        <div className="flex justify-between text-base sm:text-xl font-black dark:text-white pt-2 border-t border-dashed dark:border-slate-700"><span>{t.total}</span><span className="text-blue-600">${subtotal.toFixed(2)}</span></div>
        <button onClick={onCheckout} disabled={cart.length === 0} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 active:scale-95 text-xs sm:text-base tracking-widest uppercase">{t.checkout}</button>
      </div>
    </div>
  );
};
