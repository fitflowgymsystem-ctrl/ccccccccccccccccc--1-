import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, Dumbbell, ChevronRight, BarChart3, Database } from 'lucide-react';
import { getMonthlyStats, getYearlyStats } from '../services/statsService';
import { MonthlyStats } from '../types/finance.types';
import { getCurrentGymId } from '../services/storage';
import { Language, translations } from '../utils/translations';

interface ArchiveDashboardProps {
    lang: Language;
}

export const ArchiveDashboard: React.FC<ArchiveDashboardProps> = ({ lang }) => {
    const t = translations[lang];
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
    const [stats, setStats] = useState<MonthlyStats | null>(null);
    const [loading, setLoading] = useState(false);

    const gymId = getCurrentGymId();

    const fetchStats = async () => {
        if (!gymId) return;
        setLoading(true);
        let data: MonthlyStats | null = null;

        if (selectedMonth === 'ALL') {
            data = await getYearlyStats(gymId, selectedYear);
        } else {
            data = await getMonthlyStats(gymId, selectedMonth, selectedYear);
        }

        setStats(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, [selectedMonth, selectedYear, gymId]);

    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const years = [2024, 2025, 2026, 2027]; // You can generate this dynamically if needed

    // Compute top class
    const topClass = stats?.classSales
        ? Object.entries(stats.classSales).sort(([, a], [, b]) => b - a)[0]
        : null;

    return (
        <div className="p-6 space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Database className="text-blue-600" size={32} />
                        {lang === 'ar' ? 'الأرشيف الشهري' : 'Monthly Archive'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1 uppercase tracking-wide">
                        {lang === 'ar' ? 'سجل الأداء المالي والتشغيلي' : 'Historical Performance & Financial Records'}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border dark:border-slate-700 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'الفترة' : 'Period'}:</span>
                </div>

                <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold outline-none dark:text-white"
                >
                    <option value="ALL" className="font-black text-blue-600">{lang === 'ar' ? 'السنة بالكامل' : 'Whole Year'}</option>
                    {months.map(m => (
                        <option key={m} value={m}>{new Date(2000, parseInt(m) - 1, 1).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' })}</option>
                    ))}
                </select>

                <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold outline-none dark:text-white"
                >
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <button onClick={fetchStats} className="bg-blue-600 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-all">
                    <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Archives...</p>
                </div>
            ) : !stats ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                    <Database size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Data Archived For This Month</p>
                    <p className="text-[10px] text-gray-400 mt-2">Transactions create archives automatically.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border border-green-100 dark:border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4 shadow-sm">
                                <TrendingUp size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                                {stats.totalRevenue?.toLocaleString()} <span className="text-xs font-bold text-gray-400">EGP</span>
                            </h3>
                        </div>
                    </div>

                    {/* Expenses Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border border-red-100 dark:border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-4 shadow-sm">
                                <TrendingDown size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                                {stats.totalExpenses?.toLocaleString()} <span className="text-xs font-bold text-gray-400">EGP</span>
                            </h3>
                        </div>
                    </div>

                    {/* New Members Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border border-blue-100 dark:border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
                                <Users size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'الأعضاء الجدد' : 'New Members'}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                                {stats.newMembers || 0}
                            </h3>
                        </div>
                    </div>

                    {/* Top Class Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border border-purple-100 dark:border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 shadow-sm">
                                <Dumbbell size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'الحصة الأكثر طلباً' : 'Top Selling Class'}</p>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2 tracking-tight line-clamp-2">
                                {topClass ? topClass[0] : 'N/A'}
                            </h3>
                            {topClass && <p className="text-[10px] font-bold text-purple-500 mt-1">{topClass[1]} Sales</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
