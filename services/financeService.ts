import { apiClient } from './apiClient';
import { load, save, getCurrentGymId } from './storage';
import { FinancialRecord, Product } from '../types/finance.types';
import { MembershipPlan, Offer, MembershipType } from '../types/membership.types';
import { updateMonthlyStats } from './statsService';

export const getFinancials = async () => {
    const data = await apiClient.get<FinancialRecord[]>('/financials');
    if (data) { save('financials', data); return data; }
    return load<FinancialRecord[]>('financials', []);
};

export const getProducts = async () => {
    const data = await apiClient.get<Product[]>('/products');
    if (data) { save('products', data); return data; }
    return load<Product[]>('products', []);
};

export const addFinancialRecord = async (record: FinancialRecord) => {
    const finalGymId = record.gymId || getCurrentGymId();
    const newRecord = { ...record, id: record.id || Date.now(), gymId: finalGymId };

    // Trigger atomic update for Monthly Archive
    try {
        updateMonthlyStats(finalGymId, record.type, record.amount).catch(e => console.error("Stats bg error", e));
    } catch (e) { console.error("Stats trigger failed", e); }

    return await apiClient.post('/financials', newRecord);
};

export const processSale = async (items: { product: Product, qty: number }[], paymentMethod: 'CASH' | 'CARD') => {
    let total = items.reduce((sum, i) => sum + (i.product.sellPrice * i.qty), 0);

    const products = await getProducts();
    items.forEach(item => {
        const p = products.find((x: Product) => x.id === item.product.id);
        if (p) {
            p.stock -= item.qty;
            apiClient.post('/products', p);
        }
    });

    return await addFinancialRecord({
        id: Date.now(),
        gymId: getCurrentGymId(),
        type: 'INCOME',
        category: 'PRODUCT',
        amount: total,
        description: `Sale: ${items.map(i => `${i.product.name} (x${i.qty})`).join(', ')}`,
        date: new Date().toISOString(),
        paymentMethod
    } as FinancialRecord);
};

export const addProduct = (p: Product) => apiClient.post('/products', { ...p, gymId: getCurrentGymId() });
export const updateProduct = (p: Product) => apiClient.post('/products', p);
export const deleteProduct = (id: number) => apiClient.delete(`/products/${id}`);

export const getPlans = async () => {
    const data = await apiClient.get<MembershipPlan[]>('/plans');
    if (data) { save('plans', data); return data; }
    return load<MembershipPlan[]>('plans', []);
};

export const getOffers = async () => {
    const data = await apiClient.get<Offer[]>('/offers');
    if (data) { save('offers', data); return data; }
    return load<Offer[]>('offers', []);
};

export const updatePlanPrice = async (type: MembershipType, price: number): Promise<MembershipPlan> => {
    const plans = load<MembershipPlan[]>('plans', []);
    const idx = plans.findIndex(p => p.type === type);

    const getDuration = (t: MembershipType) => {
        switch (t) {
            case MembershipType.DAILY: return 1;
            case MembershipType.MONTHLY: return 30;
            case MembershipType.QUARTERLY: return 90;
            case MembershipType.BIANNUAL: return 180;
            case MembershipType.YEARLY: return 365;
            default: return 30;
        }
    };

    let updatedPlan: MembershipPlan;

    if (idx > -1) {
        plans[idx].price = price;
        updatedPlan = plans[idx];
        save('plans', plans);
        await apiClient.post('/plans', updatedPlan);
    } else {
        updatedPlan = {
            id: `plan_${Date.now()}`,
            gymId: getCurrentGymId(),
            type: type,
            price: price,
            durationDays: getDuration(type)
        };
        plans.push(updatedPlan);
        save('plans', plans);
        await apiClient.post('/plans', updatedPlan);
    }

    return updatedPlan;
};

export const addOffer = (o: Offer) => apiClient.post('/offers', { ...o, gymId: getCurrentGymId() });
export const deleteOffer = (id: number) => apiClient.delete(`/offers/${id}`);