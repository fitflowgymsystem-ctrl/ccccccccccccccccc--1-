import React from 'react';
import { DollarSign, Zap } from 'lucide-react';
import { MembershipType } from '../../types';
import { Language, translations } from '../../utils/translations';

interface PricingSectionProps {
    planPrices: Record<MembershipType, number>;
    onPriceChange: (type: MembershipType, price: number) => void;
    lang: Language;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ planPrices, onPriceChange, lang }) => {
    const t = translations[lang];
    return (
        <div className="space-y-6">
            <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                {t.dev_default_catalog}
            </h4>
            <div className="grid grid-cols-1 gap-3 bg-emerald-50/30 dark:bg-emerald-900/5 p-4 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20">
                {Object.values(MembershipType).map((type) => (
                    <div key={type} className="flex items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                <Zap size={14} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">{type}</span>
                        </div>
                        <div className="relative w-28">
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <input 
                                type="number" 
                                value={planPrices[type] === 0 ? '' : planPrices[type]} 
                                onChange={(e) => onPriceChange(type, e.target.value === '' ? 0 : Number(e.target.value))}
                                className="w-full pl-7 pr-3 py-1.5 bg-gray-50 dark:bg-slate-950 border-none rounded-xl text-xs font-black text-emerald-600 outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="--"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[8px] text-gray-400 font-bold uppercase text-center px-4 leading-relaxed italic">
                {t.dev_pricing_seed_note}
            </p>
        </div>
    );
};