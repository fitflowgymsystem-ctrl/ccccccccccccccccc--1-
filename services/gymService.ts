import { apiClient } from './apiClient';
import { load, save } from './storage';

export * from './storage';
export * from './authService';
export * from './memberService';
export * from './financeService';
export * from './staffService';
export * from './hardwareService';
export * from './gymProfileService';
export * from './servicePlanService';
export * from './subscriptionService';

// المزامنة الآن سريعة لأنها لا تنتظر الـ Storage المحلي إلا في الضرورة
export const syncWithServer = async (key: string, data: any) => {
    // نقوم بالحفظ محلياً كـ Backup سريع
    save(key, data);
    // نرسل للسيرفر ونعود فوراً
    return apiClient.post(`/${key}`, data);
};