import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, CheckSquare, Square, Zap, ShieldAlert } from 'lucide-react';
import { Language, translations } from '../../utils/translations';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface LoginFormProps {
    lang: Language;
    loading: boolean;
    error: string;
    onSubmit: (username: string, pass: string, stay: boolean) => void;
}

type AuthView = 'LOGIN' | 'FORGOT';

export const LoginForm: React.FC<LoginFormProps> = ({ lang, loading, error, onSubmit }) => {
    const t = translations[lang];
    const [view, setView] = useState<AuthView>('LOGIN');

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [stayLoggedIn, setStayLoggedIn] = useState(false);

    // Recovery State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(username, password, stayLoggedIn);
    };

    if (resetSuccess) {
        return (
            <div className="p-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto border border-green-500/20">
                    <CheckSquare size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                        {lang === 'ar' ? 'تم إرسال الرابط' : 'Check Your Email!'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2">
                        {lang === 'ar'
                            ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
                            : 'A password reset link has been sent to your email address.'}
                    </p>
                </div>
                <button
                    onClick={() => { setView('LOGIN'); setResetSuccess(false); }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest mt-4 transition-all"
                >
                    {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </button>
            </div>
        );
    }

    if (view === 'FORGOT') {
        return (
            <ForgotPasswordForm
                lang={lang}
                onSuccess={() => setResetSuccess(true)}
                onCancel={() => setView('LOGIN')}
            />
        );
    }

    // Default: LOGIN View
    return (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 animate-slide-in-right">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[10px] text-center font-bold animate-shake flex items-center justify-center gap-2">
                    <ShieldAlert size={14} /> {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ps-1">{t.username}</label>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <div className="relative flex items-center">
                            <UserIcon className="absolute left-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type="text" required value={username} onChange={e => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/40 border border-white/5 focus:border-blue-500/40 rounded-xl outline-none text-white placeholder-slate-600 transition-all font-semibold text-xs"
                                placeholder="admin / phone / email"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ps-1">{t.password}</label>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-slate-800/40 border border-white/5 focus:border-blue-500/40 rounded-xl outline-none text-white placeholder-slate-600 transition-all font-semibold text-xs"
                                placeholder="••••••"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 text-slate-500 hover:text-white transition-colors">
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center px-1">
                <button type="button" onClick={() => setStayLoggedIn(!stayLoggedIn)} className="flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-wider">
                    {stayLoggedIn ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} />}
                    {lang === 'ar' ? 'ابقني مسجلاً' : 'Stay Active'}
                </button>
                <button type="button" onClick={() => setView('FORGOT')} className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-wider transition-colors">
                    {lang === 'ar' ? 'نسيت؟' : 'Forgot?'}
                </button>
            </div>

            <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-xs transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest relative overflow-hidden group"
            >
                {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>{t.login_btn} <Zap size={14} className="fill-white" /></>
                )}
            </button>
        </form>
    );
};
