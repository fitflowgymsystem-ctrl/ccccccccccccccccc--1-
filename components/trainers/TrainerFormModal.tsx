
import React, { useState } from 'react';
import { X, Save, User as UserIcon, Shield, CreditCard, Briefcase, Dumbbell, Award, History, Lock, Laptop, FileText, Camera, Upload } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { UserRole, Gender, Branch } from '../../types';

interface TeamFormModalProps {
    editingId: number | null;
    initialData: any;
    lang: Language;
    devices: any[];
    error?: string | null;
    isLoading?: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    branches?: Branch[];
}

export const TrainerFormModal: React.FC<TeamFormModalProps> = ({ editingId, initialData, lang, error, isLoading, onClose, onSave, branches = [] }) => {
    const t = translations[lang];
    const [activeTab, setActiveTab] = useState<'BASIC' | 'JOB' | 'SECURITY'>('BASIC');
    const [isScanning, setIsScanning] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        ...initialData,
        gender: initialData.gender || Gender.MALE,
        status: initialData.status || 'active',
        role: initialData.role || UserRole.TRAINER,
        branch: initialData.branch || (branches.length > 0 ? branches[0].name : 'Main Branch')
    });

    const isTrainer = formData.role === UserRole.TRAINER;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderInput = (label: string, field: string, type: string = 'text', placeholder: string = '', required: boolean = false) => (
        <div className="space-y-1">
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{label}</label>
            <input
                type={type}
                required={required}
                placeholder={placeholder}
                value={formData[field as keyof typeof formData] || ''}
                onChange={e => setFormData({ ...formData, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg md:max-w-4xl overflow-hidden border dark:border-slate-700 flex flex-col max-h-[90vh] animate-scale-in cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                            {isTrainer ? <Dumbbell size={18} /> : <Briefcase size={18} />}
                        </div>
                        <div>
                            <h3 className="font-black text-xs text-gray-800 dark:text-white uppercase tracking-widest leading-none">
                                {editingId ? (lang === 'ar' ? 'تعديل البيانات' : 'Edit Member') : (lang === 'ar' ? 'إضافة عضو جديد' : 'Add New Member')}
                            </h3>
                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Team Database Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 rounded-xl transition-all"><X size={20} /></button>
                </div>

                {/* Error Message Display */}
                {(error || localError) && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 animate-shake">
                        <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                            <Shield size={16} />
                        </div>
                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight">{localError || error}</p>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex px-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10">
                    {[
                        { id: 'BASIC', label: lang === 'ar' ? 'البيانات الأساسية' : 'Basic Info', icon: UserIcon },
                        { id: 'JOB', label: lang === 'ar' ? 'البيانات الوظيفية' : 'Job Details', icon: Award },
                        { id: 'SECURITY', label: lang === 'ar' ? 'الحساب والأمن' : 'Account', icon: Shield }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={14} />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {activeTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]"></div>}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto code-scroll flex-1 space-y-6">
                    {activeTab === 'BASIC' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-4 bg-blue-50/30 dark:bg-blue-900/5 p-4 rounded-3xl border dark:border-slate-700/50">
                                <div className="relative w-20 h-20 shrink-0">
                                    <div className="w-full h-full rounded-2xl bg-gray-100 dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                                        {formData.photoUrl ? (
                                            <img src={formData.photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="text-gray-300" size={24} />
                                        )}
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-4 border-white dark:border-slate-800 active:scale-90">
                                        <Upload size={12} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        const img = new Image();
                                                        img.onload = () => {
                                                            const canvas = document.createElement('canvas');
                                                            const size = Math.min(img.width, img.height);
                                                            canvas.width = 400; // Standardize to 400x400
                                                            canvas.height = 400;
                                                            const ctx = canvas.getContext('2d');
                                                            if (ctx) {
                                                                const offsetX = (img.width - size) / 2;
                                                                const offsetY = (img.height - size) / 2;
                                                                ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 400, 400);
                                                                setFormData(prev => ({ ...prev, photoUrl: canvas.toDataURL('image/jpeg', 0.8) }));
                                                            }
                                                        };
                                                        img.src = event.target?.result as string;
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-3">
                                    {renderInput(lang === 'ar' ? 'الاسم بالكامل' : 'Full Name', 'name', 'text', 'Enter name...', true)}
                                    {renderInput(lang === 'ar' ? 'رقم الهوية / الباسبورت' : 'ID / Passport', 'idCardNumber', 'text', '1234567...', true)}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderInput(lang === 'ar' ? 'رقم الهاتف' : 'Phone Number', 'phone', 'tel', '0123...', true)}
                                {renderInput(lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address', 'email', 'email', 'name@example.com', true)}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'العنوان' : 'Residential Address'}</label>
                                <textarea
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 h-20 resize-none"
                                    placeholder="Enter full address..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
                                    <input type="date" value={formData.dob || ''} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الجنس' : 'Gender'}</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none">
                                        <option value={Gender.MALE}>{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                                        <option value={Gender.FEMALE}>{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'الفرع' : 'Branch'}</label>
                                <select
                                    value={formData.branch || ''}
                                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {branches.length > 0 ? (
                                        branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)
                                    ) : (
                                        <option value="Main Branch">Main Branch</option>
                                    )}
                                </select>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-[1.5rem] border border-blue-100 dark:border-blue-900/20">
                                <label className="block text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Lock size={12} /> Current Status</label>
                                <div className="flex gap-2">
                                    {['active', 'inactive'].map(st => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: st as any, isActive: st === 'active' })}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.status === st ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-900 text-gray-400 border dark:border-slate-700'}`}
                                        >
                                            {st === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'JOB' && (
                        <div className="space-y-6 animate-fade-in">
                            {isTrainer ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderInput(lang === 'ar' ? 'التخصص' : 'Specialty', 'specialty', 'text', 'e.g. Bodybuilding...', true)}
                                        {renderInput(lang === 'ar' ? 'سنوات الخبرة' : 'Exp. Years', 'experienceYears', 'number', '0', true)}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderInput(lang === 'ar' ? 'نسبة العمولة %' : 'Commission %', 'commissionRate', 'number', '50', true)}
                                        {renderInput(lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary', 'baseSalary', 'number', '0', true)}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}</label>
                                        <input type="date" value={formData.hireDate || ''} onChange={e => setFormData({ ...formData, hireDate: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none h-[38px]" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'السيرة الذاتية (Short Bio)' : 'Bio / Short Introduction'}</label>
                                        <textarea
                                            value={formData.bio || ''}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none"
                                            placeholder="Tell members about yourself..."
                                        />
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-[1.5rem] border border-purple-100 dark:border-purple-900/20">
                                        <label className="block text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={14} /> Certifications & Qualifications</label>
                                        <textarea
                                            value={formData.certificatesText || (formData.certificates && Array.isArray(formData.certificates) ? formData.certificates.join('\n') : '')}
                                            onChange={e => setFormData({ ...formData, certificatesText: e.target.value, certificates: e.target.value.split('\n').filter(s => s.trim()) })}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20 h-28 resize-none"
                                            placeholder={lang === 'ar' ? 'اكتب أسماء الشهادات هنا (كل سطر يحمل اسم شهادة)...' : 'Type certificate names here (one per line)...'}
                                        />
                                        <p className="text-[7px] text-gray-400 mt-2 uppercase tracking-tighter">Enter names of degrees or courses manually</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderInput(lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title', 'jobTitle', 'text', 'e.g. Receptionist...', true)}
                                        {renderInput(lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary', 'baseSalary', 'number', '0', true)}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ps-1">{lang === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}</label>
                                        <input type="date" value={formData.hireDate || ''} onChange={e => setFormData({ ...formData, hireDate: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none" />
                                    </div>
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/20">
                                        <label className="block text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 ps-1">Role Permissions</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Financials', 'Members', 'Inventory', 'Settings'].map(perm => {
                                                const hasPerm = (formData.permissions || []).includes(perm);
                                                return (
                                                    <label key={perm} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl cursor-pointer border dark:border-slate-800">
                                                        <input
                                                            type="checkbox"
                                                            className="w-3 h-3 rounded"
                                                            checked={hasPerm}
                                                            onChange={e => {
                                                                const current = formData.permissions || [];
                                                                const next = e.target.checked
                                                                    ? [...current, perm]
                                                                    : current.filter((p: string) => p !== perm);
                                                                setFormData({ ...formData, permissions: next });
                                                            }}
                                                        />
                                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{perm}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'SECURITY' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-5 bg-slate-950 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform"><Lock size={80} /></div>
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Laptop size={14} className="text-blue-400" />
                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Portal Credentials</span>
                                    </div>
                                    {renderInput(lang === 'ar' ? 'اسم المستخدم' : 'Username', 'username', 'text', 'Choose a ID...', !editingId)}
                                    {renderInput(lang === 'ar' ? 'كلمة المرور' : 'Password', 'password', 'password', '••••••••', !editingId)}
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-700 text-center space-y-3">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                                    <Shield size={24} className={isScanning ? "animate-pulse" : ""} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-800 dark:text-white uppercase">{isScanning ? (lang === 'ar' ? 'جاري المسح...' : 'Scanning...') : (lang === 'ar' ? 'تسجيل البصمة' : 'Fingerprint Enrollment')}</h4>
                                    <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-widest">{isScanning ? (lang === 'ar' ? 'يرجى وضع الإصبع على الجهاز' : 'Please place finger on scanner') : (lang === 'ar' ? 'امسح بصمة الموظف لتسجيل الحضور' : 'Scan staff biometric ID for attendance')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder={lang === 'ar' ? 'في انتظار الجهاز...' : "Waiting for device..."}
                                            value={formData.fingerprintId || ''}
                                            className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-xl text-[10px] font-mono outline-none transition-all ${isScanning ? 'ring-2 ring-blue-500/20' : ''}`}
                                        />
                                        {isScanning && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isScanning}
                                        onClick={async () => {
                                            setLocalError(null);
                                            if (!(window as any).electronAPI) {
                                                setLocalError(lang === 'ar' ? 'ميزة البصمة تعمل فقط في نسخة الحاسوب!' : 'Biometric feature only works in Desktop version!');
                                                return;
                                            }

                                            setIsScanning(true);
                                            try {
                                                const result = await (window as any).electronAPI.scanBiometric();
                                                if (result.success) {
                                                    setFormData({ ...formData, fingerprintId: result.data.fingerId });
                                                } else {
                                                    setLocalError(lang === 'ar' ? 'فشل المسح: ' + result.error : 'Scan failed: ' + result.error);
                                                }
                                            } catch (err) {
                                                console.error('Scan error:', err);
                                                setLocalError(lang === 'ar' ? 'خطأ تقني في الاتصال بجهاز البصمة' : 'Technical error communicating with scanner');
                                            } finally {
                                                setIsScanning(false);
                                            }
                                        }}
                                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg transition-all active:scale-95 ${isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/20'}`}
                                    >
                                        {isScanning ? (lang === 'ar' ? 'انتظر...' : 'Wait...') : (lang === 'ar' ? 'مسح' : 'Scan')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 dark:bg-slate-950 border-t dark:border-slate-700 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase text-gray-400 tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`flex-[2] py-4 rounded-2xl font-black text-[11px] uppercase shadow-2xl transition-all flex items-center justify-center gap-3 tracking-[0.2em] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/30 active:scale-95'}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={18} /> {editingId ? t.save : (lang === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
