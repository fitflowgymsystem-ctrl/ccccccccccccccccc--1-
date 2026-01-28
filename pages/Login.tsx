
import React, { useState } from 'react';
import { login } from '../services/gymService';
import { Language } from '../utils/translations';
import { UserSession } from '../types';
import { LoginHeader } from '../components/login/LoginHeader';
import { LoginForm } from '../components/login/LoginForm';
import { LoginFooter } from '../components/login/LoginFooter';

interface LoginProps {
    onLoginSuccess: (session: UserSession, remember: boolean) => void;
    lang: Language;
    gymInfo: { name: string, logo: string };
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, lang, gymInfo }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleLoginSubmit = async (username: string, pass: string, stay: boolean) => {
        setLoading(true);
        setError('');
        try {
            const userSession = await login(username, pass);
            onLoginSuccess(userSession, stay);
        } catch (err) {
            setError(lang === 'en' ? 'Invalid credentials' : 'بيانات الدخول غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-['Inter',_sans-serif]">
            {/* Background Effects - Enhanced and Fixed Position */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* Main Container */}
            <div className="w-full max-w-[400px] relative z-10 animate-scale-in max-h-screen flex flex-col">
                <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden flex flex-col">
                    <LoginHeader lang={lang} gymInfo={gymInfo} />

                    <div className="overflow-y-auto code-scroll flex-1">
                        <LoginForm
                            lang={lang}
                            loading={loading}
                            error={error}
                            isOnline={isOnline}
                            onSubmit={handleLoginSubmit}
                        />
                    </div>

                    <LoginFooter lang={lang} />
                </div>

                <div className="mt-6 text-center">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.6em] pointer-events-none">
                        FitFlow SaaS Enterprise
                    </span>
                </div>
            </div>
        </div>
    );
};
