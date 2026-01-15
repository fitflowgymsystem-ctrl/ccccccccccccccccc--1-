
import React from 'react';
import { Activity, Wifi } from 'lucide-react';

interface PerformancePanelProps {
    load: number;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({ load }) => {
    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl border border-slate-800 flex flex-col justify-between overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={100} /></div>
            <div className="space-y-6 relative z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">System Performance</h3>
                <div className="space-y-4">
                    <PerformanceMetric label="CPU Usage" value={load} color="blue" />
                    <PerformanceMetric label="Memory Usage" value={42} color="indigo" />
                    <PerformanceMetric label="API Success Rate" value={99.8} color="emerald" />
                    <PerformanceMetric label="Sync Efficiency" value={88} color="amber" />
                </div>
            </div>
            <div className="pt-8 border-t border-slate-800 mt-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                    <Wifi size={14} className="text-green-500" /> SYSTEM NODE: DXB-CLOUD-01
                </div>
                <span className="text-[10px] font-black uppercase text-blue-500">Live Feedback</span>
            </div>
        </div>
    );
};

const PerformanceMetric = ({ label, value, color }: { label: string, value: number, color: string }) => {
    const barColors: any = { blue: "bg-blue-500", indigo: "bg-indigo-500", emerald: "bg-emerald-500", amber: "bg-amber-500" };
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">{label}</span>
                <span className="text-white">{value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${barColors[color] || 'bg-blue-500'}`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
};
