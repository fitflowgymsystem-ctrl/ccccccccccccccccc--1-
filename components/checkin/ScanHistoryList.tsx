import React from 'react';
import { History } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { AccessStatus } from '../../types';

interface ScanHistoryListProps {
    history: any[];
    onClear: () => void;
    lang: Language;
}

export const ScanHistoryList: React.FC<ScanHistoryListProps> = ({ history, onClear, lang }) => {
    const t = translations[lang];
    return (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-lg border dark:border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                <h3 className="text-[10px] font-black dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <History size={14} className="text-purple-500" /> {t.recent_scans}
                </h3>
                {history.length > 0 && (
                    <button onClick={onClear} className="text-[9px] text-red-500 font-black uppercase hover:underline">{t.clear_history}</button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 code-scroll">
                {history.length > 0 ? history.map(scan => (
                    <div key={scan.id} className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-sm ${scan.status === AccessStatus.GRANTED ? (scan.isTrainer ? 'bg-blue-600' : 'bg-green-500') : 'bg-red-500'}`}>
                            {scan.user ? scan.user.name.charAt(0) : '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-black dark:text-white text-[11px] truncate uppercase tracking-tighter">{scan.user ? scan.user.name : t.checkin_unknown}</p>
                            <span className="text-[8px] text-gray-400 font-mono font-bold">{new Date(scan.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="text-right shrink-0">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${scan.status === AccessStatus.GRANTED ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                {scan.status === AccessStatus.GRANTED ? 'OK' : 'DENIED'}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10 h-full">
                        <History size={32} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2">No scans yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};