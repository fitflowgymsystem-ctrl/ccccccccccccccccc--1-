
import React, { useState, useMemo, useEffect } from 'react';
import { X, MessageCircle, Send, CheckCircle2, AlertCircle, Clock, Users } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { User, AccessLog } from '../../types';

interface WhatsAppCampaignModalProps {
    users: User[];
    logs: AccessLog[];
    lang: Language;
    onClose: () => void;
}

export const WhatsAppCampaignModal: React.FC<WhatsAppCampaignModalProps> = ({ users, logs, lang, onClose }) => {
    const t = translations[lang];
    const [target, setTarget] = useState<'ALL' | 'EXPIRED' | 'ACTIVE'>('ALL');
    const [absenceFilter, setAbsenceFilter] = useState<'NONE' | '7' | '14' | '30'>('NONE');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

    const filteredRecipients = useMemo(() => {
        let base = users;

        // 1. Filter by Status
        if (target === 'EXPIRED') base = base.filter(u => new Date(u.expiryDate) < new Date());
        else if (target === 'ACTIVE') base = base.filter(u => new Date(u.expiryDate) >= new Date() && u.isActive);

        // 2. Filter by Absence
        if (absenceFilter !== 'NONE') {
            const now = new Date().getTime();
            const daysInMs = Number(absenceFilter) * 24 * 60 * 60 * 1000;

            base = base.filter(user => {
                const userLogs = logs.filter(l => l.userId === user.id && l.status === 'GRANTED');
                if (userLogs.length === 0) return true; // Never attended = absent
                const lastCheckIn = new Date(userLogs[0].timestamp).getTime();
                return (now - lastCheckIn) >= daysInMs;
            });
        }

        return base;
    }, [users, logs, target, absenceFilter]);

    // Auto-select all when filters change
    React.useEffect(() => {
        setSelectedMembers(filteredRecipients.map(u => u.id));
    }, [filteredRecipients]);

    const toggleMember = (id: number) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => setSelectedMembers(filteredRecipients.map(u => u.id));
    const selectNone = () => setSelectedMembers([]);

    const handleSend = () => {
        if (!message || selectedMembers.length === 0) return;
        setIsSending(true);

        // Get selected users
        const selectedUsers = users.filter(u => selectedMembers.includes(u.id));

        // Send via WhatsApp Web
        selectedUsers.forEach((user, index) => {
            // Replace {name} placeholder with actual name
            const personalizedMessage = message.replace(/\{name\}/g, user.name);

            // Format phone number (remove spaces, dashes, etc.)
            let cleanPhone = user.phone.replace(/\D/g, '');

            // Add Egypt country code (+20) if not present
            if (!cleanPhone.startsWith('20')) {
                cleanPhone = '20' + cleanPhone;
            }

            // WhatsApp Web URL
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;

            // Open with slight delay to avoid browser blocking
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, index * 500); // 500ms delay between each
        });

        // Show success after all links are queued
        setTimeout(() => {
            setIsSending(false);
            setIsSuccess(true);
        }, selectedUsers.length * 500 + 500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-2 sm:p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg md:max-w-4xl border dark:border-slate-700 overflow-hidden animate-scale-in flex flex-col max-h-[95vh] cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Condensed */}
                <div className="px-4 py-3 border-b dark:border-slate-700 flex justify-between items-center bg-green-50 dark:bg-green-900/10">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-600 p-1.5 rounded-lg text-white"><MessageCircle size={16} /></div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-green-900 dark:text-green-300">{t.wa_campaign}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto code-scroll">
                    {isSuccess ? (
                        <div className="text-center py-6 animate-fade-in space-y-3">
                            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-green-600"><CheckCircle2 size={32} /></div>
                            <h4 className="text-lg font-black dark:text-white uppercase">{lang === 'ar' ? 'تم الإرسال!' : 'Campaign Sent!'}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Broadcast delivered to {selectedMembers.length} members.</p>
                            <button onClick={onClose} className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase">Close</button>
                        </div>
                    ) : (
                        <>
                            {/* Filter Section - Status */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ps-1 flex items-center gap-1.5"><Users size={10} /> {t.wa_audience}</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map(opt => (
                                        <button key={opt} onClick={() => setTarget(opt)} className={`py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${target === opt ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-slate-900 text-gray-400 border-transparent'}`}>
                                            {opt === 'ALL' ? t.wa_targets_all : opt === 'ACTIVE' ? t.wa_targets_active : t.wa_targets_expired}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Section - Absence */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ps-1 flex items-center gap-1.5"><Clock size={10} /> {t.wa_absence_label}</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {(['NONE', '7', '14', '30'] as const).map(opt => (
                                        <button key={opt} onClick={() => setAbsenceFilter(opt)} className={`py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${absenceFilter === opt ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-gray-50 dark:bg-slate-900 text-gray-400 border-transparent'}`}>
                                            {opt === 'NONE' ? t.wa_absence_none : opt === '7' ? t.wa_absence_7 : opt === '14' ? t.wa_absence_14 : t.wa_absence_30}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Members List with Checkboxes */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ps-1 flex items-center gap-1.5">
                                        <Users size={10} /> {lang === 'ar' ? 'الأعضاء' : 'Members'} ({filteredRecipients.length})
                                    </label>
                                    <div className="flex gap-1">
                                        <button onClick={selectAll} className="px-2 py-0.5 bg-blue-500 text-white text-[7px] font-black rounded uppercase">
                                            {lang === 'ar' ? 'الكل' : 'All'}
                                        </button>
                                        <button onClick={selectNone} className="px-2 py-0.5 bg-gray-400 text-white text-[7px] font-black rounded uppercase">
                                            {lang === 'ar' ? 'بلا' : 'None'}
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-slate-900 rounded-xl p-2 space-y-1 border dark:border-slate-700">
                                    {filteredRecipients.map(user => (
                                        <label key={user.id} className="flex items-center gap-2 p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(user.id)}
                                                onChange={() => toggleMember(user.id)}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-[10px] font-bold dark:text-white flex-1">{user.name}</span>
                                            <span className="text-[8px] text-gray-400 font-mono">{user.phone}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Message Section */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ps-1">{t.wa_message}</label>
                                <textarea
                                    rows={4}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder={lang === 'ar' ? 'اكتب رسالتك هنا... {name}' : 'Message body... {name}'}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-green-500 shadow-inner dark:text-white resize-none"
                                />
                                <p className="text-[7px] text-gray-400 font-bold uppercase italic leading-tight">{t.wa_variable_note}</p>
                            </div>

                            {/* Recipient Count Badge */}
                            <div className="bg-green-50 dark:bg-green-900/10 p-2.5 rounded-xl border dark:border-slate-700 flex items-center justify-between">
                                <span className="text-[9px] font-black dark:text-gray-300 uppercase tracking-widest">{t.wa_recipients_list}</span>
                                <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-black rounded-lg shadow-sm">{selectedMembers.length}</span>
                            </div>

                            {selectedMembers.length === 0 && (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                    <AlertCircle size={12} />
                                    <span className="text-[8px] font-black uppercase">{t.wa_no_recipients}</span>
                                </div>
                            )}

                            {/* Action Buttons - Side by Side */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={isSending || !message || selectedMembers.length === 0}
                                    className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black shadow-lg shadow-green-600/20 active:scale-95 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send size={14} /> {t.wa_send_all}</>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
