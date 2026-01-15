import { apiClient } from './apiClient';
import { ServiceSubscription } from '../types/membership.types';

export const getServiceSubscriptions = async (): Promise<ServiceSubscription[]> => {
    return apiClient.get<ServiceSubscription[]>('/serviceSubscriptions');
};

export const purchaseService = async (subscription: Omit<ServiceSubscription, 'id'>): Promise<ServiceSubscription> => {
    const newSubscription = {
        ...subscription,
        id: Date.now()
    };
    await apiClient.post('/serviceSubscriptions', newSubscription);
    return newSubscription as ServiceSubscription;
};

export const updateServiceSubscription = async (subscription: ServiceSubscription): Promise<void> => {
    await apiClient.post('/serviceSubscriptions', subscription);
};

export const deleteServiceSubscription = async (id: number): Promise<void> => {
    await apiClient.delete(`/serviceSubscriptions/${id}`);
};
