
import React, { useEffect, useRef } from 'react';
import { Fingerprint, Loader2, Volume2, VolumeX, X } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { CheckInResult } from '../components/checkin/CheckInResult';
import { ManualEntryForm } from '../components/checkin/ManualEntryForm';
import { ScanHistoryList } from '../components/checkin/ScanHistoryList';
import { useCheckIn } from '../hooks/useCheckIn';

interface CheckInProps {
    lang: Language;
    onCheckIn?: () => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ lang, onCheckIn }) => {
    const t = translations[lang];
    const { state, actions } = useCheckIn(lang, onCheckIn);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(window.innerWidth >= 1024) inputRef.current?.focus();
    }, []);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        actions.processCheckIn(state.input);
    };

    return (
        <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in overflow-hidden relative p-1">
            <div className="lg:col-span-2 h-full flex flex-col">
                 <div className="flex-1 bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl p-3 sm:p-4 border dark:border-slate-700 relative overflow-hidden">
                     {state.isProcessing ? (
                         <div className="flex flex-col items-center justify-center h-full space-y-4">
                             <Loader2 size={60} className="text-blue-600 animate-spin" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 animate-pulse">Processing Signal...</p>
                         </div>
                     ) : state.currentScan ? (
                         <CheckInResult scan={state.currentScan} lang={lang} onEnlargePhoto={actions.setEnlargedPhotoUrl} onReset={actions.resetScan} />
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-300 opacity-60">
                             <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center mb-6">
                                 <Fingerprint size={60} strokeWidth={1} />
                             </div>
                             <h2 className="text-2xl font-black uppercase tracking-widest text-center">{t.ready_scan}</h2>
                             <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">Waiting for IoT Signal</p>
                         </div>
                     )}
                     <button onClick={() => actions.setSoundEnabled(!state.soundEnabled)} className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-700 shadow-sm transition-all hover:scale-110">
                        {state.soundEnabled ? <Volume2 size={16} className="text-blue-600" /> : <VolumeX size={16} className="text-red-500" />}
                     </button>
                 </div>
            </div>

            <div className="lg:col-span-1 h-full flex flex-col gap-4 sm:gap-6">
                <ManualEntryForm input={state.input} setInput={actions.setInput} onSubmit={handleManualSubmit} inputRef={inputRef} lang={lang} />
                <ScanHistoryList history={state.history} onClear={actions.clearHistory} lang={lang} />
            </div>

            {state.enlargedPhotoUrl && (
                <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => actions.setEnlargedPhotoUrl(null)}>
                    <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full"><X size={32} /></button>
                    <img src={state.enlargedPhotoUrl} className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl animate-scale-in" />
                </div>
            )}
        </div>
    );
};
