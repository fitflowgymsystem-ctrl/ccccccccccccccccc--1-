
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Language } from '../../utils/translations';

interface MemberDeleteModalProps {
    userName: string;
    lang: Language;
    onCancel: () => void;
    onConfirm: () => void;
}

export const MemberDeleteModal: React.FC<MemberDeleteModalProps> = ({ userName, lang, onCancel, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 cursor-pointer" onClick={onCancel}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl border dark:border-slate-700 animate-scale-in cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="font-black text-lg dark:text-white mb-2 uppercase tracking-tighter">
                    {lang === 'ar' ? 'تأكيد الحذف؟' : 'Terminate Member?'}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6">
                    {lang === 'ar'
                        ? `هل أنت متأكد من حذف العضو "${userName}" نهائياً؟ لا يمكن التراجع.`
                        : `Are you sure you want to permanently delete "${userName}"? This cannot be undone.`}
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95">
                        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg text-[10px] uppercase tracking-widest active:scale-95 hover:bg-red-700 transition-all">
                        {lang === 'ar' ? 'حذف نهائي' : 'Delete Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};
