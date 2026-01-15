
import React from 'react';
import { Language, translations } from '../../utils/translations';

interface LoginHeaderProps {
    lang: Language;
    gymInfo: { name: string, logo: string };
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ lang, gymInfo }) => {
    const t = translations[lang];
    
    return (
        <div className="relative p-8 sm:p-10 text-center border-b border-white/5 bg-gradient-to-b from-blue-600/20 via-blue-600/5 to-transparent shrink-0">
            {/* Ambient Glow behind Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 blur-[50px] rounded-full animate-pulse pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6 group">
                    {/* Animated Rotating Outer Ring */}
                    <div className="absolute inset-[-8px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 rounded-full opacity-60 blur-[2px] animate-spin" style={{ animationDuration: '4s' }}></div>
                    
                    {/* Inner Black Border Ring */}
                    <div className="absolute inset-[-4px] bg-slate-900 rounded-full z-[1]"></div>
                    
                    <div className="relative z-[2] w-24 h-24 sm:w-28 sm:h-28 bg-slate-950 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white/10 transition-transform duration-700 group-hover:scale-105">
                        {gymInfo.logo ? (
                            <img 
                                src={gymInfo.logo} 
                                alt={gymInfo.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-4xl font-black italic">
                                {gymInfo.name.charAt(0)}
                            </div>
                        )}
                        
                        {/* Glass Overlap Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                </div>

                <div className="space-y-1 px-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none break-words max-w-[300px] drop-shadow-lg">
                        {gymInfo.name}
                    </h1>
                </div>
            </div>
        </div>
    );
};
