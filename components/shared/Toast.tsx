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
        success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
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
