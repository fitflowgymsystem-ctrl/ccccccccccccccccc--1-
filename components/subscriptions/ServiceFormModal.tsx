import React, { useState } from 'react';
import { X, Save, Sparkles, LayoutPanelTop, Wind, Users, DollarSign, Clock, MapPin, User as UserIcon, Calendar } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { GymService, Branch, ServiceCategory, ServicePricingType, ServiceStatus } from '../../types';

interface ServiceFormModalProps {
    lang: Language;
    branches: Branch[];
    editingService?: GymService;
    onClose: () => void;
    onSave: (service: any) => void;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ lang, branches, editingService, onClose, onSave }) => {
    const t = translations[lang];

    // Helper to parse existing schedule string: "Mon, Wed @ 10:00 AM"
    const parseInitialSchedule = () => {
        if (!editingService?.schedule) return { days: [] as string[], time: '' };
        const [daysPart, timePart] = editingService.schedule.split(' @ ');
        return {
            days: daysPart ? daysPart.split(', ') : [],
            time: timePart || ''
        };
    };

    const initialSchedule = parseInitialSchedule();
    const [selectedDays, setSelectedDays] = useState<string[]>(initialSchedule.days);
    const [selectedTime, setSelectedTime] = useState(initialSchedule.time);

    const [formData, setFormData] = useState({
        name: editingService?.name || '',
        category: editingService?.category || 'Spa' as ServiceCategory,
        description: editingService?.description || '',
        status: editingService?.status || 'AVAILABLE' as ServiceStatus,
        pricingType: editingService?.pricingType || 'PER_SESSION' as ServicePricingType,
        price: editingService?.price || '' as unknown as number,
        validityDays: editingService?.validityDays || '' as unknown as number, // Removed default 30 for placeholder
        packageSessions: editingService?.packageSessions || '' as unknown as number, // Removed default 10
        branchId: editingService?.branchId || (branches.length > 0 ? branches[0].id : ''),
        trainerName: editingService?.trainerName || '',
        capacity: editingService?.capacity || '' as unknown as number,
        room: editingService?.room || '',
        schedule: editingService?.schedule || ''
    });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysAr: Record<string, string> = {
        'Sun': 'الأحد', 'Mon': 'الاثنين', 'Tue': 'الثلاثاء', 'Wed': 'الأربعاء', 'Thu': 'الخميس', 'Fri': 'الجمعة', 'Sat': 'السبت'
    };

    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const scheduleString = selectedDays.length > 0
            ? `${selectedDays.join(', ')}${selectedTime ? ` @ ${selectedTime}` : ''}`
            : selectedTime;

        onSave({
            ...editingService,
            ...formData,
            price: Number(formData.price) || 0,
            capacity: Number(formData.capacity) || 0,
            packageSessions: formData.pricingType === 'SUBSCRIPTION' ? 0 : Number(formData.packageSessions) || 0,
            schedule: scheduleString,
            id: editingService?.id || Date.now()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-2 sm:p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border dark:border-slate-700 flex flex-col max-h-[85vh] cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-3 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-600/20">
                            {formData.category === 'Spa' ? <Wind size={16} /> : <Users size={16} />}
                        </div>
                        <div>
                            <h3 className="font-black text-lg dark:text-white uppercase tracking-widest">{editingService ? t.edit : t.add_service}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter leading-none mt-0.5">{formData.category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 code-scroll">
                    {/* Basic Info - Condensed Grid */}
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-6 space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.service_name}</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-base font-bold outline-none focus:border-blue-500/50 transition-all dark:text-white" />
                        </div>
                        <div className="col-span-6 md:col-span-3 space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.service_category}</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as ServiceCategory })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-[11px] font-bold outline-none focus:border-blue-500/50 transition-all dark:text-white">
                                <option value="Spa">{t.spa_wellness}</option>
                                <option value="Group Class">{t.group_classes}</option>
                            </select>
                        </div>
                        <div className="col-span-6 md:col-span-3 space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.branch}</label>
                            <select value={formData.branchId} onChange={e => setFormData({ ...formData, branchId: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-[11px] font-bold outline-none focus:border-blue-500/50 transition-all dark:text-white uppercase">
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-8 space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.service_description}</label>
                            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-[11px] font-bold outline-none focus:border-blue-500/50 transition-all dark:text-white" />
                        </div>
                        <div className="col-span-12 md:col-span-4 space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">{t.service_status}</label>
                            <div className="flex bg-gray-50 dark:bg-slate-950 p-0.5 rounded-lg border dark:border-slate-700">
                                <button type="button" onClick={() => setFormData({ ...formData, status: 'AVAILABLE' })} className={`flex-1 py-1.5 rounded-md text-sm font-black uppercase transition-all ${formData.status === 'AVAILABLE' ? 'bg-white dark:bg-slate-800 text-green-600 shadow-sm' : 'text-gray-400'}`}>{t.available}</button>
                                <button type="button" onClick={() => setFormData({ ...formData, status: 'UNAVAILABLE' })} className={`flex-1 py-1.5 rounded-md text-sm font-black uppercase transition-all ${formData.status === 'UNAVAILABLE' ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm' : 'text-gray-400'}`}>{t.unavailable}</button>
                            </div>
                        </div>
                    </div>

                    {/* Pricing - Compact Box */}
                    <div className="p-3.5 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <DollarSign size={14} /> {t.pricing_type}
                            </label>
                            <div className="flex gap-1">
                                {(['PER_SESSION', 'PACKAGE', 'SUBSCRIPTION'] as ServicePricingType[]).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                pricingType: type,
                                                // Clear package sessions if switching to Subscription or Per Session (unless we want to keep it as an option for Per Session? But per session usually is just 1)
                                                // Actually, for Per Session, packageSessions is mostly irrelevant or implicitly 1.
                                                // For Subscription, it should be effectively unlimited (0).
                                                // For Package, it's user input.
                                                packageSessions: type === 'PACKAGE' ? (prev.packageSessions || '' as unknown as number) : '' as unknown as number
                                            }));
                                        }}
                                        className={`px-3 py-1 rounded-md text-sm font-black uppercase border transition-all ${formData.pricingType === type ? 'bg-blue-600 text-white border-blue-700' : 'bg-white dark:bg-slate-800 text-gray-400 border-gray-100 dark:border-slate-700'}`}
                                    >
                                        {type === 'PER_SESSION' ? t.per_session : type === 'PACKAGE' ? t.package : t.subscription}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.price}</label>
                                <div className="relative">
                                    <input type="number"
                                        value={formData.price}
                                        placeholder="0"
                                        onChange={e => setFormData({ ...formData, price: e.target.value === '' ? '' as any : Number(e.target.value) })}
                                        className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold outline-none focus:border-blue-500/30 dark:text-white"
                                        dir="ltr"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-black text-gray-300 pointer-events-none">EGP</span>
                                </div>
                            </div>
                            {formData.pricingType !== 'PER_SESSION' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.validity_days}</label>
                                    <input type="number"
                                        value={formData.validityDays}
                                        placeholder="0"
                                        onChange={e => setFormData({ ...formData, validityDays: e.target.value === '' ? '' as any : Number(e.target.value) })}
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold outline-none focus:border-blue-500/30 dark:text-white"
                                    />
                                </div>
                            )}
                            {formData.pricingType === 'PACKAGE' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ps-1">{t.package_sessions}</label>
                                    <input type="number" value={formData.packageSessions} onChange={e => setFormData({ ...formData, packageSessions: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-[11px] font-bold outline-none focus:border-blue-500/30 dark:text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Class Specifics - Compact Box */}
                    {formData.category === 'Group Class' && (
                        <div className="p-3.5 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-slate-700 space-y-3">
                            <label className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <Users size={14} /> {t.group_classes} INFO
                            </label>
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-12 md:col-span-6 space-y-1">
                                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ps-1 leading-none flex items-center gap-1 mb-0.5"><UserIcon size={10} /> {t.trainer_name}</label>
                                    <input value={formData.trainerName} onChange={e => setFormData({ ...formData, trainerName: e.target.value })} className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-[11px] font-bold outline-none dark:text-white" />
                                </div>
                                <div className="col-span-6 md:col-span-3 space-y-1">
                                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ps-1 leading-none flex items-center gap-1 mb-0.5"><Users size={10} /> {t.capacity}</label>
                                    <input type="number"
                                        value={formData.capacity}
                                        placeholder="0"
                                        onChange={e => setFormData({ ...formData, capacity: e.target.value === '' ? '' as any : Number(e.target.value) })}
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-[11px] font-bold outline-none dark:text-white"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-3 space-y-1">
                                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ps-1 leading-none flex items-center gap-1 mb-0.5"><MapPin size={10} /> {t.room_studio}</label>
                                    <input value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold outline-none dark:text-white" />
                                </div>

                                {/* Structured Schedule Input */}
                                <div className="col-span-12 space-y-2 pt-2">
                                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ps-1 leading-none flex items-center gap-1 mb-1">
                                        <Clock size={10} /> {t.schedule}
                                    </label>

                                    <div className="flex flex-wrap gap-1.5">
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${selectedDays.includes(day)
                                                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20'
                                                    : 'bg-white dark:bg-slate-950 text-gray-400 border-gray-100 dark:border-slate-800'
                                                    }`}
                                            >
                                                {lang === 'ar' ? daysAr[day] : day}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[6px] font-black text-gray-300 uppercase ps-1">Select Time</label>
                                            <input
                                                type="time"
                                                value={selectedTime}
                                                onChange={e => setSelectedTime(e.target.value)}
                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-base font-bold dark:text-white outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                        <div className="flex-[2] pt-3">
                                            <div className="px-3 py-2 bg-indigo-50/50 dark:bg-slate-950 rounded-lg border border-dashed border-indigo-200 dark:border-slate-800">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-tighter">Preview:</p>
                                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300 truncate">
                                                    {selectedDays.length > 0 ? selectedDays.join(', ') : 'No days'} {selectedTime && `@ ${selectedTime}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                <div className="p-3 bg-gray-50/50 dark:bg-slate-900/50 border-t dark:border-slate-700 flex gap-2">
                    <button onClick={onClose} type="button" className="flex-1 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-black uppercase text-gray-500 tracking-widest active:scale-95 transition-all">Cancel</button>
                    <button onClick={handleSubmit} type="button" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Save size={14} /> Save Service
                    </button>
                </div>
            </div>
        </div>
    );
};
