import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ScanLine, ShoppingCart, DollarSign, Dumbbell,
  LogOut, Settings, Tag, Wrench, ClipboardList, Shield, UserCircle,
  Menu, Home, X, ShieldCheck, ChevronRight, Link, Link2Off, Sun,
  Moon, Globe, Terminal, Lock, Megaphone, Maximize, Minimize, Database, Activity
} from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { UserRole } from '../types';
import { apiClient } from '../services/apiClient';
import { NotificationBell } from './NotificationBell';

// تعريف الواجهة لـ Electron API لضمان عدم وجود أخطاء TypeScript
declare global {
  interface Window {
    electronAPI?: {
      toggleFullScreen: () => void;
      isElectron: boolean;
    };
  }
}

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
  onLogout: () => void;
  role: string;
  isOpen: boolean;
  onToggle: () => void;
  gymName: string;
  gymLogo: string;
  userId: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, lang, setLang, onLogout, role, isOpen, onToggle, gymName, gymLogo, userId
}) => {
  const t = translations[lang];
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      const status = await apiClient.checkHealth();
      setIsServerOnline(status);
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);

    const session = localStorage.getItem('fitflow_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        setIsImpersonating(data.impersonated === true);
      } catch (e) { }
    }

    // مراقبة تغيير وضع ملء الشاشة في المتصفح لتحديث الأيقونة
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', String(newMode));
  };

  // ميزة ملء الشاشة الجديدة
  const toggleFullScreen = () => {
    if (window.electronAPI?.isElectron) {
      // إذا كان التطبيق يعمل في Electron (EXE)
      window.electronAPI.toggleFullScreen();
      setIsFullScreen(!isFullScreen);
    } else {
      // إذا كان التطبيق يعمل في المتصفح
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleExitImpersonation = () => {
    const session = JSON.parse(localStorage.getItem('fitflow_session') || '{}');
    const cleanSession = {
      ...session,
      gymId: 'SYSTEM',
      impersonated: false,
      name: 'System Developer'
    };
    localStorage.setItem('fitflow_session', JSON.stringify(cleanSession));
    window.location.href = '/';
  };

  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  const allNavItems = [
    { id: 'super_admin', label: 'Fleet Command', icon: ShieldCheck, roles: [UserRole.SUPER_ADMIN] },
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.SUPER_ADMIN] },
    { id: 'member_home', label: t.dashboard, icon: Home, roles: [UserRole.MEMBER] },
    { id: 'workout_plan', label: t.workout, icon: Dumbbell, roles: [UserRole.MEMBER] },
    { id: 'inbody', label: lang === 'ar' ? 'قياساتي' : 'My Body', icon: Activity, roles: [UserRole.MEMBER] },
    { id: 'checkin', label: t.checkin, icon: ScanLine, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.TRAINER, UserRole.SUPER_ADMIN] },
    { id: 'members', label: t.members, icon: Users, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.TRAINER, UserRole.SUPER_ADMIN] },
    { id: 'trainers', label: t.trainers, icon: Dumbbell, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'subscriptions', label: t.plans, icon: Tag, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'pos', label: t.pos, icon: ShoppingCart, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.TRAINER, UserRole.SUPER_ADMIN] },
    { id: 'equipment', label: t.equip_title, icon: Wrench, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.TRAINER, UserRole.SUPER_ADMIN] },
    { id: 'financials', label: t.financials, icon: DollarSign, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'archive', label: lang === 'ar' ? 'الأرشيف' : 'Archive', icon: Database, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'logs', label: t.logs_title, icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.TRAINER, UserRole.SUPER_ADMIN] },
    { id: 'profile', label: t.profile, icon: UserCircle, roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.TRAINER, UserRole.MEMBER, UserRole.SUPER_ADMIN] },
    { id: 'settings', label: t.settings, icon: Settings, roles: [UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER, UserRole.SUPER_ADMIN] },
    { id: 'broadcast', label: 'Global Broadcast', icon: Megaphone, roles: [UserRole.SUPER_ADMIN] },
  ];

  const navItems = allNavItems.filter(item => {
    if (role === UserRole.SUPER_ADMIN) {
      if (item.id === 'super_admin') return !isImpersonating;
      return isImpersonating;
    }
    return item.roles.includes(role as UserRole);
  });

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden animate-fade-in" onClick={onToggle} />
      )}

      <div className={`
        fixed inset-y-0 z-[70] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}
        ${isOpen ? 'w-72' : 'lg:w-20 w-72'}
        bg-slate-900 border-e border-slate-800 text-white flex flex-col h-full shadow-2xl
      `}>
        {/* Logo Section */}
        <div className={`p-4 border-b border-slate-800 flex items-center shrink-0 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && (
            <div className="flex items-center gap-2.5 overflow-hidden animate-fade-in">
              <div className={`rounded-lg shrink-0 w-8 h-8 flex items-center justify-center ${isSuperAdmin && !isImpersonating ? 'bg-indigo-600' : (gymLogo ? 'bg-transparent' : 'bg-blue-600')} shadow-lg overflow-hidden`}>
                {gymLogo && (!isSuperAdmin || isImpersonating) ? (
                  <img src={gymLogo} className="w-full h-full object-cover" />
                ) : (
                  <Dumbbell size={18} className="text-white" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-tight truncate uppercase leading-none">{isSuperAdmin && !isImpersonating ? 'Nexus Cloud' : gymName}</h1>
                <div className="flex items-center gap-1 mt-1">
                  <Lock size={8} className="text-emerald-500" />
                  <p className="text-[6px] font-black uppercase tracking-[0.1em] text-emerald-400">
                    Secure Production
                  </p>
                </div>
              </div>
            </div>
          )}
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all transform active:scale-90">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto code-scroll overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'broadcast') {
                    try { window.dispatchEvent(new CustomEvent('open_broadcast_modal')); } catch { }
                    if (window.innerWidth < 1024) onToggle();
                    return;
                  }
                  onNavigate(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${isActive
                  ? (isSuperAdmin && !isImpersonating ? 'bg-indigo-600' : 'bg-blue-600') + ' text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  } ${!isOpen && 'justify-center'}`}
              >
                <Icon size={18} className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isOpen ? (
                  <span className={`font-bold text-[10px] tracking-wide truncate uppercase ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                ) : (
                  <div className="absolute left-full rtl:left-auto rtl:right-full top-1/2 -translate-y-1/2 ml-4 rtl:mr-4 px-2 py-1.5 bg-slate-800 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-slate-700 transition-all transform translate-x-2 group-hover:translate-x-0">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="p-2 border-t border-slate-800 space-y-2">
          <div className={`flex flex-col gap-1 ${!isOpen ? 'items-center' : ''}`}>
            {isOpen ? (
              <div className="px-3 py-3 bg-slate-950/40 rounded-2xl border border-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Environment</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-md text-[8px] font-black transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>EN</button>
                    <button onClick={() => setLang('ar')} className={`px-2 py-1 rounded-md text-[8px] font-black transition-all ${lang === 'ar' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>AR</button>
                  </div>
                </div>

                {/* شريط التحكم: ليلي و ملء الشاشة + Bell */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button onClick={toggleDarkMode} className="flex items-center gap-2 group">
                      {isDarkMode ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-400" />}
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{isDarkMode ? 'Night' : 'Light'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <NotificationBell userId={userId} lang={lang} placement={lang === 'ar' ? 'left-start' : 'right-start'} />
                    <button onClick={toggleFullScreen} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-sm">
                      {isFullScreen ? <Minimize size={14} /> : <Maximize size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
                  <Globe size={16} />
                </button>
                <button onClick={toggleDarkMode} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
                  {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                {/* زر ملء الشاشة في الوضع المصغر */}
                <button onClick={toggleFullScreen} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
                  {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
                {/* Bell in collapsed mode */}
                <div className="p-1">
                  <NotificationBell userId={userId} lang={lang} placement={lang === 'ar' ? 'left-start' : 'right-start'} />
                </div>
              </div>
            )}
          </div>

          <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all font-black uppercase text-[9px] tracking-widest group ${!isOpen && 'justify-center'}`}>
            <LogOut size={16} className="rtl:rotate-180 transition-transform group-hover:scale-110" />
            {isOpen && <span>{t.logout}</span>}
          </button>
        </div>
      </div>
    </>
  );
};