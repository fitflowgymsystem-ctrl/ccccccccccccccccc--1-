
import React from 'react';
import { Trash2, Clock, CheckCircle2, Heart, Activity } from 'lucide-react';
import { Exercise, ExerciseType } from '../../types';
import { Language, translations } from '../../utils/translations';
import { CustomSelect } from '../shared/CustomSelect';

interface ExerciseCardProps {
    exercise: Exercise;
    index: number;
    lang: Language;
    onUpdate: (id: string, updates: Partial<Exercise>) => void;
    onRemove: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index, lang, onUpdate, onRemove }) => {
    const t = translations[lang];

    return (
        <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm group hover:border-blue-300 transition-all relative overflow-hidden">
            <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg whitespace-nowrap">Ex #{index + 1}</span>
                            <CustomSelect
                                label=""
                                value={exercise.type}
                                onChange={val => onUpdate(exercise.id, { type: val as ExerciseType })}
                                options={Object.values(ExerciseType).map(v => ({
                                    label: v,
                                    value: v,
                                    icon: <Activity size={14} className="text-blue-500" />
                                }))}
                                className="!border-none !bg-transparent !p-0 !min-h-0 !shadow-none"
                            />
                        </div>
                        <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => onUpdate(exercise.id, { name: e.target.value })}
                            className="w-full text-lg sm:text-xl font-black bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-gray-300 truncate"
                            placeholder="Exercise Name"
                        />
                    </div>
                    <button onClick={() => onRemove(exercise.id)} className="shrink-0 p-2 text-red-300 hover:text-red-500 transition-colors active:scale-90">
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-[8px] sm:text-[9px] text-gray-400 font-black uppercase mb-2 tracking-widest">{t.sets}</span>
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <button onClick={() => onUpdate(exercise.id, { sets: Math.max(1, exercise.sets - 1) })} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-gray-500 active:scale-90 text-xs">-</button>
                            <span className="text-sm sm:text-lg font-black dark:text-white min-w-[12px] text-center">{exercise.sets}</span>
                            <button onClick={() => onUpdate(exercise.id, { sets: exercise.sets + 1 })} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-gray-500 active:scale-90 text-xs">+</button>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-[8px] sm:text-[9px] text-gray-400 font-black uppercase mb-2 tracking-widest">{t.reps}</span>
                        <input type="text" value={exercise.reps} onChange={(e) => onUpdate(exercise.id, { reps: e.target.value })} className="w-full bg-transparent border-none p-0 text-center text-sm sm:text-lg font-black text-gray-900 dark:text-white focus:ring-0" />
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-[8px] sm:text-[9px] text-gray-400 font-black uppercase mb-2 tracking-widest">{t.weight}</span>
                        <input type="text" value={exercise.weight || '0'} onChange={(e) => onUpdate(exercise.id, { weight: e.target.value })} className="w-full bg-transparent border-none p-0 text-center text-sm sm:text-lg font-black text-gray-900 dark:text-white focus:ring-0" />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Clock size={12} className="text-blue-500" />
                        <span className="hidden xs:inline">{t.rest}:</span>
                        <input type="text" value={exercise.restTime || '60s'} onChange={(e) => onUpdate(exercise.id, { restTime: e.target.value })} className="bg-transparent border-none p-0 w-10 sm:w-12 focus:ring-0 text-[9px] sm:text-[10px] font-black text-gray-600 dark:text-gray-300" />
                    </div>
                    <button
                        onClick={() => onUpdate(exercise.id, { completed: !exercise.completed })}
                        className={`p-2 sm:p-2.5 rounded-xl transition-all active:scale-90 ${exercise.completed ? 'bg-emerald-100 text-emerald-600 shadow-inner' : 'bg-gray-100 text-gray-400 dark:bg-slate-900'}`}
                    >
                        <CheckCircle2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
