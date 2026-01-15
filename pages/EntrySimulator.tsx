
import React, { useState } from 'react';
import { User, AccessStatus } from '../types';
import { simulateScan } from '../services/gymService';
import { Language, translations } from '../utils/translations';
import { ScannerUI } from '../components/simulator/ScannerUI';
import { GateFeedback } from '../components/simulator/GateFeedback';

interface EntrySimulatorProps {
  users: User[];
  onLogUpdate: () => void;
  lang: Language;
}

export const EntrySimulator: React.FC<EntrySimulatorProps> = ({ users, onLogUpdate, lang }) => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ granted: boolean; message: string; user?: User } | null>(null);
  const t = translations[lang];

  const handleScan = async () => {
    if (!selectedUser) return;
    setScanning(true);
    setResult(null);
    const userObj = users.find(u => u.id.toString() === selectedUser);
    const fpId = userObj ? userObj.fingerprintId : 'unknown_fp';
    const response = await simulateScan(fpId, 'GT_01_MAIN');
    setResult({ granted: response.status === AccessStatus.GRANTED, message: response.message, user: response.user });
    setScanning(false);
    onLogUpdate();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
        <header>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">{t.sim_title}</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t.sim_subtitle}</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScannerUI 
                scanning={scanning} result={result} selectedUser={selectedUser} 
                setSelectedUser={setSelectedUser} users={users} 
                handleScan={handleScan} reset={() => setResult(null)} lang={lang} 
            />
            <div className="flex flex-col gap-6">
                <GateFeedback scanning={scanning} result={result} lang={lang} />
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-2 uppercase text-xs tracking-widest">Logic Flow</h4>
                    <ol className="list-decimal list-inside space-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <li className={scanning ? 'text-blue-500' : ''}>Device captures fingerprint ID.</li>
                        <li className={scanning ? 'text-blue-500' : ''}>Sends payload to Cloud API.</li>
                        <li className={result ? 'text-blue-500' : ''}>Server validates subscription.</li>
                        <li className={result?.granted ? 'text-green-500' : result ? 'text-red-500' : ''}>Relay triggers gate open/deny.</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
  );
};
