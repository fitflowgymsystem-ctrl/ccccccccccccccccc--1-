
import React from 'react';
import { ImageIcon, Camera, Mail, Phone, LayoutGrid, CheckCircle2, Crown, Star, Calendar, Gift, User } from 'lucide-react';
import { GymSubscriptionPlan, GymModules } from '../../types';
import { translations } from '../../utils/translations';

export const BrandingSection = ({ lang, formData, setFormData, handleLogoUpload }: any) => {
    const t = translations[lang];
    return (
        <div className="space-y-4">
            <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 pb-2 border-b dark:border-slate-700">{t.dev_brand_assets}</h4>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm overflow-hidden flex items-center justify-center">
                        {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={24} />}
                    </div>
                    <label className="absolute -bottom-1.5 -right-1.5 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg cursor-pointer border-2 border-white dark:border-slate-800">
                        <Camera size={12} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black dark:text-white uppercase truncate">Assets Node</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">PNG/JPG • 2MB LIMIT</p>
                </div>
            </div>
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block ps-1">Gym Name (Public)</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block ps-1">Owner Official Name</label>
                    <div className="relative">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
                        <input required type="text" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none dark:text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const LicenseSection = ({ lang, formData, setFormData }: any) => {
    const t = translations[lang];
    return (
        <div className="space-y-4">
            <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 pb-2 border-b dark:border-slate-700">{t.dev_subscription_sec}</h4>
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block ps-1">Contact Email</label>
                    <div className="relative"><Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12}/><input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none dark:text-white" /></div>
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block ps-1">Phone (Will be Default Password)</label>
                    <div className="relative"><Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12}/><input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none dark:text-white" /></div>
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block ps-1">Expiry</label>
                    <input type="date" value={formData.subscriptionExpiry} onChange={e => setFormData({...formData, subscriptionExpiry: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none dark:text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block ps-1">Tier Allocation</label>
                    <div className="grid grid-cols-4 gap-1.5">
                        {Object.values(GymSubscriptionPlan).map(plan => (
                            <button 
                                key={plan}
                                type="button"
                                onClick={() => setFormData({...formData, subscriptionPlan: plan})}
                                className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${formData.subscriptionPlan === plan ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-400'}`}
                            >
                                {plan === GymSubscriptionPlan.TRIAL && <Gift size={12} />}
                                {plan === GymSubscriptionPlan.BASIC && <Calendar size={12} />}
                                {plan === GymSubscriptionPlan.PRO && <Star size={12} />}
                                {plan === GymSubscriptionPlan.ELITE && <Crown size={12} />}
                                {plan === GymSubscriptionPlan.ENTERPRISE && <Crown size={12} />}
                                <span className="text-[7px] font-black mt-1 uppercase">{plan}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ModulesSection = ({ lang, formData, toggleModule }: any) => {
    const t = translations[lang];
    return (
        <div className="space-y-4">
            <h4 className="text-[9px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 pb-2 border-b dark:border-slate-700">{t.dev_feature_flags}</h4>
            <div className="grid grid-cols-1 gap-2">
                {(Object.keys(formData.enabledModules) as Array<keyof GymModules>).map(mod => (
                    <button key={mod} type="button" onClick={() => toggleModule(mod)} className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${formData.enabledModules[mod] ? 'bg-green-50/20 border-green-500/20 text-green-600' : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-400'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${formData.enabledModules[mod] ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}><LayoutGrid size={12} /></div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{mod} Node</span>
                        </div>
                        {formData.enabledModules[mod] ? <CheckCircle2 size={14} /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-slate-700"></div>}
                    </button>
                ))}
            </div>
        </div>
    );
};