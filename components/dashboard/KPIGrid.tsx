
import React from 'react';
import { Users, UserPlus, RefreshCw, Clock, CreditCard, Moon, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface KPIGridProps {
  occupancyCount: number;
  newSignups: number;
  signupsTrend: number;
  renewalsCount: number;
  renewalsTrend: number;
  expiringSoonCount: number;
  dailyRevenue: number;
  revenueTrend: number;
  lang: Language;
  activeTheme?: string;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ 
  occupancyCount, newSignups, signupsTrend, renewalsCount, 
  renewalsTrend, expiringSoonCount, dailyRevenue, revenueTrend, 
  lang, activeTheme 
}) => {
  const t = translations[lang];
  const isRamadan = activeTheme === 'ramadan';
  const isChristmas = activeTheme === 'christmas';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
      <KPICard title={t.kpi_occupancy} value={occupancyCount} icon={isRamadan ? Moon : Users} variant="blue" subValue={lang === 'ar' ? 'الآن' : 'Live'} />
      <KPICard title={t.kpi_new_members} value={newSignups} icon={isChristmas ? Gift : UserPlus} variant="green" subValue={lang === 'ar' ? 'اليوم' : 'Today'} trend={signupsTrend} />
      <KPICard title={t.kpi_renewals} value={renewalsCount} icon={RefreshCw} variant="purple" subValue={lang === 'ar' ? 'عملية' : 'Trans.'} trend={renewalsTrend} />
      <KPICard title={t.kpi_expiring} value={expiringSoonCount} icon={Clock} variant="orange" subValue={lang === 'ar' ? 'قريباً' : 'Soon'} isCritical={expiringSoonCount > 0} />
      <KPICard title={t.kpi_revenue} value={`$${dailyRevenue}`} icon={CreditCard} variant="emerald" subValue={lang === 'ar' ? 'صافي' : 'Net'} trend={revenueTrend} />
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, variant = "blue", subValue, isCritical, trend }: any) => {
  const variantStyles: any = {
    blue: { bg: "bg-white dark:bg-slate-800", border: "border-gray-100 dark:border-slate-700", iconBg: "bg-gradient-to-br from-blue-400 to-blue-600", iconColor: "text-white" },
    green: { bg: "bg-white dark:bg-slate-800", border: "border-emerald-100 dark:border-emerald-900/30", iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600", iconColor: "text-white" },
    purple: { bg: "bg-white dark:bg-slate-800", border: "border-purple-100 dark:border-purple-900/30", iconBg: "bg-gradient-to-br from-purple-400 to-purple-600", iconColor: "text-white" },
    orange: { bg: "bg-white dark:bg-slate-800", border: "border-orange-100 dark:border-orange-900/30", iconBg: "bg-gradient-to-br from-orange-400 to-orange-600", iconColor: "text-white" },
    emerald: { bg: "bg-white dark:bg-slate-800", border: "border-green-100 dark:border-green-900/30", iconBg: "bg-gradient-to-br from-green-400 to-green-600", iconColor: "text-white" }
  };
  const s = variantStyles[variant] || variantStyles.blue;
  return (
    <div className={`relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 group ${s.bg} border ${isCritical ? 'border-red-200 dark:border-red-900/40 shadow-red-500/5' : `${s.border} shadow-sm`} hover:shadow-lg overflow-hidden`}>
      <div className="flex flex-col h-full justify-between relative z-10">
        <div className="flex justify-between items-start mb-1 sm:mb-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${s.iconBg} ${s.iconColor} shadow-md flex items-center justify-center`}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              {trend > 0 ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 text-gray-400 dark:text-slate-500 truncate">{title}</h4>
          <div className="flex items-baseline gap-1 overflow-hidden">
            <span className={`text-sm sm:text-xl font-black tracking-tighter ${isCritical ? 'text-red-600' : 'text-slate-800 dark:text-white'} truncate`}>{value}</span>
            {subValue && <span className="text-[6px] sm:text-[8px] font-bold text-gray-300 dark:text-slate-600 uppercase tracking-wide truncate">{subValue}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
