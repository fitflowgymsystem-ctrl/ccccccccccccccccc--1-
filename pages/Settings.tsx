
import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { UserRole } from '../types';

// Import split components
import { HardwareCard } from '../components/settings/HardwareCard';
import { UIPrefsSection } from '../components/settings/UIPrefsSection';
import { SystemBackupSection } from '../components/settings/SystemBackupSection';

interface SettingsProps {
    lang: Language;
    setLang: (l: Language) => void;
    role: string;
    gymInfo: { name: string, logo: string, email: string };
    onUpdateGymInfo: (name: string, logo: string, email: string) => void;
    activeTheme: string;
    onUpdateTheme: (theme: string) => void;
    onNavigate?: (page: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ lang, setLang, role, gymInfo, activeTheme, onUpdateTheme, onNavigate }) => {
    const t = translations[lang];
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [isSaving, setIsSaving] = useState(false);

    const isAdmin = role === UserRole.ADMIN;

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));
        if (newMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const handleBackup = () => {
        const data = {
            users: localStorage.getItem('fitflow_users'),
            logs: localStorage.getItem('fitflow_logs'),
            financials: localStorage.getItem('fitflow_financials'),
            gymInfo: gymInfo
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Backup_${gymInfo.name}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleSave = () => { 
        setIsSaving(true); 
        setTimeout(() => setIsSaving(false), 800); 
    };

    return (
        <div className="space-y-4 animate-fade-in max-w-5xl mx-auto pb-20 px-2 sm:px-4">
            <header className="flex flex-col gap-0.5 py-1">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">{t.settings}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instance Preferences</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {isAdmin && (
                    <div className="grid grid-cols-1 gap-4">
                        <HardwareCard onClick={() => onNavigate && onNavigate('access_control')} />
                    </div>
                )}

                <UIPrefsSection 
                    activeTheme={activeTheme} onUpdateTheme={onUpdateTheme}
                    lang={lang} onSetLang={setLang}
                    isDarkMode={isDarkMode} onToggleDarkMode={toggleTheme}
                />

                {isAdmin && (
                    <SystemBackupSection onBackup={handleBackup} onReset={() => {}} />
                )}
            </div>

            {isAdmin && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Check className="animate-bounce" size={18}/> : <Save size={18}/>}
                        {isSaving ? 'Preferences Updated' : t.save}
                    </button>
                </div>
            )}
        </div>
    );
};
