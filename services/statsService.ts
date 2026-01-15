import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { MonthlyStats } from '../types/finance.types';

export const updateMonthlyStats = async (
    gymId: string,
    type: 'INCOME' | 'EXPENSE' | 'NEW_MEMBER' | 'CLASS_SALE',
    amount: number = 0,
    className?: string
) => {
    if (!gymId) return;

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 01-12
    const year = today.getFullYear();
    const docId = `${gymId}_${month}-${year}`;

    const statsRef = doc(db, 'monthly_stats', docId);

    try {
        // Prepare the update payload
        const updates: any = { gymId }; // valid for setDoc with merge

        if (type === 'INCOME') {
            updates.totalRevenue = increment(amount);
        } else if (type === 'EXPENSE') {
            updates.totalExpenses = increment(amount);
        } else if (type === 'NEW_MEMBER') {
            updates.newMembers = increment(1);
        } else if (type === 'CLASS_SALE' && className) {
            // Firestore map increment requires dot notation: "classSales.Yoga"
            updates[`classSales.${className}`] = increment(1);
            // Also count as revenue if needed, but usually separate INCOME calls cover value
        }

        // Use setDoc with merge: true to create if not exists or update if exists
        // Note: increment works with setDoc(merge: true)
        await setDoc(statsRef, updates, { merge: true });

    } catch (error) {
        console.error("❌ [StatsService] WRITE FAILED:", error);
        logBackgroundError('updateMonthlyStats', error, { gymId, type, amount, className });
    }
};

/**
 * Helper to log background errors to localStorage for later inspection
 * This ensures silent failures in "fire-and-forget" tasks are not lost.
 */
const logBackgroundError = (source: string, error: any, context: any) => {
    try {
        const timestamp = new Date().toISOString();
        const errorLog = {
            timestamp,
            source,
            message: error?.message || String(error),
            context
        };

        const existingLogs = JSON.parse(localStorage.getItem('system_background_errors') || '[]');
        // Keep last 50 errors only to prevent quota overflow
        const newLogs = [errorLog, ...existingLogs].slice(0, 50);
        localStorage.setItem('system_background_errors', JSON.stringify(newLogs));
    } catch (e) {
        console.error("Failed to persist background error log", e);
    }
};

export const getMonthlyStats = async (gymId: string, month: string, year: string): Promise<MonthlyStats | null> => {
    try {
        const docId = `${gymId}_${month}-${year}`;
        const docRef = doc(db, 'monthly_stats', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as MonthlyStats;
        }
        return null;
    } catch (error) {
        console.error("Error fetching stats:", error);
        return null;
    }
};

export const getYearlyStats = async (gymId: string, year: string): Promise<MonthlyStats | null> => {
    try {

        // Generate promises for all 12 months
        const promises = Array.from({ length: 12 }, (_, i) => {
            const month = String(i + 1).padStart(2, '0');
            const docId = `${gymId}_${month}-${year}`;
            return getDoc(doc(db, 'monthly_stats', docId));
        });

        const snapshots = await Promise.all(promises);

        // Aggregate data
        const yearlyStats: MonthlyStats = {
            id: `${gymId}_ALL-${year}`,
            gymId,
            totalRevenue: 0,
            totalExpenses: 0,
            newMembers: 0,
            classSales: {}
        };

        let foundAny = false;

        snapshots.forEach(snap => {
            if (snap.exists()) {
                foundAny = true;
                const data = snap.data() as MonthlyStats;
                yearlyStats.totalRevenue = (yearlyStats.totalRevenue || 0) + (data.totalRevenue || 0);
                yearlyStats.totalExpenses = (yearlyStats.totalExpenses || 0) + (data.totalExpenses || 0);
                yearlyStats.newMembers = (yearlyStats.newMembers || 0) + (data.newMembers || 0);

                // Merge class sales
                if (data.classSales) {
                    Object.entries(data.classSales).forEach(([className, count]) => {
                        yearlyStats.classSales = yearlyStats.classSales || {};
                        yearlyStats.classSales[className] = (yearlyStats.classSales[className] || 0) + count;
                    });
                }
            }
        });

        if (!foundAny) {
            return null;
        }

        return yearlyStats;

    } catch (error) {
        console.error("Error fetching yearly stats:", error);
        return null;
    }
};
