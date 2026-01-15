import React, { useState } from 'react';
import { Wind, Users, Edit2, Trash2, Clock, MapPin, User as UserIcon, CheckCircle2, XCircle, Grid, Sparkles } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { GymService, ServiceCategory } from '../../types';

interface ServiceListProps {
    services: GymService[];
    lang: Language;
    onEdit: (service: GymService) => void;
    onDelete: (id: number) => void;
    onPurchase?: (service: GymService) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ services, lang, onEdit, onDelete, onPurchase }) => {
    const t = translations[lang];
    const [activeTab, setActiveTab] = useState<'ALL' | ServiceCategory>('ALL');

    const filteredServices = activeTab === 'ALL'
        ? services
        : services.filter(s => s.category === activeTab);

    return (
        <div className="space-y-4">
            {/* Category Tabs */}
            <div className="flex bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-2xl border dark:border-slate-700 w-fit">
                {(['ALL', 'Spa', 'Group Class'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm dark:text-white'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab === 'ALL' ? t.all_types : tab === 'Spa' ? t.spa_wellness : t.group_classes}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <div key={service.id} className="group bg-white dark:bg-slate-800 rounded-[2rem] border dark:border-slate-700 p-5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>

                            <div className="relative space-y-4 text-start">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-2xl ${service.category === 'Spa' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                        {service.category === 'Spa' ? <Wind size={20} /> : <Users size={20} />}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => onEdit(service)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Edit2 size={14} /></button>
                                        <button onClick={() => onDelete(service.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-black text-sm dark:text-white tracking-tight uppercase leading-none">{service.name}</h4>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{service.description || 'No description provided.'}</p>
                                </div>

                                <div className="flex items-center gap-3 py-2 border-y border-gray-50 dark:border-slate-700/50">
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.price}</p>
                                        <p className="text-sm font-black text-blue-600 dark:text-blue-400">{service.price} <span className="text-[10px]">EGP</span></p>
                                    </div>
                                    <div className="flex-1 text-end">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.pricing_type}</p>
                                        <p className="text-[9px] font-black dark:text-gray-300 uppercase">{service.pricingType === 'PER_SESSION' ? t.per_session : service.pricingType === 'PACKAGE' ? t.package : t.subscription}</p>
                                    </div>
                                </div>

                                {service.category === 'Group Class' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 dark:text-gray-400">
                                            <UserIcon size={12} className="text-blue-500" /> {service.trainerName || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 dark:text-gray-400 justify-end text-end">
                                            <Clock size={12} className="text-blue-500" /> {service.schedule || 'N/A'}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${service.status === 'AVAILABLE' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                        }`}>
                                        {service.status === 'AVAILABLE' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                        {service.status === 'AVAILABLE' ? t.available : t.unavailable}
                                    </div>
                                    {service.validityDays && (
                                        <span className="text-[8px] font-black text-gray-400 uppercase">{service.validityDays} Days Validity</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => onPurchase?.(service)}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} />
                                    {lang === 'ar' ? 'تسجيل بيع' : 'Record Sale'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-slate-800">
                        <Grid size={24} className="text-gray-200 dark:text-slate-800 mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.no_data}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
