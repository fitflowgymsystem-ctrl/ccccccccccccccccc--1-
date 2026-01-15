
import React, { useState } from 'react';
import { X, Banknote, CreditCard, CheckCircle, ReceiptText } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface CheckoutModalProps {
  total: number;
  onConfirm: (method: 'CASH' | 'CARD') => void;
  onClose: () => void;
  lang: Language;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ total, onConfirm, onClose, lang }) => {
  const t = translations[lang];
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1100] p-4 animate-fade-in cursor-pointer" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-850 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-700 animate-scale-in flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-50 dark:bg-slate-900 p-5 border-b dark:border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 text-green-500 rounded-xl">
              <ReceiptText size={20} />
            </div>
            <h3 className="font-black text-xs dark:text-white uppercase tracking-widest">
              {t.order_summary}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center bg-blue-600/5 dark:bg-blue-600/10 py-8 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-900/30">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{t.total}</p>
            <h2 className="text-5xl font-black text-blue-600 tracking-tighter tabular-nums">${total.toFixed(2)}</h2>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t.select_payment}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${paymentMethod === 'CASH' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-xl' : 'border-gray-100 dark:border-slate-800 text-gray-400 dark:bg-slate-900'}`}
              >
                <Banknote size={32} />
                <span className="font-black text-[10px] uppercase tracking-widest">{t.pay_cash}</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${paymentMethod === 'CARD' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-xl' : 'border-gray-100 dark:border-slate-800 text-gray-400 dark:bg-slate-900'}`}
              >
                <CreditCard size={32} />
                <span className="font-black text-[10px] uppercase tracking-widest">{t.pay_card}</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => onConfirm(paymentMethod)}
            className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-2xl shadow-green-600/30 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
          >
            <CheckCircle size={20} />
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
