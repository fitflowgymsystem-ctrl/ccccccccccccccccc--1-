
import React, { useState } from 'react';
import { X, Wrench, Tag, Activity, Calendar, Save } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface EquipmentFormModalProps {
    lang: Language;
    onClose: () => void;
    onSave: (data: any) => void;
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({ lang, onClose, onSave }) => {
    const t = translations[lang];
    const [formData, setFormData] = useState({
        name: '',
        status: 'Operational' as 'Operational' | 'Under Maintenance' | 'Broken',
        nextMaintenance: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-2xl w-full max-w-sm md:max-w-2xl border dark:border-slate-700 animate-scale-in overflow-hidden cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-3 sm:p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <Wrench size={16} className="text-blue-600" />
                        <h3 className="font-black text-xs uppercase tracking-widest dark:text-white">{t.equip_add}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
                    <div className="space-y-1">
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ps-1">{t.equip_name}</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Treadmill X1"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ps-1">{t.status}</label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner cursor-pointer"
                            >
                                <option value="Operational">{t.operational}</option>
                                <option value="Under Maintenance">{t.maintenance}</option>
                                <option value="Broken">{t.broken}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ps-1">{t.next_service}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="date"
                                required
                                value={formData.nextMaintenance}
                                onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="pt-3 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors">{t.cancel}</button>
                        <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Save size={14} />
                            {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
