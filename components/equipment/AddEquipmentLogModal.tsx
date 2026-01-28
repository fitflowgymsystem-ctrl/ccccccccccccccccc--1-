import React, { useState } from 'react';
import { Equipment, EquipmentLog } from '../../types';
import { Language, translations } from '../../utils/translations';
import { X, Save, Calendar, Wrench, AlertTriangle, User, DollarSign, PenTool, Activity } from 'lucide-react';

interface AddEquipmentLogModalProps {
    equipment: Equipment;
    lang: Language;
    onClose: () => void;
    onSave: (log: Omit<EquipmentLog, 'id'>) => void;
}

export const AddEquipmentLogModal: React.FC<AddEquipmentLogModalProps> = ({ equipment, lang, onClose, onSave }) => {
    const t = translations[lang];
    const [formData, setFormData] = useState<Omit<EquipmentLog, 'id' | 'equipmentId'>>({
        date: new Date().toISOString().split('T')[0],
        type: 'Maintenance',
        description: '',
        cost: 0,
        performer: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            equipmentId: equipment.id,
            cost: Number(formData.cost) || 0
        });
    };

    const types = [
        { id: 'Maintenance', label: lang === 'ar' ? 'صيانة دورية' : 'Routine Maintenance', icon: Wrench, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
        { id: 'breakdown', label: lang === 'ar' ? 'عطل مفاجئ' : 'Breakdown', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
        { id: 'Inspection', label: lang === 'ar' ? 'فحص فني' : 'Technical Inspection', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'Other', label: lang === 'ar' ? 'أخرى' : 'Other', icon: PenTool, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' }
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1300] p-4 animate-scale-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg border dark:border-slate-700 overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <PenTool size={20} className="text-blue-600" />
                        <h3 className="font-black text-lg uppercase tracking-widest dark:text-white">
                            {lang === 'ar' ? 'إضافة سجل صيانة' : 'Add Maintenance Log'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    {/* Equipment Info Summary */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center gap-3">
                        {equipment.image ? (
                            <img src={equipment.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                                <Wrench size={20} />
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-black uppercase text-blue-600/60 tracking-widest">{lang === 'ar' ? 'الجهاز المستهدف' : 'Target Equipment'}</p>
                            <p className="text-base font-bold dark:text-gray-200">{equipment.name} {equipment.brand && `• ${equipment.brand}`}</p>
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'نوع العملية' : 'Operation Type'}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {types.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type.id as any })}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${formData.type === type.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-transparent bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                                >
                                    <type.icon size={18} className={type.color} />
                                    <span className="text-sm font-black uppercase tracking-tight dark:text-gray-300">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-base font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'التكلفة' : 'Cost'}</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={14} />
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.cost}
                                    onChange={e => setFormData({ ...formData, cost: e.target.value as any })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-base font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'القائم بالعملية' : 'Performer'}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder={lang === 'ar' ? 'اسم الفني أو الموظف' : 'Technician or Staff name'}
                                value={formData.performer}
                                onChange={e => setFormData({ ...formData, performer: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-base font-bold dark:text-white outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الوصف / التفاصيل' : 'Description / Details'}</label>
                        <textarea
                            required
                            placeholder={lang === 'ar' ? 'اكتب ما تم إنجازه...' : 'Describe what was done...'}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-base font-bold dark:text-white outline-none transition-all shadow-inner min-h-[100px]"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border dark:border-slate-700 text-sm font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">{t.cancel}</button>
                        <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Save size={16} />
                            {lang === 'ar' ? 'حفظ السجل' : 'Save Log'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
