import React from 'react';
import { Clock, User as UserIcon, Calendar, Hash, Trash2 } from 'lucide-react';
import { ServiceSubscription, User } from '../../types';
import { Language, translations } from '../../utils/translations';

interface SubscriptionLogProps {
    subscriptions: ServiceSubscription[];
    users: User[];
    lang: Language;
    onDelete: (id: number) => void;
}

export const SubscriptionLog: React.FC<SubscriptionLogProps> = ({ subscriptions, users, lang, onDelete }) => {
    const t = translations[lang];

    const getUserName = (userId: number) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 15;

    // Reset to page 1 if subscriptions change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [subscriptions.length]);

    const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
    const paginatedSubscriptions = subscriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 overflow-hidden shadow-xl animate-fade-in">
            <div className="p-6 border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Clock className="text-blue-600" size={18} />
                        {lang === 'ar' ? 'سجل الاشتراكات' : 'User Subscriptions Log'}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Purchase History & session Tracking</p>
                </div>
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{subscriptions.length} {lang === 'ar' ? 'سجل' : 'Records'}</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/30 dark:bg-slate-900/30 border-b dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">{lang === 'ar' ? 'المشترك' : 'Member'}</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">{lang === 'ar' ? 'الخدمة' : 'Service'}</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">{lang === 'ar' ? 'تاريخ الشراء' : 'Purchase Date'}</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">{lang === 'ar' ? 'الجلسات' : 'Sessions'}</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {paginatedSubscriptions.length > 0 ? (
                            paginatedSubscriptions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-900 flex items-center justify-center text-gray-400 border dark:border-slate-700">
                                                <UserIcon size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black dark:text-white truncate max-w-[150px]">{getUserName(sub.userId)}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">ID: #{sub.userId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{sub.serviceName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black dark:text-gray-300">{sub.purchaseDate}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                <Calendar size={8} /> Created
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black dark:text-gray-300">{sub.expiryDate}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                <Clock size={8} /> Deadline
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-xl">
                                            <span className="text-xs font-black text-blue-600">{sub.remainingSessions}</span>
                                            <span className="text-[9px] font-bold text-gray-400">/ {sub.totalSessions}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-100 text-green-600' :
                                            sub.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onDelete(sub.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center opacity-30">
                                        <Clock size={48} className="mb-4 text-gray-400" />
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">{lang === 'ar' ? 'لا توجد بيانات' : 'No Purchase Records Found'}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{lang === 'ar' ? 'سجل اشتراكات السبا والحصص سيظهر هنا' : 'Spa & Group Class subscription history will appear here'}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border dark:border-slate-700 text-[10px] font-bold dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest"
                    >
                        {lang === 'ar' ? 'السابق' : 'Previous'}
                    </button>

                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        {lang === 'ar' ? 'صفحة' : 'Page'} {currentPage} {lang === 'ar' ? 'من' : 'of'} {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg border dark:border-slate-700 text-[10px] font-bold dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest"
                    >
                        {lang === 'ar' ? 'التالي' : 'Next'}
                    </button>
                </div>
            )}
        </div>
    );
};
