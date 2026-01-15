
import React from 'react';
import { Droplets, Plus } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface WaterTrackerProps {
    amount: number;
    goal: number;
    lang: Language;
    onAdd: (ml: number) => void;
    onReset: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ amount, goal, lang, onAdd, onReset }) => {
    const t = translations[lang];
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(100, (amount / goal) * 100);
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
                        <Droplets size={18} />
                    </div>
                    <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-wider text-xs sm:text-sm">{t.water_tracker}</h3>
                </div>
                <span className="text-[9px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full uppercase">3L</span>
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 block" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-slate-700" />
                        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className="text-blue-500 transition-all duration-1000" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{Math.round(progress)}%</span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{amount}ML</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button onClick={() => onAdd(250)} className="flex items-center justify-center gap-1.5 py-3.5 bg-gray-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-[10px] hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200 active:scale-95">
                    <Plus size={14} /> 250ml
                </button>
                <button onClick={() => onAdd(500)} className="flex items-center justify-center gap-1.5 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95">
                    <Droplets size={14} /> 500ml
                </button>
            </div>
            <div className="mt-4 text-center">
                <button onClick={onReset} className="text-[8px] text-gray-400 font-bold uppercase hover:text-red-500 transition-colors">Reset Daily Progress</button>
            </div>
        </div>
    );
};
