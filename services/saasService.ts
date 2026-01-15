
import { GymSubscriptionPlan } from '../types';
import { apiClient } from './apiClient';

const PRICING_KEY = 'fitflow_global_saas_pricing';

export interface SaaSConfig {
    prices: Record<GymSubscriptionPlan, number>;
    // mapping plan -> duration in days (e.g. Basic: 30, Pro: 90)
    planDurationDays?: Partial<Record<GymSubscriptionPlan, number>>;
    trialDurationDays: number;
}

const DEFAULT_CONFIG: SaaSConfig = {
    prices: {
        [GymSubscriptionPlan.TRIAL]: 0,
        [GymSubscriptionPlan.BASIC]: 80,
        [GymSubscriptionPlan.PRO]: 150,
        [GymSubscriptionPlan.ELITE]: 300,
        [GymSubscriptionPlan.ENTERPRISE]: 500
    },
    planDurationDays: {
        [GymSubscriptionPlan.TRIAL]: 14,
        [GymSubscriptionPlan.BASIC]: 30,
        [GymSubscriptionPlan.PRO]: 90,
        [GymSubscriptionPlan.ELITE]: 180,
        [GymSubscriptionPlan.ENTERPRISE]: 365
    },
    trialDurationDays: 14
};

export const getSaaSConfig = (): SaaSConfig => {
    const saved = localStorage.getItem(PRICING_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
};

export const updateSaaSPrice = (plan: GymSubscriptionPlan, price: number) => {
    const config = getSaaSConfig();
    config.prices[plan] = price;
    localStorage.setItem(PRICING_KEY, JSON.stringify(config));
    // Persist to central config (best-effort). Use a fixed id to store single document.
    try {
        // Attach actor metadata when available for server audit logging
        const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('fitflow_session') || '{}') : {};
        const actor = session.username || session.name || session.id || 'ADMIN_LOCAL';
        apiClient.post('/saas_config', { id: 'saas_config', ...config, actor }).catch(() => { /* ignore */ });
    } catch {
        // ignore network errors — local changes still apply immediately
    }
    return config;
};

export const fetchSaaSConfigFromServer = async (): Promise<SaaSConfig | null> => {
    try {
        const res = await apiClient.get('/saas_config');
        if (!res) return null;
        // If server returns an array of docs, pick the one with id 'saas_config' or first
        const doc = Array.isArray(res) ? (res.find((r: any) => r.id === 'saas_config') || res[0]) : res;
        if (!doc) return null;
        const config: SaaSConfig = {
            prices: doc.prices || DEFAULT_CONFIG.prices,
            planDurationDays: doc.planDurationDays || DEFAULT_CONFIG.planDurationDays,
            trialDurationDays: doc.trialDurationDays || DEFAULT_CONFIG.trialDurationDays
        };
        localStorage.setItem(PRICING_KEY, JSON.stringify(config));
        return config;
    } catch (e) {
        return null;
    }
};

export const calculateMRR = (gyms: any[]) => {
    const { prices, planDurationDays } = getSaaSConfig();
    // Normalize each plan price to a monthly amount (30-day month approximation)
    return gyms.reduce((acc, gym) => {
        if (!gym.isActive) return acc;
        const plan = gym.subscriptionPlan as GymSubscriptionPlan;
        const price = prices[plan] || 0;
        const durationDays = (planDurationDays && planDurationDays[plan]) || DEFAULT_CONFIG.planDurationDays?.[plan] || 30;
        // For zero-duration or trial (0 price) handle gracefully
        if (!durationDays || price === 0) return acc + 0;
        const monthly = price * (30 / durationDays);
        return acc + monthly;
    }, 0);
};
