import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentLog } from '../types';
import { Search, Plus, AlertTriangle, Wrench, Tag, DollarSign, Activity, Calendar } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { EquipmentFormModal } from '../components/equipment/EquipmentFormModal';
import { EquipmentLogTable } from '../components/equipment/EquipmentLogTable';

interface EquipmentProps {
    equipment: Equipment[];
    lang: Language;
    onUpdateEquipment: (id: number, updates: Partial<Equipment>) => void;
    onAddEquipment: (item: Equipment) => void;
    onDeleteEquipment: (id: number) => void;
}

export const EquipmentPage: React.FC<EquipmentProps> = ({ equipment, lang, onUpdateEquipment, onAddEquipment, onDeleteEquipment }) => {
    const t = translations[lang];
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'OPERATIONAL' | 'ISSUES'>('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Equipment | null>(null);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const handleSave = (data: any) => {
        if (editingItem) {
            onUpdateEquipment(editingItem.id, data);
        } else {
            onAddEquipment({
                id: Date.now(),
                gymId: '',
                ...data,
                lastMaintenance: new Date().toISOString().split('T')[0]
            });
        }
        setIsAddModalOpen(false);
        setEditingItem(null);
    };

    const handleEdit = (item: Equipment) => {
        setEditingItem(item);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingItem(null);
    };

    const handleAddLog = (equipmentId: number, logData: Omit<EquipmentLog, 'id'>) => {
        const item = equipment.find(e => e.id === equipmentId);
        if (!item) return;

        const newLog: EquipmentLog = {
            ...logData,
            id: Date.now()
        };

        const updatedLogs = [...(item.logs || []), newLog];

        let newStatus = item.status;
        if (logData.type === 'breakdown') newStatus = 'Broken';
        if (logData.type === 'Maintenance') newStatus = 'Operational';

        const updates: Partial<Equipment> = {
            logs: updatedLogs,
            status: newStatus
        };

        if (logData.type === 'Maintenance') {
            updates.lastMaintenance = logData.date;
        }

        onUpdateEquipment(equipmentId, updates);
    };

    const filteredEquipment = useMemo(() => {
        return equipment.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'ALL' || (filter === 'OPERATIONAL' ? item.status === 'Operational' : item.status !== 'Operational');
            return matchesSearch && matchesFilter;
        });
    }, [equipment, searchTerm, filter]);

    const stats = useMemo(() => {
        const total = equipment.length;
        const totalValue = equipment.reduce((sum, item) => sum + (item.price || 0), 0);
        const operational = equipment.filter(i => i.status === 'Operational').length;
        const maintenanceDue = equipment.filter(i => new Date(i.nextMaintenance) <= new Date()).length;
        return { total, totalValue, operational, maintenanceDue };
    }, [equipment]);

    return (
        <>
            <div className="space-y-6 animate-fade-in pb-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
                            <Wrench size={32} className="text-blue-600" />
                            {t.equip_title}
                        </h2>
                    </div>
                    <button onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 shadow-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                        <Plus size={18} /> {t.equip_add}
                    </button>
                </header>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><Tag size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{lang === 'ar' ? 'الأصول' : 'Total Assets'}</span>
                        </div>
                        <h3 className="text-2xl font-black dark:text-white">{stats.total}</h3>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600"><DollarSign size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{lang === 'ar' ? 'القيمة' : 'Total Value'}</span>
                        </div>
                        <h3 className="text-2xl font-black dark:text-white">{stats.totalValue.toLocaleString()}</h3>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600"><Activity size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{lang === 'ar' ? 'الحالة' : 'Health Score'}</span>
                        </div>
                        <h3 className="text-2xl font-black dark:text-white">{stats.total > 0 ? Math.round((stats.operational / stats.total) * 100) : 100}%</h3>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600"><Calendar size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{lang === 'ar' ? 'صيانة' : 'Maintenance'}</span>
                        </div>
                        <h3 className="text-2xl font-black dark:text-white">{stats.maintenanceDue} <span className="text-xs text-gray-400 font-bold uppercase">{lang === 'ar' ? 'مطلوب' : 'Due'}</span></h3>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-2 flex flex-col md:flex-row gap-3 border dark:border-slate-700">
                    <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder={t.equip_search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ps-10 pe-4 py-3 bg-white dark:bg-slate-900 border-none text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-blue-500 shadow-sm" />
                    </div>
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700">
                        {['ALL', 'OPERATIONAL', 'ISSUES'].map(f => (
                            <button key={f} onClick={() => setFilter(f as any)} className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${filter === f ? 'bg-gray-100 dark:bg-slate-700 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                {f === 'ALL' ? t.equip_filter_all : (f === 'OPERATIONAL' ? t.operational : t.broken)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEquipment.map((item) => (
                        <EquipmentCard
                            key={item.id}
                            item={item}
                            lang={lang}
                            onUpdateStatus={(id, status) => onUpdateEquipment(id, { status })}
                            onDelete={setItemToDelete}
                            onEdit={handleEdit}
                            onViewHistory={() => {
                                document.getElementById('maintenance-logs')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        />
                    ))}
                </div>

                <div id="maintenance-logs">
                    <EquipmentLogTable
                        equipment={equipment}
                        lang={lang}
                        onAddLog={handleAddLog}
                    />
                </div>
            </div>

            {/* Modals */}
            {(isAddModalOpen || editingItem) && (
                <EquipmentFormModal
                    lang={lang}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    initialData={editingItem}
                />
            )}

            {itemToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-sm border dark:border-slate-700 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 ring-4 ring-red-500/10">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white mb-2 uppercase tracking-tight">{t.equip_delete_title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">{t.equip_delete_msg}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl font-black dark:text-white hover:bg-gray-200 transition-colors uppercase text-[10px] tracking-widest">{t.cancel}</button>
                            <button onClick={() => { onDeleteEquipment(itemToDelete); setItemToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors uppercase text-[10px] tracking-widest">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
