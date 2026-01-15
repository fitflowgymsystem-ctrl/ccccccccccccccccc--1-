import React, { useState } from 'react';
import { X, Search, User as UserIcon, CheckCircle2, Calendar, Hash } from 'lucide-react';
import { GymService, User } from '../../types';
import { Language, translations } from '../../utils/translations';

interface ServicePurchaseModalProps {
    service: GymService;
    users: User[];
    lang: Language;
    onClose: () => void;
    onConfirm: (userId: number) => void;
}

export const ServicePurchaseModal: React.FC<ServicePurchaseModalProps> = ({ service, users, lang, onClose, onConfirm }) => {
    const t = translations[lang];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    ).slice(0, 5);

    return (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-700 flex flex-col animate-scale-in cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 text-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <h3 className="font-black text-xs text-gray-800 dark:text-white uppercase tracking-widest leading-none">
                                {lang === 'ar' ? 'تسجيل اشتراك جديد' : 'Record New Subscription'}
                            </h3>
                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Assigning: {service.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Search Section */}
                    <div className="space-y-2 text-start">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">Search Member (Name or Phone)</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Start typing member name..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-2">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUserId(user.id)}
                                    className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between group ${selectedUserId === user.id
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-700 hover:border-blue-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedUserId === user.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                            <UserIcon size={14} className={selectedUserId === user.id ? 'text-white' : 'text-gray-400'} />
                                        </div>
                                        <div className="text-start">
                                            <p className={`text-xs font-black truncate max-w-[180px] ${selectedUserId === user.id ? 'text-white' : 'dark:text-white'}`}>{user.name}</p>
                                            <p className={`text-[8px] font-bold uppercase ${selectedUserId === user.id ? 'text-white/60' : 'text-gray-400'}`}>{user.phone}</p>
                                        </div>
                                    </div>
                                    {selectedUserId === user.id && <CheckCircle2 size={16} className="text-white" />}
                                </button>
                            ))
                        ) : searchQuery.length > 0 ? (
                            <div className="py-8 text-center opacity-30">
                                <Search size={24} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase">No results found</p>
                            </div>
                        ) : (
                            <div className="py-8 text-center opacity-20">
                                <UserIcon size={24} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase">Start typing to find a member</p>
                            </div>
                        )}
                    </div>

                    {/* Summary Card */}
                    {selectedUserId && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-700 space-y-3 animate-fade-in text-start">
                            <h4 className="text-[8px] font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Hash size={10} /> Subscription Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[7px] font-black text-gray-500 dark:text-gray-400 uppercase">Sessions</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">
                                        {service.pricingType === 'SUBSCRIPTION' ? (lang === 'ar' ? 'غير محدود' : 'Unlimited') : (service.packageSessions || 1)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[7px] font-black text-gray-500 dark:text-gray-400 uppercase">Validity</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{service.validityDays || 0} Days</p>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-blue-100 dark:border-blue-500/30">
                                    <p className="text-[7px] font-black text-gray-500 dark:text-gray-400 uppercase">Total Price</p>
                                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{service.price} EGP</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-slate-950 border-t dark:border-slate-700 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase text-gray-400 tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm">Cancel</button>
                    <button
                        onClick={() => selectedUserId && onConfirm(selectedUserId)}
                        disabled={!selectedUserId}
                        className={`flex-[2] py-3 rounded-2xl font-black text-[11px] uppercase shadow-2xl transition-all flex items-center justify-center gap-3 tracking-[0.2em] ${!selectedUserId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/30 active:scale-95'}`}
                    >
                        {lang === 'ar' ? 'تأكيد العملية' : 'Confirm Purchase'}
                    </button>
                </div>
            </div>
        </div>
    );
};
