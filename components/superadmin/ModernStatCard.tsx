
import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

interface ModernStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: 'blue' | 'emerald' | 'amber' | 'purple';
    trend: string;
}

export const ModernStatCard: React.FC<ModernStatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
    const colors = { 
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", 
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", 
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20", 
        purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" 
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
                <div className={`p-2 rounded-lg ${colors[color]}`}><Icon size={16} /></div>
                <div className={`flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${trend.includes('+') ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'text-slate-400 bg-slate-50 dark:bg-slate-900/10'}`}>
                    {trend} {trend.includes('%') && <ArrowUpRight size={8} />}
                </div>
            </div>
            <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
                <h3 className="text-xl font-black dark:text-white tracking-tighter leading-none">{value}</h3>
            </div>
        </div>
    );
};
