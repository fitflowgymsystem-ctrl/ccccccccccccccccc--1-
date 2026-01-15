
import React from 'react';
import { Database, RefreshCw, AlertTriangle } from 'lucide-react';

interface SystemBackupSectionProps {
    onBackup: () => void;
    onReset: () => void;
}

export const SystemBackupSection: React.FC<SystemBackupSectionProps> = ({ onBackup, onReset }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-50 dark:border-red-900/10 p-4">
            <h3 className="text-[10px] font-black text-red-500 mb-4 flex items-center gap-2 uppercase tracking-[0.2em] opacity-60">
                <Database size={14} /> System & Maintenance
            </h3>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onBackup} 
                    className="flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-xl uppercase tracking-widest border border-blue-100 dark:border-blue-900/20 hover:bg-blue-100 transition-all active:scale-95"
                >
                    <Database size={14} /> Backup
                </button>
                <button 
                    onClick={onReset} 
                    className="flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-[9px] font-black rounded-xl uppercase tracking-widest border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition-all active:scale-95"
                >
                    <RefreshCw size={14} /> Reset
                </button>
            </div>
            <p className="mt-3 text-[8px] text-gray-400 font-bold uppercase tracking-tighter text-center flex items-center justify-center gap-1">
                <AlertTriangle size={10} className="text-amber-500 shrink-0" /> Full Wipe Caution
            </p>
        </div>
    );
};
