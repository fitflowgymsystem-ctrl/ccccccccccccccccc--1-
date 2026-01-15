import { useState, useEffect, useMemo } from 'react';
// Fixed: Language is not an exported member of ../types. It is imported from ../utils/translations.
import { User, AccessLog, FinancialRecord } from '../types';
import { Language, translations } from '../utils/translations';
import { ar } from '../utils/locales/ar';
import { getMonthlyStats } from '../services/statsService';
import { getCurrentGymId } from '../services/storage';

export const useDashboard = (users: User[], logs: AccessLog[], financials: FinancialRecord[], lang: Language) => {
    const today = new Date().toISOString().split('T')[0];
    const [archiveRevenue, setArchiveRevenue] = useState<{ [key: string]: number }>({});
    const gymId = getCurrentGymId();

    useEffect(() => {
        const fetchArchive = async () => {
            if (!gymId) return;
            const revenueMap: { [key: string]: number } = {};
            const anchor = new Date(); anchor.setDate(1);

            // Fetch stats for previous 6 months
            const promises = Array.from({ length: 6 }, (_, i) => {
                const d = new Date(anchor); d.setMonth(d.getMonth() - (i + 1));
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = String(d.getFullYear());
                return getMonthlyStats(gymId, month, year).then(stats => ({
                    key: `${month}-${year}`,
                    amount: stats?.totalRevenue || 0
                }));
            });

            const results = await Promise.all(promises);
            results.forEach(res => {
                revenueMap[res.key] = res.amount;
            });
            setArchiveRevenue(revenueMap);
        };
        fetchArchive();
    }, [gymId]);

    const stats = useMemo(() => {
        const occupancyCount = new Set(logs.filter(l => l.timestamp.startsWith(today) && l.status === 'GRANTED').map(l => l.userId)).size;
        const dailyRevenue = financials.filter(f => f.type === 'INCOME' && f.date.startsWith(today)).reduce((sum, f) => sum + f.amount, 0);
        const newSignups = users.filter(u => u.joinDate === today).length;
        const renewals = financials.filter(f => f.type === 'INCOME' && f.category === 'MEMBERSHIP' && f.date.startsWith(today)).length;
        const expiringSoon = users.filter(u => u.isActive && new Date(u.expiryDate) > new Date()).length;

        return { occupancyCount, dailyRevenue, newSignups, renewals, expiringSoon };
    }, [users, logs, financials, today]);

    const chartsData = useMemo(() => {
        // Peak Hours
        const hourCounts = new Array(24).fill(0);
        logs.forEach(log => hourCounts[new Date(log.timestamp).getHours()]++);
        const peakHours = hourCounts.map((count, hour) => ({ hour: `${hour.toString().padStart(2, '0')}:00`, visitors: count }));

        // Monthly Revenue (last 7 months)
        const revenue = [];
        const anchor = new Date(); anchor.setDate(1);
        const monthKeys: (keyof typeof ar)[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(anchor); d.setMonth(d.getMonth() - i);
            const monthName = translations[lang][monthKeys[d.getMonth()]];
            const monthIdx = String(d.getMonth() + 1).padStart(2, '0');
            const yearStr = String(d.getFullYear());
            const archiveKey = `${monthIdx}-${yearStr}`;

            let total = 0;
            if (i === 0) {
                // Current month: Always calculate live from current financials
                total = financials.filter(f => {
                    const fd = new Date(f.date);
                    return f.type === 'INCOME' && fd.getMonth() === d.getMonth() && fd.getFullYear() === d.getFullYear();
                }).reduce((s, r) => s + r.amount, 0);
            } else {
                // Historical months: Use archive data from Firestore
                total = archiveRevenue[archiveKey] || 0;
            }

            revenue.push({ name: monthName, amount: total });
        }

        return { peakHours, revenue };
    }, [logs, financials, lang, archiveRevenue]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return lang === 'ar' ? 'صباح الخير كابتن' : 'Good Morning, Coach';
        if (hour < 18) return lang === 'ar' ? 'طاب يومك' : 'Good Afternoon';
        return lang === 'ar' ? 'مساء الخير' : 'Good Evening';
    }, [lang]);

    return { stats, chartsData, greeting, today };
};
