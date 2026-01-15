
import React from 'react';
import { Search } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface ManualEntryFormProps {
    input: string;
    setInput: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    lang: Language;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ input, setInput, onSubmit, inputRef, lang }) => {
    const t = translations[lang];
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[1.5rem] shadow-lg border dark:border-slate-700 shrink-0">
            <h3 className="text-[10px] font-black dark:text-white mb-3 flex items-center gap-2 uppercase tracking-[0.2em] opacity-60">
                <Search size={14} className="text-blue-500"/> {t.manual_entry}
            </h3>
            <form onSubmit={onSubmit} className="relative">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder={t.scan_placeholder} 
                    className="w-full pl-3 pr-12 py-3.5 rounded-xl border-2 border-transparent dark:border-slate-700 bg-gray-50 dark:bg-slate-950 dark:text-white focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-sm shadow-inner" 
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg shadow-md active:scale-95 transition-all">
                    <Search size={18} />
                </button>
            </form>
        </div>
    );
};
