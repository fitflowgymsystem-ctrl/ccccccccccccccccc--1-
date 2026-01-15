import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { getAllGyms } from '../../services/gymProfileService';

interface BroadcastModalProps {
    onClose: () => void;
    onSend: (notif: any) => void;
    lang: Language;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ onClose, onSend, lang }) => {
    const t = translations[lang];
    const [notifData, setNotifData] = useState({
        title: lang === 'ar' ? 'صيانة النظام' : 'System Maintenance',
        message: lang === 'ar' ? 'سيكون النظام تحت الصيانة الليلة في تمام الساعة 12:00 صباحاً.' : 'The system will be under maintenance tonight at 12:00 AM UTC.',
        type: 'info' as 'info' | 'warning' | 'urgent'
    });
    const [gyms, setGyms] = useState<Array<any>>([]);
    const [targetGymId, setTargetGymId] = useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        getAllGyms().then(list => { if (mounted) setGyms(list || []); }).catch(() => { });
        return () => { mounted = false; };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend({ ...notifData, targetGymId });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1100] flex items-center justify-center p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl w-full max-w-lg border dark:border-slate-700 animate-fade-in-up overflow-hidden cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 border-b dark:border-slate-700 flex justify-between items-center bg-amber-50 dark:bg-amber-900/20">
                    <div>
                        <h3 className="font-black text-2xl text-amber-900 dark:text-amber-100 uppercase tracking-tighter">{t.dev_broadcast_title}</h3>
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-1">{t.dev_broadcast_sub}</p>
                    </div>
                    <button onClick={onClose} className="text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 p-2 rounded-full transition-all"><X size={28} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ps-1">{lang === 'ar' ? 'الوجهة' : 'Target'}</label>
                            <select value={targetGymId ?? ''} onChange={(e) => setTargetGymId(e.target.value || null)} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-none rounded-2xl text-sm font-bold outline-none">
                                <option value="">{lang === 'ar' ? 'جميع الصالات' : 'All Gyms'}</option>
                                {gyms.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ps-1">{t.dev_alert_level}</label>
                            <div className="flex gap-2">
                                {(['info', 'warning', 'urgent'] as const).map(type => (
                                    <button key={type} type="button" onClick={() => setNotifData({ ...notifData, type })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${notifData.type === type ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-gray-50 dark:bg-slate-900 text-gray-400 border-transparent'}`}>
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ps-1">{t.dev_alert_title}</label>
                            <input required type="text" value={notifData.title} onChange={e => setNotifData({ ...notifData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 shadow-inner dark:text-white" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ps-1">{t.wa_message}</label>
                            <textarea required rows={4} value={notifData.message} onChange={e => setNotifData({ ...notifData, message: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 shadow-inner dark:text-white resize-none" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-900/40 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                        <Megaphone size={18} /> {t.dev_launch_broadcast}
                    </button>
                </form>
            </div>
        </div>
    );
};