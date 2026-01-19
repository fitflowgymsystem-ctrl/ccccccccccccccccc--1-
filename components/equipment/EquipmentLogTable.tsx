import React, { useState } from 'react';
import { Equipment, EquipmentLog } from '../../types';
import { Language, translations } from '../../utils/translations';
import { Calendar, Wrench, ChevronLeft, ChevronRight, Activity, DollarSign, User, Plus, Search, Filter } from 'lucide-react';
import { AddEquipmentLogModal } from './AddEquipmentLogModal';
import { CustomSelect } from '../shared/CustomSelect';

interface EquipmentLogTableProps {
    equipment: Equipment[];
    lang: Language;
    onAddLog: (equipmentId: number, log: Omit<EquipmentLog, 'id'>) => void;
}

export const EquipmentLogTable: React.FC<EquipmentLogTableProps> = ({ equipment, lang, onAddLog }) => {
    const t = translations[lang];
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEquipId, setSelectedEquipId] = useState<number | 'ALL'>('ALL');
    const [isAddLogOpen, setIsAddLogOpen] = useState<Equipment | null>(null);
    const itemsPerPage = 15;

    // Flatten all logs from all equipment
    const allLogs = equipment.flatMap(item => (item.logs || []).map(log => ({
        ...log,
        equipmentName: item.name
    })));

    const filteredLogs = allLogs.filter(log => {
        const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.performer || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEquip = selectedEquipId === 'ALL' || log.equipmentId === selectedEquipId;
        return matchesSearch && matchesEquip;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col mt-10">
            {/* Header / Toolbar */}
            <div className="p-6 border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-gray-800 dark:text-white uppercase tracking-tight">{lang === 'ar' ? 'سجل العمليات العام' : 'General Operations Log'}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'تتبع صيانة كافة الأجهزة' : 'Tracking maintenance for all devices'}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder={lang === 'ar' ? 'بحث في السجل...' : 'Search logs...'}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full ps-9 pe-4 py-2 bg-white dark:bg-slate-950 border-none ring-1 ring-gray-200 dark:ring-slate-700 rounded-xl text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <CustomSelect
                            label=""
                            value={selectedEquipId}
                            onChange={val => { setSelectedEquipId(val === 'ALL' ? 'ALL' : Number(val)); setCurrentPage(1); }}
                            options={[
                                { label: lang === 'ar' ? 'كل الأجهزة' : 'All Equipment', value: 'ALL', icon: <Activity size={14} className="text-blue-500" /> },
                                ...equipment.map(e => ({ label: e.name, value: e.id, icon: <Wrench size={14} className="text-gray-500" /> }))
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-slate-900 shadow-sm border-b dark:border-slate-700">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{lang === 'ar' ? 'الجهاز' : 'Equipment'}</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{lang === 'ar' ? 'التكلفة' : 'Cost'}</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{lang === 'ar' ? 'المسؤول' : 'Performer'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                        {paginatedLogs.map((log, idx) => (
                            <tr key={log.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="p-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        <Calendar size={14} className="text-gray-400" />
                                        {log.date}
                                    </div>
                                </td>
                                <td className="p-4 py-4">
                                    <span className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight">{log.equipmentName}</span>
                                </td>
                                <td className="p-4 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide
                                        ${log.type === 'Maintenance' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            log.type === 'breakdown' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="p-4 py-4">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 max-w-xs">{log.description}</p>
                                </td>
                                <td className="p-4 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {log.cost ? <div className="flex items-center gap-1"><DollarSign size={12} className="text-green-500" />{log.cost.toLocaleString()}</div> : '-'}
                                </td>
                                <td className="p-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2"><User size={14} />{log.performer || '-'}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {paginatedLogs.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-gray-400">
                        <Wrench size={48} className="mb-4 opacity-10" />
                        <p className="text-sm font-bold uppercase tracking-widest">{lang === 'ar' ? 'لا توجد سجلات مطابقة' : 'No matching logs found'}</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="p-5 border-t dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {lang === 'ar' ? `صفحة ${currentPage} من ${totalPages || 1}` : `Page ${currentPage} of ${totalPages || 1}`}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl border dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2.5 rounded-xl border dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => {
                            const firstEquip = equipment[0];
                            if (firstEquip) setIsAddLogOpen(firstEquip);
                        }}
                        className="ms-4 bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        {lang === 'ar' ? 'إضافة سجل جديد' : 'New Log Entry'}
                    </button>
                </div>
            </div>

            {/* Add Log Modal */}
            {isAddLogOpen && (
                <AddEquipmentLogModal
                    equipment={isAddLogOpen}
                    lang={lang}
                    onClose={() => setIsAddLogOpen(null)}
                    onSave={(log) => {
                        onAddLog(isAddLogOpen.id, log);
                        setIsAddLogOpen(null);
                    }}
                />
            )}
        </div>
    );
};
