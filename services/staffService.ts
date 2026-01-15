import { Trainer, TrainerSchedule, Employee } from '../types';
import { apiClient } from './apiClient';
import { load, save, getCurrentGymId } from './storage';

// --- Trainer Operations ---
export const getTrainers = async () => {
    const data = await apiClient.get('/trainers');
    if (data) { save('trainers', data); return data; }
    return load<Trainer[]>('trainers', []);
};

export const addMockTrainer = async (t: Trainer): Promise<any> => {
    const trainer = { ...t, gymId: getCurrentGymId(), attendanceLogs: t.attendanceLogs || [], schedule: t.schedule || [] };
    return await apiClient.post('/trainers', trainer);
};

export const updateMockTrainer = async (t: Trainer) => {
    return await apiClient.post('/trainers', t);
};

export const deleteMockTrainer = async (id: number) => {
    const trainers = load<Trainer[]>('trainers', []).filter(x => x.id !== id);
    save('trainers', trainers);
    return await apiClient.delete(`/trainers/${id}`);
};

// --- Employee Operations ---
export const getEmployees = async () => {
    const data = await apiClient.get('/employees');
    if (data) { save('employees', data); return data; }
    return load<Employee[]>('employees', []);
};

export const addEmployee = async (e: Employee): Promise<any> => {
    const employee = { ...e, gymId: getCurrentGymId(), attendanceLogs: e.attendanceLogs || [] };
    return await apiClient.post('/employees', employee);
};

export const updateEmployee = async (e: Employee) => {
    return await apiClient.post('/employees', e);
};

export const deleteEmployee = async (id: number) => {
    const employees = load<Employee[]>('employees', []).filter(x => x.id !== id);
    save('employees', employees);
    return await apiClient.delete(`/employees/${id}`);
};

export const updateTrainerSchedule = (trainerId: number, schedule: TrainerSchedule[]) => {
    const trainers = load<Trainer[]>('trainers', []);
    const idx = trainers.findIndex(t => t.id === trainerId);
    if (idx > -1) {
        trainers[idx].schedule = schedule;
        save('trainers', trainers);
        apiClient.post('/trainers', trainers[idx]);
    }
};
