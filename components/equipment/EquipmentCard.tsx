
import React from 'react';
import { Activity, Wrench, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { Equipment } from '../../types';
import { Language, translations } from '../../utils/translations';

interface EquipmentCardProps {
    item: Equipment;
    lang: Language;
    onUpdateStatus: (id: number, status: 'Operational' | 'Under Maintenance' | 'Broken') => void;
    onDelete: (id: number) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, lang, onUpdateStatus, onDelete }) => {
    const t = translations[lang];
    const isIssue = item.status !== 'Operational';

    const getDaysUntil = (dateStr: string) => {
        const diffTime = new Date(dateStr).getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysUntil(item.nextMaintenance);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col hover:shadow-md transition-all group overflow-hidden">
            <div className="p-3 sm:p-6 flex-1">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                    <div className={`p-1.5 sm:p-3 rounded-xl ${!isIssue ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {item.status === 'Operational' ? <Activity size={window.innerWidth < 640 ? 14 : 24} /> : <Wrench size={window.innerWidth < 640 ? 14 : 24} />}
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase flex items-center gap-1 ${!isIssue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {!isIssue ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                        <span className="hidden xs:inline">{!isIssue ? t.operational : t.broken}</span>
                    </span>
                </div>
                <h3 className="text-xs sm:text-xl font-bold text-gray-800 dark:text-white truncate">{item.name}</h3>
                <div className="mt-2 sm:mt-4 py-2 sm:py-4 border-t border-gray-50 dark:border-slate-700 grid grid-cols-1 gap-1 sm:gap-4">
                    <div>
                        <p className="text-[8px] sm:text-xs text-gray-400 uppercase font-black">{t.next_service}</p>
                        <p className={`font-bold text-[9px] sm:text-sm ${daysLeft < 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{item.nextMaintenance}</p>
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border-t flex gap-2">
                 <button onClick={() => onUpdateStatus(item.id, 'Operational')} className="flex-1 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-[9px] font-black uppercase text-gray-600 hover:text-blue-600 transition-colors shadow-sm">{t.log_service}</button>
                 <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
            </div>
        </div>
    );
};
