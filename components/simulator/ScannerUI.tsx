
import React from 'react';
import { Fingerprint, RefreshCw } from 'lucide-react';
import { User } from '../../types';
import { Language, translations } from '../../utils/translations';

interface ScannerUIProps {
    scanning: boolean;
    result: { granted: boolean } | null;
    selectedUser: string;
    setSelectedUser: (v: string) => void;
    users: User[];
    handleScan: () => void;
    reset: () => void;
    lang: Language;
}

export const ScannerUI: React.FC<ScannerUIProps> = ({ 
    scanning, result, selectedUser, setSelectedUser, users, handleScan, reset, lang 
}) => {
    const t = translations[lang];
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t.finger_scanner}</h3>
            
            <div className={`relative w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                scanning ? 'border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 
                result?.granted ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' :
                result?.granted === false ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' :
                'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'
            }`}>
                <Fingerprint size={80} className={`transition-colors duration-300 ${scanning ? 'text-blue-500 animate-pulse' : result?.granted ? 'text-green-500' : result?.granted === false ? 'text-red-500' : 'text-gray-300 dark:text-slate-500'}`} />
                {scanning && <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>}
            </div>

            <div className="w-full max-w-sm space-y-4">
                <select className="w-full p-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg outline-none" value={selectedUser} onChange={e => { setSelectedUser(e.target.value); if(result) reset(); }}>
                    <option value="">-- {t.select_finger} --</option>
                    {users.map(u => <option key={u.id} value={u.id}>Finger ID: {u.fingerprintId} ({u.name})</option>)}
                    <option value="999">{t.unknown_finger}</option>
                </select>
                <button onClick={handleScan} disabled={!selectedUser || scanning} className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all active:scale-95 ${!selectedUser || scanning ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {scanning ? t.scanning : t.scan_btn}
                </button>
                {result && <button onClick={reset} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"><RefreshCw size={14} /> Reset</button>}
            </div>
        </div>
    );
};
