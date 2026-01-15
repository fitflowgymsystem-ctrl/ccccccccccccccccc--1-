
import React from 'react';
import { Power, CheckCircle, XCircle, User as UserIcon, CreditCard, Clock } from 'lucide-react';
import { User } from '../../types';
import { Language, translations } from '../../utils/translations';

interface GateFeedbackProps {
    scanning: boolean;
    result: { granted: boolean; message: string; user?: User } | null;
    lang: Language;
}

export const GateFeedback: React.FC<GateFeedbackProps> = ({ scanning, result, lang }) => {
    const t = translations[lang];
    const daysLeft = (expiry: string) => Math.max(0, Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700 h-full flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4 z-10">
                <div className="flex items-center gap-2"><Power size={20} className="text-green-500" /><span className="text-slate-300 font-mono text-sm">DEVICE: GT_01_MAIN</span></div>
                <span className="text-xs text-slate-500 font-mono uppercase">ONLINE</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 z-10 w-full">
                {scanning ? (
                    <div className="space-y-4"><div className="text-blue-400 text-xl font-mono animate-pulse uppercase">Processing...</div><div className="text-slate-500 text-sm">Reading biometric data...</div></div>
                ) : result ? (
                    result.granted && result.user ? (
                        <div className="w-full animate-fade-in-up">
                            <div className="flex flex-col items-center mb-6">
                                <div className="bg-green-500/10 p-4 rounded-full mb-3"><CheckCircle size={48} className="text-green-500" /></div>
                                <h2 className="text-2xl font-bold text-white uppercase">{t.access_granted}</h2>
                                <p className="text-green-400 text-sm font-mono mt-1">{t.gate_opening}</p>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-start shadow-xl">
                                <div className="flex gap-4 items-center mb-4">
                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">{result.user.name.charAt(0)}</div>
                                    <div><h3 className="text-xl font-bold text-white">{result.user.name}</h3><p className="text-sm text-slate-400">{result.user.phone}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-900/50 p-2 rounded-lg"><p className="text-[10px] text-slate-500 uppercase">{t.membership}</p><p className="text-sm font-medium text-blue-300">{result.user.membershipType}</p></div>
                                    <div className="bg-slate-900/50 p-2 rounded-lg"><p className="text-[10px] text-slate-500 uppercase">{t.days_remaining}</p><p className="text-sm font-medium text-green-400">{daysLeft(result.user.expiryDate)} Days</p></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-shake">
                            <XCircle size={80} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2 uppercase">{t.access_denied}</h2>
                            <p className="text-red-400 text-lg font-mono">{lang === 'ar' ? 'انتهى الاشتراك' : result.message}</p>
                        </div>
                    )
                ) : (
                    <div className="text-slate-600"><UserIcon size={48} className="mx-auto mb-4 opacity-20" /><p className="text-lg font-mono uppercase">{t.ready_scan}</p></div>
                )}
            </div>
        </div>
    );
};
