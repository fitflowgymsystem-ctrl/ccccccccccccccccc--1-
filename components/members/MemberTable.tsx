
import React from 'react';
import { Eye, Edit, Trash2, User as UserIcon, Calendar, AlertCircle, Clock, Wallet } from 'lucide-react';
import { User } from '../../types';
import { Language, translations } from '../../utils/translations';

interface MemberTableProps {
    users: User[];
    lang: Language;
    onView: (id: number) => void;
    onEdit: (user: User) => void;
    onDelete: (user: { id: number, name: string }) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ users, lang, onView, onEdit, onDelete }) => {
    const t = translations[lang];

    const getStatusConfig = (user: User) => {
        const isExpired = new Date(user.expiryDate) < new Date();

        if (user.isFrozen) {
            return {
                label: lang === 'ar' ? 'مجمد' : 'Frozen',
                className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            };
        }
        if (!user.isActive) {
            return {
                label: t.inactive,
                className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            };
        }
        if (isExpired) {
            return {
                label: lang === 'ar' ? 'منتهي' : 'Expired',
                className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
            };
        }
        return {
            label: t.active,
            className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
        };
    };

    return (
        <div className="overflow-x-auto code-scroll">
            <table className="w-full text-start border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-gray-50/30 dark:bg-slate-900/30 text-gray-400 text-[7px] uppercase font-black tracking-[0.2em] border-b dark:border-slate-700">
                        <th className="px-4 py-3 text-start">{t.name}</th>
                        <th className="px-4 py-3 text-start hidden sm:table-cell">{t.membership}</th>
                        <th className="px-4 py-3 text-start hidden md:table-cell">{t.join_date}</th>
                        <th className="px-4 py-3 text-start">{t.renewal_date}</th>
                        <th className="px-4 py-3 text-center">{t.status}</th>
                        <th className="px-4 py-3 text-end">{t.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    {users.map(user => {
                        const status = getStatusConfig(user);
                        const isExpired = new Date(user.expiryDate) < new Date();

                        return (
                            <tr
                                key={user.id}
                                onClick={() => onView(user.id)}
                                className="hover:bg-blue-50/10 dark:hover:bg-slate-700/20 transition-all group animate-fade-in cursor-pointer"
                            >
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                                            {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-gray-400">{user.name.charAt(0)}</span>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[13px] text-gray-800 dark:text-white uppercase tracking-tighter truncate leading-none">{user.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold font-mono tracking-tight mt-1">{user.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 hidden sm:table-cell">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 w-fit">
                                            {user.membershipType}
                                        </span>
                                        {user.installmentPlans && user.installmentPlans.length > 0 && (
                                            <span className="flex items-center gap-1 text-[7px] font-black text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded-full border border-orange-100 dark:border-orange-800/30 w-fit uppercase tracking-tighter">
                                                <Wallet size={8} /> {lang === 'ar' ? 'تقسيط' : 'Installment'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 hidden md:table-cell">
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                        <Clock size={10} />
                                        <span className="font-mono">{user.joinDate}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${isExpired ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                        <Calendar size={10} className={isExpired ? 'text-red-400' : 'text-gray-400'} />
                                        <span className="font-mono">{user.expiryDate}</span>
                                        {isExpired && !user.isFrozen && <AlertCircle size={10} className="text-red-500 animate-pulse" />}
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-sm ${status.className}`}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onView(user.id); }}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            title="View"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(user); }}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete({ id: user.id, name: user.name }); }}
                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
