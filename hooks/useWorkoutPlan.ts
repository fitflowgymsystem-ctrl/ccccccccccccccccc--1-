
import { useState, useEffect } from 'react';
import { User, WorkoutPlan, Exercise, ExerciseType } from '../types';

const DAYS_OF_WEEK = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const useWorkoutPlan = (member: User, lang: string) => {
    const [activeDay, setActiveDay] = useState('Sat');
    const [weeks, setWeeks] = useState(member.workoutPlan?.durationWeeks || 4);
    const [tempPlan, setTempPlan] = useState<WorkoutPlan>(member.workoutPlan || {
        id: Date.now().toString(),
        title: 'My Custom Plan',
        durationWeeks: 4,
        startDate: new Date().toISOString().split('T')[0],
        days: DAYS_OF_WEEK.map(d => ({ day: d, exercises: [] }))
    });

    const handleAddExercise = (dayName: string) => {
        const newEx: Exercise = {
            id: Math.random().toString(36).substr(2, 9),
            name: lang === 'ar' ? 'تمرين جديد' : 'New Exercise',
            sets: 3, reps: '12', type: ExerciseType.NORMAL, completed: false
        };
        setTempPlan(prev => ({
            ...prev,
            days: prev.days.map(d => d.day === dayName ? { ...d, exercises: [...d.exercises, newEx] } : d)
        }));
    };

    const handleRemoveExercise = (dayName: string, exId: string) => {
        setTempPlan(prev => ({
            ...prev,
            days: prev.days.map(d => d.day === dayName ? { ...d, exercises: d.exercises.filter(ex => ex.id !== exId) } : d)
        }));
    };

    const handleUpdateEx = (dayName: string, exId: string, updates: Partial<Exercise>) => {
        setTempPlan(prev => ({
            ...prev,
            days: prev.days.map(d => d.day === dayName ? { 
                ...d, 
                exercises: d.exercises.map(ex => ex.id === exId ? { ...ex, ...updates } : ex)
            } : d)
        }));
    };

    return {
        activeDay, setActiveDay, weeks, setWeeks, tempPlan,
        actions: { handleAddExercise, handleRemoveExercise, handleUpdateEx }
    };
};
