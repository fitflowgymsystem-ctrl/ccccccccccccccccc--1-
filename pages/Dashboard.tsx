
import React from 'react';
import { User, AccessLog, Equipment, FinancialRecord } from '../types';
import { Language, translations } from '../utils/translations';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { BusinessCharts } from '../components/dashboard/BusinessCharts';
import { CheckinsLiveFeed } from '../components/dashboard/CheckinsLiveFeed';
import { Calendar } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

interface DashboardProps {
  users: User[];
  logs: AccessLog[];
  equipment: Equipment[];
  financials: FinancialRecord[];
  lang: Language;
  activeTheme?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ users, logs, equipment, financials, lang, activeTheme }) => {
  const t = translations[lang];
  const { stats, chartsData, greeting } = useDashboard(users, logs, financials, lang);

  return (
    <div className="space-y-4 animate-slide-up pb-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 px-1">
          <div className="space-y-0.5">
             <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase">{greeting}</h2>
             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{t.dash_subtitle}</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border dark:border-slate-700 shadow-sm">
             <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600"><Calendar size={16}/></div>
             <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter leading-none">{new Date().toLocaleDateString(undefined, {weekday:'short'})}</p>
                <p className="text-xs font-bold dark:text-white leading-none mt-1">{new Date().toLocaleDateString(undefined, {day:'numeric', month:'short'})}</p>
             </div>
          </div>
      </header>

      <KPIGrid 
        occupancyCount={stats.occupancyCount}
        newSignups={stats.newSignups}
        signupsTrend={12}
        renewalsCount={stats.renewals}
        renewalsTrend={5}
        expiringSoonCount={stats.expiringSoon}
        dailyRevenue={stats.dailyRevenue}
        revenueTrend={8}
        lang={lang}
        activeTheme={activeTheme}
      />

      <BusinessCharts peakHoursData={chartsData.peakHours} revenueData={chartsData.revenue} lang={lang} activeTheme={activeTheme} />

      <div className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <CheckinsLiveFeed logs={logs} lang={lang} activeTheme={activeTheme} />
          </div>
      </div>
    </div>
  );
};
