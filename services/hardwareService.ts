
import { AccessDevice, Equipment } from '../types';
import { load, save, getCurrentGymId } from './storage';
import { apiClient } from './apiClient';

export const getDevices = () => Promise.resolve(load<AccessDevice[]>('devices', [
    { id: '1', gymId: getCurrentGymId(), name: 'Main Gate', type: 'Fingerprint', connectionType: 'Ethernet', ip: '192.168.1.201', port: 4370, status: 'online', isCluster: false }
]));

export const saveDevice = (device: AccessDevice) => {
    const devices = load<AccessDevice[]>('devices', []);
    const idx = devices.findIndex(d => d.id === device.id);
    if (idx > -1) devices[idx] = device;
    else devices.push({ ...device, gymId: getCurrentGymId() });
    save('devices', devices);
};

export const deleteDevice = (id: string) => {
    const devices = load<AccessDevice[]>('devices', []).filter(d => d.id !== id);
    save('devices', devices);
};

export const getEquipment = async () => {
    const data = await apiClient.get('/equipment');
    if (data) { save('equipment', data); return data; }
    return load<Equipment[]>('equipment', []);
};

// Fixed: Return the promise result from apiClient.post to allow the UI to receive the updated state and avoid void truthiness issues
export const updateMockEquipment = (id: number, updates: Partial<Equipment>) => {
    const equip = load<Equipment[]>('equipment', []);
    const idx = equip.findIndex(e => e.id === id);
    if (idx > -1) {
        equip[idx] = { ...equip[idx], ...updates };
        save('equipment', equip);
        return apiClient.post('/equipment', equip[idx]);
    }
    return Promise.resolve(null);
};

// Fixed: Return the result of the API call so that truthiness checks in hooks (like useGymData) function correctly
export const addMockEquipment = (item: Equipment) => {
    const equip = load<Equipment[]>('equipment', []);
    const newItem = { ...item, gymId: getCurrentGymId(), logs: [] };
    equip.unshift(newItem);
    save('equipment', equip);
    return apiClient.post('/equipment', newItem);
};

export const deleteMockEquipment = (id: number) => {
    const equip = load<Equipment[]>('equipment', []).filter(e => e.id !== id);
    save('equipment', equip);
    // تم تغيير fetch بـ apiClient.delete لمنع خطأ الاتصال بالسيرفر المحلي
    return apiClient.delete(`/equipment/${id}`);
};
