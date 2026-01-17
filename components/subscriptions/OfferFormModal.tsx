
import React, { useState } from 'react';
import { X, Tag, Save, Calendar, Percent } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface OfferFormModalProps {
    lang: Language;
    onClose: () => void;
    onSave: (offerData: any) => void;
}

export const OfferFormModal: React.FC<OfferFormModalProps> = ({ lang, onClose, onSave }) => {
    const t = translations[lang];
    const [offerForm, setOfferForm] = useState({
        title: '',
        code: '',
        discountValue: undefined as number | undefined,
        discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        validUntil: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...offerForm, discountValue: offerForm.discountValue || 0 });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm md:max-w-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-slate-700 flex flex-col cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-3 border-b dark:border-slate-700 flex justify-between items-center bg-purple-50/50 dark:bg-slate-900/50 shrink-0">
                    <h3 className="font-black text-lg uppercase tracking-widest text-purple-900 dark:text-purple-300 flex items-center gap-2">
                        <Tag size={18} className="text-purple-500" />
                        {t.create_offer}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3">
                    <div className="space-y-1">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.offer_title}</label>
                        <input type="text" required placeholder="Summer Sale..." value={offerForm.title} onChange={e => setOfferForm({ ...offerForm, title: e.target.value })} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.offer_code}</label>
                        <input type="text" required placeholder="OFF50" value={offerForm.code} onChange={e => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-black text-purple-600 dark:text-purple-400 outline-none uppercase tracking-widest" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.offer_value}</label>
                            <input type="number" required min="1" placeholder="--" value={offerForm.discountValue ?? ''} onChange={e => setOfferForm({ ...offerForm, discountValue: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-black dark:text-white outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.discount_type}</label>
                            <select value={offerForm.discountType} onChange={e => setOfferForm({ ...offerForm, discountType: e.target.value as any })} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-black outline-none dark:text-white" >
                                <option value="PERCENTAGE">{t.percentage}</option>
                                <option value="FIXED">{t.fixed_amount}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.offer_expiry}</label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <input type="date" required value={offerForm.validUntil} onChange={e => setOfferForm({ ...offerForm, validUntil: e.target.value })} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold dark:text-white outline-none" />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-sm font-black uppercase tracking-widest text-gray-400 rounded-xl active:scale-95 transition-all">{t.cancel}</button>
                        <button type="submit" className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Save size={14} /> {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
