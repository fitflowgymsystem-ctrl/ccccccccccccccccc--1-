
import React from 'react';
import { Search, Activity } from 'lucide-react';
import { GymProfile } from '../../types';
import { FleetTableRow } from './FleetTableRow';

interface FleetTableProps {
    gyms: GymProfile[];
    searchTerm: string;
    onSearch: (v: string) => void;
    onImpersonate: (gym: GymProfile) => void;
    // Fixed: Added missing onToggleStatus property to the interface
    onToggleStatus: (gym: GymProfile) => void;
    onEdit: (gym: GymProfile) => void;
    onDelete: (id: string) => void;
}

// Fixed: Destructured onToggleStatus from props
export const FleetTable: React.FC<FleetTableProps> = ({ gyms, searchTerm, onSearch, onImpersonate, onToggleStatus, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-900/50">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity size={18} className="text-green-500" /> Facility Fleet
                </h3>
                <div className="relative w-full md:w-64">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Filter instances..." 
                        value={searchTerm} 
                        onChange={e => onSearch(e.target.value)} 
                        className="w-full ps-11 pe-4 py-2 bg-white dark:bg-slate-950 border-none rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 shadow-inner dark:text-white" 
                    />
                </div>
            </div>
            <div className="overflow-x-auto flex-1 code-scroll">
                <table className="w-full text-start">
                    <thead className="bg-gray-50/50 dark:bg-slate-900/50 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] border-b dark:border-slate-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-start">Instance</th>
                            <th className="px-6 py-4 text-center">Modules</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-end">Ops</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                        {gyms.map(gym => (
                            <FleetTableRow 
                                key={gym.id} 
                                gym={gym} 
                                onImpersonate={onImpersonate} 
                                // Fixed: Passed onToggleStatus to FleetTableRow to satisfy component requirements
                                onToggleStatus={onToggleStatus}
                                onEdit={onEdit} 
                                onDelete={onDelete} 
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
