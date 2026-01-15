
import React from 'react';
import { Server, ImageIcon, Upload } from 'lucide-react';

interface GymDetailsSectionProps {
    name: string;
    email: string;
    logo: string;
    setName: (v: string) => void;
    setEmail: (v: string) => void;
    setLogo: (v: string) => void;
}

export const GymDetailsSection: React.FC<GymDetailsSectionProps> = ({ name, email, logo, setName, setEmail, setLogo }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-col h-full">
            <h3 className="text-[10px] font-black dark:text-white mb-4 flex items-center gap-2 uppercase tracking-[0.2em] opacity-60">
                <Server size={14} className="text-blue-500" /> Facility Profile
            </h3>
            <div className="flex items-start gap-4">
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                    {logo ? <img src={logo} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={24} />}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                        <Upload className="text-white" size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const f = e.target.files?.[0];
                            if(f){
                                const r = new FileReader();
                                r.onloadend = () => setLogo(r.result as string);
                                r.readAsDataURL(f);
                            }
                        }} />
                    </label>
                </div>
                <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">Gym Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Iron Palace" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none transition-all shadow-inner" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ps-1">Contact Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@gym.com" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none transition-all shadow-inner" />
                    </div>
                </div>
            </div>
        </div>
    );
};
