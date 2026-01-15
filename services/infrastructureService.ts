import { apiClient } from './apiClient';
import { getDevices } from './hardwareService';
import { getCurrentGymId } from './storage';

export const probeDatabase = async () => {
    const start = Date.now();
    let connected = false;
    try {
        // Simple read to measure read latency
        await apiClient.get('/gyms');
        connected = await apiClient.checkHealth();
    } catch (e) {
        connected = false;
    }
    const latencyMs = Date.now() - start;
    return { connected, latencyMs };
};

export const probeSync = async () => {
    const payload = { id: 'infra_probe', probeAt: new Date().toISOString() };
    const start = Date.now();
    try {
        // Use apiClient.post so the write is associated with the current gym and will be merged
        await apiClient.post('/infra_checks', payload);
    } catch (e) {
        // ignore
    }
    const writeMs = Date.now() - start;
    return { writeMs };
};

export const checkRlsEnforcement = async () => {
    const gymId = getCurrentGymId();
    if (!gymId) return { enforced: false, details: 'No gym session' };
    try {
        // Attempt to read a sample table that should be isolated
        const users = await apiClient.get('/users');
        // If any returned record has a different gymId, RLS might be misconfigured
        const leaked = Array.isArray(users) ? users.some((u: any) => u.gymId && String(u.gymId) !== String(gymId)) : false;
        return { enforced: !leaked, details: leaked ? 'Cross-tenant rows detected' : 'RLS looks enforced' };
    } catch (e) {
        return { enforced: false, details: 'Check failed' };
    }
};

export const getHardwareClusters = async () => {
    // For now rely on local hardware service (may be mocked)
    try {
        const devices = await getDevices();
        return devices;
    } catch (e) {
        return [];
    }
};
