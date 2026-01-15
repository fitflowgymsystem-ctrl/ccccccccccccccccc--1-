import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { subscribeToNotifications, markAsRead } from '../services/notificationService';
import { GymNotification } from '../types/notification.types';
import { useOnClickOutside } from '../hooks/useOnClickOutside'; // Assuming this exists or I'll check/create
import { translations, Language } from '../utils/translations';

interface NotificationBellProps {
    userId: number | string;
    lang: Language;
    placement?: 'bottom-right' | 'top-right' | 'right-start' | 'left-start' | 'top-left';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, lang, placement = 'bottom-right' }) => {
    const [notifications, setNotifications] = useState<GymNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = translations[lang];

    // Subscribe to real-time updates
    useEffect(() => {
        if (!userId) return;
        const unsubscribe = subscribeToNotifications(userId, (data) => {
            setNotifications(data);
        });
        return () => unsubscribe();
    }, [userId]);

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markAsRead(id);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'urgent': return <AlertCircle size={16} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'success': return <Check size={16} className="text-green-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    // Determine Dropdown Position Classes
    const getDropdownClasses = () => {
        const base = "absolute w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-[100] animate-scale-in";
        switch (placement) {
            case 'top-right': // Opens UP, aligned Right
                return `${base} bottom-full right-0 mb-2 origin-bottom-right`;
            case 'top-left': // Opens UP, aligned Left
                return `${base} bottom-full left-0 mb-2 origin-bottom-left`;
            case 'right-start': // Opens RIGHT, aligned Top
                return `${base} left-full bottom-0 ml-2 origin-bottom-left`;
            case 'left-start': // Opens LEFT, aligned Top (for RTL sidebar)
                return `${base} right-full bottom-0 mr-2 origin-bottom-right`;
            case 'bottom-right':
            default:
                return `${base} right-0 mt-2 origin-top-right`;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={getDropdownClasses()}>
                    <div className="p-4 border-b dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex justify-between items-center">
                        <h3 className="font-bold text-sm dark:text-white">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h3>
                        <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            {unreadCount} {lang === 'ar' ? 'جديد' : 'New'}
                        </span>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                <Bell size={32} className="opacity-20" />
                                <p className="text-xs font-medium">{lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`p-4 border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 group relative ${n.isRead ? 'opacity-60' : 'bg-blue-50/10'}`}>
                                    <div className={`mt-1 p-2 rounded-full shrink-0 ${n.type === 'urgent' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{n.title}</h4>
                                            <span className="text-[9px] text-gray-400 whitespace-nowrap">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{n.message}</p>

                                        <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                                className="text-[9px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                <Check size={10} /> {lang === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
