
import React from 'react';
import { Language } from '../../utils/translations';

interface LoginFooterProps {
    lang: Language;
}

export const LoginFooter: React.FC<LoginFooterProps> = ({ lang }) => {
    return (
        <div className="bg-white/[0.01] p-5 text-center border-t border-white/5 shrink-0">
            <div className="flex flex-col items-center gap-2">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                   {lang === 'ar' ? 'أعضاء الجيم: استخدم رقم الهاتف' : 'Members: Use phone number'}
                </p>
                <div className="flex items-center justify-center gap-3 opacity-30">
                    <span className="h-[1px] w-6 bg-white/20"></span>
                    <span className="text-[8px] text-slate-600 font-mono tracking-[0.3em] uppercase">Core v3.2.1</span>
                    <span className="h-[1px] w-6 bg-white/20"></span>
                </div>
            </div>
        </div>
    );
};
