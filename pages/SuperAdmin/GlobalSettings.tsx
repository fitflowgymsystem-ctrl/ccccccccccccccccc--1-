
import React from 'react';
import { Settings, DollarSign, Crown, Star, Calendar, Gift, Zap } from 'lucide-react';
import { GymSubscriptionPlan } from '../../types';
import { Language, translations } from '../../utils/translations';
import { useSuperAdmin } from '../../hooks/useSuperAdmin';

interface GlobalSettingsProps {
    lang: Language;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({ lang }) => {
    const t = translations[lang];
    const { saasPricing, saasPlanDurations, actions } = useSuperAdmin();

    const tierIcons = {
        [GymSubscriptionPlan.TRIAL]: <Gift size={14} className="text-gray-400" />,
        [GymSubscriptionPlan.BASIC]: <Calendar size={14} className="text-blue-500" />,
        [GymSubscriptionPlan.PRO]: <Star size={14} className="text-purple-500" />,
        [GymSubscriptionPlan.ENTERPRISE]: <Crown size={14} className="text-amber-500" />
    };

    const formatDuration = (days?: number) => {
        if (!days) return '';
        if (days === 14) return '14 days';
        if (days === 30) return '1 month';
        if (days === 90) return '3 months';
        if (days === 180) return '6 months';
        if (days === 365) return '12 months';
        return `${days} days`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl p-5 border dark:border-slate-700 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-sm font-black uppercase tracking-tight text-gray-800 dark:text-white flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-500" /> Licensing Engine
                    </h3>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Global SaaS Tiers</p>
                </div>

                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-2">All plans share the same features; only the subscription period differs.</p>

                <div className="space-y-2 mt-3">
                    {Object.values(GymSubscriptionPlan).map((plan) => (
                        <div key={plan} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border dark:border-slate-700 hover:border-blue-500/30 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border dark:border-slate-700">
                                    {tierIcons[plan]}
                                </div>
                                <div>
                                    <h4 className="font-black text-[10px] uppercase dark:text-white">{plan}</h4>
                                    <p className="text-[7px] text-gray-400 font-bold uppercase">{formatDuration(saasPlanDurations[plan]) || 'Period'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative w-24">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-[9px]">$</span>
                                    <input 
                                        type="number" 
                                        value={saasPricing[plan]} 
                                        onChange={(e) => actions.updatePrice(plan, Number(e.target.value))}
                                        className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-xs font-black dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/50" 
                                    />
                                </div>
                                <span className="text-[7px] font-black text-gray-400 uppercase">/ Period</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden h-full">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4">
                        <Settings size={24} className="animate-spin-slow" />
                    </div>
                    <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Nexus Orchestrator</h4>
                    <p className="text-slate-500 text-[8px] font-bold uppercase mt-2 leading-relaxed">
                        Pricing changes reflect in MRR analytics immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};
