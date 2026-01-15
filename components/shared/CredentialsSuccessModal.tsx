import React from 'react';
import { X, MessageCircle, CheckCircle2, Copy } from 'lucide-react';
import { Language } from '../../utils/translations';

interface CredentialsSuccessModalProps {
    lang: Language;
    userName: string;
    phone: string;
    email: string;
    password: string;
    gymName: string; // قمت بجعلها إجبارية لضمان وصول اسم الجيم الصحيح
    appUrl?: string;
    onClose: () => void;
}

import { useToast } from '../../hooks/useToast';

export const CredentialsSuccessModal: React.FC<CredentialsSuccessModalProps> = ({
    lang, userName, phone, email, password, gymName, appUrl = window.location.origin, onClose
}) => {
    const { showToast } = useToast();

    const formatPhoneForWhatsApp = (phoneNumber: string): string => {
        if (!phoneNumber) return '';
        let cleaned = phoneNumber.replace(/\D/g, ''); // حذف أي رموز غير الأرقام

        // إذا كان الرقم يبدأ بـ 20 (كود مصر) لا نكرره
        if (cleaned.startsWith('20') && cleaned.length >= 12) {
            return cleaned;
        }

        // إذا كان يبدأ بـ 0، نحذفه ونضيف 20
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        return '20' + cleaned;
    };

    const whatsappPhone = formatPhoneForWhatsApp(phone);

    // تجهيز الرسالة بتنسيق احترافي (النجوم * تجعل الكلام Bold في واتساب)
    const message = lang === 'ar'
        ? `🌟 *تم الاشتراك بنجاح في ${gymName}!* 🌟

يمكنك الآن متابعة تمارينك واشتراكك عبر تطبيقنا.

🔗 *رابط الدخول للموقع:* ${appUrl}

*بيانات الدخول الخاصة بك:*
📱 *رقم الهاتف أو الإيميل:* ${phone}
🔑 *كلمة المرور:* ${password}

*ملاحظة:* يمكنك تغيير كلمة المرور في أي وقت عبر خيار (نسيت كلمة المرور) في صفحة الدخول.`
        : `🌟 *Successfully registered at ${gymName}!* 🌟

You can now track your workouts and membership via our app.

🔗 *App Link:* ${appUrl}

*Your Login Credentials:*
📱 *Phone or Email:* ${phone}
🔑 *Password:* ${password}

*Note:* You can change your password anytime via the (Forgot Password) option.`;

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast(lang === 'ar' ? 'تم النسخ!' : 'Copied!', 'info');
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md md:max-w-2xl overflow-hidden border dark:border-slate-700 animate-scale-in cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-tight">
                                {lang === 'ar' ? 'تم الإنشاء بنجاح!' : 'Created Successfully!'}
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold">
                                {userName} - {gymName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 p-1 hover:text-gray-600 transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30 space-y-3">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            {lang === 'ar' ? 'بيانات الدخول المسجلة' : 'Login Credentials'}
                        </p>

                        <div className="space-y-2">
                            {/* Email Row */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] text-gray-500 font-bold">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}:</span>
                                <div className="flex items-center gap-1">
                                    <code className="text-[10px] font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded">{email}</code>
                                    <button onClick={() => copyToClipboard(email)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded">
                                        <Copy size={12} className="text-blue-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Phone Row */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] text-gray-500 font-bold">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}:</span>
                                <div className="flex items-center gap-1">
                                    <code className="text-[10px] font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded">{phone}</code>
                                    <button onClick={() => copyToClipboard(phone)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded">
                                        <Copy size={12} className="text-blue-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Password Row */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] text-gray-500 font-bold">{lang === 'ar' ? 'كلمة المرور' : 'Password'}:</span>
                                <div className="flex items-center gap-1">
                                    <code className="text-[10px] font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded font-black text-green-600">{password}</code>
                                    <button onClick={() => copyToClipboard(password)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded">
                                        <Copy size={12} className="text-blue-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                        >
                            {lang === 'ar' ? 'إغلاق' : 'Close'}
                        </button>

                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-[2] py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={16} />
                            {lang === 'ar' ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};