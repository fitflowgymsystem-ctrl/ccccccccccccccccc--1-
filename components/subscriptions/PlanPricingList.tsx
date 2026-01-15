import React, { useState } from 'react';
import { DollarSign, Edit2, Check, X, ShieldCheck, Zap, Calendar, Star, Shield, Clock } from 'lucide-react';
import { MembershipPlan, MembershipType } from '../../types';
import { Language, translations } from '../../utils/translations';

interface PlanPricingListProps {
    plans: MembershipPlan[];
    lang: Language;
    onUpdatePrice: (type: MembershipType, price: number) => void;
}

export const PlanPricingList: React.FC<PlanPricingListProps> = ({ plans, lang, onUpdatePrice }) => {
    const t = translations[lang];
    const [editingType, setEditingType] = useState<MembershipType | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');

    // تعريف الفئات الخمس المطلوبة بتصميم مكثف
    const requiredTiers = [
        { type: MembershipType.DAILY, icon: <Zap size={14} className="text-amber-500" />, duration: 1, label: t.type_daily, color: 'border-amber-100 dark:border-amber-900/20' },
        { type: MembershipType.MONTHLY, icon: <Calendar size={14} className="text-blue-500" />, duration: 30, label: t.type_monthly, color: 'border-gray-100 dark:border-slate-700' },
        { type: MembershipType.QUARTERLY, icon: <Star size={14} className="text-purple-500" />, duration: 90, label: t.type_quarterly, color: 'border-purple-100 dark:border-purple-900/20' },
        { type: MembershipType.BIANNUAL, icon: <Shield size={14} className="text-emerald-500" />, duration: 180, label: t.type_biannual, color: 'border-emerald-100 dark:border-emerald-900/20' },
        { type: MembershipType.YEARLY, icon: <DollarSign size={14} className="text-indigo-500" />, duration: 365, label: t.type_yearly, color: 'border-indigo-100 dark:border-indigo-900/20' }
    ];

    const getPriceForType = (type: MembershipType) => {
        const plan = plans.find(p => p.type === type);
        return plan ? plan.price : 0;
    };

    const handleEditClick = (type: MembershipType, currentPrice: number) => {
        setEditingType(type);
        // إذا كان السعر 0، اترك الخانة فارغة بدلاً من إظهار الصفر
        setTempPrice(currentPrice === 0 ? '' : currentPrice.toString());
    };

    const handleSavePrice = (type: MembershipType) => {
        const finalPrice = parseFloat(tempPrice) || 0;
        onUpdatePrice(type, finalPrice);
        setEditingType(null);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md">
                        <ShieldCheck size={16} />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-[0.2em] leading-none">{t.plans_title}</h3>
                        <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-tighter italic">Live Pricing Control</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto code-scroll p-3 space-y-2">
                {requiredTiers.map((tier) => {
                    const currentPrice = getPriceForType(tier.type);
                    const isEditing = editingType === tier.type;

                    return (
                        <div key={tier.type} className={`group flex items-center justify-between p-3 rounded-2xl border transition-all hover:shadow-md ${isEditing ? 'border-blue-500 bg-blue-50/20 ring-4 ring-blue-500/5' : tier.color + ' bg-white dark:bg-slate-900/40'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border dark:border-slate-700 group-hover:scale-105 transition-transform shrink-0">
                                    {tier.icon}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-[10px] sm:text-xs text-gray-800 dark:text-white uppercase tracking-widest group-hover:text-blue-600 transition-colors truncate">
                                        {tier.label}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                                         <Clock size={10} className="text-gray-400" />
                                         <p className="text-[8px] font-bold text-gray-500 uppercase">
                                            {tier.duration} {lang === 'ar' ? 'يوم' : 'Days'}
                                         </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {isEditing ? (
                                    <div className="flex items-center gap-1.5 animate-scale-in">
                                        <div className="relative">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-500 font-black text-[10px]">$</span>
                                            <input 
                                                type="number" 
                                                value={tempPrice} 
                                                onChange={(e) => setTempPrice(e.target.value)}
                                                className="w-28 sm:w-36 pl-6 pr-3 py-2 bg-white dark:bg-slate-950 border-2 border-blue-500 text-gray-900 dark:text-white rounded-xl focus:outline-none text-[12px] font-black shadow-inner"
                                                autoFocus
                                                placeholder="--"
                                            />
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleSavePrice(tier.type)} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-90 transition-all"><Check size={16} /></button>
                                            <button onClick={() => setEditingType(null)} className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-400 rounded-xl hover:bg-gray-200 active:scale-90 transition-all"><X size={16} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-gray-400 font-black text-[9px]">$</span>
                                                <span className="text-sm sm:text-2xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none">
                                                    {currentPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleEditClick(tier.type, currentPrice)}
                                            className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white rounded-xl transition-all border dark:border-slate-700 active:scale-90 shadow-sm"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-slate-900/50 border-t dark:border-slate-700 flex items-center justify-center">
                <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-1">
                    <Shield size={8} /> Secure SaaS Ledger Verified
                </p>
            </div>
        </div>
    );
};