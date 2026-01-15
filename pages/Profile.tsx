
import React, { useState, useEffect } from 'react';
import { UserRole, UserSession, Branch, GymProfile } from '../types';
import { changePassword } from '../services/gymService';
import { getGymProfile, updateGym } from '../services/gymProfileService';
import { Lock, UserCircle, CheckCircle, AlertCircle, Shield, MapPin, Plus, Trash2, Building2 } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { useToast } from '../hooks/useToast';

interface ProfileProps {
    currentUser: UserSession;
    lang: Language;
    reloadProfile?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, lang, reloadProfile }) => {
    const t = translations[lang];
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // --- Multi-Branch State ---
    const [gymProfile, setGymProfile] = useState<GymProfile | null>(null);
    const [newBranch, setNewBranch] = useState({ name: '', address: '' });
    const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
    const isAdmin = currentUser.role === UserRole.ADMIN;

    useEffect(() => {
        if (isAdmin && currentUser.gymId) {
            loadGymProfile();
        }
    }, [isAdmin, currentUser.gymId]);

    const loadGymProfile = async () => {
        const profile = await getGymProfile(currentUser.gymId);
        if (profile) setGymProfile(profile);
    };

    const { showToast } = useToast();

    const handleAddBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gymProfile || !newBranch.name) return;

        const branch: Branch = {
            id: Date.now().toString(),
            name: newBranch.name,
            address: newBranch.address
        };

        const updatedBranches = [...(gymProfile.branches || []), branch];
        try {
            await updateGym(gymProfile.id, { branches: updatedBranches });
            setGymProfile({ ...gymProfile, branches: updatedBranches });
            setNewBranch({ name: '', address: '' });
            if (reloadProfile) reloadProfile();
            showToast(lang === 'ar' ? 'تم إضافة الفرع بنجاح' : 'Branch added successfully', 'success');
        } catch (err) {
            showToast(lang === 'ar' ? 'حدث خطأ أثناء إضافة الفرع' : 'Error adding branch', 'error');
        }
    };

    const confirmDeleteBranch = async () => {
        if (!gymProfile || !gymProfile.branches || !branchToDelete) return;

        const updatedBranches = gymProfile.branches.filter(b => b.id !== branchToDelete.id);
        try {
            await updateGym(gymProfile.id, { branches: updatedBranches });
            setGymProfile({ ...gymProfile, branches: updatedBranches });
            if (reloadProfile) reloadProfile();
            showToast(lang === 'ar' ? 'تم حذف الفرع' : 'Branch deleted', 'success');
        } catch (err) {
            showToast(lang === 'ar' ? 'حدث خطأ أثناء حذف الفرع' : 'Error deleting branch', 'error');
        } finally {
            setBranchToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (passwords.new !== passwords.confirm) {
            showToast(t.pass_mismatch, 'error');
            return;
        }
        if (passwords.new.length < 3) {
            showToast(lang === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password too short', 'error');
            return;
        }
        setLoading(true);
        try {
            await changePassword(currentUser.role, currentUser.id, passwords.new);
            showToast(t.pass_updated, 'success');
            setPasswords({ new: '', confirm: '' });
        }
        catch (error) {
            showToast(lang === 'ar' ? 'حدث خطأ أثناء تحديث كلمة المرور' : 'Error updating password', 'error');
        }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-4 sm:space-y-6 pb-20 px-1">
            <header className="px-1"><h2 className="text-xl sm:text-3xl font-black dark:text-white tracking-tight">{t.profile_title}</h2></header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column: User Card */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-sm border dark:border-slate-700 p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg mb-3 sm:mb-4">{currentUser.name.charAt(0)}</div>
                        <h3 className="text-lg sm:text-xl font-bold dark:text-white">{currentUser.name}</h3>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 uppercase tracking-widest"><Shield size={12} className="text-blue-500" /><span>{currentUser.role}</span></div>
                        {currentUser.username && <div className="mt-3 bg-gray-50 dark:bg-slate-900 py-1.5 px-3 rounded-lg text-[10px] font-mono dark:text-gray-300">@{currentUser.username}</div>}
                    </div>

                    {/* Stats or Info could go here */}
                </div>

                {/* Right Column: Settings */}
                <div className="md:col-span-2 space-y-4 sm:space-y-6">
                    {/* Password Change Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-sm border dark:border-slate-700 p-5 sm:p-8">
                        <h3 className="text-sm sm:text-lg font-bold dark:text-white mb-4 sm:mb-6 flex items-center gap-2 uppercase tracking-widest"><Lock size={18} className="text-blue-500" /> {t.change_password}</h3>
                        {message && <div className={`p-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-2 mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}{message.text}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ps-1">{t.new_password}</label><input type="password" required value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" /></div>
                            <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ps-1">{t.confirm_password}</label><input type="password" required value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border dark:border-slate-700 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" /></div>
                            <div className="pt-2"><button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg active:scale-95 transition-all">{loading ? t.loading : t.save}</button></div>
                        </form>
                    </div>

                    {/* Branch Management Section (Admins Only) */}
                    {isAdmin && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-sm border dark:border-slate-700 p-5 sm:p-8 animate-fade-in">
                            <h3 className="text-sm sm:text-lg font-bold dark:text-white mb-4 sm:mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <Building2 size={18} className="text-purple-500" />
                                {lang === 'ar' ? 'إدارة الفروع' : 'Branch Management'}
                            </h3>

                            {/* Add Branch Form */}
                            <form onSubmit={handleAddBranch} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-slate-700/50 mb-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ps-1">{lang === 'ar' ? 'اسم الفرع' : 'Branch Name'}</label>
                                        <input
                                            type="text"
                                            required
                                            value={newBranch.name}
                                            onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                                            placeholder={lang === 'ar' ? 'مثال: فرع النزهة' : 'e.g. Downtown Branch'}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border dark:border-slate-700 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ps-1">{lang === 'ar' ? 'العنوان' : 'Address'}</label>
                                        <input
                                            type="text"
                                            value={newBranch.address}
                                            onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                                            placeholder={lang === 'ar' ? 'شارع التحرير...' : '123 Street...'}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border dark:border-slate-700 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 shadow-md">
                                    <Plus size={14} /> {lang === 'ar' ? 'إضافة فرع' : 'Add Branch'}
                                </button>
                            </form>

                            {/* Branch List */}
                            <div className="space-y-3">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ps-1">
                                    {lang === 'ar' ? 'الفروع المسجلة' : 'Registered Branches'} ({gymProfile?.branches?.length || 0})
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {gymProfile?.branches && gymProfile.branches.length > 0 ? (
                                        gymProfile.branches.map(branch => (
                                            <div key={branch.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl group hover:border-purple-500/50 transition-all shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black dark:text-white uppercase tracking-tight">{branch.name}</h4>
                                                        {branch.address && <p className="text-[10px] text-gray-400 font-bold">{branch.address}</p>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setBranchToDelete(branch)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-3xl">
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                                                <Building2 size={24} />
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No branches added yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Deletion Confirmation Modal --- */}
            {branchToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-xl font-black dark:text-white mb-2 uppercase tracking-tight">
                                {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                                {lang === 'ar' ? `هل أنت متأكد من رغبتك في حذف فرع "${branchToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete "${branchToDelete.name}" branch? This action cannot be undone.`}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 p-6 pt-0">
                            <button
                                onClick={() => setBranchToDelete(null)}
                                className="py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={confirmDeleteBranch}
                                className="py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/25"
                            >
                                {lang === 'ar' ? 'حذف الفرع' : 'Delete Branch'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
