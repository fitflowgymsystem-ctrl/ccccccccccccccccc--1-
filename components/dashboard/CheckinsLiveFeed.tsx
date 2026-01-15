
import React from 'react';
import { Activity } from 'lucide-react';
import { AccessLog } from '../../types';
import { Language, translations } from '../../utils/translations';

interface CheckinsLiveFeedProps {
  logs: AccessLog[];
  lang: Language;
  activeTheme?: string;
}

export const CheckinsLiveFeed: React.FC<CheckinsLiveFeedProps> = ({ logs, lang, activeTheme }) => {
  const t = translations[lang];
  const isRamadan = activeTheme === 'ramadan';

  return (
    <div className={`rounded-3xl shadow-sm border overflow-hidden dashboard-card ${isRamadan ? 'bg-slate-900 border-slate-700' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
      <div className={`p-4 sm:p-5 border-b flex justify-between items-center ${isRamadan ? 'border-slate-800' : 'border-gray-100 dark:border-slate-700'}`}>
        <h3 className={`font-bold text-base sm:text-lg flex items-center gap-2 ${isRamadan ? 'text-gray-200' : 'text-gray-800 dark:text-white'}`}>
          <Activity size={20} className={isRamadan ? 'text-blue-400' : 'text-blue-500'} /> {t.todays_checkins}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[400px]">
          <thead className={`${isRamadan ? 'bg-slate-950/50 text-slate-400' : 'bg-gray-50 dark:bg-slate-900 text-gray-500'} text-xs uppercase font-semibold`}>
            <tr><th className="p-4">{t.time}</th><th className="p-4">{t.user}</th><th className="p-4">{t.status}</th></tr>
          </thead>
          <tbody className={`divide-y ${isRamadan ? 'divide-slate-800' : 'divide-gray-100 dark:divide-slate-700'}`}>
            {logs.slice(0, 5).map(log => (
              <tr key={log.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <td className="p-4 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td className="p-4 font-bold text-xs sm:text-sm">{log.userName}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${log.status === 'GRANTED' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {log.status === 'GRANTED' ? 'OK' : 'NO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
