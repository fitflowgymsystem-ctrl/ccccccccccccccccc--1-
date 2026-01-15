import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { requestPasswordReset } from '../../services/authService';
import { Language } from '../../utils/translations';

interface ForgotPasswordFormProps {
    lang: Language;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ lang, onSuccess, onCancel }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await requestPasswordReset(email);
            onSuccess();
        } catch (err: any) {
            console.error("Password Reset Error:", err);

            let msg = '';
            if (err.code === 'auth/user-not-found') {
                msg = lang === 'ar' ? 'البريد الإلكتروني غير مسجل' : 'Email not found';
            } else if (err.code === 'auth/invalid-email') {
                msg = lang === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
            } else {
                msg = err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ، تأكد من البريد الإلكتروني' : 'Error sending Reset Link. Check email.');
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 animate-fade-in">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-1">
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {lang === 'ar'
                    ? 'أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين.'
                    : 'Enter your email to receive a password reset link.'}
            </p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[10px] text-center font-bold animate-shake flex items-center justify-center gap-2">
                    <ShieldAlert size={14} /> {error}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ps-1">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-600/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/40 border border-white/5 focus:border-blue-500/40 rounded-xl outline-none text-white placeholder-slate-600 transition-all font-semibold text-xs"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button" onClick={onCancel}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={14} className={lang === 'ar' ? 'rotate-180' : ''} /> {lang === 'ar' ? 'عودة' : 'Back'}
                </button>
                <button
                    type="submit" disabled={loading}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-[10px] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>{lang === 'ar' ? 'ارسال الرابط' : 'Send Link'} <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} /></>
                    )}
                </button>
            </div>
        </form>
    );
};
