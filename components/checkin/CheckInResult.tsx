
import React from 'react';
import { CheckCircle, XCircle, ShieldCheck, User as UserIcon, X, Maximize2 } from 'lucide-react';
import { User, AccessStatus } from '../../types';
import { Language, translations } from '../../utils/translations';

interface CheckInResultProps {
    scan: { user?: User, status: AccessStatus, message: string, isTrainer?: boolean };
    lang: Language;
    onEnlargePhoto: (url: string) => void;
    onReset: () => void;
}

export const CheckInResult: React.FC<CheckInResultProps> = ({ scan, lang, onEnlargePhoto, onReset }) => {
    const t = translations[lang];
    const isGranted = scan.status === AccessStatus.GRANTED;
    const isTrainer = scan.isTrainer;
    const borderColor = isGranted ? (isTrainer ? 'border-blue-500' : 'border-green-500') : 'border-red-500';

    let statusText = isGranted ? (isTrainer ? (lang === 'ar' ? 'أهلاً كابتن' : 'HELLO COACH') : t.access_granted) : t.access_denied;
    if (scan.message === 'USER_NOT_FOUND') statusText = t.checkin_unknown;
    if (scan.message === 'EXPIRED') statusText = t.checkin_expired;
    if (scan.message === 'FROZEN') statusText = t.checkin_frozen;

    return (
        <div className={`h-full flex flex-col items-center justify-center p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-4 ${borderColor} bg-white dark:bg-slate-900 shadow-2xl animate-scale-in`}>
            <div className="flex items-center gap-2 mb-4 sm:mb-8">
                {isGranted ? (isTrainer ? <ShieldCheck size={32} className="text-blue-600" /> : <CheckCircle size={32} className="text-green-500" />) : <XCircle size={32} className="text-red-500" />}
                <h1 className={`text-xl sm:text-4xl font-black uppercase tracking-widest ${isGranted ? (isTrainer ? 'text-blue-600' : 'text-green-500') : 'text-red-500'}`}>{statusText}</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8 w-full max-w-2xl bg-gray-50 dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border dark:border-slate-700 shadow-lg">
                <div className="shrink-0 cursor-zoom-in" onClick={() => scan.user?.photoUrl && onEnlargePhoto(scan.user.photoUrl)}>
                    <div className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full border-4 sm:border-8 ${borderColor} shadow-xl overflow-hidden bg-gray-200 dark:bg-slate-800`}>
                        {scan.user?.photoUrl ? <img src={scan.user.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><UserIcon size={60} /></div>}
                    </div>
                </div>
                <div className="flex-1 text-center md:text-start w-full">
                    {scan.user ? (
                        <>
                            <h2 className="text-xl sm:text-3xl font-bold dark:text-white mb-1">{scan.user.name}</h2>
                            {isTrainer ? (
                                <p className="text-sm sm:text-lg text-blue-600 font-bold uppercase tracking-widest">Staff / Coach Instance</p>
                            ) : (
                                <>
                                    <p className="text-xs sm:text-lg text-gray-500 mb-2 sm:mb-4">{scan.user.phone}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border dark:border-slate-700">
                                            <p className="text-[8px] text-gray-400 uppercase font-bold">Plan</p>
                                            <p className="text-xs sm:text-base font-bold text-blue-600 truncate">{scan.user.membershipType}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border dark:border-slate-700">
                                            <p className="text-[8px] text-gray-400 uppercase font-bold">Expiry</p>
                                            <p className={`text-xs sm:text-base font-bold ${new Date(scan.user.expiryDate) < new Date() ? 'text-red-500' : 'dark:text-white'}`}>{scan.user.expiryDate}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="py-4">
                            <button onClick={onReset} className="px-6 py-2 bg-gray-800 text-white rounded-xl text-xs uppercase font-black tracking-widest">{t.re_scan}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
