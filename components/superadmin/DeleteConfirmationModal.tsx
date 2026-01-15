import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    gymName: string;
    lang: Language;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, gymName, lang }) => {
    const t = translations[lang];
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
        setConfirmText('');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fade-in cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-red-500/20 overflow-hidden animate-scale-in cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Terminate Node?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            You are about to permanently destroy <span className="text-red-500 font-bold">{gymName}</span>.
                            This action cannot be undone and all associated data will be lost.
                        </p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-500/10 text-start space-y-2">
                        <label className="text-[10px] font-black uppercase text-red-400 tracking-widest block">Type "DELETE" to confirm</label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/50 dark:text-white placeholder-slate-400"
                            placeholder="DELETE"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t dark:border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] border dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={confirmText !== 'DELETE'}
                        className="flex-[2] py-3 bg-red-600 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} /> Terminate Permanently
                    </button>
                </div>
            </div>
        </div>
    );
};
