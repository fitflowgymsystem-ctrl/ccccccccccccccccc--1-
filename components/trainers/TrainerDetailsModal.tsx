
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Users, Calendar, CheckSquare, Square, DollarSign, User as UserIcon, Award } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { Trainer, User } from '../../types';

interface TrainerDetailsModalProps {
    trainer: Trainer;
    assignedMembers: User[];
    attendanceLogs: any[];
    lang: Language;
    onClose: () => void;
    onViewMember: (id: number) => void;
    onUpdateSchedule: (day: string, type: 'startTime' | 'endTime', value: string) => void;
    onBulkSchedule: (days: string[], start: string, end: string) => void;
}

export const TrainerDetailsModal: React.FC<TrainerDetailsModalProps> = ({ trainer, assignedMembers, attendanceLogs, lang, onClose, onViewMember, onUpdateSchedule, onBulkSchedule }) => {
    const t = translations[lang];
    const isTrainer = trainer.role === 'TRAINER';
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'ATTENDANCE' | 'MEMBERS' | 'SCHEDULE'>('PROFILE');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [bulkStart, setBulkStart] = useState('09:00');
    const [bulkEnd, setBulkEnd] = useState('17:00');

    const weekDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return createPortal(
        <div
            className="fixed top-0 left-0 right-0 bottom-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 cursor-pointer"
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl md:max-w-4xl overflow-hidden flex flex-col h-[85vh] border dark:border-slate-700 animate-fade-in-up cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg overflow-hidden ${isTrainer ? 'bg-blue-600' : 'bg-purple-600'}`}>
                            {trainer.photoUrl ? (
                                <img src={trainer.photoUrl} className="w-full h-full object-cover" />
                            ) : (
                                trainer.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-sm sm:text-lg dark:text-white truncate">{trainer.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isTrainer ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'}`}>
                                    {isTrainer ? (lang === 'ar' ? 'مدرب' : 'Coach') : (lang === 'ar' ? 'موظف' : 'Staff')}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${trainer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><X size={24} /></button>
                </div>

                <div className="flex border-b dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 shrink-0 px-2">
                    {[
                        { id: 'PROFILE', label: lang === 'ar' ? 'الملف الشخصي' : 'Profile' },
                        { id: 'ATTENDANCE', label: lang === 'ar' ? 'الحضور' : 'Attendance' },
                        { id: 'MEMBERS', label: lang === 'ar' ? 'الأعضاء' : 'Members', hidden: !isTrainer },
                        { id: 'SCHEDULE', label: lang === 'ar' ? 'الجدول الأسبوعي' : 'Weekly Schedule' }
                    ].filter(t => !t.hidden).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]"></div>}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 code-scroll">
                    {activeTab === 'PROFILE' && (
                        <div className="space-y-6 animate-fade-in text-start">
                            {/* Stats Grid - Core Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-2xl border dark:border-slate-700/50">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'رقم الهوية' : 'ID Card'}</p>
                                    <p className="text-[10px] font-black dark:text-white">{(trainer as any).idCardNumber || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-2xl border dark:border-slate-700/50">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{isTrainer ? (lang === 'ar' ? 'التخصص' : 'Specialty') : (lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title')}</p>
                                    <p className="text-[10px] font-black dark:text-white truncate">{isTrainer ? (trainer as any).specialty : (trainer as any).jobTitle || 'Staff'}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-2xl border dark:border-slate-700/50">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'الفرع' : 'Branch'}</p>
                                    <p className="text-[10px] font-black dark:text-white truncate">{(trainer as any).branch || 'Main'}</p>
                                </div>
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                    <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</p>
                                    <p className="text-xs font-black text-blue-700 dark:text-blue-300">{(trainer as any).baseSalary || 0} <span className="text-[8px]">EGP</span></p>
                                </div>
                            </div>

                            {/* Job Details Section */}
                            <div className="p-5 bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border dark:border-slate-700/50">
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4 ps-1">
                                    <Award size={14} className="text-blue-500" />
                                    {lang === 'ar' ? 'البيانات الوظيفية' : 'Employment Details'}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}</p>
                                        <p className="text-[10px] font-bold dark:text-white">{(trainer as any).hireDate || 'N/A'}</p>
                                    </div>
                                    {isTrainer && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'سنوات الخبرة' : 'Exp. Years'}</p>
                                                <p className="text-[10px] font-bold dark:text-white">{(trainer as any).experienceYears || 0} {lang === 'ar' ? 'سنوات' : 'Years'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'العمولة' : 'Commission'}</p>
                                                <p className="text-[10px] font-bold text-blue-600">{(trainer as any).commissionRate || 0}%</p>
                                            </div>
                                        </>
                                    )}
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'الحالة' : 'Status'}</p>
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${trainer.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {trainer.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Personal & Contact Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-white dark:bg-slate-900/30 rounded-[2rem] border dark:border-slate-700/50 space-y-4">
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ps-1">
                                        <Users size={14} className="text-emerald-500" />
                                        {lang === 'ar' ? 'البيانات الشخصية' : 'Personal Info'}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}</p>
                                            <p className="text-[10px] font-bold dark:text-white">{(trainer as any).dob || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'الجنس' : 'Gender'}</p>
                                            <p className="text-[10px] font-bold dark:text-white">{(trainer as any).gender || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t dark:border-slate-700/50">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">{lang === 'ar' ? 'العنوان' : 'Address'}</p>
                                        <p className="text-[10px] font-bold dark:text-white/80 shrink-0">{(trainer as any).address || (lang === 'ar' ? 'غير مسجل' : 'Not Registered')}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white dark:bg-slate-900/30 rounded-[2rem] border dark:border-slate-700/50 space-y-4">
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ps-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        {lang === 'ar' ? 'بيانات التواصل والنظام' : 'System & Contact'}
                                    </h4>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                                            <span className="text-[10px] font-black dark:text-white px-2 py-0.5 bg-gray-50 dark:bg-slate-800 rounded-lg">{trainer.phone}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'البريد' : 'Email'}</span>
                                            <span className="text-[10px] font-bold dark:text-white truncate max-w-[140px]">{trainer.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t dark:border-slate-700/50 pt-2.5">
                                            <span className="text-[8px] font-black text-blue-500 uppercase">{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</span>
                                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{(trainer as any).username || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-black text-indigo-500 uppercase">{lang === 'ar' ? 'معرف البصمة' : 'Fingerprint ID'}</span>
                                            <span className="text-[10px] font-mono font-black dark:text-gray-300">{(trainer as any).fingerprintId || 'No Biometric'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            {isTrainer && (trainer as any).bio && (
                                <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/20">
                                    <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 ps-1">{lang === 'ar' ? 'السيرة الذاتية' : 'Biography'}</p>
                                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed ps-1">{(trainer as any).bio}</p>
                                </div>
                            )}

                            {/* Certificates Section */}
                            {isTrainer && trainer.certificates && trainer.certificates.length > 0 && (
                                <div className="p-5 bg-purple-50/30 dark:bg-purple-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-900/20">
                                    <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3 ps-1">{lang === 'ar' ? 'الشهادات والمؤهلات' : 'Certificates & Qualifications'}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {trainer.certificates.map((cert: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 shadow-sm transition-all hover:border-purple-500/30">
                                                <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                                                    <Award size={10} />
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300 truncate">{cert}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Permissions Section (for Employees) */}
                            {!isTrainer && (trainer as any).permissions && (trainer as any).permissions.length > 0 && (
                                <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/20">
                                    <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 ps-1">{lang === 'ar' ? 'الصلاحيات' : 'Permissions'}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(trainer as any).permissions.map((perm: string) => (
                                            <span key={perm} className="px-3 py-1 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-[9px] font-black text-amber-600 uppercase tracking-widest border-amber-100">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ATTENDANCE' && (
                        <div className="space-y-2 animate-fade-in">
                            {attendanceLogs.map(log => (
                                <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 shadow-sm"><Clock size={18} /></div>
                                        <div>
                                            <p className="text-xs font-black dark:text-white">{new Date(log.timestamp).toLocaleDateString()}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-green-500 font-bold uppercase">Time: {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${log.status === 'GRANTED' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <p className="text-[7px] text-gray-400 font-bold uppercase">{log.deviceId}</p>
                                    </div>
                                </div>
                            ))}
                            {attendanceLogs.length === 0 && (
                                <div className="text-center py-20 opacity-20">
                                    <Clock size={48} className="mx-auto mb-3" />
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">No attendance logs found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'MEMBERS' && (
                        <div className="space-y-3 animate-fade-in">
                            {assignedMembers.map(member => (
                                <div
                                    key={member.id}
                                    onClick={() => onViewMember(member.id)}
                                    className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/50 border dark:border-slate-700/50 rounded-[1.5rem] shadow-sm group hover:border-blue-500/50 transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 border dark:border-slate-700">
                                            {member.photoUrl ? <img src={member.photoUrl} className="w-full h-full object-cover" alt="" /> : <UserIcon size={24} className="text-gray-400" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black dark:text-white">{member.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{member.phone}</p>
                                                <span className="text-[8px] text-blue-500/50 dark:text-blue-400/30 font-black uppercase">• {lang === 'ar' ? 'منذ:' : 'Since:'} {member.joinDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black">
                                            <DollarSign size={14} />
                                            <span className="text-base">{member.privateSessionPrice || 0}</span>
                                        </div>
                                        <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{lang === 'ar' ? 'السعر / حصة' : 'Price / Session'}</p>
                                    </div>
                                </div>
                            ))}
                            {assignedMembers.length === 0 && (
                                <div className="text-center py-20 opacity-20">
                                    <Users size={48} className="mx-auto mb-3" />
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">No members assigned yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'SCHEDULE' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 space-y-4 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2"><Calendar size={16} /> Bulk Update Times</h4>
                                <div className="flex flex-wrap gap-2">
                                    {weekDays.map(day => (
                                        <button key={day} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 border ${selectedDays.includes(day) ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-800 text-gray-400 border-gray-100 dark:border-slate-700'}`}>
                                            {selectedDays.includes(day) ? <CheckSquare size={14} /> : <Square size={14} />} {day}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center gap-3 w-full sm:w-auto bg-white dark:bg-slate-950 p-2 rounded-2xl border dark:border-slate-800">
                                        <input type="time" value={bulkStart} onChange={e => setBulkStart(e.target.value)} className="w-28 px-3 py-1.5 bg-transparent text-xs font-black dark:text-white outline-none" />
                                        <span className="text-gray-300">→</span>
                                        <input type="time" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} className="w-28 px-3 py-1.5 bg-transparent text-xs font-black dark:text-white outline-none" />
                                    </div>
                                    <button onClick={() => { onBulkSchedule(selectedDays, bulkStart, bulkEnd); setSelectedDays([]); }} disabled={selectedDays.length === 0} className="w-full sm:w-auto flex-1 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-blue-600/20 disabled:opacity-30 active:scale-95 transition-all">Apply to Days</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {weekDays.map(day => {
                                    const daySchedule = (trainer.schedule || []).find(s => s.day === day);
                                    return (
                                        <div key={day} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{day}</span>
                                            <div className="flex items-center gap-2">
                                                <input type="time" value={daySchedule?.startTime || ''} onChange={(e) => onUpdateSchedule(day, 'startTime', e.target.value)} className="text-[10px] font-black text-blue-600 bg-white dark:bg-slate-800 border dark:border-slate-700/50 rounded-xl px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
                                                <span className="text-gray-300">→</span>
                                                <input type="time" value={daySchedule?.endTime || ''} onChange={(e) => onUpdateSchedule(day, 'endTime', e.target.value)} className="text-[10px] font-black text-blue-600 bg-white dark:bg-slate-800 border dark:border-slate-700/50 rounded-xl px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-slate-950 border-t dark:border-slate-700 shrink-0">
                    <button onClick={onClose} className="w-full py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-all shadow-sm">Close Window</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
