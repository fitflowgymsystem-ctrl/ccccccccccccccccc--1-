
import React from 'react';
import { LogIn, Edit3, Trash2, Power, Database } from 'lucide-react';
import { GymProfile } from '../../types';

interface FleetTableRowProps {
    gym: GymProfile;
    onImpersonate: (gym: GymProfile) => void;
    onToggleStatus: (gym: GymProfile) => void;
    onEdit: (gym: GymProfile) => void;
    onDelete: (id: string) => void;
}

export const FleetTableRow: React.FC<FleetTableRowProps> = ({ gym, onImpersonate, onToggleStatus, onEdit, onDelete }) => {
    
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(gym.id);
    };

    return (
        <tr className="hover:bg-blue-50/20 dark:hover:bg-white/5 transition-all group border-b border-gray-100 dark:border-white/5 last:border-0">
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-white font-black text-sm uppercase group-hover:scale-110 transition-all duration-500 overflow-hidden border border-white dark:border-white/10 shadow-lg">
                        {gym.logoUrl ? <img src={gym.logoUrl} className="w-full h-full object-cover" /> : gym.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-black text-sm uppercase dark:text-white truncate max-w-[150px] tracking-tight">{gym.name}</p>
                        <p className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase flex items-center gap-1 mt-1">
                            <span className="text-blue-500">UUID:</span> {gym.id.slice(0, 8)}...
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 text-center">
                <div className="flex justify-center gap-2">
                    {Object.entries(gym.enabledModules || {}).map(([key, val]) => val && (
                        <div key={key} className="w-2 h-2 rounded-full bg-blue-500/40 border border-blue-500" title={key}></div>
                    ))}
                </div>
                <p className="text-[7px] font-black text-slate-500 uppercase mt-2 tracking-widest">Active Modules</p>
            </td>
            <td className="px-6 py-5 text-center">
                <div className="flex flex-col items-center gap-1">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${gym.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${gym.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                        {gym.isActive ? 'Healthy' : 'Suspended'}
                    </span>
                    <p className="text-[7px] text-gray-400 font-bold uppercase">{gym.subscriptionPlan} Tier</p>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex justify-end gap-2">
                    <button onClick={() => onImpersonate(gym)} title="Impersonate Admin" className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90 border border-blue-600/20">
                        <LogIn size={14}/>
                    </button>
                    <button 
                        onClick={() => onToggleStatus(gym)} 
                        title={gym.isActive ? "Deactivate" : "Activate"}
                        className={`p-2.5 rounded-xl border transition-all active:scale-90 ${gym.isActive ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-emerald-500 hover:text-white'}`}
                    >
                        <Power size={14}/>
                    </button>
                    <button onClick={() => onEdit(gym)} title="Configure Subscription" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 rounded-xl hover:text-blue-500 transition-all active:scale-90 border border-transparent dark:hover:border-white/10">
                        <Edit3 size={14}/>
                    </button>
                    <button 
                        onClick={handleDelete}
                        title="Terminate Instance" 
                        className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                    >
                        <Trash2 size={14}/>
                    </button>
                </div>
            </td>
        </tr>
    );
};