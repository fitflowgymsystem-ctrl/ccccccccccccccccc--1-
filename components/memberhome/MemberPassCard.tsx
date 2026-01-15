import React from 'react';
import { Smartphone, User as UserIcon, Maximize2, ScanLine } from 'lucide-react';
import { User } from '../../types';
import { Language, translations } from '../../utils/translations';

interface MemberPassCardProps {
    member: User;
    lang: Language;
    onEnlarge: (url: string) => void;
}

export const MemberPassCard: React.FC<MemberPassCardProps> = ({ member, lang, onEnlarge }) => {
    const t = translations[lang];
    
    return (
        <div className="bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col items-center">
            {/* User Photo Section */}
            <div className="relative z-10 mb-3">
                <div 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-slate-950 shadow-2xl overflow-hidden bg-slate-950 flex items-center justify-center cursor-zoom-in group relative"
                    onClick={() => member.photoUrl && onEnlarge(member.photoUrl)}
                >
                    {member.photoUrl ? (
                        <>
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Maximize2 size={20} className="text-white" />
                            </div>
                        </>
                    ) : <UserIcon size={32} className="text-slate-700" />}
                </div>
            </div>

            {/* Name & Type */}
            <div className="text-center z-10 mb-3">
                <h3 className="text-base font-black text-white truncate max-w-[150px] uppercase tracking-tight">{member.name}</h3>
                <p className="text-blue-500 text-[9px] font-black tracking-[0.2em] uppercase mt-0.5">{member.membershipType}</p>
            </div>

            {/* --- Barcode Section --- */}
            <div className="w-full bg-white p-3 rounded-xl shadow-inner flex flex-col items-center justify-center min-h-[120px]">
                
                {/* 1. الباركود فقط (بدون أرقام) */}
                <div className="flex flex-col items-center justify-center w-full overflow-hidden h-[130px]">
                   <span 
                        style={{ 
                            fontFamily: "'Libre Barcode 39', cursive", // استخدام الخط الجديد بدون نص
                            transform: "scaleY(12)", // تمطيط قوي جداً للباركود فقط
                            display: "inline-block",
                            transformOrigin: "center"
                        }} 
                        className="text-6xl text-slate-900 whitespace-nowrap select-none"
                    >
                        {`*${member.id}*`}
                    </span>
                </div>

                {/* 2. الأرقام منفصلة بخط عادي وشكل نظيف */}
                <div className="text-slate-900 font-mono font-bold text-sm tracking-[0.5em] mt-2">
                    {member.id}
                </div>

                <div className="mt-2 flex items-center gap-1 text-slate-400 text-[8px] font-black uppercase tracking-tighter">
                    <ScanLine size={10} /> {t.scan_at_gate}
                </div>
            </div>
        </div>
    );
};