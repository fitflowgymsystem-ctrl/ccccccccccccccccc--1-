import React, { useState, useMemo } from 'react';
import { User, InBodyMeasurement, ActivityLevel, FitnessGoalType, Gender } from '../types';
import { Language, translations } from '../utils/translations';
import {
    Activity, Plus, TrendingUp, TrendingDown, Minus, Scale,
    Flame, X, Calendar, Edit2, Trash2,
    Zap, Ruler, Clock, BarChart3, Percent
} from 'lucide-react';
import { calculateCalories, getLatestMeasurement, getMeasurementProgress } from '../services/inbodyService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InBodyProps {
    member: User;
    lang: Language;
    onAddMeasurement: (userId: number, measurement: Omit<InBodyMeasurement, 'id'>) => Promise<void>;
    onUpdateMeasurement: (userId: number, measurement: InBodyMeasurement) => Promise<void>;
    onDeleteMeasurement: (userId: number, measurementId: number) => Promise<void>;
    onUpdateSettings: (userId: number, activityLevel: ActivityLevel, fitnessGoal: FitnessGoalType) => Promise<void>;
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; labelEn: string; labelAr: string }[] = [
    { value: 'sedentary', labelEn: 'Sedentary (Office Job)', labelAr: 'غير نشط (عمل مكتبي)' },
    { value: 'light', labelEn: 'Light (1-3 days/week)', labelAr: 'نشاط خفيف (1-3 أيام/أسبوع)' },
    { value: 'moderate', labelEn: 'Moderate (3-5 days/week)', labelAr: 'نشاط متوسط (3-5 أيام/أسبوع)' },
    { value: 'active', labelEn: 'Active (6-7 days/week)', labelAr: 'نشاط عالي (6-7 أيام/أسبوع)' },
    { value: 'extra', labelEn: 'Very Active (Athlete)', labelAr: 'نشاط مكثف (رياضي)' },
];

const GOAL_OPTIONS: { value: FitnessGoalType; labelEn: string; labelAr: string }[] = [
    { value: 'lose_fast', labelEn: 'Lose 1 kg/week', labelAr: 'خسارة 1 كجم/أسبوع' },
    { value: 'lose_slow', labelEn: 'Lose 0.5 kg/week', labelAr: 'خسارة 0.5 كجم/أسبوع' },
    { value: 'maintain', labelEn: 'Maintain Weight', labelAr: 'الحفاظ على الوزن' },
    { value: 'gain_slow', labelEn: 'Gain 0.5 kg/week', labelAr: 'زيادة 0.5 كجم/أسبوع' },
    { value: 'gain_fast', labelEn: 'Gain 1 kg/week', labelAr: 'زيادة 1 كجم/أسبوع' },
];

