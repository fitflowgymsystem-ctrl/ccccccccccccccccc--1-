import React from 'react';
import { ShieldCheck, Cpu, Megaphone, UserPlus, Zap } from 'lucide-react';

interface SuperAdminHeaderProps {
    onOpenBroadcast: () => void;
    onOpenOnboard: () => void;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onOpenBroadcast, onOpenOnboard }) => {
    return (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 mb-6 flex justify-between items-center overflow-hidden relative">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><Zap size={100} className="text-blue-500" /></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><ShieldCheck size={24} className="text-white"/></div>
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Fleet Command</h2>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Global SaaS Infrastructure Panel</p>
                </div>
            </div>
            <div className="flex gap-2 relative z-10">
                <button onClick={onOpenBroadcast} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all flex items-center gap-2">
                    <Megaphone size={14}/> Broadcast
                </button>
            </div>
        </div>
    );
};