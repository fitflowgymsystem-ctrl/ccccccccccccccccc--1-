import React, { useState } from 'react';
import { X, Save, Edit, UserPlus, Camera, Upload, Crown, Fingerprint, Gift, Activity, Shield, Coffee, Dumbbell, Users, Wind, Lock, DollarSign } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { User, MembershipType, Offer, Trainer, Gender, Branch } from '../../types';
import { calculateExpiry } from '../../utils/dateUtils';

interface MemberFormModalProps {
    editingMember?: User;
    offers: Offer[];
    trainers: Trainer[];
    branches?: Branch[];
    services?: any[];
    lang: Language;
    onClose: () => void;
    onSave: (data: any) => void;
}

import { useToast } from '../../hooks/useToast';

export const MemberFormModal: React.FC<MemberFormModalProps> = ({ editingMember, offers, trainers, branches = [], services = [], lang, onClose, onSave }) => {
    const t = translations[lang];
    const { showToast } = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: editingMember?.name || '',
        phone: editingMember?.phone || '',
        email: editingMember?.email || '',
        gender: editingMember?.gender || Gender.MALE,
        joinDate: editingMember?.joinDate || new Date().toISOString().split('T')[0],
        membershipType: editingMember?.membershipType || MembershipType.MONTHLY,
        expiryDate: editingMember?.expiryDate || calculateExpiry(MembershipType.MONTHLY, new Date().toISOString().split('T')[0]),
        isActive: editingMember?.isActive ?? true,
        fingerprintId: editingMember?.fingerprintId || '',
        activeOfferId: editingMember?.activeOfferId || '',
        isPrivate: editingMember?.isPrivate || false,
        assignedTrainerId: editingMember?.assignedTrainerId || '',
        privateSessionPrice: editingMember?.privateSessionPrice || undefined,
        photoUrl: editingMember?.photoUrl || '',
        inbodySessions: editingMember?.perks?.inbodySessions || undefined,
        guestPasses: editingMember?.perks?.guestPasses || undefined,
        ptSessions: editingMember?.perks?.ptSessions || undefined,
        groupClasses: editingMember?.perks?.groupClasses || false,
        spaAccess: editingMember?.perks?.spaAccess || false,
        privateLocker: editingMember?.perks?.privateLocker || false,
        towelService: editingMember?.perks?.towelService || false,
        barDiscount: editingMember?.perks?.barDiscount || false,
        freeGroupClassCount: editingMember?.perks?.freeGroupClassCount || undefined,
        freeGroupClassId: editingMember?.perks?.freeGroupClassId || '',
        // New Fields
        dob: editingMember?.dob || '',
        emergencyContactName: editingMember?.emergencyContactName || '',
        emergencyContactPhone: editingMember?.emergencyContactPhone || '',
        branch: editingMember?.branch || (branches.length > 0 ? branches[0].name : 'Main Branch'),
        fitnessGoal: editingMember?.fitnessGoal || '',
        weight: editingMember?.weight || undefined,
        height: editingMember?.height || undefined,
        fatPercentage: editingMember?.fatPercentage || undefined,
        medicalConditions: editingMember?.medicalConditions || '',
        bloodType: editingMember?.bloodType || '',
        paymentMethod: editingMember?.paymentMethod || 'CASH',
        totalPaid: editingMember?.totalPaid || undefined,
        installmentPlan: {
            enabled: false,
            total: 0,
            downPayment: 0,
            months: 1,
            description: ''
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Firebase Auth requires passwords to be at least 6 characters.
        // Since we use the phone number as the password, we must enforce this.
        if (formData.phone.length < 6) {
            const msg = lang === 'ar'
                ? 'رقم الهاتف يجب أن يكون 6 أرقام على الأقل (لاستخدامه ككلمة مرور)!'
                : 'Phone number must be at least 6 digits (used as password)!';
            setLocalError(msg);
            showToast(msg, 'error');
            return;
        }

        onSave({
            ...formData,
            privateSessionPrice: formData.privateSessionPrice || 0,
            inbodySessions: formData.inbodySessions || 0,
            guestPasses: formData.guestPasses || 0,
            ptSessions: formData.ptSessions || 0,
            groupClasses: !!formData.groupClasses,
            spaAccess: !!formData.spaAccess,
            privateLocker: !!formData.privateLocker,
            towelService: !!formData.towelService,
            barDiscount: !!formData.barDiscount,
            freeGroupClassCount: formData.freeGroupClassCount || 0,
            freeGroupClassId: formData.freeGroupClassId || null,
            weight: formData.weight ? Number(formData.weight) : null,
            height: formData.height ? Number(formData.height) : null,
            fatPercentage: formData.fatPercentage ? Number(formData.fatPercentage) : null,
            totalPaid: formData.totalPaid ? Number(formData.totalPaid) : undefined,
            installmentPlan: formData.installmentPlan.enabled ? {
                enabled: true,
                total: formData.installmentPlan.total,
                downPayment: formData.installmentPlan.downPayment,
                months: formData.installmentPlan.months,
                description: formData.installmentPlan.description || 'Installment Plan'
            } : { enabled: false }
        });
    };

    const previewInstallments = () => {
        if (!formData.installmentPlan.enabled || formData.installmentPlan.total <= 0) return [];
        const remaining = formData.installmentPlan.total - formData.installmentPlan.downPayment;
        const perMonth = remaining / formData.installmentPlan.months;
        const list = [];
        const today = new Date();
        for (let i = 1; i <= formData.installmentPlan.months; i++) {
            const d = new Date(today);
            d.setMonth(today.getMonth() + i);
            list.push({
                dueDate: d.toISOString().split('T')[0],
                amount: Math.round(perMonth)
            });
        }
        return list;
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-2 sm:p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg md:max-w-4xl overflow-hidden border dark:border-slate-700 flex flex-col max-h-[90vh] animate-scale-in cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-3 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 shrink-0">
                    <h3 className="font-black text-lg text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                        {editingMember ? <Edit size={14} className="text-blue-500" /> : <UserPlus size={14} className="text-blue-500" />}
                        {editingMember ? t.edit_member : t.add_member}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all"><X size={18} /></button>
                </div>

                {localError && (
                    <div className="mx-4 mt-3 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-2 animate-shake">
                        <Shield size={12} className="text-red-500" />
                        <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">{localError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 code-scroll">
                    <div className="flex items-center gap-4 bg-blue-50/30 dark:bg-blue-900/5 p-3 rounded-2xl border dark:border-slate-700/50">
                        <div className="relative w-14 h-14 shrink-0">
                            <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <Camera className="text-gray-400" size={16} />}
                            </div>
                            <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-lg cursor-pointer shadow-md hover:bg-blue-700 transition-all border-2 border-white dark:border-slate-800">
                                <Upload size={10} />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const img = new Image();
                                            img.onload = () => {
                                                const canvas = document.createElement('canvas');
                                                const size = Math.min(img.width, img.height);
                                                canvas.width = 400; // Standardize to 400x400
                                                canvas.height = 400;
                                                const ctx = canvas.getContext('2d');
                                                if (ctx) {
                                                    const offsetX = (img.width - size) / 2;
                                                    const offsetY = (img.height - size) / 2;
                                                    ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 400, 400);
                                                    setFormData(prev => ({ ...prev, photoUrl: canvas.toDataURL('image/jpeg', 0.7) }));
                                                }
                                            };
                                            img.src = event.target?.result as string;
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </label>
                        </div>
                        <div className="flex-1 space-y-2">
                            <input type="text" required placeholder={t.name} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-base font-bold outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" />
                            <input type="tel" required placeholder={t.phone} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-base font-mono outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" />
                            <input type="email" required={!editingMember} placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-base font-bold outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" />
                        </div>
                    </div>

                    {/* --- Personal Info (Extra) --- */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-slate-900/30 rounded-xl border dark:border-slate-700">
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.dob || 'Date of Birth'}</label>
                            <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm uppercase font-bold outline-none dark:text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.gender}</label>
                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm uppercase font-bold outline-none dark:text-white">
                                <option value={Gender.MALE}>{t.male}</option>
                                <option value={Gender.FEMALE}>{t.female}</option>
                            </select>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.branch || 'Branch'}</label>
                            <select value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm uppercase font-bold outline-none dark:text-white">
                                {branches.length > 0 ? (
                                    branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)
                                ) : (
                                    <option value="Main Branch">Main Branch</option>
                                )}
                            </select>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.emergency_name || 'Emergency Contact Name'}</label>
                                <input type="text" placeholder="Name" value={formData.emergencyContactName} onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-bold outline-none dark:text-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.emergency_phone || 'Emergency Phone'}</label>
                                <input type="tel" placeholder="Phone" value={formData.emergencyContactPhone} onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-bold outline-none dark:text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.membership}</label>
                            <select value={formData.membershipType} onChange={(e) => {
                                const nt = e.target.value as MembershipType;
                                setFormData(p => ({ ...p, membershipType: nt, expiryDate: calculateExpiry(nt, p.joinDate) }));
                            }} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white font-bold">
                                {Object.values(MembershipType).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.select_offer}</label>
                            <select value={formData.activeOfferId} onChange={e => setFormData({ ...formData, activeOfferId: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white font-bold">
                                <option value="">{t.no_offer_selected}</option>
                                {offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* --- Perks & Training --- */}
                    <div className="space-y-3 p-3 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-slate-700">
                        <label className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Gift size={12} /> {t.training_perks || 'Training Perks'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-xs font-black text-purple-500 uppercase tracking-widest">
                                    <Activity size={10} /> {t.perks_inbody}
                                </label>
                                <input type="number" min="0" placeholder="0" value={formData.inbodySessions ?? ''} onChange={e => setFormData({ ...formData, inbodySessions: e.target.value === '' ? null : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-xs font-black text-orange-500 uppercase tracking-widest">
                                    <Gift size={10} /> {t.perks_guest}
                                </label>
                                <input type="number" min="0" placeholder="0" value={formData.guestPasses ?? ''} onChange={e => setFormData({ ...formData, guestPasses: e.target.value === '' ? null : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-xs font-black text-blue-500 uppercase tracking-widest">
                                    <Dumbbell size={10} /> {t.pt_sessions || 'PT Sessions'}
                                </label>
                                <input type="number" min="0" placeholder="0" value={formData.ptSessions ?? ''} onChange={e => setFormData({ ...formData, ptSessions: e.target.value === '' ? null : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="flex items-center gap-1.5 text-xs font-black text-green-500 uppercase tracking-widest">
                                    <Users size={10} /> {lang === 'ar' ? 'الحصص الجماعية المجانية' : 'Free Group Classes'}
                                </label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={formData.freeGroupClassCount ?? ''}
                                        onChange={e => setFormData({ ...formData, freeGroupClassCount: e.target.value === '' ? null : Number(e.target.value) })}
                                        className="col-span-2 px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white"
                                    />
                                    <select
                                        value={formData.freeGroupClassId}
                                        onChange={e => setFormData({ ...formData, freeGroupClassId: e.target.value })}
                                        className="col-span-3 px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white font-bold"
                                    >
                                        <option value="">{lang === 'ar' ? 'اختر الحصة...' : 'Select Class...'}</option>
                                        {services.filter(s => s.category === 'Group Class').map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Amenities --- */}
                    <div className="space-y-3 p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border dark:border-slate-700">
                        <label className="text-xs font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Wind size={12} /> {t.amenities || 'Amenities'}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {/* Spa */}
                            <button type="button" onClick={() => setFormData({ ...formData, spaAccess: !formData.spaAccess })}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${formData.spaAccess ? 'bg-blue-500 text-white border-blue-600' : 'bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}>
                                <Wind size={14} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">{t.spa}</span>
                            </button>
                            {/* Private Locker */}
                            <button type="button" onClick={() => setFormData({ ...formData, privateLocker: !formData.privateLocker })}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${formData.privateLocker ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}>
                                <Lock size={14} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">{t.private_locker}</span>
                            </button>
                            {/* Towels */}
                            <button type="button" onClick={() => setFormData({ ...formData, towelService: !formData.towelService })}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${formData.towelService ? 'bg-teal-500 text-white border-teal-600' : 'bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}>
                                <Wind size={14} className="rotate-90" />
                                <span className="text-[8px] font-black uppercase tracking-tighter">{t.towels}</span>
                            </button>
                            {/* Bar Discount */}
                            <button type="button" onClick={() => setFormData({ ...formData, barDiscount: !formData.barDiscount })}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${formData.barDiscount ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}>
                                <Coffee size={14} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">{t.bar_discount}</span>
                            </button>
                        </div>
                    </div>

                    {/* --- Health & Fitness --- */}
                    <div className="space-y-2 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                        <label className="text-xs font-black text-green-700 dark:text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Activity size={12} /> {t.health_info || 'Health & Fitness'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <input type="number" placeholder="Weight (kg)" value={formData.weight ?? ''} onChange={e => setFormData({ ...formData, weight: e.target.value === '' ? null : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white" />
                            <input type="number" placeholder="Height (cm)" value={formData.height ?? ''} onChange={e => setFormData({ ...formData, height: e.target.value === '' ? null : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white" />
                            <input type="number" placeholder="Fat %" value={formData.fatPercentage ?? ''} onChange={e => setFormData({ ...formData, fatPercentage: e.target.value === '' ? null : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={formData.fitnessGoal} onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white">
                                <option value="">Select Goal...</option>
                                <option value="Weight Loss">Weight Loss</option>
                                <option value="Muscle Gain">Muscle Gain</option>
                                <option value="General Fitness">General Fitness</option>
                                <option value="Rehabilitation">Rehabilitation</option>
                            </select>
                            <select value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white">
                                <option value="">Blood Type...</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                        <textarea placeholder="Medical Conditions / Injuries..." value={formData.medicalConditions} onChange={e => setFormData({ ...formData, medicalConditions: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white resize-none h-14" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.join_date}</label>
                            <input type="date" value={formData.joinDate} onChange={e => {
                                const jd = e.target.value;
                                setFormData({ ...formData, joinDate: jd, expiryDate: calculateExpiry(formData.membershipType, jd) });
                            }} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-mono dark:text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.expiry}</label>
                            <input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-mono dark:text-white" />
                        </div>
                    </div>

                    {/* --- Financials --- */}
                    {!editingMember && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest ps-1">{t.payment_method || 'Payment Method'}</label>
                                <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-bold outline-none dark:text-white">
                                    <option value="CASH">Cash</option>
                                    <option value="VISA">Visa</option>
                                    <option value="WALLET">E-Wallet</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest ps-1">{t.amount_paid || 'Amount Paid'}</label>
                                <input type="number" placeholder="Paid Amount" value={formData.totalPaid ?? ''} onChange={e => setFormData({ ...formData, totalPaid: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-bold outline-none dark:text-white" />
                            </div>
                        </div>
                    )}
                    <div className={`p-4 rounded-xl border-2 transition-all ${formData.installmentPlan.enabled ? 'bg-orange-50 dark:bg-orange-950/10 border-orange-200' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-700'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-black text-orange-700 dark:text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                                <DollarSign size={16} /> {lang === 'ar' ? 'نظام التقسيط' : 'Installment Plan'}
                            </label>
                            <button type="button" onClick={() => setFormData({ ...formData, installmentPlan: { ...formData.installmentPlan, enabled: !formData.installmentPlan.enabled } })} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${formData.installmentPlan.enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.installmentPlan.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {formData.installmentPlan.enabled && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'المبلغ الكلي' : 'Total Amount'}</label>
                                        <input
                                            type="number"
                                            value={formData.installmentPlan.total || ''}
                                            onChange={(e) => setFormData({ ...formData, installmentPlan: { ...formData.installmentPlan, total: Number(e.target.value) } })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'المبلغ المقدم' : 'Down Payment'}</label>
                                        <input
                                            type="number"
                                            value={formData.installmentPlan.downPayment || ''}
                                            onChange={(e) => setFormData({ ...formData, installmentPlan: { ...formData.installmentPlan, downPayment: Number(e.target.value) } })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'عدد الشهور' : 'Months'}</label>
                                        <select
                                            value={formData.installmentPlan.months}
                                            onChange={(e) => setFormData({ ...formData, installmentPlan: { ...formData.installmentPlan, months: Number(e.target.value) } })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold outline-none"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 10, 12, 18, 24].map(m => (
                                                <option key={m} value={m}>{m} {lang === 'ar' ? 'شهور' : 'Months'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder={lang === 'ar' ? 'وصف خطة التقسيط...' : 'Installment description...'}
                                    value={formData.installmentPlan.description}
                                    onChange={(e) => setFormData({ ...formData, installmentPlan: { ...formData.installmentPlan, description: e.target.value } })}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-bold outline-none"
                                />

                                {formData.installmentPlan.total > 0 && (
                                    <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900/20 max-h-40 overflow-y-auto">
                                        <table className="w-full text-[9px]">
                                            <thead className="text-gray-400 font-black uppercase tracking-widest border-b dark:border-slate-700">
                                                <tr>
                                                    <th className="text-start py-1">Month</th>
                                                    <th className="text-start py-1">Due Date</th>
                                                    <th className="text-end py-1">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-slate-800">
                                                {previewInstallments().map((inst, i) => (
                                                    <tr key={i}>
                                                        <td className="py-1.5 font-bold">#{i + 1}</td>
                                                        <td className="py-1.5 font-bold uppercase">{inst.dueDate}</td>
                                                        <td className="py-1.5 font-black text-end">{inst.amount} EGP</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={`p-3 rounded-xl border transition-all ${formData.isPrivate ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-700'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Crown size={14} /> {t.private_training}
                            </label>
                            <button type="button" onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })} className={`relative inline-flex h-4 w-9 items-center rounded-full transition-colors ${formData.isPrivate ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${formData.isPrivate ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {formData.isPrivate && (
                            <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                <select value={formData.assignedTrainerId} onChange={e => setFormData({ ...formData, assignedTrainerId: e.target.value })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-amber-200 rounded-lg text-sm outline-none dark:text-white">
                                    <option value="">Coach</option>
                                    {trainers.map(tr => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
                                </select>
                                <input type="number" placeholder="Price" value={formData.privateSessionPrice ?? ''} onChange={e => setFormData({ ...formData, privateSessionPrice: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-amber-200 rounded-lg text-sm outline-none dark:text-white font-bold" />
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <label className="block text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Fingerprint size={12} className={isScanning ? "animate-pulse" : ""} /> {isScanning ? (lang === 'ar' ? 'جاري المسح...' : 'Scanning...') : t.fingerprint_id}
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    readOnly
                                    placeholder={isScanning ? (lang === 'ar' ? 'ضع إصبعك...' : 'Place finger...') : 'Enroll...'}
                                    value={formData.fingerprintId}
                                    className={`w-full px-3 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-base font-mono dark:text-white outline-none transition-all ${isScanning ? 'ring-2 ring-blue-500/20' : ''}`}
                                />
                                {isScanning && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={isScanning}
                                onClick={async () => {
                                    setLocalError(null);
                                    if (!(window as any).electronAPI) {
                                        setLocalError(lang === 'ar' ? 'ميزة البصمة تعمل فقط في نسخة الحاسوب!' : 'Biometric feature only works in Desktop version!');
                                        return;
                                    }

                                    setIsScanning(true);
                                    try {
                                        const result = await (window as any).electronAPI.scanBiometric();
                                        if (result.success) {
                                            setFormData({ ...formData, fingerprintId: result.data.fingerId });
                                        } else {
                                            setLocalError(lang === 'ar' ? 'فشل المسح: ' + result.error : 'Scan failed: ' + result.error);
                                        }
                                    } catch (err) {
                                        console.error('Scan error:', err);
                                        setLocalError(lang === 'ar' ? 'خطأ في الاتصال بجهاز البصمة' : 'Scanner communication error');
                                    } finally {
                                        setIsScanning(false);
                                    }
                                }}
                                className={`px-4 py-1.5 rounded-xl text-sm font-black uppercase flex items-center gap-1 transition-all active:scale-95 shadow-md tracking-widest ${isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'}`}
                            >
                                <Fingerprint size={12} /> {isScanning ? (lang === 'ar' ? 'انتظر' : 'Wait') : (lang === 'ar' ? 'بصمة' : 'Enroll')}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 sticky bottom-0 bg-white dark:bg-slate-800 py-3 border-t dark:border-slate-700 z-10 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all tracking-widest">
                            <Save size={16} /> {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
