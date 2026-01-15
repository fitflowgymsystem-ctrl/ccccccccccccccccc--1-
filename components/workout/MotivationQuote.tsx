
import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Language, translations } from '../../utils/translations';

interface MotivationQuoteProps {
    lang: Language;
}

export const MotivationQuote: React.FC<MotivationQuoteProps> = ({ lang }) => {
    const t = translations[lang];
    const quotes = lang === 'ar' 
        ? ["العرق هو مجرد بكاء الدهون.", "أنت لا تخسر حتى تتوقف عن المحاولة.", "الجسد يحقق ما يؤمن به العقل.", "تحدى نفسك اليوم لتفخر بها غداً."]
        : ["Sweat is just fat crying.", "You don't lose until you stop trying.", "The body achieves what the mind believes.", "Challenge yourself today for a better tomorrow."];
    
    const [quote, setQuote] = useState(quotes[0]);

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, [lang]);

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 sm:p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <Trophy size={50} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-3">{t.motivation}</h4>
            <p className="text-base sm:text-lg font-bold italic leading-relaxed relative z-10">"{quote}"</p>
        </div>
    );
};
