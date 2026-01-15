import React from 'react';
import { Crown } from 'lucide-react';
import { User } from '../../types';
import { Language } from '../../utils/translations';

interface MemberStatsSectionProps {
    member: User;
    daysRemaining: number;
    isExpired: boolean;
    services: any[];
    lang: Language;
    translations: any;
}

export const MemberStatsSection: React.FC<MemberStatsSectionProps> = ({ member, daysRemaining, isExpired, services = [], lang, translations: t }) => {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-md relative overflow-hidden transition-all ${isExpired ? 'bg-red-50 border-red-100' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                <p className="text-gray-400 text-[9px] font-black uppercase mb-1 tracking-widest">{t.days_left}</p>
                <div className="flex items-baseline gap-1">
                    <h2 className={`text-4xl sm:text-5xl font-black ${isExpired ? 'text-red-600' : 'text-gray-900 dark:text-white'} tracking-tighter`}>{daysRemaining}</h2>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Days</span>
                </div>
                <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, (daysRemaining / 30) * 100)}%` }}></div>
                </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md">
                <p className="text-gray-400 text-[9px] font-black uppercase mb-2 tracking-widest">{lang === 'ar' ? 'مميزاتي' : 'PERKS'}</p>
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl border dark:border-slate-700">
                        <p className="text-xl font-black dark:text-white tracking-tighter">{member.perks?.inbodySessions || 0}</p>
                        <p className="text-[7px] text-purple-600 font-black uppercase tracking-widest">InBody</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl border dark:border-slate-700">
                        <p className="text-xl font-black dark:text-white tracking-tighter">{member.perks?.guestPasses || 0}</p>
                        <p className="text-[7px] text-orange-600 font-black uppercase tracking-widest">Guest</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl border dark:border-slate-700">
                        <p className="text-xl font-black dark:text-white tracking-tighter">{member.perks?.ptSessions || 0}</p>
                        <p className="text-[7px] text-blue-600 font-black uppercase tracking-widest">{lang === 'ar' ? 'برايفت' : 'PT'}</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl border dark:border-slate-700 flex flex-col justify-center">
                        <p className="text-xl font-black dark:text-white tracking-tighter">{member.perks?.freeGroupClassCount || 0}</p>
                        <p className="text-[6px] text-green-600 font-black uppercase tracking-tighter line-clamp-1">
                            {member.perks?.freeGroupClassId && services.find(s => String(s.id) === String(member.perks?.freeGroupClassId))
                                ? services.find(s => String(s.id) === String(member.perks?.freeGroupClassId))?.name
                                : (lang === 'ar' ? 'حصص جماعية' : 'Classes')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};