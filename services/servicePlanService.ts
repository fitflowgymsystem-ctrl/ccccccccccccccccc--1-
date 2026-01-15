import { apiClient } from './apiClient';
import { GymService } from '../types';
import { getCurrentGymId, save, load } from './storage';

export const getServices = async () => {
    const data = await apiClient.get('/services');
    if (data) { save('services', data); return data; }
    return load<GymService[]>('services', []);
};

export const addService = (service: GymService) => {
    return apiClient.post('/services', { ...service, gymId: getCurrentGymId() });
};

export const updateService = (service: GymService) => {
    return apiClient.post('/services', service);
};

export const deleteService = (id: number) => {
    return apiClient.delete(`/services/${id}`);
};
