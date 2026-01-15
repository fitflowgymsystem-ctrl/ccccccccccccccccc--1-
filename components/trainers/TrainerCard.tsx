
import React from 'react';
import { Eye, Edit2, Trash2, Shield, Briefcase, Dumbbell, Award, History } from 'lucide-react';
import { Trainer, Employee, UserRole } from '../../types';
import { Language, translations } from '../../utils/translations';

interface StaffCardProps {
    trainer: Trainer | Employee; // Using trainer as prop name for compatibility
    lang: Language;
    onView: (item: any) => void;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
}

export const TrainerCard: React.FC<StaffCardProps> = ({ trainer, lang, onView, onEdit, onDelete }) => {
    const t = translations[lang];
    const isTrainer = trainer.role === UserRole.TRAINER;
    const isActive = (trainer as any).status === 'active';

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all group relative ${!isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            {/* Role Badge */}
            <div className={`absolute top-4 z-10 ${lang === 'ar' ? 'left-4' : 'right-4'}`}>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${isTrainer ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/40'}`}>
                    {isTrainer ? <Dumbbell size={10} /> : <Briefcase size={10} />}
                    {isTrainer ? (lang === 'ar' ? 'مدرب' : 'Coach') : (lang === 'ar' ? 'موظف' : 'Staff')}
                </div>
            </div>

            <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5">
                    <div className="relative">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-600/20 transform group-hover:rotate-6 transition-transform overflow-hidden ${isTrainer ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                            {trainer.photoUrl ? (
                                <img src={trainer.photoUrl} className="w-full h-full object-cover" />
                            ) : (
                                trainer.name.charAt(0)
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 shadow-sm z-20 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>

                    <div className="text-center sm:text-start min-w-0 flex-1">
                        <h3 className="font-black text-sm sm:text-lg text-gray-800 dark:text-white truncate lg:max-w-[150px]">{trainer.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                            {isTrainer ? (trainer as Trainer).specialty || 'General Coach' : (trainer as Employee).jobTitle || 'Staff Member'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                        <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">{isTrainer ? t.commission_rate : (lang === 'ar' ? 'الراتب' : 'Salary')}</p>
                        <p className="text-sm font-black text-gray-800 dark:text-white">
                            {isTrainer ? `${(trainer as Trainer).commissionRate}%` : `$${(trainer as Employee).baseSalary}`}
                        </p>
                    </div>
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-50 dark:border-blue-900/20 text-center sm:text-start">
                        <p className="text-[8px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-widest mb-1">{lang === 'ar' ? 'الخبرة' : 'Details'}</p>
                        <p className="text-sm font-black text-blue-700 dark:text-blue-300">
                            {isTrainer ? `${(trainer as Trainer).experienceYears}Y` : (trainer as Employee).hireDate?.split('-')[0] || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t dark:border-slate-700/50">
                    <button onClick={() => onView(trainer)} className="flex-1 py-2 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm"><Eye size={14} /> {lang === 'ar' ? 'عرض' : 'View'}</button>
                    <button onClick={() => onEdit(trainer)} className="p-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 shadow-sm"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(trainer)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 shadow-sm"><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
};
