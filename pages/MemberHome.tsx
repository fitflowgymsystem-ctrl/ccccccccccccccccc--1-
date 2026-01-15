
import React, { useMemo, useState } from 'react';
import { User, AccessLog, ServiceSubscription, GymService } from '../types';
import { Language, translations } from '../utils/translations';
import { Clock, History, X, Snowflake, AlertCircle, Sparkles } from 'lucide-react';
import { MemberPassCard } from '../components/memberhome/MemberPassCard';
import { MemberStatsSection } from '../components/memberhome/MemberStatsSection';

interface MemberHomeProps {
    member: User;
    logs: AccessLog[];
    services?: GymService[];
    serviceSubscriptions?: ServiceSubscription[];
    lang: Language;
    onPurchaseService?: (userId: number, service: GymService) => Promise<void>;
}

export const MemberHome: React.FC<MemberHomeProps> = ({ member, logs, services = [], serviceSubscriptions = [], lang, onPurchaseService }) => {
    const t = translations[lang];
    const today = new Date();
    const expiryDate = new Date(member.expiryDate);
    const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

    const daysRemaining = useMemo(() => {
        const diffTime = expiryDate.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }, [member.expiryDate]);

    const isExpired = daysRemaining <= 0;
    const visitHistory = useMemo(() => logs.filter(l => l.userId === member.id && l.status === 'GRANTED').slice(0, 3), [logs, member.id]);

    const activeSubscriptions = useMemo(() => {
        return serviceSubscriptions.filter(s => s.userId === member.id && s.status === 'active');
    }, [serviceSubscriptions, member.id]);

    const activeClassSchedules = useMemo(() => {
        return activeSubscriptions
            .map(sub => {
                const service = services.find(s => s.id === sub.serviceId);
                if (service?.category === 'Group Class') {
                    return {
                        name: service.name,
                        schedule: service.schedule,
                        trainer: service.trainerName,
                        remaining: sub.remainingSessions
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [activeSubscriptions, services]);

    const nonClassSubscriptions = useMemo(() => {
        return activeSubscriptions.filter(sub => {
            const service = services.find(s => s.id === sub.serviceId);
            return service?.category !== 'Group Class';
        });
    }, [activeSubscriptions, services]);

    const availableServices = useMemo(() => {
        const subscribedIds = activeSubscriptions.map(s => s.serviceId);
        return services.filter(s => s.status === 'AVAILABLE' && !subscribedIds.includes(s.id));
    }, [services, activeSubscriptions]);

    const [viewingService, setViewingService] = useState<GymService | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchase = async (service: GymService) => {
        if (!onPurchaseService) return;
        setIsPurchasing(true);
        try {
            await onPurchaseService(member.id, service);
            setViewingService(null);
        } catch (error) {
            console.error("Purchase failed:", error);
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in pb-20 px-1 sm:px-0">
            <header className="flex justify-between items-center px-1">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase">{t.checkin_welcome} {member.name.split(' ')[0]}!</h2>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">{t.my_membership}</p>
                </div>
                {member.isFrozen ? (
                    <div className="px-3 py-1 rounded-lg text-[8px] font-black uppercase border bg-cyan-500 text-white border-cyan-600 shadow-md flex items-center gap-1.5 animate-pulse">
                        <Snowflake size={10} fill="currentColor" /> FROZEN
                    </div>
                ) : (
                    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${isExpired ? 'bg-red-500 text-white border-red-600' : 'bg-green-500 text-white border-green-600'}`}>
                        {isExpired ? t.checkin_expired : t.active}
                    </div>
                )}
            </header>

            {member.isFrozen && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3 animate-fade-in mx-1">
                    <div className="p-2 bg-cyan-500 rounded-xl text-white shadow-lg"><Snowflake size={18} /></div>
                    <div>
                        <h3 className="text-xs font-black text-cyan-700 dark:text-cyan-300 uppercase tracking-widest">Membership Frozen</h3>
                        <p className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold">Resumes on: <span className="font-black underline">{member.frozenUntil}</span></p>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${member.isFrozen ? 'opacity-70 pointer-events-none grayscale-[0.5]' : ''}`}>
                <div className="lg:col-span-4">
                    <MemberPassCard member={member} lang={lang} onEnlarge={setEnlargedPhotoUrl} />
                </div>

                <div className="lg:col-span-8 space-y-4">
                    <MemberStatsSection member={member} daysRemaining={daysRemaining} isExpired={isExpired} services={services} lang={lang} translations={t} />

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                            <h3 className="text-[9px] font-black flex items-center gap-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]"><History size={12} className="text-blue-500" /> {t.my_history}</h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-slate-700">
                            {visitHistory.length > 0 ? visitHistory.map(log => (
                                <div key={log.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600"><Clock size={12} /></div>
                                        <div>
                                            <p className="text-[11px] font-black dark:text-white uppercase tracking-tighter">{new Date(log.timestamp).toLocaleDateString()}</p>
                                            <p className="text-[8px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-gray-400 bg-gray-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg uppercase tracking-widest">{log.deviceId}</span>
                                </div>
                            )) : (
                                <div className="py-8 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">{t.never_attended}</div>
                            )}
                        </div>
                    </div>

                    {/* Simple Subscriptions (Spa, etc.) */}
                    {nonClassSubscriptions.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="px-4 py-2.5 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-slate-900/50">
                                <h3 className="text-[9px] font-black flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                                    <Sparkles size={12} className="text-indigo-500" /> {lang === 'ar' ? 'اشتراكاتي' : 'My Subscriptions'}
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {nonClassSubscriptions.map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                                            <Sparkles size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-[11px] font-black dark:text-white uppercase tracking-tighter">{sub.serviceName}</h4>
                                                    {sub.paymentStatus === 'unpaid' && (
                                                        <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-md text-[6px] font-black uppercase animate-pulse">
                                                            {lang === 'ar' ? 'بانتظار الدفع' : 'Payment Pending'}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Expires {sub.expiryDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${(sub.remainingSessions / sub.totalSessions) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[9px] font-black text-blue-600 whitespace-nowrap">{sub.remainingSessions} / {sub.totalSessions}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Class Schedule Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-slate-900/50">
                            <h3 className="text-[9px] font-black flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                                <Clock size={12} className="text-indigo-500" /> {lang === 'ar' ? 'مواعيد فصولي' : 'My Class Schedule'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {activeClassSchedules.length > 0 ? activeClassSchedules.map((cls: any, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-3 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-slate-700 h-full">
                                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                        <Clock size={18} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-black dark:text-white uppercase tracking-tighter">{cls.name}</h4>
                                            <span className="text-[8px] font-black text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                                {cls.remaining} {lang === 'ar' ? 'حصة متبقية' : 'Sessions Left'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1 leading-none">
                                            {cls.schedule || 'Schedule Not Set'}
                                        </p>
                                        {cls.trainer && (
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                                                <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                                Coach {cls.trainer}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-8 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-gray-50 dark:border-slate-800 rounded-xl">
                                    {lang === 'ar' ? 'لا توجد حصص نشطة حالياً' : 'No Active Class Subscriptions'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Available Services Catalog */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-blue-50/30 dark:bg-slate-900/50">
                            <h3 className="text-[9px] font-black flex items-center gap-1.5 text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                                <Sparkles size={12} className="text-blue-500" /> {lang === 'ar' ? 'اكتشف الخدمات والحصص' : 'Explore Services & Classes'}
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availableServices.length > 0 ? availableServices.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => setViewingService(service)}
                                    className="flex flex-col items-start p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl hover:border-blue-200 dark:hover:border-blue-900 transition-all text-start group shadow-sm hover:shadow-md h-full"
                                >
                                    <div className="flex justify-between w-full mb-3">
                                        <div className={`p-2 rounded-2xl ${service.category === 'Spa' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'} dark:bg-slate-800`}>
                                            <Sparkles size={16} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black dark:text-white leading-none">{service.price} EGP</p>
                                            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                                                {service.pricingType === 'PACKAGE' ? `${service.packageSessions} Sessions` : service.pricingType}
                                            </p>
                                        </div>
                                    </div>
                                    <h4 className="text-[11px] font-black dark:text-white uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{service.name}</h4>
                                    <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium line-clamp-2 leading-relaxed mb-3">{service.description}</p>
                                    <div className="mt-auto pt-2 w-full flex items-center justify-between">
                                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${service.category === 'Spa' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'} dark:bg-slate-800`}>
                                            {service.category}
                                        </span>
                                        <div className="p-1 px-3 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest group-hover:scale-105 transition-all">Details</div>
                                    </div>
                                </button>
                            )) : (
                                <div className="col-span-full py-8 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-gray-50 dark:border-slate-800 rounded-xl">
                                    {lang === 'ar' ? 'لا توجد عروض جديدة حالياً' : 'No New Services Available'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Detail & Purchase Modal */}
            {viewingService && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingService(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-700 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="p-1">
                            <div className="h-48 bg-blue-600 rounded-[2.2rem] relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
                                </div>
                                <Sparkles size={60} className="text-white relative z-10" />
                                <button onClick={() => setViewingService(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-md">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter leading-none">{viewingService.name}</h3>
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        {viewingService.category}
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{viewingService.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700">
                                    <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Price</p>
                                    <p className="text-xl font-black dark:text-white">{viewingService.price} <span className="text-[10px] text-gray-400 uppercase">EGP</span></p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700">
                                    <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Validity</p>
                                    <p className="text-xl font-black dark:text-white">{viewingService.validityDays} <span className="text-[10px] text-gray-400 uppercase">Days</span></p>
                                </div>
                            </div>

                            {viewingService.category === 'Group Class' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl dark:bg-slate-800"><Clock size={16} /></div>
                                            <div>
                                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Weekly Schedule</p>
                                                <p className="text-[11px] font-black dark:text-white">{viewingService.schedule || "To be announced"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 px-2">
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Coach</p>
                                            <p className="text-xs font-black dark:text-white uppercase">{viewingService.trainerName || "-"}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Studio/Room</p>
                                            <p className="text-xs font-black dark:text-white uppercase">{viewingService.room || "-"}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Capacity</p>
                                            <p className="text-xs font-black dark:text-white uppercase">{viewingService.capacity || "∞"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                disabled={isPurchasing}
                                onClick={() => handlePurchase(viewingService)}
                                className={`w-full py-4 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isExpired ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'}`}
                            >
                                {isPurchasing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Subscribe Now <Sparkles size={18} /></>
                                )}
                            </button>
                            {isExpired && (
                                <p className="text-center text-[8px] font-black text-red-500 uppercase tracking-widest">Renew subscription to access services</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {enlargedPhotoUrl && (
                <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setEnlargedPhotoUrl(null)}>
                    <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setEnlargedPhotoUrl(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
                            <X size={32} />
                        </button>
                        <img src={enlargedPhotoUrl} alt="Enlarged view" className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10" />
                    </div>
                </div>
            )}
        </div >
    );
};
