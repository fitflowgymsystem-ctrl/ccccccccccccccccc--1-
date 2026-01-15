
// V9: The Final Isolation Layer
const STORAGE_PREFIX = 'fitflow_cloud_v9_';

export const getCurrentGymId = (): string | null => {
    const session = localStorage.getItem('fitflow_session');
    if (!session) return null;
    try {
        const data = JSON.parse(session);
        // الأولوية دائماً لمعرف الجيم الحالي في الجلسة
        const id = data.gymId || null;
        if (id === 'GYM') console.warn("[Storage] getCurrentGymId returned 'GYM'. Is this intended? Session:", session);
        return id;
    } catch {
        console.error("[Storage] Failed to parse session");
        return null;
    }
};

export const getGymKey = (key: string, gymId?: string) => {
    const id = gymId || getCurrentGymId() || 'GUEST';
    // عزل المفاتيح داخل المتصفح لضمان عدم ظهور بيانات قديمة
    return `${STORAGE_PREFIX}${id}_${key}`;
};

export const load = <T>(key: string, defaultValue: T, gymId?: string): T => {
    const targetId = gymId || getCurrentGymId();
    if (!targetId) return defaultValue;
    const saved = localStorage.getItem(getGymKey(key, targetId));
    return saved ? JSON.parse(saved) : defaultValue;
};

export const save = (key: string, data: any, gymId?: string) => {
    const targetId = gymId || getCurrentGymId();
    if (!targetId) return;
    localStorage.setItem(getGymKey(key, targetId), JSON.stringify(data));
};
