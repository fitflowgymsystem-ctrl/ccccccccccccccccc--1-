import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../contexts/ToastContext';

interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 4000); // 4 seconds total life (slightly longer than context for animation handling if needed)
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const styles = {
        success: 'bg-white dark:bg-slate-900/90 border-green-500 text-green-700 dark:text-green-400 shadow-[0_0_15px_-3px_rgba(34,197,94,0.6)] dark:shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)]',
        error: 'bg-white dark:bg-slate-900/90 border-red-500 text-red-700 dark:text-red-400 shadow-[0_0_15px_-3px_rgba(239,68,68,0.6)] dark:shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]',
        info: 'bg-white dark:bg-slate-900/90 border-blue-500 text-blue-700 dark:text-blue-400 shadow-[0_0_15px_-3px_rgba(59,130,246,0.6)] dark:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]',
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg animate-slide-in-right min-w-[300px] max-w-sm cursor-pointer hover:scale-[1.02] transition-transform ${styles[toast.type]}`} onClick={() => onRemove(toast.id)}>
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            <button onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }} className="p-1 hover:bg-black/5 rounded-full transition-colors opacity-50 hover:opacity-100">
                <X size={14} />
            </button>
        </div>
    );
};
