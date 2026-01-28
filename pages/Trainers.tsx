import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Users, Dumbbell, Briefcase, Calendar, DollarSign, Edit2, CheckCircle, Trash2, X, Loader2, Download } from 'lucide-react';
import { Trainer, User, TrainerSchedule, AccessDevice, Employee, UserRole, Branch } from '../types';
import { Language, translations } from '../utils/translations';
import { getDevices } from '../services/gymService';
import { getCurrentGymId } from '../services/storage';
import { useToast } from '../hooks/useToast';
import * as XLSX from 'xlsx';


import { TrainerCard } from '../components/trainers/TrainerCard';
import { TrainerFormModal } from '../components/trainers/TrainerFormModal';
import { TrainerDetailsModal } from '../components/trainers/TrainerDetailsModal';
import { MemberDetailsModal } from '../components/members/MemberDetailsModal';
import { CredentialsSuccessModal } from '../components/shared/CredentialsSuccessModal';

// --- مكونات فرعية للجداول ---
const formatTimeTo12h = (time: string, lang: Language) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? (lang === 'ar' ? 'مساءً' : 'PM') : (lang === 'ar' ? 'صباحاً' : 'AM');
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, '0')} ${period} `;
};

const SchedulePopup: React.FC<{ person: any, lang: Language, onClose: () => void }> = ({ person, lang, onClose }) => {
    const t = translations[lang];
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const daysAr: Record<string, string> = {
        'Sat': 'السبت', 'Sun': 'الأحد', 'Mon': 'الاثنين', 'Tue': 'الثلاثاء',
        'Wed': 'الأربعاء', 'Thu': 'الخميس', 'Fri': 'الجمعة'
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-2 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border dark:border-slate-700 animate-scale-in cursor-default"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg dark:text-white uppercase tracking-widest leading-none">
                                {lang === 'ar' ? 'جدول المواعيد' : 'Work Schedule'}
                            </h3>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-tight mt-1">{person.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5">
                    <div className="space-y-2">
                        {days.map(day => {
                            const sched = (person.schedule || []).find((s: any) => s.day === day);
                            return (
                                <div key={day} className="flex justify-between items-center px-4 py-2.5 rounded-2xl bg-gray-50/80 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 transition-all hover:border-blue-200 dark:hover:border-blue-900/30">
                                    <span className="text-sm font-black uppercase text-gray-500 tracking-wider">
                                        {lang === 'ar' ? daysAr[day] : day}
                                    </span>
                                    {sched ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                                                {formatTimeTo12h(sched.startTime, lang)}
                                            </span>
                                            <span className="text-gray-300 dark:text-gray-600 font-black">-</span>
                                            <span className="text-sm font-mono font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                                                {formatTimeTo12h(sched.endTime, lang)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest opacity-60">
                                            {lang === 'ar' ? 'إجازة' : 'Off Duty'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-3.5 bg-gray-900 dark:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black dark:hover:bg-slate-600 transition-all shadow-lg active:scale-95"
                    >
                        {lang === 'ar' ? 'إغلاق النافذة' : 'Close Schedule'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const ScheduleTab: React.FC<{ allStaff: any[], lang: Language, onOpenDetails: (p: any) => void }> = ({ allStaff, lang, onOpenDetails }) => {
    const t = translations[lang];
    const [filter, setFilter] = useState<'ALL' | 'TRAINER' | 'EMPLOYEE'>('ALL');
    const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

    const filtered = allStaff.filter(p => filter === 'ALL' || p.role === filter);

    return (
        <div className="space-y-4">
            <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
                {['ALL', 'TRAINER', 'EMPLOYEE'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'} `}
                    >
                        {f === 'ALL' ? (lang === 'ar' ? 'الكل' : 'All') : (f === 'TRAINER' ? (lang === 'ar' ? 'المدربون' : 'Coaches') : (lang === 'ar' ? 'الموظفون' : 'Staff'))}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-[10px] font-black uppercase text-gray-400">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                                <th className="px-4 py-2 text-[10px] font-black uppercase text-gray-400">{lang === 'ar' ? 'الصفة' : 'Role'}</th>
                                <th className="px-4 py-2 text-[10px] font-black uppercase text-gray-400">{lang === 'ar' ? 'أيام العمل' : 'Work Days'}</th>
                                <th className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 text-center">{translations[lang].actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-700">
                            {filtered.map(person => (
                                <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-2 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">{person.name[0]}</div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs dark:text-white leading-none mb-1">{person.name}</span>
                                            <span className="text-[9px] text-gray-400 font-bold">{person.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${person.role === 'TRAINER' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'} `}>
                                            {person.role === 'TRAINER' ? (lang === 'ar' ? 'مدرب' : 'Coach') : (lang === 'ar' ? 'موظف' : 'Staff')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => setSelectedPerson(person)}
                                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-gray-300 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-blue-500 transition-all flex items-center gap-2"
                                        >
                                            <Calendar size={10} className="text-blue-600" />
                                            {lang === 'ar' ? 'عرض الجدول' : 'View Schedule'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => onOpenDetails(person)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-all"><Edit2 size={12} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedPerson && <SchedulePopup person={selectedPerson} lang={lang} onClose={() => setSelectedPerson(null)} />}
        </div>
    );
};

interface TrainersProps {
    trainers: Trainer[];
    users: User[];
    employees: Employee[];
    logs: any[];
    lang: Language;
    onAddTrainer: (trainer: Trainer) => void;
    onUpdateTrainer: (trainer: Trainer) => void;
    onDeleteTrainer: (id: number) => void;
    onAddEmployee: (employee: Employee) => void;
    onUpdateEmployee: (employee: Employee) => void;
    onDeleteEmployee: (id: number) => void;
    onUpdateUser?: (u: User) => void;
    onUsePerk?: (userId: number, type: 'InBody' | 'Guest Pass') => void;
    onLogSession?: (userId: number, trainerId: number, price: number) => void;
    isSidebarOpen?: boolean;
    branches?: Branch[];
}

export const Trainers: React.FC<TrainersProps> = ({
    trainers, users, employees, logs, lang,
    onAddTrainer, onUpdateTrainer, onDeleteTrainer,
    onAddEmployee, onUpdateEmployee, onDeleteEmployee,
    onUpdateUser, onUsePerk, onLogSession, isSidebarOpen,
    branches = []
}) => {
    const t = translations[lang];
    const { showToast } = useToast();

    // --- STATES ---
    const [activeTab, setActiveTab] = useState<'TRAINERS' | 'STAFF' | 'SCHEDULES' | 'PAYROLL'>('TRAINERS');
    const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'DETAILS' | 'DELETE'>('NONE');
    const [modalError, setModalError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewId, setViewId] = useState<number | null>(null);
    const [viewMemberId, setViewMemberId] = useState<number | null>(null);
    const [devices, setDevices] = useState<AccessDevice[]>([]);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [successData, setSuccessData] = useState<{ name: string, phone: string, email: string, password: string } | null>(null);

    const [paymentHistory, setPaymentHistory] = useState<Record<number, string>>(() => {
        const saved = localStorage.getItem('gym_payment_history');
        return saved ? JSON.parse(saved) : {};
    });
    const [isPaying, setIsPaying] = useState<number | null>(null);

    useEffect(() => {
        getDevices().then(setDevices);
    }, []);

    useEffect(() => {
        localStorage.setItem('gym_payment_history', JSON.stringify(paymentHistory));
    }, [paymentHistory]);

    const allStaff = useMemo(() => [...trainers, ...employees], [trainers, employees]);

    const currentGymName = useMemo(() => {
        const adminUser = users.find(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN);
        return adminUser?.name || 'FitFlow Gym';
    }, [users]);
    const currentGymId = getCurrentGymId();

    // --- وظيفة تصدير الإكسيل ---
    const exportToExcel = () => {
        const currentMonth = new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

        // تحضير البيانات بالتنسيق المطلوب
        const dataToExport = allStaff.map(person => {
            const p = person as any;
            const rate = p.commissionRate || 0;
            const totalEarned = p.totalCommissionEarned || 0;
            const calculatedComm = (totalEarned * rate) / 100;
            const net = (p.baseSalary || 0) + calculatedComm;
            const currentMonthKey = new Date().toISOString().slice(0, 7);
            const isPaid = paymentHistory[person.id] === currentMonthKey;

            return {
                [lang === 'ar' ? 'الاسم' : 'Name']: person.name,
                [lang === 'ar' ? 'الوظيفة' : 'Role']: person.role,
                [lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary']: p.baseSalary || 0,
                [lang === 'ar' ? 'العمولة المستحقة' : 'Due Commission']: calculatedComm.toFixed(0),
                [lang === 'ar' ? 'نسبة العمولة' : 'Comm. Rate']: `${rate}% `,
                [lang === 'ar' ? 'صافي المبلغ' : 'Net Total']: net.toFixed(0),
                [lang === 'ar' ? 'حالة الدفع' : 'Payment Status']: isPaid ? (lang === 'ar' ? 'تم الدفع' : 'Paid') : (lang === 'ar' ? 'لم يدفع' : 'Unpaid')
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

        // تحميل الملف
        XLSX.writeFile(workbook, `Payroll_${currentMonth.replace(' ', '_')}.xlsx`);
    };

    // --- HANDLERS ---
    const handleOpenAdd = () => { setModalError(null); setEditingId(null); setActiveModal('FORM'); };
    const handleOpenEdit = (item: any) => { setModalError(null); setEditingId(item.id); setActiveModal('FORM'); };
    const handleOpenView = (item: any) => { setViewId(item.id); setActiveModal('DETAILS'); };
    const handleOpenDelete = (item: any) => { setItemToDelete(item); setActiveModal('DELETE'); };

    const handlePaySalary = (id: number) => {
        setIsPaying(id);
        setTimeout(() => {
            const currentMonthKey = new Date().toISOString().slice(0, 7);
            setPaymentHistory(prev => ({ ...prev, [id]: currentMonthKey }));
            setIsPaying(null);
        }, 1000);
    };

    const handleSave = async (formData: any) => {
        setModalError(null);
        if (editingId) {
            if (currentEditingItem?.role === UserRole.TRAINER) onUpdateTrainer({ ...currentEditingItem, ...formData } as Trainer);
            else onUpdateEmployee({ ...currentEditingItem, ...formData } as Employee);
            setActiveModal('NONE');
            showToast(activeTab === 'TRAINERS' ? (lang === 'ar' ? 'تم تحديث البيانات بنجاح' : 'Updated successfully') : (lang === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully'), 'success');
        } else {
            if (!formData.email || !formData.password) {
                setModalError(lang === 'ar' ? 'البريد الإلكتروني وكلمة المرور مطلوبان!' : 'Email and password are required!');
                return;
            }
            setIsSubmitting(true);
            try {
                const { createStaffWithAuth } = await import('../services/userCreationService');
                const roleToAdd = activeTab === 'TRAINERS' ? UserRole.TRAINER : UserRole.EMPLOYEE;
                const result = await createStaffWithAuth(formData, roleToAdd);
                if (roleToAdd === UserRole.TRAINER) onAddTrainer(result.data as Trainer);
                else onAddEmployee(result.data as Employee);
                setActiveModal('NONE');
                setSuccessData({ name: formData.name, phone: formData.phone || '', email: formData.email, password: formData.password });
                if (roleToAdd === UserRole.TRAINER) {
                    showToast(lang === 'ar' ? `تمت إضافة المدرب ${formData.name} إلى النظام` : `Trainer ${formData.name} added to the system`, 'success');
                } else {
                    showToast(lang === 'ar' ? `تمت إضافة الموظف ${formData.name} إلى النظام` : `Staff ${formData.name} added to the system`, 'success');
                }
            } catch (error: any) {
                if (error.message === 'WEAK_PASSWORD') {
                    setModalError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password should be at least 6 characters');
                } else if (error.message === 'EMAIL_EXISTS') {
                    setModalError(lang === 'ar' ? 'البريد الإلكتروني مسجل بالفعل' : 'Email already exists');
                } else {
                    setModalError(lang === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account.');
                }
                showToast(lang === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account', 'error');
            } finally { setIsSubmitting(false); }
        }
    };

    const handleSingleScheduleUpdate = (day: string, type: 'startTime' | 'endTime', value: string) => {
        if (!currentViewItem) return;
        const currentItem = currentViewItem as any;
        const currentSchedule = currentItem.schedule || [];
        const existingIdx = currentSchedule.findIndex((s: any) => s.day === day);
        let newSchedule: TrainerSchedule[];
        if (existingIdx > -1) {
            newSchedule = currentSchedule.map((s: any, i: number) => i === existingIdx ? { ...s, [type]: value } : s);
        } else {
            newSchedule = [...currentSchedule, { day, startTime: type === 'startTime' ? value : '09:00', endTime: type === 'endTime' ? value : '17:00' }];
        }
        if (currentItem.role === UserRole.TRAINER) onUpdateTrainer({ ...currentItem, schedule: newSchedule });
        else onUpdateEmployee({ ...currentItem, schedule: newSchedule });
    };

    const handleBulkScheduleUpdate = (days: string[], start: string, end: string) => {
        if (!currentViewItem) return;
        const currentItem = currentViewItem as any;
        let currentSchedule = [...(currentItem.schedule || [])];
        days.forEach(day => {
            const idx = currentSchedule.findIndex(s => s.day === day);
            if (idx > -1) currentSchedule[idx] = { ...currentSchedule[idx], startTime: start, endTime: end };
            else currentSchedule.push({ day, startTime: start, endTime: end });
        });
        if (currentItem.role === UserRole.TRAINER) onUpdateTrainer({ ...currentItem, schedule: currentSchedule });
        else onUpdateEmployee({ ...currentItem, schedule: currentSchedule });
    };

    const initialTrainerState = {
        name: '', role: UserRole.TRAINER, specialty: '', experienceYears: 0,
        commissionRate: 50, baseSalary: 0, totalCommissionEarned: 0,
        username: '', password: '', phone: '', email: '', status: 'active', isActive: true,
        gender: 'Male' as any, photoUrl: '', hireDate: new Date().toISOString().split('T')[0],
        branch: branches.length > 0 ? branches[0].name : 'Main Branch'
    };

    const initialEmployeeState = {
        name: '', role: UserRole.EMPLOYEE, jobTitle: '', hireDate: new Date().toISOString().split('T')[0],
        baseSalary: 0, username: '', password: '', phone: '', email: '', status: 'active', isActive: true,
        gender: 'Male' as any, photoUrl: '',
        branch: branches.length > 0 ? branches[0].name : 'Main Branch'
    };

    const currentEditingItem = editingId
        ? (trainers.find(t => t.id === editingId) || employees.find(e => e.id === editingId))
        : null;

    const currentViewItem = viewId
        ? (trainers.find(t => t.id === viewId) || employees.find(e => e.id === viewId))
        : null;

    const currentViewMember = useMemo(() => users.find(u => u.id === viewMemberId), [users, viewMemberId]);

    return (
        <>
            <div className="space-y-6 animate-fade-in pb-10">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
                            <Users className="text-blue-600" size={32} />
                            {lang === 'ar' ? 'إدارة الفريق' : 'Team Management'}
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        {activeTab === 'PAYROLL' && (
                            <button
                                onClick={exportToExcel}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 shadow-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                            >
                                <Download size={18} />
                                {lang === 'ar' ? 'تصدير إكسيل' : 'Export Excel'}
                            </button>
                        )}
                        {(activeTab === 'TRAINERS' || activeTab === 'STAFF') && (
                            <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 shadow-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                                <Plus size={18} />
                                {activeTab === 'TRAINERS' ? (lang === 'ar' ? 'إضافة مدرب' : 'Add Coach') : (lang === 'ar' ? 'إضافة موظف' : 'Add Employee')}
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border dark:border-slate-700 w-fit overflow-x-auto max-w-full">
                    <button onClick={() => setActiveTab('TRAINERS')} className={`flex items - center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace - nowrap ${activeTab === 'TRAINERS' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'} `}>
                        <Dumbbell size={16} /> {lang === 'ar' ? 'المدربون' : 'Coaches'}
                    </button>
                    <button onClick={() => setActiveTab('STAFF')} className={`flex items - center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace - nowrap ${activeTab === 'STAFF' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'} `}>
                        <Briefcase size={16} /> {lang === 'ar' ? 'الموظفون' : 'Staff'}
                    </button>
                    <button onClick={() => setActiveTab('SCHEDULES')} className={`flex items - center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace - nowrap ${activeTab === 'SCHEDULES' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'} `}>
                        <Calendar size={16} /> {lang === 'ar' ? 'المواعيد' : 'Schedules'}
                    </button>
                    <button onClick={() => setActiveTab('PAYROLL')} className={`flex items - center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace - nowrap ${activeTab === 'PAYROLL' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'} `}>
                        <DollarSign size={16} /> {lang === 'ar' ? 'الرواتب والماليات' : 'Payroll'}
                    </button>
                </div>

                {(activeTab === 'TRAINERS' || activeTab === 'STAFF') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(activeTab === 'TRAINERS' ? trainers : employees).map(person => (
                            <TrainerCard key={person.id} trainer={person as any} lang={lang} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
                        ))}
                    </div>
                )}

                {activeTab === 'SCHEDULES' && <ScheduleTab allStaff={allStaff} lang={lang} onOpenDetails={handleOpenView} />}

                {activeTab === 'PAYROLL' && (
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border dark:border-slate-700 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">{lang === 'ar' ? 'الأساسي' : 'Base'}</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">{lang === 'ar' ? 'العمولة المستحقة' : 'Due Comm.'}</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">{lang === 'ar' ? 'صافي الراتب' : 'Net Salary'}</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {allStaff.map(person => {
                                        const p = person as any;
                                        const rate = p.commissionRate || 0;
                                        const totalEarned = p.totalCommissionEarned || 0;
                                        const calculatedComm = (totalEarned * rate) / 100;
                                        const net = (p.baseSalary || 0) + calculatedComm;
                                        const currentMonthKey = new Date().toISOString().slice(0, 7);
                                        const isPaid = paymentHistory[person.id] === currentMonthKey;

                                        return (
                                            <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-sm dark:text-white">{person.name}</td>
                                                <td className="px-6 py-4 text-sm dark:text-gray-300">{p.baseSalary || 0}</td>
                                                <td className="px-6 py-4 text-sm text-green-500 font-bold">+{calculatedComm.toFixed(0)} <span className="text-[9px] opacity-60">({rate}%)</span></td>
                                                <td className="px-6 py-4 font-black text-sm text-blue-600 dark:text-blue-400">{net.toFixed(0)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        disabled={isPaid || isPaying === person.id}
                                                        onClick={() => handlePaySalary(person.id)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items - center gap-2 mx-auto transition-all ${isPaid
                                                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed border dark:border-slate-600'
                                                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95'
                                                            } `}
                                                    >
                                                        {isPaying === person.id ? <Loader2 size={12} className="animate-spin" /> : (isPaid ? <CheckCircle size={12} /> : null)}
                                                        {isPaid ? (lang === 'ar' ? 'تم الدفع' : 'PAID') : (lang === 'ar' ? 'دفع الراتب' : 'PAY NOW')}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            {activeModal === 'FORM' && (
                <TrainerFormModal
                    editingId={editingId}
                    initialData={currentEditingItem ? currentEditingItem : (activeTab === 'TRAINERS' ? initialTrainerState : initialEmployeeState)}
                    lang={lang} devices={devices} error={modalError} isLoading={isSubmitting}
                    branches={branches}
                    onClose={() => setActiveModal('NONE')} onSave={handleSave}
                />
            )}

            {activeModal === 'DETAILS' && currentViewItem && (
                <TrainerDetailsModal
                    trainer={currentViewItem as Trainer}
                    assignedMembers={currentViewItem.role === UserRole.TRAINER ? users.filter(u => Number(u.assignedTrainerId) === Number(currentViewItem.id)) : []}
                    attendanceLogs={logs.filter(l => Number(l.userId) === Number(currentViewItem.id)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
                    lang={lang} onClose={() => setActiveModal('NONE')}
                    onViewMember={(id) => setViewMemberId(id)}
                    onUpdateSchedule={handleSingleScheduleUpdate}
                    onBulkSchedule={handleBulkScheduleUpdate}
                />
            )}

            {viewMemberId && currentViewMember && (
                <MemberDetailsModal
                    member={currentViewMember} logs={logs} trainers={trainers} lang={lang}
                    onClose={() => setViewMemberId(null)}
                    onUsePerk={onUsePerk || (() => { })}
                    onLogSession={onLogSession || (() => { })}
                    onUpdateMember={onUpdateUser || (() => { })}
                />
            )}

            {activeModal === 'DELETE' && itemToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl border dark:border-slate-700 animate-scale-in">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 ring-4 ring-red-500/10">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="font-black text-lg dark:text-white mb-2 uppercase tracking-tighter">{lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm Removal?'}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"><b>{itemToDelete.name}</b></p>
                        <div className="flex gap-3">
                            <button onClick={() => { setActiveModal('NONE'); setItemToDelete(null); }} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">{t.cancel}</button>
                            <button onClick={() => { if (itemToDelete.role === UserRole.TRAINER) onDeleteTrainer(itemToDelete.id); else onDeleteEmployee(itemToDelete.id); setActiveModal('NONE'); setItemToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-600/20 text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95">{lang === 'ar' ? 'حذف نهائي' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}

            {successData && (
                <CredentialsSuccessModal
                    lang={lang} userName={successData.name} phone={successData.phone || 'N/A'}
                    email={successData.email} password={successData.password} gymName={currentGymName}
                    onClose={() => setSuccessData(null)}
                />
            )}
        </>
    );
};
