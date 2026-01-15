
import React, { useState } from 'react';
import { Search, Plus, LayoutGrid, List, LogIn, Edit3, Database, Cpu, Trash2, Power } from 'lucide-react';
import { GymProfile } from '../../types';
import { Language, translations } from '../../utils/translations';
import { InstanceCard } from '../../components/superadmin/InstanceCard';

interface InstanceManagementProps {
    gyms: GymProfile[];
    searchTerm: string;
    onSearch: (v: string) => void;
    onAdd: () => void;
    onEdit: (gym: GymProfile) => void;
    onDelete: (id: string) => void;
    onImpersonate: (gym: GymProfile) => void;
    onToggleStatus: (gym: GymProfile) => void;
    lang: Language;
}

export const InstanceManagement: React.FC<InstanceManagementProps> = ({
    gyms, searchTerm, onSearch, onAdd, onEdit, onDelete, onImpersonate, onToggleStatus, lang
}) => {
    const t = translations[lang];
    const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-xl border dark:border-white/5">
                        <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><LayoutGrid size={16} /></button>
                        <button onClick={() => setViewMode('TABLE')} className={`p-2 rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><List size={16} /></button>
                    </div>
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder={t.dev_search_gyms} value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full ps-9 pe-4 py-2 bg-gray-50 dark:bg-slate-950 border-none rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500/30 dark:text-white" />
                    </div>
                </div>
                <button onClick={onAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg hover:bg-blue-700 tracking-widest transition-all"><Plus size={16} /> {t.dev_new_instance}</button>
            </div>

            {viewMode === 'GRID' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {gyms.map(gym => (
                        <InstanceCard
                            key={gym.id}
                            gym={gym}
                            onImpersonate={onImpersonate}
                            onToggleStatus={onToggleStatus}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start">
                            <thead className="bg-gray-50/50 dark:bg-slate-950 text-gray-400 text-[8px] font-black uppercase tracking-widest border-b dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-start">Node</th>
                                    <th className="px-4 py-3 text-center">Plan</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-end">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {gyms.map(gym => (
                                    <tr key={gym.id} className="hover:bg-blue-50/10 dark:hover:bg-white/5 transition-all group">
                                        <td className="px-6 py-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border dark:border-white/10 shrink-0">
                                                {gym.logoUrl ? <img src={gym.logoUrl} className="w-full h-full object-cover" /> : <Database size={12} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-[10px] uppercase dark:text-white truncate max-w-[120px]">{gym.name}</p>
                                                <p className="text-[7px] text-gray-400 font-mono">ID: {gym.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-[8px] font-black text-indigo-600 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg uppercase">{gym.subscriptionPlan}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${gym.isActive ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-red-500'}`}></div>
                                                <span className="text-[8px] font-black uppercase text-gray-400">{gym.isActive ? 'Healthy' : 'Suspended'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-end">
                                            <div className="flex justify-end gap-1.5">
                                                <button onClick={() => onImpersonate(gym)} title="Access Dashboard" className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><LogIn size={14} /></button>
                                                <button onClick={() => onToggleStatus(gym)} title="Toggle Status" className={`p-1.5 rounded-lg transition-colors ${gym.isActive ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}><Power size={14} /></button>
                                                <button onClick={() => onEdit(gym)} title="Edit Configuration" className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><Edit3 size={14} /></button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(gym.id); }}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90"
                                                    title="Terminate Permanently"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {gyms.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-2 opacity-20">
                    <Cpu size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Active Nodes</p>
                </div>
            )}
        </div>
    );
};