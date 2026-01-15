import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, User as UserIcon, Crown, Clock, DollarSign, Gift, Activity, ShieldCheck, History, CalendarDays, Maximize2, Snowflake, PlayCircle, AlertTriangle, Calendar, Loader2, Coffee, Lock, Wind, Users, Dumbbell, Sparkles } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { User, AccessLog, Trainer, Gender, ServiceSubscription } from '../../types';

interface MemberDetailsModalProps {
    member: User;
    logs: AccessLog[];
    trainers: Trainer[];
    services?: any[];
    serviceSubscriptions?: ServiceSubscription[];
    lang: Language;
    onClose: () => void;
    onUsePerk: (userId: number, type: 'InBody' | 'Guest Pass' | 'PT Session' | 'Free Group Class') => void;
    onLogSession: (userId: number, trainerId: number, price: number) => void;
    onLogServiceSession?: (userId: number, serviceId: number, price: number, serviceName: string) => void;
    onUpdateMember: (user: User) => void;
    onConfirmPayment?: (subId: number) => Promise<void>;
    onAddInstallmentPlan?: (userId: number, plan: any) => Promise<void>;
}

import { useToast } from '../../hooks/useToast';

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({ member, logs, trainers, services = [], serviceSubscriptions = [], lang, onClose, onUsePerk, onLogSession, onLogServiceSession, onUpdateMember, onConfirmPayment }) => {
    const t = translations[lang];
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'INFO' | 'ATTENDANCE' | 'PERKS' | 'PRIVATE' | 'FINANCIALS' | 'ACTIONS'>('INFO');
    const [showFullPhoto, setShowFullPhoto] = useState(false);
    const [freezeDuration, setFreezeDuration] = useState(7);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [previewPlan, setPreviewPlan] = useState<any>(null);

    // ABSOLUTE PROTECTION: Use BOTH state and ref for guaranteed synchronous blocking
    const isLockedRef = useRef(false);
    const [isModalLocked, setIsModalLocked] = useState(false);

    // The one and only close handler - NOTHING else should call onClose directly
    const handleSafeClose = () => {
        console.log('[DEBUG] handleSafeClose called. isLockedRef.current:', isLockedRef.current, 'isModalLocked:', isModalLocked, 'showFullPhoto:', showFullPhoto);

        // Check ref first (synchronous, always up-to-date)
        if (isLockedRef.current) {
            console.log('[BLOCKED] Modal close prevented by isLockedRef');
            return;
        }

        // Check state (should match ref, but safety first)
        if (isModalLocked) {
            console.log('[BLOCKED] Modal close prevented by isModalLocked state');
            return;
        }

        // Check photo state
        if (showFullPhoto) {
            console.log('[BLOCKED] Modal close prevented - photo is still showing');
            return;
        }

        console.log('[ALLOWED] Modal close proceeding...');
        onClose();
    };

    const openPhoto = (e: React.MouseEvent) => {
        console.log('[DEBUG] openPhoto called');
        e.stopPropagation();
        e.preventDefault();

        if (!member.photoUrl) return; // Prevent locking if no photo exists

        // Lock IMMEDIATELY using ref (synchronous)
        isLockedRef.current = true;
        setIsModalLocked(true);
        setShowFullPhoto(true);
    };

    const closePhoto = (e?: React.MouseEvent | KeyboardEvent) => {
        console.log('[DEBUG] closePhoto called');
        if (e) {
            e.stopPropagation();
            if ('preventDefault' in e) e.preventDefault();
        }

        // Close photo but KEEP locked
        setShowFullPhoto(false);

        // Unlock after 300ms - enough to prevent ghost clicks, but fast enough for user
        setTimeout(() => {
            isLockedRef.current = false;
            setIsModalLocked(false);
            console.log('[DEBUG] Modal unlocked after 300ms timeout');
        }, 300);
    };

    // Handle Escape key for photo overlay
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showFullPhoto) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                closePhoto();
            }
        };

        if (showFullPhoto) {
            window.addEventListener('keydown', handleKeyDown, true);
        }

        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [showFullPhoto]);

    const userLogs = logs
        .filter(l => l.userId === member.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const assignedTrainer = trainers.find(tr => tr.id === member.assignedTrainerId);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const handleFreeze = async () => {
        setIsActionLoading(true);
        const today = new Date();
        const unfreezeDate = new Date(today);
        unfreezeDate.setDate(today.getDate() + freezeDuration);

        // Extend expiry date by the freeze duration to compensate member
        const currentExpiry = new Date(member.expiryDate);
        const newExpiry = new Date(currentExpiry);
        newExpiry.setDate(currentExpiry.getDate() + freezeDuration);

        await onUpdateMember({
            ...member,
            isFrozen: true,
            frozenUntil: unfreezeDate.toISOString().split('T')[0],
            expiryDate: newExpiry.toISOString().split('T')[0]
        });
        showToast(lang === 'ar' ? `تم تجميد العضوية لمدة ${freezeDuration} يوم` : `Membership frozen for ${freezeDuration} days`, 'success');
        setTimeout(() => setIsActionLoading(false), 500);
    };

    const handleUnfreeze = async () => {
        setIsActionLoading(true);
        await onUpdateMember({
            ...member,
            isFrozen: false,
            frozenUntil: null
        });
        showToast(lang === 'ar' ? 'تم إلغاء تجميد العضوية' : 'Membership un-frozen successfully', 'success');
        setTimeout(() => setIsActionLoading(false), 500);
    };

    const handlePayInstallment = async (planId: number, installmentId: number, amount: number) => {
        setIsActionLoading(true);
        try {
            const updatedPlans = member.installmentPlans?.map(plan => {
                if (plan.id === planId) {
                    const updatedInstallments = plan.installments.map(inst => {
                        if (inst.id === installmentId) {
                            return { ...inst, status: 'PAID', paidDate: new Date().toISOString() };
                        }
                        return inst;
                    });
                    const remaining = plan.remainingAmount - amount;
                    const allPaid = updatedInstallments.every(i => i.status === 'PAID');
                    return {
                        ...plan,
                        installments: updatedInstallments,
                        remainingAmount: remaining,
                        status: allPaid ? 'COMPLETED' : plan.status
                    };
                }
                return plan;
            });

            await onUpdateMember({
                ...member,
                installmentPlans: updatedPlans as any
            });

            // Record in financials
            const { addFinancialRecord } = await import('../../services/financeService');
            await addFinancialRecord({
                id: Date.now(),
                gymId: member.gymId,
                type: 'INCOME',
                category: 'OTHER',
                amount: amount,
                description: `Installment Payment - ${member.name} (${member.installmentPlans?.find(p => p.id === planId)?.description})`,
                date: new Date().toISOString(),
                paymentMethod: 'CASH'

            } as any);

            showToast(lang === 'ar' ? 'تم دفع القسط بنجاح' : 'Installment paid successfully', 'success');
        } catch (error) {
            console.error('Failed to pay installment:', error);
            showToast('Failed to record payment', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    return createPortal(
        <>
            <div
                className="fixed top-0 left-0 right-0 bottom-0 bg-black/75 backdrop-blur-sm z-[9998] flex items-center justify-center p-2 sm:p-4 animate-fade-in cursor-pointer"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) handleSafeClose();
                }}
            >
                <div
                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl md:max-w-5xl overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] border dark:border-slate-700 animate-scale-in cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-xs dark:text-white uppercase tracking-widest leading-none">Member Dossier</h3>
                                <p
                                    onClick={() => {
                                        navigator.clipboard.writeText(member.id.toString());
                                        showToast(lang === 'ar' ? 'تم نسخ معرف العضو' : 'Member ID copied to clipboard', 'info');
                                    }}
                                    className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter cursor-copy hover:text-blue-500 transition-colors"
                                    title="Click to copy"
                                >
                                    UID: {member.id}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleSafeClose} className="text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto code-scroll flex flex-col">
                        {/* Hero Profile Section */}
                        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent border-b dark:border-slate-700">
                            <button
                                type="button"
                                onClick={openPhoto}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden bg-gray-100 shrink-0 relative group cursor-zoom-in active:scale-95 transition-all"
                            >
                                {member.photoUrl ? (
                                    <>
                                        <img src={member.photoUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Maximize2 size={24} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <UserIcon size={40} className="absolute inset-0 m-auto text-gray-300" />
                                )}
                            </button>
                            <div className="flex-1 text-center sm:text-start space-y-2">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black dark:text-white uppercase tracking-tighter leading-tight">{member.name}</h2>
                                    <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em]">{member.membershipType}</p>
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                                    {member.isFrozen ? (
                                        <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase shadow-sm bg-cyan-500 text-white flex items-center gap-1">
                                            <Snowflake size={10} /> FROZEN
                                        </span>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase shadow-sm ${member.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {member.isActive ? t.active : t.inactive}
                                        </span>
                                    )}
                                    {member.isPrivate && (
                                        <span className="bg-amber-500 text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase shadow-sm flex items-center gap-1">
                                            <Crown size={10} /> VIP PRIVATE
                                        </span>
                                    )}
                                    <span className="bg-slate-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 px-3 py-1 rounded-xl text-[9px] font-black uppercase shadow-sm">
                                        {member.phone}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-20 px-4">
                            {(['INFO', 'ATTENDANCE', 'PERKS', 'PRIVATE', 'FINANCIALS', 'ACTIONS'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab === 'INFO' ? (lang === 'ar' ? 'المعلومات' : 'Info') :
                                        tab === 'ATTENDANCE' ? (lang === 'ar' ? 'الحضور' : 'Attendance') :
                                            tab === 'PERKS' ? (lang === 'ar' ? 'المزايا' : 'Perks') :
                                                tab === 'PRIVATE' ? (lang === 'ar' ? 'برايفت وحصص' : 'Private & Classes') :
                                                    tab === 'ACTIONS' ? (lang === 'ar' ? 'إجراءات' : 'Actions') :
                                                        (lang === 'ar' ? 'المالية' : 'Finance')}
                                    {activeTab === tab && <div className="absolute bottom-0 left-2 right-2 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]"></div>}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 flex-1 bg-gray-50/30 dark:bg-slate-900/10 dark:text-gray-200">
                            {activeTab === 'INFO' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Basic Info Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border dark:border-slate-700 shadow-sm space-y-3">
                                            <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                                <UserIcon size={14} /> {lang === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-y-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.email}</span>
                                                    <span className="text-[10px] font-bold dark:text-white truncate">{member.email || '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.gender}</span>
                                                    <span className="text-[10px] font-bold dark:text-white uppercase">{member.gender === Gender.MALE ? t.male : t.female}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.dob}</span>
                                                    <span className="text-[10px] font-bold dark:text-white">{member.dob || '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.branch}</span>
                                                    <span className="text-[10px] font-bold dark:text-white uppercase">{member.branch || '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.join_date}</span>
                                                    <span className="text-[10px] font-bold dark:text-white">{member.joinDate}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.fingerprint_id}</span>
                                                    <span className="text-[10px] font-mono font-bold dark:text-white">{member.fingerprintId || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Info Group */}
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border dark:border-slate-700 shadow-sm space-y-3">
                                            <h4 className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                                <AlertTriangle size={14} /> {lang === 'ar' ? 'طوارئ' : 'Emergency'}
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.emergency_name}</span>
                                                    <span className="text-[10px] font-bold dark:text-white uppercase">{member.emergencyContactName || '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.emergency_phone}</span>
                                                    <span className="text-[10px] font-bold dark:text-white font-mono">{member.emergencyContactPhone || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Health Info Group */}
                                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border dark:border-slate-700 shadow-sm space-y-4">
                                        <h4 className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={14} /> {t.health_info}
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="flex flex-col p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                                                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">{t.weight}</span>
                                                <span className="text-sm font-black dark:text-white truncate">{member.weight ? `${member.weight} kg` : '-'}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                                                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">{t.height}</span>
                                                <span className="text-sm font-black dark:text-white truncate">{member.height ? `${member.height} cm` : '-'}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                                                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">{t.fat_percentage}</span>
                                                <span className="text-sm font-black dark:text-white truncate">{member.fatPercentage ? `${member.fatPercentage} %` : '-'}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                                                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">{t.blood_type}</span>
                                                <span className="text-sm font-black dark:text-white truncate">{member.bloodType || '-'}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest ps-1">{t.fitness_goal}</span>
                                                <div className="p-3 bg-blue-50/30 dark:bg-blue-900/5 rounded-2xl border dark:border-slate-700/50 min-h-[40px] flex items-center">
                                                    <span className="text-[10px] font-bold dark:text-white">{member.fitnessGoal || '-'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest ps-1">{t.medical_conditions}</span>
                                                <div className="p-3 bg-red-50/30 dark:bg-red-900/5 rounded-2xl border dark:border-slate-700/50 min-h-[40px] flex items-center">
                                                    <span className="text-[10px] font-bold dark:text-white leading-relaxed">{member.medicalConditions || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ATTENDANCE' && (
                                <div className="space-y-2">
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <History size={14} className="text-blue-500" /> Recent Entry Logs
                                    </h4>
                                    {userLogs.length > 0 ? userLogs.slice(0, 15).map(log => {
                                        const { date, time } = formatDate(log.timestamp);
                                        return (
                                            <div key={log.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm transition-all hover:border-blue-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                                        <Clock size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black dark:text-gray-200 uppercase tracking-tighter">{date}</span>
                                                        <span className="text-[9px] text-gray-400 font-mono font-bold">{time}</span>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${log.status === 'GRANTED' ? 'bg-green-500 text-white shadow-sm shadow-green-500/20' : 'bg-red-500 text-white shadow-sm shadow-red-500/20'}`}>
                                                        {log.status}
                                                    </span>
                                                    <p className="text-[7px] text-gray-400 mt-1 font-bold uppercase">{log.deviceId}</p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="py-12 text-center opacity-30">
                                            <History size={40} className="mx-auto mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No access history found</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'PERKS' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Session Balances */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl mb-2 shadow-inner">
                                                <Activity size={20} />
                                            </div>
                                            <p className="text-[8px] font-black text-purple-600 uppercase tracking-widest mb-1">{t.perks_inbody}</p>
                                            <h3 className="text-xl font-black dark:text-white mb-3 tracking-tighter">{member.perks.inbodySessions} <span className="text-[10px] text-gray-400">Left</span></h3>
                                            <button disabled={member.perks.inbodySessions <= 0} onClick={() => onUsePerk(member.id, 'InBody')} className="w-full py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-30">Use Now</button>
                                        </div>

                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl mb-2 shadow-inner">
                                                <Gift size={20} />
                                            </div>
                                            <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1">{t.perks_guest}</p>
                                            <h3 className="text-xl font-black dark:text-white mb-3 tracking-tighter">{member.perks.guestPasses} <span className="text-[10px] text-gray-400">Left</span></h3>
                                            <button disabled={member.perks.guestPasses <= 0} onClick={() => onUsePerk(member.id, 'Guest Pass')} className="w-full py-2 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-orange-600/20 hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-30">Invite Guest</button>
                                        </div>

                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl mb-2 shadow-inner">
                                                <Dumbbell size={20} />
                                            </div>
                                            <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">{t.pt_sessions}</p>
                                            <h3 className="text-xl font-black dark:text-white mb-3 tracking-tighter">{member.perks.ptSessions || 0} <span className="text-[10px] text-gray-400">Left</span></h3>
                                            <button disabled={!member.perks.ptSessions} onClick={() => onUsePerk(member.id, 'PT Session')} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30">Record PT</button>
                                        </div>

                                        {(member.perks.freeGroupClassCount || 0) > 0 && (
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                                                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl mb-2 shadow-inner">
                                                    <Users size={20} />
                                                </div>
                                                <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-1">
                                                    {lang === 'ar' ? 'حصص مجانية' : 'Free Classes'}
                                                    {member.perks.freeGroupClassId && services.find(s => String(s.id) === String(member.perks.freeGroupClassId)) ? ` - ${services.find(s => String(s.id) === String(member.perks.freeGroupClassId))?.name}` : ''}
                                                </p>
                                                <h3 className="text-xl font-black dark:text-white mb-3 tracking-tighter">{member.perks.freeGroupClassCount} <span className="text-[10px] text-gray-400">Left</span></h3>
                                                <button onClick={() => onUsePerk(member.id, 'Free Group Class')} className="w-full py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all">Log Use</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feature Badges */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${member.perks.spaAccess ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 text-blue-600' : 'bg-white dark:bg-slate-800 border-gray-100 text-gray-300 dark:text-gray-600 opacity-60'}`}>
                                            <Wind size={16} />
                                            <span className="text-[9px] font-black uppercase tracking-tight">{t.spa}</span>
                                        </div>
                                        <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${member.perks.privateLocker ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 text-indigo-600' : 'bg-white dark:bg-slate-800 border-gray-100 text-gray-300 dark:text-gray-600 opacity-60'}`}>
                                            <Lock size={16} />
                                            <span className="text-[9px] font-black uppercase tracking-tight">{t.private_locker}</span>
                                        </div>
                                        <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${member.perks.towelService ? 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 text-teal-600' : 'bg-white dark:bg-slate-800 border-gray-100 text-gray-300 dark:text-gray-600 opacity-60'}`}>
                                            <Wind size={16} className="rotate-90" />
                                            <span className="text-[9px] font-black uppercase tracking-tight">{t.towels}</span>
                                        </div>
                                        <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${member.perks.barDiscount ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 text-amber-600' : 'bg-white dark:bg-slate-800 border-gray-100 text-gray-300 dark:text-gray-600 opacity-60'}`}>
                                            <Coffee size={16} />
                                            <span className="text-[9px] font-black uppercase tracking-tight">{t.bar_discount}</span>
                                        </div>
                                        <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${member.perks.groupClasses ? 'bg-green-50 dark:bg-green-900/10 border-green-200 text-green-600' : 'bg-white dark:bg-slate-800 border-gray-100 text-gray-300 dark:text-gray-600 opacity-60'}`}>
                                            <Users size={16} />
                                            <span className="text-[9px] font-black uppercase tracking-tight">{t.group_classes}</span>
                                        </div>
                                    </div>

                                    {/* History */}
                                    <div className="space-y-2">
                                        <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <History size={14} className="text-purple-500" /> Usage History
                                        </h4>
                                        {member.perkLogs && member.perkLogs.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {[...member.perkLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(pLog => {
                                                    const { date, time } = formatDate(pLog.date);
                                                    return (
                                                        <div key={pLog.id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700 text-[10px]">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-1.5 rounded-lg ${pLog.type === 'InBody' ? 'bg-purple-100 text-purple-600' : pLog.type === 'Free Group Class' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                                    {pLog.type === 'InBody' ? <Activity size={12} /> : pLog.type === 'Free Group Class' ? <Users size={12} /> : <Gift size={12} />}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-black dark:text-gray-200 uppercase tracking-tighter">{pLog.type} Used</span>
                                                                    <span className="text-[8px] text-gray-400 font-bold">{date}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-[9px] font-mono text-gray-400">{time}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-center py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl">No usage records</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'PRIVATE' && (
                                <div className="space-y-6">
                                    {/* Services Subscriptions */}
                                    {serviceSubscriptions.filter(s => s.userId === member.id && s.status === 'active').map(sub => {
                                        const service = services.find(s => String(s.id) === String(sub.serviceId));
                                        const sessionPrice = service?.price || 0;
                                        const isUnpaid = sub.paymentStatus === 'unpaid';

                                        return (
                                            <div key={sub.id} className={`p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-md flex justify-between items-center relative overflow-hidden group mb-4 last:mb-0 ${isUnpaid ? 'border-red-200 dark:border-red-900/30 grayscale-[0.3]' : 'border-indigo-200 dark:border-indigo-900/30'}`}>
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform"><Sparkles size={60} /></div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{lang === 'ar' ? 'خدمة مفعّلة' : 'Active Service'}</p>
                                                        {isUnpaid && (
                                                            <span className="px-2 py-0.5 bg-red-500 text-white rounded-lg text-[7px] font-black uppercase animate-pulse">
                                                                {lang === 'ar' ? 'لم يتم الدفع' : 'Unpaid'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter">{sub.serviceName}</h3>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-1 text-green-600 font-black">
                                                            <DollarSign size={14} />
                                                            <span className="text-lg">{sessionPrice}</span>
                                                        </div>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'للحصة' : 'Rate / Session'}</span>
                                                        <div className="h-4 w-[1px] bg-gray-200 dark:bg-slate-700 ml-2"></div>
                                                        {sub.totalSessions === 0 ? (
                                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{lang === 'ar' ? 'اشتراك مفتوح' : 'Unlimited Access'}</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-blue-600">{sub.remainingSessions} / {sub.totalSessions} {lang === 'ar' ? 'متبقي' : 'Left'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (isUnpaid) {
                                                            showToast(lang === 'ar' ? 'عذراً، يجب تأكيد الدفع أولاً من قسم المالية قبل تسجيل الحصة' : 'Sorry, payment must be confirmed in the Financials section before recording a session', 'error');
                                                            return;
                                                        }
                                                        onLogServiceSession?.(member.id, sub.serviceId, sessionPrice, sub.serviceName);
                                                    }}
                                                    className={`relative z-10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all ${isUnpaid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'}`}
                                                >
                                                    {isUnpaid ? (lang === 'ar' ? 'لم يتم الدفع' : 'Unpaid') : (lang === 'ar' ? 'تسجيل حصة' : 'Record Session')}
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {member.isPrivate && (
                                        <>
                                            <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-amber-200 dark:border-amber-900/30 shadow-md flex justify-between items-center relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform"><Crown size={60} /></div>
                                                <div className="relative z-10">
                                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">{t.assigned_trainer}</p>
                                                    <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter">{assignedTrainer?.name || 'Pro Coach'}</h3>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-1 text-blue-600 font-black">
                                                            <DollarSign size={14} />
                                                            <span className="text-lg">{member.privateSessionPrice}</span>
                                                        </div>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase">Rate / Session</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => onLogSession(member.id, member.assignedTrainerId!, member.privateSessionPrice!)} className="relative z-10 px-6 py-3 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-amber-600/20 active:scale-95 transition-all hover:bg-amber-700">Record Session</button>
                                            </div>
                                        </>
                                    )}

                                    {!member.isPrivate && serviceSubscriptions.filter(s => s.userId === member.id && s.status === 'active').length === 0 && (
                                        <div className="py-20 text-center bg-gray-50/50 dark:bg-slate-900/50 border-2 border-dashed rounded-[2.5rem] border-gray-200 dark:border-slate-800">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm opacity-50">
                                                <Crown size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">No Active Private Training or Services</h3>
                                            <p className="text-[9px] text-gray-500 font-bold mt-2 uppercase">Subscribe to services in the plans page</p>
                                        </div>
                                    )}

                                    {(member.privateLogs && member.privateLogs.length > 0) && (
                                        <div className="space-y-2">
                                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <CalendarDays size={14} className="text-amber-500" /> Session Log
                                            </h4>
                                            <div className="space-y-1.5">
                                                {[...member.privateLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(pLog => {
                                                    const { date, time } = formatDate(pLog.date);
                                                    return (
                                                        <div key={pLog.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 text-[10px] hover:border-amber-200 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                                                                    <Activity size={14} />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-black dark:text-gray-200 uppercase tracking-tighter">Session: {pLog.trainerName}</span>
                                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{date} • {time}</span>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg font-black text-[9px] shadow-sm">${pLog.price}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'FINANCIALS' && (
                                <div className="space-y-6 animate-fade-in pb-10">
                                    {/* Existing Subscriptions */}
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <DollarSign size={16} className="text-green-600" /> {lang === 'ar' ? 'اشتراكات الخدمات الذاتية' : 'Self-Service Subscriptions'}
                                    </h4>
                                    <div className="space-y-3">
                                        {serviceSubscriptions.filter(s => s.userId === member.id).length > 0 ? (
                                            serviceSubscriptions.filter(s => s.userId === member.id).sort((a, b) => b.id - a.id).map(sub => {
                                                const service = services.find(s => s.id === sub.serviceId);
                                                return (
                                                    <div key={sub.id} className="p-4 bg-white dark:bg-slate-800 rounded-[2rem] border dark:border-slate-700 shadow-sm flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-2xl ${sub.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                <DollarSign size={20} />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-[11px] font-black dark:text-white uppercase tracking-tight">{sub.serviceName}</h5>
                                                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{sub.purchaseDate}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-green-600">{(sub.price || service?.price || 0)} EGP</p>
                                                                <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest">{sub.status}</p>
                                                            </div>
                                                            {sub.paymentStatus === 'unpaid' ? (
                                                                <button
                                                                    onClick={() => {
                                                                        onConfirmPayment?.(sub.id);
                                                                        showToast(lang === 'ar' ? `تم تسجيل مبلغ ${sub.price || service?.price} جنيه` : `Payment of ${sub.price || service?.price} EGP confirmed`, 'success');
                                                                    }}
                                                                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all"
                                                                >
                                                                    {lang === 'ar' ? 'تم الدفع' : 'Confirm Paid'}
                                                                </button>
                                                            ) : (
                                                                <div className="px-5 py-2.5 bg-gray-100 dark:bg-slate-900 text-gray-400 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                                                                    <ShieldCheck size={12} /> {lang === 'ar' ? 'مدفوع' : 'Paid'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-20 text-center bg-gray-50/50 dark:bg-slate-900/50 border-2 border-dashed rounded-[2.5rem] border-gray-200 dark:border-slate-800 text-gray-300">
                                                <p className="text-[10px] font-black uppercase tracking-widest">No financial records found</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Installment Plans */}
                                    <div className="mt-8 pt-8 border-t dark:border-slate-700">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <History size={16} className="text-orange-500" /> {lang === 'ar' ? 'خطط التقسيط' : 'Installment Plans'}
                                        </h4>

                                        {/* Existing Plans */}
                                        <div className="space-y-4 mb-8">
                                            {member.installmentPlans?.map(plan => (
                                                <div key={plan.id} className="p-5 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-orange-100 dark:border-orange-900/20 shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h5 className="text-[12px] font-black dark:text-white uppercase tracking-tight">{plan.description}</h5>
                                                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{plan.startDate}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${plan.status === 'ACTIVE' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                            {plan.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                                        <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl">
                                                            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mb-1">{lang === 'ar' ? 'المبلغ الكلي' : 'Total'}</p>
                                                            <p className="text-sm font-black text-gray-800 dark:text-white">{plan.totalAmount} EGP</p>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl">
                                                            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mb-1">{lang === 'ar' ? 'المقدم' : 'Paid'}</p>
                                                            <p className="text-sm font-black text-green-600">{plan.downPayment} EGP</p>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl">
                                                            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mb-1">{lang === 'ar' ? 'المتبقي' : 'Remain'}</p>
                                                            <p className="text-sm font-black text-red-600">{plan.remainingAmount} EGP</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {plan.installments.map((inst, idx) => (
                                                            <div key={inst.id} className="flex justify-between items-center py-2 px-4 bg-white/50 dark:bg-slate-700/50 rounded-xl border dark:border-slate-700 border-dashed transition-all hover:bg-orange-50/20">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-black text-gray-400">#{idx + 1}</span>
                                                                    <span className="text-[10px] font-bold dark:text-gray-200">{inst.dueDate}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[10px] font-black dark:text-white">{inst.amount} EGP</span>
                                                                    {inst.status === 'UNPAID' ? (
                                                                        <button
                                                                            onClick={() => handlePayInstallment(plan.id, inst.id, inst.amount)}
                                                                            disabled={isActionLoading}
                                                                            className="px-3 py-1 bg-orange-600 text-white rounded-lg text-[8px] font-black uppercase shadow-md active:scale-95 transition-all hover:bg-orange-700 disabled:opacity-50"
                                                                        >
                                                                            {lang === 'ar' ? 'تأكيد الدفع' : 'Pay Now'}
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-[8px] font-black uppercase text-green-500 flex items-center gap-1">
                                                                            <ShieldCheck size={10} /> {lang === 'ar' ? 'مدفوع' : 'Paid'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {activeTab === 'ACTIONS' && (
                                <div className="space-y-6">
                                    {/* Freeze Membership Card */}
                                    <div className={`p-5 rounded-[2rem] border transition-all ${member.isFrozen ? 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${member.isFrozen ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-slate-900 text-gray-500'}`}>
                                                    <Snowflake size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-sm uppercase tracking-tight dark:text-white">{t.freeze_membership}</h3>
                                                    {member.isFrozen ? (
                                                        <p className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase mt-0.5">{t.freeze_date}: {member.frozenUntil}</p>
                                                    ) : (
                                                        <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5 tracking-widest">Pause Subscription Temporarily</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {member.isFrozen ? (
                                            <button
                                                onClick={handleUnfreeze}
                                                disabled={isActionLoading}
                                                className="w-full py-3 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />} {t.action_unfreeze} Now
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.freeze_duration}</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {[7, 14, 21, 30].map(d => (
                                                            <button
                                                                key={d}
                                                                onClick={() => setFreezeDuration(d)}
                                                                className={`py-2 rounded-xl text-[9px] font-black border transition-all ${freezeDuration === d ? 'bg-cyan-600 text-white border-cyan-600 shadow-md' : 'bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-slate-700'}`}
                                                            >
                                                                {d} Days
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-950 p-3 rounded-xl flex gap-2 items-start">
                                                    <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                                    <p className="text-[8px] text-gray-500 leading-relaxed">
                                                        Freezing will extend the expiry date by <b>{freezeDuration} days</b> automatically. Access will be revoked during this period.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleFreeze}
                                                    disabled={isActionLoading}
                                                    className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                                                >
                                                    {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Snowflake size={14} />} Confirm Freeze
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Manual Expiry Update */}
                                    <div className="p-5 bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-200 dark:border-slate-700">
                                        <h3 className="font-black text-sm uppercase tracking-tight dark:text-white mb-4 flex items-center gap-2">
                                            <Calendar size={16} className="text-blue-500" /> {t.renew_membership}
                                        </h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                defaultValue={member.expiryDate} // Use defaultValue or handle local state if fully controlled needed, but ref or event value is easier for simple update
                                                id="renewal-date-input"
                                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none dark:text-white"
                                            />
                                            <button
                                                onClick={() => {
                                                    const input = document.getElementById('renewal-date-input') as HTMLInputElement;
                                                    if (input && input.value) {
                                                        onUpdateMember({ ...member, expiryDate: input.value });
                                                        showToast(lang === 'ar' ? `تم تجديد اشتراك ${member.name} بنجاح! ✅` : `Subscription for ${member.name} renewed successfully! ✅`, 'success');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[9px] font-black uppercase whitespace-nowrap hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                            >
                                                {lang === 'ar' ? 'تجديد' : 'Renwal'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showFullPhoto && member.photoUrl && createPortal(
                <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={closePhoto}>
                    <button onClick={closePhoto} className="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors">
                        <X size={32} />
                    </button>
                    <img src={member.photoUrl} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()} />
                </div>,
                document.body
            )}
        </>,
        document.body
    );
};
