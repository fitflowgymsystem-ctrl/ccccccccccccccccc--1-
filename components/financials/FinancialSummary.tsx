
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ShoppingBag, Crown } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface FinancialSummaryProps {
  income: number;
  expenses: number;
  net: number;
  storeProfit: number;
  totalPrivateRevenue: number;
  lang: Language;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ income, expenses, net, storeProfit, totalPrivateRevenue, lang }) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      <FinCard title={t.income} value={income} icon={TrendingUp} color="green" />
      <FinCard title={t.expense} value={expenses} icon={TrendingDown} color="red" />
      <FinCard title={t.net_profit} value={net} icon={Wallet} color="blue" isGradient />
      <FinCard title={t.store_profit} value={storeProfit} icon={ShoppingBag} color="purple" />
      <FinCard title={t.private_revenue} value={totalPrivateRevenue} icon={Crown} color="amber" />
    </div>
  );
};

const FinCard = ({ title, value, icon: Icon, color, isGradient }: any) => {
  const colorStyles: any = {
    green: "text-green-600 bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20",
    red: "text-red-600 bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20",
    blue: "text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20",
    purple: "text-purple-600 bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20",
    amber: "text-amber-600 bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20"
  };
  const s = colorStyles[color] || colorStyles.blue;
  
  return (
    <div className={`
      relative p-2.5 sm:p-4 rounded-xl border transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg
      ${isGradient 
        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-transparent' 
        : `bg-white dark:bg-slate-800 ${s.split(' ').slice(2).join(' ')} shadow-sm`}
    `}>
      <div className={`
        p-1.5 sm:p-2 rounded-lg mb-1.5 sm:mb-2 inline-block
        ${isGradient ? 'bg-white/20' : s.split(' ').slice(0, 2).join(' ')}
      `}>
        <Icon size={14} />
      </div>
      <p className={`text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isGradient ? 'text-blue-100/80' : 'text-gray-400 dark:text-slate-500'}`}>
        {title}
      </p>
      <h3 className={`text-xs sm:text-lg font-black tracking-tight truncate ${!isGradient ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
        ${value.toLocaleString()}
      </h3>
    </div>
  );
};
