
import React, { useState } from 'react';
import { X, Wrench, Tag, Activity, Calendar, Save } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface EquipmentFormModalProps {
    lang: Language;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({ lang, onClose, onSave, initialData }) => {
    const t = translations[lang];
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        brand: initialData?.brand || '',
        model: initialData?.model || '',
        serialNumber: initialData?.serialNumber || '',
        purchaseDate: initialData?.purchaseDate || '',
        price: initialData?.price || '' as any,
        image: initialData?.image || '',
        maintenanceFrequency: initialData?.maintenanceFrequency || 30,
        notes: initialData?.notes || '',
        status: (initialData?.status || 'Operational') as 'Operational' | 'Under Maintenance' | 'Broken',
        nextMaintenance: initialData?.nextMaintenance || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: Number(formData.price) || 0,
            maintenanceFrequency: Number(formData.maintenanceFrequency) || 30
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-2xl border dark:border-slate-700 animate-scale-in overflow-hidden cursor-default flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <Wrench size={20} className="text-blue-600" />
                        <h3 className="font-black text-lg uppercase tracking-widest dark:text-white">{t.equip_add}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form id="equip-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Image Preview / URL */}
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'صورة الجهاز (رابط)' : 'Device Image (URL)'}</label>
                            <div className="flex gap-4 items-start">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-slate-900 flex items-center justify-center border dark:border-slate-700 overflow-hidden shrink-0">
                                    {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <Activity className="text-gray-400" size={24} />}
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="flex-1 w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-base font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{t.equip_name} *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={lang === 'ar' ? 'مثال: جهاز مشي' : 'e.g. Treadmill X1'}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الحالة' : 'Status'}</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                                >
                                    <option value="Operational">{t.operational}</option>
                                    <option value="Under Maintenance">{t.maintenance}</option>
                                    <option value="Broken">{t.broken}</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الماركة' : 'Brand'}</label>
                                <input
                                    type="text"
                                    placeholder={lang === 'ar' ? 'مثال: Technogym' : 'e.g. Technogym'}
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الموديل' : 'Model'}</label>
                                <input
                                    type="text"
                                    placeholder="e.g. T-1000"
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الرقم التسلسلي' : 'Serial Number'}</label>
                                <input
                                    type="text"
                                    placeholder="SN-12345678"
                                    value={formData.serialNumber}
                                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'سعر الشراء' : 'Purchase Price'}</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'تاريخ الشراء' : 'Purchase Date'}</label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الصيانة القادمة' : 'Next Service'}</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.nextMaintenance}
                                    onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-base font-medium dark:text-white outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest ps-1">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-xl text-base font-medium dark:text-white outline-none transition-all shadow-inner min-h-[80px]"
                                placeholder={lang === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                            />
                        </div>

                    </form>
                </div>

                <div className="flex gap-3 p-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                    <button type="button" onClick={onClose} className="flex-1 py-3 border dark:border-slate-700 text-sm font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">{t.cancel}</button>
                    <button type="submit" form="equip-form" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Save size={16} />
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
};
