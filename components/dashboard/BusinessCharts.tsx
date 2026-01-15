
import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Zap, TrendingUp } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface BusinessChartsProps {
  peakHoursData: any[];
  revenueData: any[];
  lang: Language;
  activeTheme?: string;
}

export const BusinessCharts: React.FC<BusinessChartsProps> = ({ peakHoursData, revenueData, lang, activeTheme }) => {
  const t = translations[lang];
  const isRamadan = activeTheme === 'ramadan';
  const isChristmas = activeTheme === 'christmas';

  const chartStroke = isRamadan ? '#fbbf24' : isChristmas ? '#ef4444' : '#3b82f6';
  const chartFill = isRamadan ? 'url(#colorRamadan)' : isChristmas ? 'url(#colorChristmas)' : 'url(#colorDefault)';

  // Calculate dynamic threshold for peak hours (top 20% of current data)
  const maxVisitors = Math.max(...peakHoursData.map(d => d.visitors), 0);
  const peakThreshold = maxVisitors * 0.8;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`lg:col-span-2 p-4 sm:p-6 rounded-3xl shadow-sm border dashboard-card ${isRamadan ? 'bg-slate-900 border-slate-700' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-bold text-base sm:text-lg flex items-center gap-2 ${isRamadan ? 'text-gray-100' : 'text-gray-800 dark:text-white'}`}>
            <Zap size={20} className={isRamadan ? 'text-amber-400' : 'text-amber-500'} /> {t.peak_hours}
          </h3>
        </div>
        <div className="h-64 sm:h-72 w-full" dir="ltr" style={{ minHeight: '256px', minWidth: '0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#64748b" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isRamadan ? '#334155' : '#94a3b8'} opacity={0.4} />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                interval={window.innerWidth < 640 ? 5 : 2}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: isRamadan ? '#0f172a' : '#ffffff',
                  borderColor: isRamadan ? '#334155' : '#e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  border: '1px solid',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#4f46e5' }}
              />
              <Bar
                dataKey="visitors"
                radius={[8, 8, 4, 4]}
                barSize={window.innerWidth < 640 ? 12 : 28}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {peakHoursData.map((entry, index) => {
                  const isPeak = maxVisitors > 0 && entry.visitors >= peakThreshold && entry.visitors > 0;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isPeak ? 'url(#peakGradient)' : 'url(#defaultGradient)'}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-4 sm:p-6 rounded-3xl shadow-sm border flex flex-col dashboard-card ${isRamadan ? 'bg-slate-900 border-slate-700' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
        <h3 className={`font-bold text-base sm:text-lg mb-4 flex items-center gap-2 ${isRamadan ? 'text-gray-100' : 'text-gray-800 dark:text-white'}`}>
          <TrendingUp size={20} className={isChristmas ? 'text-green-500' : 'text-emerald-500'} /> {t.revenue_analytics}
        </h3>
        <div className="flex-1 h-64 w-full" dir="ltr" style={{ minHeight: '256px', minWidth: '0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDefault" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isRamadan ? '#334155' : '#94a3b8'} opacity={0.2} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isRamadan ? '#0f172a' : '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: isRamadan ? '#334155' : '#f1f5f9',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                formatter={(value: any) => [`${value.toLocaleString()} EGP`, t.amount]}
                labelStyle={{ fontWeight: 'bold', color: '#6366f1', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#colorDefault)"
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
