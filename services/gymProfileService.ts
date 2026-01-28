
import { GymProfile } from '../types';
import { apiClient } from './apiClient';
import { collection, doc, setDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export const getAllGyms = async (): Promise<GymProfile[]> => {
    const data = await apiClient.get<GymProfile[]>('/gyms');
    if (!data) return [];

    // Deduplicate logic to prevent key collisions in UI
    const uniqueMap = new Map();
    (data as any[]).forEach(item => {
        if (item.id) uniqueMap.set(String(item.id), item);
    });

    return Array.from(uniqueMap.values()) as GymProfile[];
};

export const getGymProfile = async (gymId: string): Promise<GymProfile | null> => {
    const data = await apiClient.get<GymProfile[]>('/gyms');
    if (data && Array.isArray(data)) {
        return data.find((g: any) => String(g.id) === String(gymId)) || null;
    }
    return null;
};

export const createGym = async (gym: any) => {
    return await apiClient.post('/gyms', gym);
};

export const updateGym = async (gymId: string, updates: any) => {
    return await apiClient.post('/gyms', { ...updates, id: gymId });
};

export const deleteGym = async (gymId: string) => {
    // التأكد من أن المسار يبدأ بـ / ليتوافق مع معالج apiClient
    return await apiClient.delete(`/gyms/${gymId}`);
};

export const getGlobalNotification = () => {
    const saved = localStorage.getItem('fitflow_global_alert');
    return saved ? JSON.parse(saved) : null;
};

export const sendGlobalNotification = (notif: any) => {
    // Ensure a stable id/timestamp so dismissals can reference the same notification
    const id = String(notif.id || Date.now());
    const payload = { ...notif, id, timestamp: notif.timestamp || new Date().toISOString() };

    // Persist locally
    localStorage.setItem('fitflow_global_alert', JSON.stringify(payload));

    // Broadcast to other windows/tabs in the same origin
    try {
        if (typeof (window as any).BroadcastChannel !== 'undefined') {
            const bc = new (window as any).BroadcastChannel('fitflow_global_alert');
            console.debug('[gymProfileService] broadcasting global notif', payload);
            bc.postMessage(payload);
            bc.close();
        }
    } catch (e) {
        // ignore
    }

    // Trigger a storage event for same-window listeners
    try {
        console.debug('[gymProfileService] dispatching custom event for global notif', payload);
        window.dispatchEvent(new CustomEvent('fitflow_global_alert', { detail: payload }));
    } catch (e) { /* ignore */ }

    // Persist to Firestore so other devices / browsers can fetch it
    try {
        const docRef = doc(db, 'broadcasts', id);
        const firestorePayload = { ...payload, created_at: Timestamp.now() } as any;
        // include gym targeting if provided (targetGymId === null means global)
        setDoc(docRef, firestorePayload, { merge: true }).catch((err) => console.debug('[gymProfileService] failed to persist broadcast', err));
    } catch (e) { console.debug('[gymProfileService] persist broadcast failed', e); }
    // Also try POSTing to local mock server (fallback for local dev)
    try {
        fetch('http://localhost:3001/api/broadcasts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload })
        }).then(res => res.json()).then(() => console.debug('[gymProfileService] persisted broadcast to local server')).catch(err => console.debug('[gymProfileService] local server persist failed', err));
    } catch (e) { console.debug('[gymProfileService] local persist error', e); }
};

export const clearGlobalNotification = () => localStorage.removeItem('fitflow_global_alert');

// Track per-user dismissals for global alerts so users can permanently dismiss them.
export const isNotificationDismissed = (userId: string | number, notifId: string | number) => {
    try {
        const raw = localStorage.getItem('fitflow_global_alert_dismissed');
        if (!raw) return false;
        const obj = JSON.parse(raw || '{}');
        const list = obj[String(userId)];
        if (!Array.isArray(list)) return false;
        return list.includes(String(notifId));
    } catch (e) { return false; }
};

export const dismissGlobalNotificationForUser = (userId: string | number, notifId: string | number) => {
    try {
        const raw = localStorage.getItem('fitflow_global_alert_dismissed');
        const obj = raw ? JSON.parse(raw) : {};
        const id = String(userId);
        const nid = String(notifId);
        const list = new Set(Array.isArray(obj[id]) ? obj[id].map(String) : []);
        list.add(nid);
        obj[id] = Array.from(list);
        localStorage.setItem('fitflow_global_alert_dismissed', JSON.stringify(obj));

        // notify other tabs/windows
        try {
            if (typeof (window as any).BroadcastChannel !== 'undefined') {
                const bc = new (window as any).BroadcastChannel('fitflow_global_alert_dismissed');
                bc.postMessage({ userId: id, notifId: nid });
                bc.close();
            }
        } catch (e) { /* ignore */ }

        try { window.dispatchEvent(new CustomEvent('fitflow_global_alert_dismissed', { detail: { userId: id, notifId: nid } })); } catch (e) { /* ignore */ }
    } catch (e) { /* ignore */ }
};

export const fetchRecentBroadcasts = async (limit = 50) => {
    // Try Firestore first
    try {
        const snap = await getDocs(collection(db, 'broadcasts'));
        const items = snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
        items.sort((a, b) => {
            const ta = a.timestamp ? new Date(a.timestamp).getTime() : (a.created_at?._seconds ? a.created_at._seconds * 1000 : 0);
            const tb = b.timestamp ? new Date(b.timestamp).getTime() : (b.created_at?._seconds ? b.created_at._seconds * 1000 : 0);
            return tb - ta;
        });
        return items.slice(0, limit);
    } catch (e) {
        console.debug('[gymProfileService] Firestore fetch failed, falling back to local server', e);
    }

    // Fallback to local mock server
    try {
        const res = await fetch('http://localhost:3001/api/broadcasts');
        if (!res.ok) return [];
        const data = await res.json();
        const items = (Array.isArray(data) ? data : []).map((d: any) => ({ ...d }));
        items.sort((a: any, b: any) => new Date(b.timestamp || b.created_at || 0).getTime() - new Date(a.timestamp || a.created_at || 0).getTime());
        return items.slice(0, limit);
    } catch (e) { console.debug('[gymProfileService] local server fetch failed', e); return []; }
};
