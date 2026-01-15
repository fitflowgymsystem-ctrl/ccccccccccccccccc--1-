
import React from 'react';
import { LogIn, Power, HardDrive, Activity, Calendar, Trash2, Edit3 } from 'lucide-react';
import { GymProfile } from '../../types';

interface InstanceCardProps {
    gym: GymProfile;
    onImpersonate: (gym: GymProfile) => void;
    onToggleStatus: (gym: GymProfile) => void;
    onEdit: (gym: GymProfile) => void;
    onDelete: (id: string) => void;
}

export const InstanceCard: React.FC<InstanceCardProps> = ({ gym, onImpersonate, onToggleStatus, onEdit, onDelete }) => {

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(gym.id);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-white/5 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border dark:border-white/10 shadow-sm shrink-0">
                            {gym.logoUrl ? <img src={gym.logoUrl} className="w-full h-full object-cover" /> : <div className="text-lg font-black text-gray-300 italic">{gym.name.charAt(0)}</div>}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-black text-xs uppercase dark:text-white tracking-tight truncate">{gym.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${gym.isActive ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-red-500'}`}></div>
                                <span className="text-[8px] text-indigo-500 font-black uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/10 px-1.5 rounded">{gym.subscriptionPlan}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(gym); }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Edit3 size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-50/50 dark:bg-slate-950 rounded-xl border dark:border-white/5">
                        <p className="text-[7px] font-black text-gray-400 uppercase mb-0.5 flex items-center gap-1"><HardDrive size={8} /> Expiry</p>
                        <span className="text-[9px] font-black dark:text-gray-300">{new Date(gym.subscriptionExpiry).toLocaleDateString()}</span>
                    </div>
                    <div className="p-2 bg-gray-50/50 dark:bg-slate-950 rounded-xl border dark:border-white/5">
                        <p className="text-[7px] font-black text-gray-400 uppercase mb-0.5 flex items-center gap-1"><Activity size={8} /> Node ID</p>
                        <span className="text-[9px] font-mono font-bold text-blue-500 uppercase">{gym.id}</span>
                    </div>
                </div>

                <div className="pt-2 border-t dark:border-white/5 flex gap-1.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); onImpersonate(gym); }}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 hover:bg-blue-700"
                    >
                        <LogIn size={12} /> Access
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleStatus(gym); }}
                        title={gym.isActive ? "Deactivate Instance" : "Activate Instance"}
                        className={`p-2 rounded-xl border transition-all active:scale-90 ${gym.isActive ? 'border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                    >
                        <Power size={12} />
                    </button>
                </div>
            </div>
            <div className="px-4 py-2 bg-gray-50/50 dark:bg-slate-950 flex items-center justify-between border-t dark:border-white/5">
                <div className="flex items-center gap-1">
                    <Calendar size={10} className="text-gray-400" />
                    <span className="text-[7px] font-black text-gray-400 uppercase">{new Date(gym.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                    onClick={handleDelete}
                    className="text-[7px] font-black text-red-400 hover:text-red-600 hover:underline uppercase tracking-widest flex items-center gap-1 transition-all active:scale-90"
                >
                    <Trash2 size={10} /> Terminate
                </button>
            </div>
        </div>
    );
};