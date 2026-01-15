
import { useState, useEffect } from 'react';
import { AccessDevice } from '../types';
import { getDevices, saveDevice, deleteDevice } from '../services/gymService';

export const useAccessControl = () => {
    const [devices, setDevices] = useState<AccessDevice[]>([]);
    const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'DELETE'>('NONE');
    const [editingDevice, setEditingDevice] = useState<AccessDevice | null>(null);
    const [deviceToDelete, setDeviceToDelete] = useState<AccessDevice | null>(null);
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{id: string, success: boolean} | null>(null);

    useEffect(() => { refreshDevices(); }, []);
    
    const refreshDevices = () => getDevices().then(setDevices);

    const handleSaveDevice = (formData: any) => {
        const deviceData: AccessDevice = {
            id: editingDevice?.id || `NODE_${Date.now()}`,
            gymId: '', 
            status: editingDevice?.status || 'online',
            isCluster: false,
            ...formData
        };
        saveDevice(deviceData);
        refreshDevices();
        setActiveModal('NONE');
    };

    const handleTestConnection = (id: string) => {
        setIsTesting(id); setTestResult(null);
        // Simulate hardware handshake
        setTimeout(() => { 
            setIsTesting(null); 
            setTestResult({ id, success: Math.random() > 0.1 }); 
        }, 2000);
    };

    const handleDelete = (id: string) => {
        deleteDevice(id);
        refreshDevices();
        setActiveModal('NONE');
    };

    return {
        devices, activeModal, setActiveModal, editingDevice, setEditingDevice, 
        deviceToDelete, setDeviceToDelete, isTesting, testResult,
        actions: { handleSaveDevice, handleTestConnection, handleDelete, refreshDevices }
    };
};