export const InBody: React.FC<InBodyProps> = ({
    member, lang, onAddMeasurement, onUpdateMeasurement, onDeleteMeasurement, onUpdateSettings
}) => {
    const t = translations[lang];
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMeasurement, setEditingMeasurement] = useState<InBodyMeasurement | null>(null);
    const [deletingMeasurement, setDeletingMeasurement] = useState<InBodyMeasurement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>(member.activityLevel || 'moderate');
    const [fitnessGoal, setFitnessGoal] = useState<FitnessGoalType>(member.fitnessGoalType || 'maintain');

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        fatPercentage: '',
        muscleMass: '',
        bmi: '',
        visceralFat: '',
        bodyWater: '',
        metabolicAge: '',
        basalMetabolicRate: '',
        notes: ''
    });

    const measurements = useMemo(() => {
        return [...(member.inbodyMeasurements || [])].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [member.inbodyMeasurements]);

    const latestMeasurement = getLatestMeasurement(member);
    const progress = getMeasurementProgress(member);

    // Calculate age from DOB
    const age = useMemo(() => {
        if (!member.dob) return 30; // Default age if not provided
        const today = new Date();
        const birth = new Date(member.dob);
        let years = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
        return years;
    }, [member.dob]);

    // Calculate calories based on latest measurement and settings
    const calorieData = useMemo(() => {
        const weight = latestMeasurement?.weight || member.weight || 70;
        const height = member.height || 170;
        const fatPct = latestMeasurement?.fatPercentage || member.fatPercentage;
        const bmr = latestMeasurement?.basalMetabolicRate;

        return calculateCalories(
            weight, height, age, member.gender,
            activityLevel, fitnessGoal, fatPct, bmr
        );
    }, [latestMeasurement, member, age, activityLevel, fitnessGoal]);

    const handleSettingsChange = async (newActivity: ActivityLevel, newGoal: FitnessGoalType) => {
        setActivityLevel(newActivity);
        setFitnessGoal(newGoal);
        try {
            await onUpdateSettings(member.id, newActivity, newGoal);
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            weight: '', fatPercentage: '', muscleMass: '', bmi: '',
            visceralFat: '', bodyWater: '', metabolicAge: '', basalMetabolicRate: '', notes: ''
        });
        setEditingMeasurement(null);
    };

    const openEditModal = (measurement: InBodyMeasurement) => {
        setEditingMeasurement(measurement);
        setFormData({
            date: measurement.date,
            weight: String(measurement.weight),
            fatPercentage: String(measurement.fatPercentage),
            muscleMass: String(measurement.muscleMass),
            bmi: String(measurement.bmi),
            visceralFat: String(measurement.visceralFat),
            bodyWater: String(measurement.bodyWater),
            metabolicAge: measurement.metabolicAge ? String(measurement.metabolicAge) : '',
            basalMetabolicRate: measurement.basalMetabolicRate ? String(measurement.basalMetabolicRate) : '',
            notes: measurement.notes || ''
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.weight || !formData.fatPercentage || !formData.muscleMass) return;

        setIsSubmitting(true);
        try {
            const measurementData = {
                date: formData.date,
                weight: parseFloat(formData.weight),
                fatPercentage: parseFloat(formData.fatPercentage),
                muscleMass: parseFloat(formData.muscleMass),
                bmi: parseFloat(formData.bmi) || parseFloat(formData.weight) / Math.pow((member.height || 170) / 100, 2),
                visceralFat: parseFloat(formData.visceralFat) || 0,
                bodyWater: parseFloat(formData.bodyWater) || 0,
                metabolicAge: formData.metabolicAge ? parseInt(formData.metabolicAge) : undefined,
                basalMetabolicRate: formData.basalMetabolicRate ? parseInt(formData.basalMetabolicRate) : undefined,
                notes: formData.notes || undefined
            };

            if (editingMeasurement) {
                await onUpdateMeasurement(member.id, { ...measurementData, id: editingMeasurement.id });
            } else {
                await onAddMeasurement(member.id, measurementData);
            }
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save measurement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (measurementId: number) => {
        setIsDeleting(true);
        try {
            await onDeleteMeasurement(member.id, measurementId);
            setDeletingMeasurement(null);
        } catch (error) {
            console.error('Failed to delete measurement:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Chart data for progress visualization
    const chartData = useMemo(() => {
        const sorted = [...measurements].reverse().slice(-12); // Last 12 measurements
        return sorted;
    }, [measurements]);

    const getMaxValue = (key: 'weight' | 'fatPercentage' | 'muscleMass') => {
        if (chartData.length === 0) return 100;
        return Math.max(...chartData.map(m => m[key])) * 1.1;
    };

    const getMinValue = (key: 'weight' | 'fatPercentage' | 'muscleMass') => {
        if (chartData.length === 0) return 0;
        return Math.min(...chartData.map(m => m[key])) * 0.9;
    };

    return (
        <div className="space-y-4 animate-fade-in pb-20 px-1 sm:px-0">
            {/* Header */}
            <header className="flex justify-between items-center px-1">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase flex items-center gap-2">
                        <Activity className="text-emerald-500" size={24} />
                        {lang === 'ar' ? 'قياسات الجسم' : 'Body Composition'}
                    </h2>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                        {lang === 'ar' ? 'تتبع تقدمك واحسب احتياجاتك الغذائية' : 'Track your progress & calculate nutrition'}
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
                >
                    <Plus size={14} />
                    {lang === 'ar' ? 'إضافة قياس' : 'Add Measurement'}
                </button>
            </header>

            {/* Progress Summary Cards */}
            {latestMeasurement && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Weight Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Scale size={16} className="text-blue-500" />
                            {progress && (
                                <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${progress.weightChange < 0 ? 'text-green-500' : progress.weightChange > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {progress.weightChange < 0 ? <TrendingDown size={12} /> : progress.weightChange > 0 ? <TrendingUp size={12} /> : <Minus size={12} />}
                                    {Math.abs(progress.weightChange)} kg
                                </div>
                            )}
                        </div>
                        <p className="text-2xl font-black dark:text-white">{latestMeasurement.weight} <span className="text-xs text-gray-400">kg</span></p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'الوزن' : 'Weight'}</p>
                    </div>

                    {/* Body Fat Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Percent size={16} className="text-orange-500" />
                            {progress && (
                                <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${progress.fatChange < 0 ? 'text-green-500' : progress.fatChange > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {progress.fatChange < 0 ? <TrendingDown size={12} /> : progress.fatChange > 0 ? <TrendingUp size={12} /> : <Minus size={12} />}
                                    {Math.abs(progress.fatChange)}%
                                </div>
                            )}
                        </div>
                        <p className="text-2xl font-black dark:text-white">{latestMeasurement.fatPercentage}<span className="text-xs text-gray-400">%</span></p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'نسبة الدهون' : 'Body Fat'}</p>
                    </div>

                    {/* Muscle Mass Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Zap size={16} className="text-purple-500" />
                            {progress && (
                                <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${progress.muscleChange > 0 ? 'text-green-500' : progress.muscleChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {progress.muscleChange > 0 ? <TrendingUp size={12} /> : progress.muscleChange < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                                    {Math.abs(progress.muscleChange)} kg
                                </div>
                            )}
                        </div>
                        <p className="text-2xl font-black dark:text-white">{latestMeasurement.muscleMass} <span className="text-xs text-gray-400">kg</span></p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'الكتلة العضلية' : 'Muscle Mass'}</p>
                    </div>

                    {/* BMI Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Ruler size={16} className="text-cyan-500" />
                            <div className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase ${latestMeasurement.bmi < 18.5 ? 'bg-yellow-100 text-yellow-600' :
                                latestMeasurement.bmi < 25 ? 'bg-green-100 text-green-600' :
                                    latestMeasurement.bmi < 30 ? 'bg-orange-100 text-orange-600' :
                                        'bg-red-100 text-red-600'
                                }`}>
                                {latestMeasurement.bmi < 18.5 ? (lang === 'ar' ? 'نحيف' : 'Underweight') :
                                    latestMeasurement.bmi < 25 ? (lang === 'ar' ? 'طبيعي' : 'Normal') :
                                        latestMeasurement.bmi < 30 ? (lang === 'ar' ? 'زيادة' : 'Overweight') :
                                            (lang === 'ar' ? 'سمنة' : 'Obese')}
                            </div>
                        </div>
                        <p className="text-2xl font-black dark:text-white">{latestMeasurement.bmi.toFixed(1)}</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">BMI</p>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Progress Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                        <h3 className="text-[10px] font-black flex items-center gap-2 text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                            <BarChart3 size={14} className="text-emerald-500" />
                            {lang === 'ar' ? 'رسم التقدم' : 'Progress Chart'}
                        </h3>
                    </div>
                    <div className="p-4">
                        {chartData.length > 1 ? (
                            <div className="space-y-4">
                                {/* Modern Recharts Implementation */}
                                <div className="h-64 relative bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-900/50 dark:to-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={localStorage.getItem('theme') === 'dark' ? '#334155' : '#e2e8f0'} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                                                stroke="#94a3b8"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                orientation="left"
                                                stroke="#94a3b8"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#94a3b8"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700">
                                                                <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-wonder">
                                                                    {new Date(label).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </p>
                                                                <div className="space-y-1">
                                                                    {payload.map((entry: any, index: number) => (
                                                                        <div key={index} className="flex items-center gap-2 text-xs font-bold">
                                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                                {entry.name === 'weight' ? (lang === 'ar' ? 'الوزن' : 'Weight') :
                                                                                    entry.name === 'fatPercentage' ? (lang === 'ar' ? 'الدهون' : 'Fat %') :
                                                                                        (lang === 'ar' ? 'العضلات' : 'Muscle')}
                                                                            </span>
                                                                            <span className="ml-auto" style={{ color: entry.color }}>
                                                                                {entry.value} {entry.name === 'fatPercentage' ? '%' : 'kg'}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#3B82F6"
                                                fillOpacity={1}
                                                fill="url(#colorWeight)"
                                                strokeWidth={3}
                                            />
                                            <Area
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="fatPercentage"
                                                stroke="#F97316"
                                                fillOpacity={1}
                                                fill="url(#colorFat)"
                                                strokeWidth={3}
                                            />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="muscleMass"
                                                stroke="#8B5CF6"
                                                fillOpacity={1}
                                                fill="url(#colorMuscle)"
                                                strokeWidth={3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legend with values */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                                        <div>
                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">{lang === 'ar' ? 'الوزن' : 'Weight'}</span>
                                            <p className="text-sm font-black text-blue-700 dark:text-blue-300">{chartData[chartData.length - 1]?.weight} kg</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                                        <div>
                                            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase">{lang === 'ar' ? 'الدهون' : 'Fat %'}</span>
                                            <p className="text-sm font-black text-orange-700 dark:text-orange-300">{chartData[chartData.length - 1]?.fatPercentage}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                        <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                                        <div>
                                            <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase">{lang === 'ar' ? 'العضلات' : 'Muscle'}</span>
                                            <p className="text-sm font-black text-purple-700 dark:text-purple-300">{chartData[chartData.length - 1]?.muscleMass} kg</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-xl">
                                <p className="text-gray-300 dark:text-gray-600 text-[10px] font-black uppercase tracking-widest">
                                    {lang === 'ar' ? 'أضف قياسين على الأقل لعرض الرسم البياني' : 'Add at least 2 measurements to see the chart'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Calorie Calculator */}
                <div className="lg:col-span-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl overflow-hidden shadow-lg text-white">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                        <Flame size={16} />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'حاسبة السعرات' : 'Calorie Calculator'}</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Activity Level */}
                        <div>
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/70 mb-1 block">
                                {lang === 'ar' ? 'مستوى النشاط' : 'Activity Level'}
                            </label>
                            <select
                                value={activityLevel}
                                onChange={(e) => handleSettingsChange(e.target.value as ActivityLevel, fitnessGoal)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                {ACTIVITY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="text-gray-800">
                                        {lang === 'ar' ? opt.labelAr : opt.labelEn}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fitness Goal */}
                        <div>
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/70 mb-1 block">
                                {lang === 'ar' ? 'الهدف' : 'Goal'}
                            </label>
                            <select
                                value={fitnessGoal}
                                onChange={(e) => handleSettingsChange(activityLevel, e.target.value as FitnessGoalType)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                {GOAL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="text-gray-800">
                                        {lang === 'ar' ? opt.labelAr : opt.labelEn}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Calorie Target */}
                        <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/70 mb-1">
                                {lang === 'ar' ? 'السعرات اليومية' : 'Daily Calories'}
                            </p>
                            <p className="text-4xl font-black">{calorieData.targetCalories}</p>
                            <p className="text-[9px] text-white/60 font-bold mt-1">
                                BMR: {calorieData.bmr} | TDEE: {calorieData.tdee}
                            </p>
                        </div>

                        {/* Macros Breakdown */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                                <p className="text-lg font-black">{calorieData.protein}g</p>
                                <p className="text-[7px] font-black uppercase tracking-widest text-white/60">
                                    {lang === 'ar' ? 'بروتين' : 'Protein'}
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                                <p className="text-lg font-black">{calorieData.carbs}g</p>
                                <p className="text-[7px] font-black uppercase tracking-widest text-white/60">
                                    {lang === 'ar' ? 'كارب' : 'Carbs'}
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                                <p className="text-lg font-black">{calorieData.fats}g</p>
                                <p className="text-[7px] font-black uppercase tracking-widest text-white/60">
                                    {lang === 'ar' ? 'دهون' : 'Fats'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Measurement History */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <h3 className="text-[10px] font-black flex items-center gap-2 text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                        <Clock size={14} className="text-blue-500" />
                        {lang === 'ar' ? 'سجل القياسات' : 'Measurement History'}
                    </h3>
                    <span className="text-[8px] font-black text-gray-400 bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
                        {measurements.length} {lang === 'ar' ? 'قياس' : 'Records'}
                    </span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                    {measurements.length > 0 ? measurements.map((m) => (
                        <div key={m.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black dark:text-white">{new Date(m.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                        {m.notes && <p className="text-[9px] text-gray-400 font-medium">{m.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openEditModal(m)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => setDeletingMeasurement(m)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                <div className="text-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-black text-blue-600">{m.weight} kg</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'وزن' : 'Weight'}</p>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-black text-orange-600">{m.fatPercentage}%</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'دهون' : 'Fat'}</p>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-black text-purple-600">{m.muscleMass} kg</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'عضلات' : 'Muscle'}</p>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-black text-cyan-600">{m.bmi.toFixed(1)}</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase">BMI</p>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-black text-teal-600">{m.bodyWater}%</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'ماء' : 'Water'}</p>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-black text-pink-600">{m.visceralFat}</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'دهون البطن' : 'Visceral'}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center">
                            <Activity size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
                            <p className="text-gray-300 dark:text-gray-600 text-[10px] font-black uppercase tracking-widest">
                                {lang === 'ar' ? 'لا توجد قياسات بعد' : 'No measurements yet'}
                            </p>
                            <button onClick={() => { resetForm(); setShowAddModal(true); }} className="mt-3 text-emerald-600 text-[10px] font-black uppercase hover:underline">
                                {lang === 'ar' ? 'أضف أول قياس' : 'Add your first measurement'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Measurement Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-700 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20">
                            <h3 className="text-sm font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Activity size={18} className="text-emerald-600" />
                                {editingMeasurement
                                    ? (lang === 'ar' ? 'تعديل القياس' : 'Edit Measurement')
                                    : (lang === 'ar' ? 'إضافة قياس جديد' : 'Add New Measurement')
                                }
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Date */}
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                    {lang === 'ar' ? 'التاريخ' : 'Date'} *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            {/* Main Measurements Row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                        {lang === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'} *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="75.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                        {lang === 'ar' ? 'الدهون %' : 'Fat %'} *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.fatPercentage}
                                        onChange={(e) => setFormData({ ...formData, fatPercentage: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="18.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                        {lang === 'ar' ? 'العضلات (كجم)' : 'Muscle (kg)'} *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.muscleMass}
                                        onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="32.0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Secondary Measurements Row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">BMI</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.bmi}
                                        onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="24.2"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                        {lang === 'ar' ? 'دهون البطن' : 'Visceral Fat'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.visceralFat}
                                        onChange={(e) => setFormData({ ...formData, visceralFat: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="5"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                        {lang === 'ar' ? 'الماء %' : 'Water %'}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.bodyWater}
                                        onChange={(e) => setFormData({ ...formData, bodyWater: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="55.0"
                                    />
                                </div>
                            </div>

                            {/* Optional Fields Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                        {lang === 'ar' ? 'العمر الأيضي' : 'Metabolic Age'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.metabolicAge}
                                        onChange={(e) => setFormData({ ...formData, metabolicAge: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="28"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                        BMR (kcal)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.basalMetabolicRate}
                                        onChange={(e) => setFormData({ ...formData, basalMetabolicRate: e.target.value })}
                                        className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="1650"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">
                                    {lang === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    rows={2}
                                    placeholder={lang === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {editingMeasurement ? (lang === 'ar' ? 'تحديث القياس' : 'Update Measurement') : (lang === 'ar' ? 'حفظ القياس' : 'Save Measurement')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingMeasurement && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeletingMeasurement(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-700 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <Trash2 size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-black dark:text-white mb-2">
                                {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {lang === 'ar' ? 'هل أنت متأكد من حذف هذا القياس؟' : 'Are you sure you want to delete this measurement?'}
                            </p>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-900 rounded-lg px-3 py-2">
                                {new Date(deletingMeasurement.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                <span className="mx-2">•</span>
                                {deletingMeasurement.weight} kg
                            </p>
                        </div>
                        <div className="flex border-t dark:border-slate-700">
                            <button
                                onClick={() => setDeletingMeasurement(null)}
                                disabled={isDeleting}
                                className="flex-1 py-4 text-gray-600 dark:text-gray-300 font-black text-sm uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                            >
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={() => handleDelete(deletingMeasurement.id)}
                                disabled={isDeleting}
                                className="flex-1 py-4 text-red-500 font-black text-sm uppercase tracking-wide hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-l dark:border-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                                ) : (
                                    lang === 'ar' ? 'حذف' : 'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
