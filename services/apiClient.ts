
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { getCurrentGymId, save, load } from "./storage";
import { toSnake, toCamel } from "../utils/naming";

let authPromise: Promise<any> | null = null;

const ensureAuth = () => {
    if (auth.currentUser) return Promise.resolve(auth.currentUser);
    if (authPromise) return authPromise;
    authPromise = new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) { unsubscribe(); resolve(user); }
            else { signInAnonymously(auth).then(cred => { unsubscribe(); resolve(cred.user); }).catch(() => resolve(null)); }
        });
    });
    return authPromise;
};

// API Call Tracking
const incrementAPICallCount = () => {
    const count = parseInt(localStorage.getItem('api_call_count') || '0');
    localStorage.setItem('api_call_count', String(count + 1));
};

export const getAPICallCount = () => {
    return parseInt(localStorage.getItem('api_call_count') || '0');
};

export const apiClient = {
    async get(endpoint: string) {
        incrementAPICallCount();
        await ensureAuth();
        const table = endpoint.replace(/^\//, '').split('?')[0];
        const gymId = getCurrentGymId();

        // جلب قائمة الجيمات فقط للتحقق من اللوجن
        // Global admin-only tables that should not be scoped by gym
        if (table === 'gyms' || table === 'saas_config') {
            try {
                const querySnapshot = await getDocs(collection(db, 'gyms'));
                // For saas_config we fetch the document by id 'saas_config' if present
                if (table === 'saas_config') {
                    try {
                        const docRef = doc(db, 'saas_config', 'saas_config');
                        const snap = await getDocs(collection(db, 'saas_config'));
                        // If there is a collection, fallback to scanning docs
                        const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
                        return toCamel(docs.length ? docs : querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                    } catch {
                        return toCamel(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                    }
                }
                return toCamel(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch { return []; }
        }

        // Allow global access for admin-only table
        if (table !== 'saas_config' && (!gymId || gymId === 'SYSTEM')) return [];

        try {
            const colRef = collection(db, table);
            // فرض العزل: لا يمكن جلب أي سجل لا ينتمي لهذا الجيم
            const q = table === 'saas_config' ? null : query(colRef, where("gym_id", "==", gymId));
            const querySnapshot = q ? await getDocs(q) : await getDocs(colRef);

            const results = querySnapshot.docs.map(d => {
                const data = d.data();
                // تنظيف الـ ID من البادئة قبل إرساله للـ UI
                let cleanId = d.id;
                if (cleanId.startsWith(`${gymId}_`)) {
                    cleanId = cleanId.replace(`${gymId}_`, '');
                }
                return { ...data, id: isNaN(Number(cleanId)) ? cleanId : Number(cleanId) };
            });

            const camelResults = toCamel(results);
            save(table, camelResults); // تحديث الكاش المحلي للجيم الحالي فقط
            return camelResults;
        } catch (e) {
            console.error(`[Security Access Denied] for table ${table}`);
            return load<any[]>(table, []);
        }
    },

    async post(endpoint: string, data: any) {
        incrementAPICallCount();
        await ensureAuth();
        const table = endpoint.replace(/^\//, '').split('?')[0];
        const gymId = getCurrentGymId();

        // Allow posts to saas_config as a global object (admin)
        if (!gymId && table !== 'gyms' && table !== 'saas_config') return data;

        const originalId = data.id || Date.now();
        // ضمان فرادة المعرف في السحاب لمنع التداخل بين الجيمات
        const docId = table === 'gyms' || table === 'saas_config' ? String(originalId) : `${gymId}_${originalId}`;

        if (!gymId && table !== 'gyms' && table !== 'saas_config') {
            console.error('[ApiClient] Refusing POST - gymId is null for table:', table);
            return data;
        }



        const snakeData = toSnake(data);
        if (table !== 'gyms' && table !== 'saas_config') {
            // Respect provided Gym ID if present (allows services to override/fix context), otherwise use global ID
            if (!snakeData.gym_id) {
                snakeData.gym_id = gymId;
            }
        }

        try {
            const docRef = doc(db, table, docId);
            await setDoc(docRef, { ...snakeData, updated_at: Timestamp.now() }, { merge: true });
            return data;
        } catch (e: any) {
            console.error(`[ApiClient] Error updating ${table}/${docId}:`, e);
            return data;
        }
    },

    async delete(endpoint: string) {
        incrementAPICallCount();
        await ensureAuth();
        const parts = endpoint.replace(/^\/+|\/+$/g, '').split('/');
        const table = parts[0];
        const id = parts[parts.length - 1];
        const gymId = getCurrentGymId();

        if (!gymId && table !== 'gyms' && table !== 'saas_config') return { success: false };
        const docId = table === 'gyms' || table === 'saas_config' ? id : `${gymId}_${id}`;

        console.log(`[ApiClient] DELETE from /${table}. DocId: ${docId}`);

        try {
            await deleteDoc(doc(db, table, docId));
            console.log(`[ApiClient] DELETE Success: /${table}/${docId}`);
            return { success: true };
        } catch (e) {
            console.error(`[ApiClient] DELETE Error: /${table}/${docId}`, e);
            return { success: false };
        }
    },

    // New helper for flexible querying (useful for Check-in)
    async findOne(table: string, filters: Record<string, any>) {
        incrementAPICallCount();
        await ensureAuth();
        const gymId = getCurrentGymId();
        if (!gymId) return null;

        try {
            const colRef = collection(db, table);
            const snakeFilters = toSnake(filters);

            // Basic query building with gym_id isolation
            const queryConstraints = [where("gym_id", "==", gymId)];
            Object.entries(snakeFilters).forEach(([key, val]) => {
                queryConstraints.push(where(key, "==", val));
            });

            const q = query(colRef, ...queryConstraints);
            const snap = await getDocs(q);

            if (snap.empty) return null;

            const doc = snap.docs[0];
            const data = doc.data();
            let id = doc.id;
            if (id.startsWith(`${gymId}_`)) {
                id = id.replace(`${gymId}_`, '');
            }
            return toCamel({ ...data, id: isNaN(Number(id)) ? id : Number(id) });
        } catch (e) {
            console.error(`[ApiClient.findOne] Error in ${table}:`, e);
            return null;
        }
    },

    async checkHealth() {
        try { await ensureAuth(); return !!db; } catch { return false; }
    }
};
