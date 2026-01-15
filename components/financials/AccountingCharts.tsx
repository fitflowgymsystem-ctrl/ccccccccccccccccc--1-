
import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

interface AccountingChartsProps {
  cashFlowData: any[];
  expenseData: any[];
  lang: Language;
}

export const AccountingCharts: React.FC<AccountingChartsProps> = ({ cashFlowData, expenseData, lang }) => {
  const t = translations[lang];
  const [chartType, setChartType] = useState<'stacked' | 'trend' | 'category'>('stacked');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm sm:text-base dark:text-white flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> {t.revenue_analytics}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setChartType('stacked')} className={`px-2 py-1 text-xs font-black rounded ${chartType === 'stacked' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-white'}`}>Stacked</button>
            <button onClick={() => setChartType('trend')} className={`px-2 py-1 text-xs font-black rounded ${chartType === 'trend' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-white'}`}>Trend</button>
            <button onClick={() => setChartType('category')} className={`px-2 py-1 text-xs font-black rounded ${chartType === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-white'}`}>Category</button>
          </div>
        </div>
        <div className="h-56 sm:h-72 w-full" dir="ltr" style={{ minHeight: '288px', minWidth: '0' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'stacked' && (
              <BarChart data={cashFlowData} margin={{ top: 6, right: 20, left: -12, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="income" stackId="a" name={t.income} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" stackId="a" name={t.expense} fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
            {chartType === 'trend' && (
              <AreaChart data={cashFlowData} margin={{ top: 6, right: 20, left: -12, bottom: 6 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0.05} /></linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} /></linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" name={t.income} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#expenseGrad)" name={t.expense} />
              </AreaChart>
            )}
            {chartType === 'category' && (
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={6} dataKey="value">
                  {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border dark:border-slate-700">
        <h3 className="font-bold text-sm sm:text-base dark:text-white mb-4 flex items-center gap-2"><PieChartIcon size={18} className="text-purple-500" /> {t.expense}</h3>
        <div className="h-56 sm:h-72 w-full" dir="ltr" style={{ minHeight: '288px', minWidth: '0' }}>
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expenseData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{expenseData.map((entry, index) => <Cell key={`cell-side-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
