
import { useState, useMemo, useEffect } from 'react';
import { FinancialRecord, User } from '../types';
import { getFinancials } from '../services/gymService';
import { Language, translations } from '../utils/translations';

export const useFinancials = (lang: Language, trainers: any[] = [], employees: any[] = []) => {
    // Fixed: Cast t to any to resolve property access errors on potentially missing keys in different locales
    const t = translations[lang] as any;
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => { refreshData(); }, [trainers, employees, lang]);

    const refreshData = () => {
        getFinancials().then(data => {
            console.log("Financials Data Fetched:", data?.length, "Records");
            const dbRecords = data || [];

            // Generate historical salary records for all staff
            const salaryRecords: FinancialRecord[] = [];
            const now = new Date();
            const allStaff = [...trainers, ...employees];

            allStaff.forEach(staff => {
                if (!staff.baseSalary || !staff.hireDate) return;

                const [hYear, hMonth, hDay] = staff.hireDate.split('-').map(Number);
                let current = new Date(hYear, hMonth - 1, hDay);
                let isFirstMonth = true;

                while (current <= now) {
                    const monthYear = current.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

                    const YYYY = current.getFullYear();
                    const MM = current.getMonth();
                    const DD = current.getDate();
                    const dateStr = `${YYYY}-${String(MM + 1).padStart(2, '0')}-${String(DD).padStart(2, '0')}`;

                    let amount = Number(staff.baseSalary);
                    if (isFirstMonth) {
                        const daysInMonth = new Date(YYYY, MM + 1, 0).getDate();
                        const daysWorked = daysInMonth - hDay + 1;
                        amount = Number(((amount / daysInMonth) * daysWorked).toFixed(2));
                        isFirstMonth = false;
                    }

                    salaryRecords.push({
                        id: Number(`999${staff.id}${YYYY}${String(MM + 1).padStart(2, '0')}`),
                        type: 'EXPENSE',
                        category: 'SALARY',
                        amount: amount,
                        description: lang === 'ar' ? `راتب: ${staff.name} (${monthYear})` : `Salary: ${staff.name} (${monthYear})`,
                        date: `${dateStr}T00:00:00.000Z`,
                        gymId: staff.gymId,
                        paymentMethod: 'CASH'
                    } as any);

                    const nextMonth = current.getMonth() + 1;
                    current.setMonth(nextMonth);
                    if (current.getDate() !== hDay) {
                        const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
                        current.setDate(Math.min(hDay, lastDay));
                    }
                }
            });

            setRecords([...dbRecords, ...salaryRecords]);
        });
    };

    const getCategoryLabel = (cat: string) => {
        // Fixed: Use casted translations object to safely access category keys
        const cats: any = {
            'MEMBERSHIP': t.cat_membership,
            'PRODUCT': t.cat_product,
            'SALARY': t.cat_salary,
            'MAINTENANCE': t.cat_maintenance
        };
        return cats[cat] || t.cat_other;
    };

    const getTranslatedDescription = (desc: string) => {
        if (lang !== 'ar') return desc;

        let translated = desc;

        // Pattern 1: Store Sale
        if (desc === 'Store Sale') return 'مبيعات المتجر';
        if (desc.startsWith('Sale: ')) {
            return desc.replace('Sale: ', 'بيع: ');
        }

        // Pattern 4: New Member & Renewal
        if (desc.startsWith('New Member:')) {
            return desc.replace('New Member:', 'عضو جديد:');
        }
        if (desc.startsWith('Renewal:')) {
            return desc.replace('Renewal:', 'تجديد اشتراك:');
        }

        // Pattern 2: Membership
        if (desc.startsWith('Membership:')) {
            let clean = desc.replace('Membership:', 'اشتراك:');
            const planTerms: Record<string, string> = {
                'DAILY': 'يومية',
                'MONTHLY': 'شهرية',
                'QUARTERLY': 'ربع سنوية',
                'BIANNUAL': 'نصف سنوية',
                'YEARLY': 'سنوية'
            };
            Object.entries(planTerms).forEach(([en, ar]) => {
                clean = clean.replace(en, ar);
            });
            return clean;
        }

        // Pattern 3: Private Session
        if (desc.startsWith('Private Session -')) {
            return desc.replace('Private Session -', 'جلسة خاصة -').replace('with', 'مع');
        }

        // Common manual expense terms
        const commonTerms: Record<string, string> = {
            'Registration Fee': 'رسوم تسجيل',
            'Maintenance': 'صيانة',
            'Electricity': 'كهرباء',
            'Rent': 'إيجار',
            'Water': 'مياه',
            'Internet': 'إنترنت',
            'Cleaning': 'نظافة',
            'Supplies': 'أدوات ومستلزمات'
        };

        if (commonTerms[desc]) return commonTerms[desc];

        return translated;
    };

    const filteredRecords = useMemo(() => {
        return (records || []).map(r => ({
            ...r,
            translatedDescription: getTranslatedDescription(r.description)
        })).filter(r => {
            const matchesType = filterType === 'ALL' || r.type === filterType;
            const matchesSearch = (r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.translatedDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                getCategoryLabel(r.category).toLowerCase().includes(searchTerm.toLowerCase());
            let matchesDate = true;
            if (startDate) matchesDate = matchesDate && r.date >= startDate;
            if (endDate) matchesDate = matchesDate && r.date <= endDate;
            return matchesType && matchesSearch && matchesDate;
        }).sort((a, b) => {
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();
            if (timeB !== timeA) return timeB - timeA;
            return b.id - a.id;
        });
    }, [records, filterType, searchTerm, startDate, endDate, lang]);

    const stats = useMemo(() => {
        const income = records.filter(r => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
        const expenses = records.filter(r => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
        const storeProfit = records.filter(r => r.category === 'PRODUCT').reduce((s, r) => r.type === 'INCOME' ? s + r.amount : s - r.amount, 0);
        const totalPrivate = records.filter(r => r.type === 'INCOME' && r.description.toLowerCase().includes('private session')).reduce((s, r) => s + r.amount, 0);
        return { income, expenses, net: income - expenses, storeProfit, totalPrivate };
    }, [records]);

    const chartData = useMemo(() => {
        // Pie Chart
        const cats: Record<string, number> = {};
        records.filter(r => r.type === 'EXPENSE').forEach(r => {
            const label = getCategoryLabel(r.category);
            cats[label] = (cats[label] || 0) + r.amount;
        });
        const expensePie = Object.keys(cats).map(name => ({ name, value: cats[name] }));

        // Cash Flow
        const cashFlow = [];
        const anchor = new Date(); anchor.setDate(1);
        for (let i = 5; i >= 0; i--) {
            const d = new Date(anchor); d.setMonth(d.getMonth() - i);
            const mRecs = records.filter(r => {
                const rd = new Date(r.date);
                return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
            });
            cashFlow.push({
                name: d.toLocaleString('default', { month: 'short' }),
                income: mRecs.filter(r => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0),
                expense: mRecs.filter(r => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0)
            });
        }
        return { expensePie, cashFlow };
    }, [records, lang]);

    return {
        records, filteredRecords, stats, chartData, refreshData, getCategoryLabel,
        filters: { filterType, setFilterType, searchTerm, setSearchTerm, startDate, setStartDate, endDate, setEndDate }
    };
};
