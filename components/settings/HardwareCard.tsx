
import React from 'react';
import { Fingerprint, ChevronRight } from 'lucide-react';

interface HardwareCardProps {
    onClick: () => void;
}

export const HardwareCard: React.FC<HardwareCardProps> = ({ onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 text-start hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden h-full flex flex-col justify-between"
        >
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform"><Fingerprint size={80} /></div>
            <div className="space-y-3 relative z-10">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Fingerprint size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Access Hardware</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Biometric Nodes</p>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between relative z-10 pt-3 border-t border-gray-50 dark:border-slate-700/50">
                <span className="text-[9px] font-black uppercase text-blue-600">Configure</span>
                <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
        </button>
    );
};
