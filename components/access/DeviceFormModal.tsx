
import React, { useState } from 'react';
import { X, Cpu, Globe, Hash, Save, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { AccessDevice } from '../../types';

interface DeviceFormModalProps {
    editingDevice: AccessDevice | null;
    lang: Language;
    onClose: () => void;
    onSave: (data: any) => void;
}

export const DeviceFormModal: React.FC<DeviceFormModalProps> = ({ editingDevice, lang, onClose, onSave }) => {
    const t = translations[lang];
    const [formData, setFormData] = useState({
        name: editingDevice?.name || '',
        ip: editingDevice?.ip || '192.168.1.',
        port: editingDevice?.port || 4370,
        type: editingDevice?.type || 'Fingerprint',
        connectionType: editingDevice?.connectionType || 'Ethernet'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 animate-fade-in cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-700 flex flex-col animate-scale-in cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Condensed Header */}
                <div className="px-4 py-3 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <h3 className="font-black text-lg text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                        <Cpu size={18} className="text-blue-500" />
                        {editingDevice ? (lang === 'ar' ? 'تعديل جهاز' : 'Edit Device') : (lang === 'ar' ? 'إضافة جهاز' : 'Add Device')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1 hover:text-gray-600 transition-all"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">Device Identity</label>
                        <input
                            type="text" required placeholder="Node Name (e.g. Main Gate)"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-base font-bold outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1 flex items-center gap-1"><Globe size={10} /> IP Address</label>
                            <input
                                type="text" required placeholder="192.168.1.X"
                                value={formData.ip} onChange={e => setFormData({ ...formData, ip: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-[10px] font-mono outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1 flex items-center gap-1"><Hash size={10} /> Port</label>
                            <input
                                type="number" required
                                value={formData.port} onChange={e => setFormData({ ...formData, port: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-[10px] font-mono outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">Biometric Type</label>
                        <select
                            value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-base font-black uppercase outline-none dark:text-white"
                        >
                            <option value="Fingerprint">Fingerprint Reader</option>
                            <option value="FaceID">Face Recognition</option>
                            <option value="RFID">RFID / Card Scanner</option>
                        </select>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-sm font-black uppercase text-gray-400 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                            <Save size={18} /> {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
