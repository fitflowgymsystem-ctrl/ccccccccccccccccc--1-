
import React, { useState, useEffect } from 'react';
import { User, WorkoutPlan, ExerciseType } from '../types';
import { Language, translations } from '../utils/translations';
import { Plus, Calendar, Save, LayoutList, Dumbbell } from 'lucide-react';
import { useWorkoutPlan } from '../hooks/useWorkoutPlan';

// Import split components
import { WaterTracker } from '../components/workout/WaterTracker';
import { MotivationQuote } from '../components/workout/MotivationQuote';
import { ExerciseCard } from '../components/workout/ExerciseCard';

interface WorkoutPlanProps {
  member: User;
  lang: Language;
  onUpdateWorkout: (plan: WorkoutPlan) => void;
  onUpdateWater: (userId: number, amountMl: number) => void;
}

const DAYS_OF_WEEK = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const WorkoutPlanPage: React.FC<WorkoutPlanProps> = ({ member, lang, onUpdateWorkout, onUpdateWater }) => {
  const t = translations[lang];
  const { activeDay, setActiveDay, weeks, setWeeks, tempPlan, actions } = useWorkoutPlan(member, lang);

  const todayStr = new Date().toISOString().split('T')[0];
  const waterLogForToday = member.waterLogs?.find(l => l.date === todayStr);
  const [waterAmount, setWaterAmount] = useState(waterLogForToday?.amountMl || 0);

  useEffect(() => { if (waterLogForToday) setWaterAmount(waterLogForToday.amountMl); }, [member.waterLogs]);

  const currentDayExercises = tempPlan.days.find(d => d.day === activeDay)?.exercises || [];

  return (
    <div className="max-w-full overflow-x-hidden space-y-6 animate-fade-in pb-24 px-2 sm:px-4">
      <header className="flex flex-col gap-1 py-2">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{t.workout_title}</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">{t.workout_subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
            <MotivationQuote lang={lang} />
            <WaterTracker amount={waterAmount} goal={3000} lang={lang} onAdd={(ml) => { const n = waterAmount + ml; setWaterAmount(n); onUpdateWater(member.id, n); }} onReset={() => { setWaterAmount(0); onUpdateWater(member.id, 0); }} />
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] border shadow-lg space-y-5">
                <div className="flex items-center gap-2"><div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-500"><Calendar size={18} /></div><h3 className="font-black text-gray-800 dark:text-white uppercase tracking-wider text-xs sm:text-sm">{lang === 'ar' ? 'إعدادات البرنامج' : 'Plan Settings'}</h3></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">{t.weeks_count}</label><div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 p-2 rounded-2xl border"><button onClick={() => setWeeks(Math.max(1, weeks-1))} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-600">-</button><span className="flex-1 text-center font-black text-base dark:text-white">{weeks}</span><button onClick={() => setWeeks(weeks+1)} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-600">+</button></div></div>
                <button onClick={() => onUpdateWorkout({ ...tempPlan, durationWeeks: weeks })} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.25rem] font-black text-xs shadow-lg flex items-center justify-center gap-2.5 transition-all">
                    <Save size={18} /> {t.save_plan}
                </button>
            </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
            <div className="sticky top-0 z-20 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md -mx-2 px-2 py-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x">
                    {DAYS_OF_WEEK.map(day => (
                        <button key={day} onClick={() => setActiveDay(day)} className={`snap-start shrink-0 px-6 sm:px-8 py-4 sm:py-5 rounded-[1.25rem] font-black text-[10px] transition-all border ${activeDay === day ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105 z-10' : 'bg-white dark:bg-slate-800 text-gray-400 border-gray-100 hover:border-blue-200'}`}>{day.toUpperCase()}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-2"><div className="flex items-center gap-2"><LayoutList size={16} className="text-blue-500" /><h4 className="font-black text-gray-400 text-[9px] uppercase tracking-[0.2em]">{activeDay} - {t.workout_title}</h4></div><button onClick={() => actions.handleAddExercise(activeDay)} className="w-10 h-10 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:rotate-90 transition-all"><Plus size={20} /></button></div>
                {currentDayExercises.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">{currentDayExercises.map((ex, index) => (
                        <ExerciseCard key={ex.id} exercise={ex} index={index} lang={lang} onUpdate={(id, updates) => actions.handleUpdateEx(activeDay, id, updates)} onRemove={(id) => actions.handleRemoveExercise(activeDay, id)} />
                    ))}</div>
                ) : (
                    <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-gray-100"><div className="w-16 h-16 bg-gray-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><Dumbbell size={32} className="text-gray-200" /></div><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.empty_workout}</p></div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
