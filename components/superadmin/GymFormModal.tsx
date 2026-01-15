
import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck } from 'lucide-react';
import { GymProfile, GymSubscriptionPlan, GymModules } from '../../types';
import { getSaaSConfig } from '../../services/saasService';
import { Language, translations } from '../../utils/translations';
import { BrandingSection, LicenseSection, ModulesSection } from './GymFormSections';

interface GymFormModalProps {
    editingGym: GymProfile | null;
    onClose: () => void;
    onSave: (data: any) => void;
    lang: Language;
}

import { useToast } from '../../hooks/useToast';

export const GymFormModal: React.FC<GymFormModalProps> = ({ editingGym, onClose, onSave, lang }) => {
    const t = translations[lang];
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: editingGym?.name || '',
        ownerName: editingGym?.ownerName || '',
        email: editingGym?.email || '',
        phone: editingGym?.phone || '',
        logoUrl: editingGym?.logoUrl || '',
        subscriptionPlan: editingGym?.subscriptionPlan || GymSubscriptionPlan.TRIAL,
        subscriptionExpiry: editingGym?.subscriptionExpiry || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        enabledModules: editingGym?.enabledModules || { pos: true, trainers: true, attendance: true, financials: true, workoutPlans: true } as GymModules,
    });

    useEffect(() => {
        // Compute new expiry when plan changes. For edits, extend from the current expiry
        // if it is in the future; otherwise start from today.
        try {
            const cfg = getSaaSConfig();
            const plan = formData.subscriptionPlan as GymSubscriptionPlan;
            const planDurations = cfg.planDurationDays || {};
            const durationDays = planDurations[plan] || (plan === GymSubscriptionPlan.TRIAL ? cfg.trialDurationDays : 30);

            const now = new Date();
            let baseDate = new Date();

            // If editing an existing gym and it has a future expiry, preserve continuity
            if (editingGym && editingGym.subscriptionExpiry) {
                const existing = new Date(editingGym.subscriptionExpiry);
                if (!isNaN(existing.getTime()) && existing > now) {
                    baseDate = existing;
                }
            }

            // Use existing form date if it's also in the future and later than baseDate
            if (formData.subscriptionExpiry) {
                const formDate = new Date(formData.subscriptionExpiry);
                if (!isNaN(formDate.getTime()) && formDate > baseDate) baseDate = formDate;
            }

            baseDate.setDate(baseDate.getDate() + (durationDays || 30));
            const newExpiry = baseDate.toISOString().split('T')[0];
            // Debug: surface computed expiry to browser console for troubleshooting
            try { console.debug('[GymFormModal] plan', plan, 'durationDays', durationDays, 'computedExpiry', newExpiry); } catch { };
            setFormData(prev => ({ ...prev, subscriptionExpiry: newExpiry }));
        } catch (e) {
            // fallback: trial -> +14 days, otherwise +1 month
            if (formData.subscriptionPlan === GymSubscriptionPlan.TRIAL) {
                const trialDate = new Date();
                trialDate.setDate(trialDate.getDate() + 14);
                setFormData(prev => ({ ...prev, subscriptionExpiry: trialDate.toISOString().split('T')[0] }));
            } else {
                const fallback = new Date();
                fallback.setMonth(fallback.getMonth() + 1);
                setFormData(prev => ({ ...prev, subscriptionExpiry: fallback.toISOString().split('T')[0] }));
            }
        }
    }, [formData.subscriptionPlan, editingGym]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const toggleModule = (mod: keyof GymModules) => {
        setFormData(prev => ({ ...prev, enabledModules: { ...prev.enabledModules, [mod]: !prev.enabledModules[mod] } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // فحص أمني لضمان عدم وجود قيم فارغة أو Null في حقل الاسم
        const gymName = formData.name?.trim();
        if (!gymName) {
            showToast(lang === 'ar' ? 'يرجى إدخال اسم المنشأة' : 'Please enter the gym name', 'error');
            return;
        }

        // إنشاء نسخة نظيفة من البيانات للإرسال
        const submissionData = {
            ...formData,
            name: gymName,
            // التأكد من أن الحقول النصية ليست Null
            ownerName: formData.ownerName?.trim() || '',
            email: formData.email?.trim() || '',
            phone: formData.phone?.trim() || ''
        };

        onSave(submissionData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-2 sm:p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-5xl border dark:border-slate-700 animate-scale-in overflow-hidden flex flex-col max-h-[95vh] cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 sm:p-5 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><ShieldCheck size={18} /></div>
                        <div>
                            <h3 className="font-black text-sm dark:text-white uppercase tracking-tighter">{t.dev_provision_unit}</h3>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Instance ID: {editingGym?.id || 'NEW_NODE'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-full transition-all bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-6 space-y-6 overflow-y-auto code-scroll flex-1">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <BrandingSection lang={lang} formData={formData} setFormData={setFormData} handleLogoUpload={handleLogoUpload} />
                            <LicenseSection lang={lang} formData={formData} setFormData={setFormData} />
                            <ModulesSection lang={lang} formData={formData} toggleModule={toggleModule} />
                        </div>
                    </div>

                    <div className="p-4 border-t dark:border-slate-700 flex gap-3 shrink-0 bg-gray-50 dark:bg-slate-950">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white dark:bg-slate-800 text-gray-400 rounded-xl font-black uppercase tracking-widest text-[9px] border dark:border-slate-700">Discard</button>
                        <button type="submit" className="flex-[3] py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                            <Save size={14} /> {editingGym ? t.dev_commit_updates : t.dev_deploy_infra}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
