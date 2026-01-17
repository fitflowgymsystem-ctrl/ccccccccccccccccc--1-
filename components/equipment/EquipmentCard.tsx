
import React from 'react';
import { Activity, Wrench, CheckCircle2, AlertTriangle, Trash2, Edit2, ClipboardList } from 'lucide-react';
import { Equipment } from '../../types';
import { Language, translations } from '../../utils/translations';

interface EquipmentCardProps {
    item: Equipment;
    lang: Language;
    onUpdateStatus: (id: number, status: 'Operational' | 'Under Maintenance' | 'Broken') => void;
    onDelete: (id: number) => void;
    onEdit?: (item: Equipment) => void;
    onViewHistory?: (item: Equipment) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, lang, onUpdateStatus, onDelete, onEdit, onViewHistory }) => {
    const t = translations[lang];
    const isIssue = item.status !== 'Operational';

    const getDaysUntil = (dateStr: string) => {
        const diffTime = new Date(dateStr).getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysUntil(item.nextMaintenance);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-lg shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-slate-700 flex flex-col hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all group overflow-hidden relative">
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${item.status === 'Operational' ? 'bg-green-500' : item.status === 'Under Maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`} />

            <div className="p-4 flex gap-4">
                {/* Image Section */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        item.status === 'Operational'
                            ? <Activity className="text-gray-300 dark:text-slate-600" size={32} />
                            : <Wrench className="text-gray-300 dark:text-slate-600" size={32} />
                    )}
                    <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${item.status === 'Operational' ? 'bg-green-500' : item.status === 'Under Maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                </div>

                {/* Details Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-gray-800 dark:text-white truncate leading-tight mb-0.5">{item.name}</h3>
                                {(item.brand || item.model) && (
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                                        {item.brand} {item.model && `• ${item.model}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Key Stats Grid */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-1.5 px-2">
                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">{t.next_service}</p>
                                <p className={`text-[10px] font-bold ${daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-yellow-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {daysLeft < 0 ? (lang === 'ar' ? 'متأخر!' : 'Overdue!') : (lang === 'ar' ? `${daysLeft} يوم` : `${daysLeft} days`)}
                                </p>
                            </div>
                            {item.price && (
                                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-1.5 px-2">
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">{lang === 'ar' ? 'السعر' : 'Price'}</p>
                                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{item.price.toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="px-4 py-2 bg-gray-50/50 dark:bg-slate-900/30 border-t dark:border-slate-700/50 flex gap-2 items-center justify-between">
                <div className="flex gap-2 w-full">
                    {onViewHistory && (
                        <button onClick={() => onViewHistory(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm" title={lang === 'ar' ? 'السجل' : 'Log'}>
                            <ClipboardList size={14} />
                        </button>
                    )}
                    {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm">
                            <Edit2 size={14} />
                        </button>
                    )}
                    <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm">
                        <Trash2 size={14} />
                    </button>
                    <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-1 self-center"></div>
                    <button onClick={() => onUpdateStatus(item.id, 'Operational')} className="flex-1 py-1 px-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-[9px] font-black uppercase text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={12} /> {t.log_service}
                    </button>
                </div>
            </div>
        </div>
    );
};
