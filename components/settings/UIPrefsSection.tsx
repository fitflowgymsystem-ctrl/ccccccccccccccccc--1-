
import React from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { Language } from '../../utils/translations';
import { THEMES } from '../../constants/themes';

interface UIPrefsSectionProps {
    activeTheme: string;
    onUpdateTheme: (theme: string) => void;
    lang: Language;
    onSetLang: (l: Language) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

export const UIPrefsSection: React.FC<UIPrefsSectionProps> = ({ activeTheme, onUpdateTheme, lang, onSetLang, isDarkMode, onToggleDarkMode }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 sm:p-5">
            <h3 className="text-[10px] font-black dark:text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em] opacity-60">
                <Palette size={14} className="text-purple-500" /> Interface Customization
            </h3>
            
            <div className="space-y-6">
                <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 ps-1">Branding Palette</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {Object.entries(THEMES).map(([key, theme]) => (
                            <button 
                                key={key} 
                                onClick={() => onUpdateTheme(key)} 
                                className={`relative p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${activeTheme === key ? 'border-blue-500 bg-blue-50/50 dark:bg-slate-700' : 'border-transparent bg-gray-50 dark:bg-slate-900 hover:bg-gray-100'}`}
                            >
                                <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: (theme as any).colors[500] }}></div>
                                <span className="text-[7px] font-black uppercase truncate w-full text-center">{(theme as any).name.split(' ')[0]}</span>
                                {activeTheme === key && <div className="absolute top-0.5 right-0.5 text-blue-500"><Check size={10} strokeWidth={4} /></div>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border dark:border-slate-700">
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-gray-800 dark:text-white uppercase truncate">Language</p>
                        </div>
                        <div className="flex gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border dark:border-slate-700">
                            <button onClick={() => onSetLang('en')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>EN</button>
                            <button onClick={() => onSetLang('ar')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${lang === 'ar' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>AR</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border dark:border-slate-700">
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-gray-800 dark:text-white uppercase truncate">Visual Mode</p>
                        </div>
                        <button onClick={onToggleDarkMode} className={`p-1.5 rounded-lg transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-white text-amber-500 border border-gray-100'}`}>
                            {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
