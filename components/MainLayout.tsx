
import React from 'react';
import { Sidebar } from './Sidebar';
import { isNotificationDismissed, dismissGlobalNotificationForUser } from '../services/gymProfileService';
import { Menu, Dumbbell, Megaphone, X } from 'lucide-react';
import { Language } from '../utils/translations';
import { UserRole, UserSession } from '../types';

interface MainLayoutProps {
    children: React.ReactNode;
    currentUser: UserSession;
    lang: Language;
    setLang: (l: Language) => void;
    currentPage: string;
    setCurrentPage: (p: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (v: boolean) => void;
    gymInfo: { name: string, logo: string };
    activeTheme: string;
    globalNotif: any;
    setGlobalNotif: (v: any) => void;
    onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children, currentUser, lang, setLang, currentPage, setCurrentPage,
    isSidebarOpen, setIsSidebarOpen, gymInfo, activeTheme,
    globalNotif, setGlobalNotif, onLogout
}) => {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);
    const [showOnlineToast, setShowOnlineToast] = React.useState(false);

    React.useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowOnlineToast(true);
            setTimeout(() => setShowOnlineToast(false), 3000);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className={`flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-300 app-container`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {!isOnline && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white backdrop-blur-md py-3 px-6 rounded-2xl shadow-2xl z-[9999] animate-slide-down flex items-center justify-center gap-3 border border-red-400/50 min-w-[300px]">
                    <span className="animate-pulse text-lg">⚠️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">
                        {lang === 'ar' ? 'أنت تعمل الآن بدون إنترنت - سيتم المزامنة لاحقاً' : 'You are working offline - syncing later'}
                    </span>
                </div>
            )}
            {showOnlineToast && isOnline && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500/90 text-white backdrop-blur-md py-3 px-6 rounded-2xl shadow-2xl z-[9999] animate-slide-down flex items-center justify-center gap-3 border border-green-400/50 min-w-[300px]">
                    <span className="text-lg">🌐</span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">
                        {lang === 'ar' ? 'تم استعادة الاتصال بالإنترنت' : 'Internet Connection Restored'}
                    </span>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    currentPage={currentPage}
                    onNavigate={setCurrentPage}
                    lang={lang}
                    setLang={setLang}
                    onLogout={onLogout}
                    role={currentUser.role}
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    gymName={gymInfo.name}
                    gymLogo={gymInfo.logo}
                    userId={currentUser.id}
                />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden text-slate-800 dark:text-slate-100 relative">
                    {/* Mobile Header */}
                    <header className="lg:hidden flex items-center justify-between p-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shrink-0 z-40">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><Menu size={20} /></button>
                        <div className="flex items-center gap-1.5"><Dumbbell className="text-blue-600" size={16} /><span className="font-black text-[10px] tracking-tight uppercase">{gymInfo.name}</span></div>
                        <div className="w-8"></div>
                    </header>

                    {/* Desktop Header Removed as Bell moved to Sidebar */}
                    {/* Global Notification Banner Removed - Now handled via NotificationBell */}

                    <div className="flex-1 overflow-auto p-2 sm:p-4 relative">
                        <div className="max-w-7xl mx-auto">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
};
