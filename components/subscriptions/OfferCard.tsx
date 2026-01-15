
import React from 'react';
import { Tag, Calendar, Trash2 } from 'lucide-react';
import { Offer } from '../../types';
import { Language, translations } from '../../utils/translations';

interface OfferCardProps {
    offer: Offer;
    lang: Language;
    onDelete: (offer: Offer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, lang, onDelete }) => {
    const t = translations[lang];

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm border border-purple-50 dark:border-purple-900/20 relative group overflow-hidden hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-50 dark:from-purple-900/10 to-transparent rounded-bl-[3rem] -mr-6 -mt-6"></div>
            <div className="flex justify-between items-start relative z-10">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Tag size={12} className="text-purple-600 dark:text-purple-400" />
                        <span className="font-black text-[10px] sm:text-xs text-gray-800 dark:text-white uppercase tracking-widest truncate">{offer.title}</span>
                    </div>
                    <div className="bg-purple-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-dashed border-purple-200 dark:border-purple-800/50 inline-block">
                         <div className="text-base sm:text-xl font-black text-purple-700 dark:text-purple-300 tracking-[0.2em]">
                             {offer.code}
                         </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-gray-400">
                        <Calendar size={10} />
                        <p className="text-[9px] font-bold uppercase tracking-tighter">
                            {t.offer_expiry}: {offer.validUntil}
                        </p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <div className="text-xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tighter">
                        {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                    </div>
                    <div className="text-[8px] font-black text-purple-300 uppercase tracking-[0.2em]">Discount OFF</div>
                    <button 
                        onClick={() => onDelete(offer)}
                        className="mt-4 p-2 text-red-300 hover:text-red-500 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
