
import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { ShieldAlert, CreditCard } from 'lucide-react';
import { getGymProfile } from './services/gymService';
import { UserSession, UserRole, GymProfile } from './types';
import { Language } from './utils/translations';
import { useGymData } from './hooks/useGymData';
import { fetchRecentBroadcasts, isNotificationDismissed } from './services/gymProfileService';
import { THEMES } from './constants/themes';
import { MainLayout } from './components/MainLayout';
import { AppRouter } from './components/AppRouter';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
    const [gymProfile, setGymProfile] = useState<GymProfile | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [lang, setLang] = useState<Language>('en');
    const [isSubExpired, setIsSubExpired] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem('appTheme') || 'blue');
    const [globalNotif, setGlobalNotif] = useState<any>(() => {
        try {
            const saved = localStorage.getItem('fitflow_global_alert');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

    const [gymInfo, setGymInfo] = useState({
        name: localStorage.getItem('gymName') || 'FitFlow System',
        logo: localStorage.getItem('gymLogo') || '',
        email: localStorage.getItem('gymEmail') || '',
    });

    const { data, refreshData, actions } = useGymData(currentUser, isSubExpired);

    useEffect(() => {
        const savedSession = localStorage.getItem('fitflow_session');
        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                setCurrentUser(parsed);
            } catch (e) {
                localStorage.clear();
            }
        }
        if (localStorage.getItem('darkMode') === 'true') document.documentElement.classList.add('dark');
    }, []);

    useEffect(() => {
        if (currentUser?.role === UserRole.SUPER_ADMIN && !(currentUser as any).impersonated) {
            setCurrentPage('super_admin');
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && currentUser.gymId && currentUser.gymId !== 'SYSTEM') {
            refreshGymProfile();
        }
    }, [currentUser]);

    // [TRIGGER] Check for expiring memberships and upcoming installments
    useEffect(() => {
        if (data.users && data.users.length > 0) {
            const runChecks = async () => {
                const { checkAndTriggerExpirations, checkAndNotifyInstallmentsDue } = await import('./services/notificationService');
                await checkAndTriggerExpirations(data.users);
                await checkAndNotifyInstallmentsDue(data.users);
            };
            runChecks();
        }
    }, [data.users]);

    const refreshGymProfile = async () => {
        try {
            if (currentUser?.gymId && currentUser.gymId !== 'SYSTEM') {
                const profile = await getGymProfile(currentUser.gymId);
                if (profile) {
                    setGymProfile(profile);
                    setIsSubExpired(new Date(profile.subscriptionExpiry) < new Date());
                    const info = { name: profile.name, logo: profile.logoUrl || '', email: profile.email };
                    setGymInfo(info);
                    localStorage.setItem('gymName', info.name);
                    localStorage.setItem('gymLogo', info.logo);
                }
            }
        } catch (e) {
            console.warn("Failed to refresh gym profile (offline?)", e);
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        const themeConfig = THEMES[activeTheme as keyof typeof THEMES];
        if (themeConfig) {
            Object.entries(themeConfig.colors).forEach(([shade, color]) => root.style.setProperty(`--color-primary-${shade}`, color));
            root.setAttribute('data-theme', activeTheme);
        }
        localStorage.setItem('appTheme', activeTheme);
    }, [activeTheme]);

    const handleLogout = () => {
        const preserveKeys = ['gymName', 'gymLogo', 'gymEmail', 'appTheme', 'darkMode'];
        const preserved: Record<string, string | null> = {};
        preserveKeys.forEach(k => preserved[k] = localStorage.getItem(k));
        localStorage.clear();
        Object.entries(preserved).forEach(([k, v]) => { if (v !== null) localStorage.setItem(k, v as string); });
        sessionStorage.clear();
        setCurrentUser(null);
    };

    const updateGymInfo = (name: string, logo: string, email: string) => {
        setGymInfo({ name, logo, email });
        localStorage.setItem('gymName', name);
        localStorage.setItem('gymLogo', logo);
    };

    useEffect(() => {
        // Listen for storage events (other tabs) and BroadcastChannel / custom events
        const onStorage = (e: StorageEvent) => {
            try {
                if (e.key === 'fitflow_global_alert') {
                    const parsed = e.newValue ? JSON.parse(e.newValue) : null;
                    console.debug('[App] storage event for global notif', parsed);
                    if (parsed && currentUser && isNotificationDismissed(currentUser.id, parsed.id)) {
                        setGlobalNotif(null);
                    } else {
                        setGlobalNotif(parsed);
                    }
                }

                if (e.key === 'fitflow_global_alert_dismissed') {
                    const parsed = e.newValue ? JSON.parse(e.newValue) : null;
                    if (parsed && currentUser && parsed[String(currentUser.id)] && globalNotif && parsed[String(currentUser.id)].includes(String(globalNotif.id))) {
                        setGlobalNotif(null);
                    }
                }
            } catch (err) { console.debug('[App] storage handler error', err); }
        };

        const onCustom = (ev: any) => {
            console.debug('[App] custom event received for global notif', ev?.detail);
            if (ev?.detail) {
                const parsed = ev.detail;
                if (parsed && currentUser && isNotificationDismissed(currentUser.id, parsed.id)) {
                    setGlobalNotif(null);
                } else {
                    setGlobalNotif(parsed);
                }
            }
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener('fitflow_global_alert', onCustom as EventListener);

        let bc: any = null;
        let bcDismiss: any = null;
        try {
            if (typeof (window as any).BroadcastChannel !== 'undefined') {
                bc = new (window as any).BroadcastChannel('fitflow_global_alert');
                bc.onmessage = (m: any) => { console.debug('[App] BroadcastChannel message received', m.data); const parsed = m.data; if (parsed && currentUser && isNotificationDismissed(currentUser.id, parsed.id)) { setGlobalNotif(null); } else setGlobalNotif(parsed); };
                bcDismiss = new (window as any).BroadcastChannel('fitflow_global_alert_dismissed');
                bcDismiss.onmessage = (m: any) => {
                    const d = m.data;
                    console.debug('[App] dismiss BroadcastChannel received', d);
                    if (d && currentUser && String(d.userId) === String(currentUser.id) && globalNotif && String(d.notifId) === String(globalNotif.id)) {
                        setGlobalNotif(null);
                    }
                };
            }
        } catch (e) { /* ignore */ }

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('fitflow_global_alert', onCustom as EventListener);
            if (bc) bc.close();
            if (bcDismiss) bcDismiss.close();
        };
    }, [currentUser, globalNotif]);

    // Poll recent broadcasts from Firestore so admins on other devices receive them
    useEffect(() => {
        let mounted = true;
        let lastSeenId: string | null = null;
        const check = async () => {
            if (!mounted) return;
            try {
                const items = await fetchRecentBroadcasts(20);
                if (!items || items.length === 0) return;
                const newest = items[0];
                // Only show if this broadcast targets this gym or is global
                const myGymId = currentUser?.gymId || null;
                if (newest.id !== lastSeenId) {
                    const target = newest.targetGymId || null;
                    if (!target || (myGymId && String(target) === String(myGymId))) {
                        setGlobalNotif(newest);
                    }
                    lastSeenId = newest.id;
                }
            } catch (e) { /* ignore */ }
        };
        // initial fetch
        check();
        const iv = setInterval(check, 10000);
        return () => { mounted = false; clearInterval(iv); };
    }, [currentUser]);

    if (!currentUser) return <Login gymInfo={gymInfo} onLoginSuccess={(s, r) => { setCurrentUser(s); if (r) localStorage.setItem('fitflow_session', JSON.stringify(s)); }} lang={lang} />;

    if (isSubExpired && currentUser.role === UserRole.ADMIN) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-2xl p-6 max-w-md w-full text-center space-y-4 border-2 border-red-500/20">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600"><ShieldAlert size={40} /></div>
                    <h2 className="text-xl font-black dark:text-white uppercase">{lang === 'ar' ? 'انتهى اشتراك النظام' : 'Subscription Expired'}</h2>
                    <p className="text-gray-500 text-xs">{lang === 'ar' ? `نأسف، لقد انتهى اشتراك ${gymProfile?.name} يرجى التواصل للتجديد.` : `Subscription for ${gymProfile?.name} expired.`}</p>
                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs shadow-xl flex items-center justify-center gap-2"><CreditCard size={18} /> {lang === 'ar' ? 'تجديد الآن' : 'Renew Now'}</button>
                    <button onClick={handleLogout} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500">{lang === 'ar' ? 'تسجيل خروج' : 'Logout'}</button>
                </div>
            </div>
        );
    }

    return (
        <MainLayout
            currentUser={currentUser} lang={lang} setLang={setLang} currentPage={currentPage}
            setCurrentPage={setCurrentPage} isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen} gymInfo={gymInfo}
            activeTheme={activeTheme} globalNotif={globalNotif}
            setGlobalNotif={(v: any) => {
                setGlobalNotif(v);
                if (!v) localStorage.removeItem('fitflow_global_alert');
            }} onLogout={handleLogout}
        >
            <AppRouter
                currentPage={currentPage} setCurrentPage={setCurrentPage}
                lang={lang} setLang={setLang}
                currentUser={currentUser} data={data} actions={actions}
                refreshData={refreshData} gymInfo={gymInfo}
                gymProfile={gymProfile}
                refreshGymProfile={refreshGymProfile}
                updateGymInfo={updateGymInfo}
                activeTheme={activeTheme} setActiveTheme={setActiveTheme}
                isSidebarOpen={isSidebarOpen}
            />
        </MainLayout>
    );
};

export default App;
