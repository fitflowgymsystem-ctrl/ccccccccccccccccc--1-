
import React, { useState, useMemo } from 'react';
import { Equipment } from '../types';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { EquipmentFormModal } from '../components/equipment/EquipmentFormModal';

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
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const handleAddSubmit = (formData: any) => {
        onAddEquipment({
            id: Date.now(),
            gymId: '',
            name: formData.name,
            status: formData.status,
            nextMaintenance: formData.nextMaintenance,
            lastMaintenance: new Date().toISOString().split('T')[0]
        });
        setIsAddModalOpen(false);
    };

    const filteredEquipment = useMemo(() => {
        return equipment.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'ALL' || (filter === 'OPERATIONAL' ? item.status === 'Operational' : item.status !== 'Operational');
            return matchesSearch && matchesFilter;
        });
    }, [equipment, searchTerm, filter]);

    return (
        <>
            <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
                <header className="flex justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white tracking-tight">{t.equip_title}</h2>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 shadow-lg text-xs font-bold transition-all active:scale-95">
                        <Plus size={16} /> <span className="hidden sm:inline">{t.equip_add}</span>
                    </button>
                </header>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-2 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder={t.equip_search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ps-9 pe-4 py-2 bg-gray-50 dark:bg-slate-950 border-none text-gray-900 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" />
                    </div>
                    <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
                        {['ALL', 'OPERATIONAL', 'ISSUES'].map(f => (
                            <button key={f} onClick={() => setFilter(f as any)} className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                                {f === 'ALL' ? t.equip_filter_all : (f === 'OPERATIONAL' ? t.operational : t.broken)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {filteredEquipment.map((item) => (
                        <EquipmentCard
                            key={item.id}
                            item={item}
                            lang={lang}
                            onUpdateStatus={(id, status) => onUpdateEquipment(id, { status })}
                            onDelete={setItemToDelete}
                        />
                    ))}
                </div>
            </div>

            {/* Modals خارج div المتحرك */}
            {isAddModalOpen && (
                <EquipmentFormModal lang={lang} onClose={() => setIsAddModalOpen(false)} onSave={handleAddSubmit} />
            )}

            {itemToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm border dark:border-slate-700 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-lg font-black dark:text-white mb-2">{t.equip_delete_title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.equip_delete_msg}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 border dark:border-slate-700 rounded-xl font-bold dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors uppercase text-[10px]">Cancel</button>
                            <button onClick={() => { onDeleteEquipment(itemToDelete); setItemToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors uppercase text-[10px]">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
