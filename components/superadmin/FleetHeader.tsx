
import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface FleetHeaderProps {
  systemLoad: number;
}

export const FleetHeader: React.FC<FleetHeaderProps> = ({ systemLoad }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border dark:border-white/5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/20">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">
            Nexus Fleet
          </h1>
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
            v4.8.2 / Control Plane
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-2 px-4 rounded-xl border dark:border-white/5">
        <div className="text-right">
          <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Health</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black dark:text-white tabular-nums">99.9%</span>
            <div className="w-8 h-0.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${100 - (systemLoad / 10)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800">
          <Activity size={14} className="animate-pulse" />
        </div>
      </div>
    </header>
  );
};
