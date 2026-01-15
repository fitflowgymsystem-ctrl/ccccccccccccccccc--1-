
import { useState, useEffect, useCallback } from 'react';
import {
    getUsers, getLogs, getEquipment, getPlans, getOffers, getFinancials, getTrainers, getEmployees,
    getServices, getServiceSubscriptions, addService, updateService, deleteService,
    purchaseService, updateServiceSubscription, deleteServiceSubscription,
    addMockUser, updateMockUser, deleteMockUser,
    updateMockEquipment, addMockEquipment, deleteMockEquipment,
    updatePlanPrice, addOffer, deleteOffer,
    addMockTrainer, updateMockTrainer, deleteMockTrainer,
    addEmployee, updateEmployee, deleteEmployee,
    addFinancialRecord, updateWaterLog, useMockPerk, logPrivateSession, logServiceSession,
    purchaseServiceWithFinance, confirmSubscriptionPayment
} from '../services/gymService';
import { addInBodyMeasurement, updateInBodyMeasurement, deleteInBodyMeasurement, updateUserFitnessSettings } from '../services/inbodyService';
import { User, AccessLog, Equipment, MembershipPlan, Offer, FinancialRecord, Trainer, Employee, UserRole, UserSession, MembershipType, GymService, ServiceSubscription, Branch, InBodyMeasurement, ActivityLevel, FitnessGoalType } from '../types';

export const useGymData = (currentUser: UserSession | null, isSubExpired: boolean) => {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [financials, setFinancials] = useState<FinancialRecord[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [services, setServices] = useState<GymService[]>([]);
    const [serviceSubscriptions, setServiceSubscriptions] = useState<ServiceSubscription[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    const refreshData = useCallback(async () => {
        if (!currentUser || currentUser.gymId === 'SYSTEM') return;
        if (isSubExpired && currentUser.role === UserRole.ADMIN) return;

        setIsLoading(true);
        try {
            const [u, l, eq, p, o, f, t, emp, s, ss] = await Promise.all([
                getUsers(), getLogs(), getEquipment(), getPlans(), getOffers(),
                getFinancials(), getTrainers(), getEmployees(), getServices(),
                getServiceSubscriptions()
            ]);

            setUsers(u || []);
            setLogs(l || []);
            setEquipment(eq || []);
            setPlans(p || []);
            setOffers(o || []);
            setFinancials(f || []);
            setTrainers(t || []);
            setEmployees(emp || []);
            setServices(s || []);
            setServiceSubscriptions(ss || []);
        } catch (err) {
            console.error('Error refreshing gym data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, isSubExpired]);

    const refreshServices = useCallback(async () => {
        if (!currentUser || currentUser.gymId === 'SYSTEM') return;
        try {
            const s = await getServices();
            setServices(s || []);
        } catch (err) {
            console.error('Error refreshing services:', err);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && currentUser.gymId !== 'SYSTEM') {
            refreshData();
        }
    }, [currentUser?.gymId, refreshData]);

    // --- Service Actions ---
    const handleAddService = async (service: GymService) => {
        await addService(service);
        refreshServices();
    };

    const handleUpdateService = async (service: GymService) => {
        await updateService(service);
        refreshServices();
    };

    const handleDeleteService = async (id: number) => {
        await deleteService(id);
        refreshServices();
    };

    const handlePurchaseService = async (sub: Omit<ServiceSubscription, 'id'>) => {
        await purchaseService(sub);
        refreshData();
    };

    const handleUpdateServiceSubscription = async (sub: ServiceSubscription) => {
        await updateServiceSubscription(sub);
        refreshData();
    };

    const handleDeleteServiceSubscription = async (id: number) => {
        await deleteServiceSubscription(id);
        refreshData();
    };

    const handleMemberPurchaseService = async (userId: number, service: GymService) => {
        await purchaseServiceWithFinance(userId, service);
        refreshData();
    };

    const handleConfirmPayment = async (subId: number) => {
        await confirmSubscriptionPayment(subId);
        refreshData();
    };

    return {
        data: {
            users,
            logs,
            equipment,
            plans,
            offers,
            financials,
            trainers,
            employees,
            services,
            serviceSubscriptions,
            branches
        },
        isLoading,
        refreshData,
        actions: {
            refreshData,
            addUser: async (u: User) => { await addMockUser(u); refreshData(); },
            updateUser: async (u: User) => { await updateMockUser(u); refreshData(); },
            deleteUser: async (id: number) => { await deleteMockUser(id); refreshData(); },
            addFinancial: async (r: FinancialRecord) => { await addFinancialRecord(r); refreshData(); },
            addTrainer: async (t: Trainer) => { await addMockTrainer(t); refreshData(); },
            updateTrainer: async (t: Trainer) => { await updateMockTrainer(t); refreshData(); },
            deleteTrainer: async (id: number) => { await deleteMockTrainer(id); refreshData(); },
            addEmployee: async (e: Employee) => { await addEmployee(e); refreshData(); },
            updateEmployee: async (e: Employee) => { await updateEmployee(e); refreshData(); },
            deleteEmployee: async (id: number) => { await deleteEmployee(id); refreshData(); },
            addEquipment: async (e: Equipment) => { await addMockEquipment(e); refreshData(); },
            updateEquipment: async (id: number, u: any) => { await updateMockEquipment(id, u); refreshData(); },
            deleteEquipment: async (id: number) => { await deleteMockEquipment(id); refreshData(); },
            updateWater: async (id: number, amt: number) => { await updateWaterLog(id, amt); refreshData(); },
            updatePlan: async (type: MembershipType, price: number) => { await updatePlanPrice(type, price); refreshData(); },
            addOffer: async (o: Offer) => { await addOffer(o); refreshData(); },
            deleteOffer: async (id: number) => { await deleteOffer(id); refreshData(); },
            usePerk: async (userId: number, type: 'InBody' | 'Guest Pass' | 'PT Session') => { await useMockPerk(userId, type); refreshData(); },
            logSession: async (userId: number, trainerId: number, price: number) => { await logPrivateSession(userId, trainerId, price, currentUser?.name || 'System'); refreshData(); },
            logServiceSession: async (userId: number, serviceId: number, price: number, serviceName: string) => { await logServiceSession(userId, serviceId, price, serviceName, currentUser?.name || 'System'); refreshData(); },
            confirmPayment: handleConfirmPayment,
            addService: handleAddService,
            updateService: handleUpdateService,
            deleteService: handleDeleteService,
            purchaseService: handlePurchaseService,
            updateServiceSubscription: handleUpdateServiceSubscription,
            deleteServiceSubscription: handleDeleteServiceSubscription,
            memberPurchaseService: async (userId: number, service: GymService) => { await purchaseServiceWithFinance(userId, service, 'CASH', currentUser?.name || 'System'); refreshData(); },
            // InBody Actions
            addInBodyMeasurement: async (userId: number, measurement: Omit<InBodyMeasurement, 'id'>) => { await addInBodyMeasurement(userId, measurement); refreshData(); },
            updateInBodyMeasurement: async (userId: number, measurement: InBodyMeasurement) => { await updateInBodyMeasurement(userId, measurement); refreshData(); },
            deleteInBodyMeasurement: async (userId: number, measurementId: number) => { await deleteInBodyMeasurement(userId, measurementId); refreshData(); },
            updateFitnessSettings: async (userId: number, activityLevel: ActivityLevel, fitnessGoal: FitnessGoalType) => { await updateUserFitnessSettings(userId, activityLevel, fitnessGoal); refreshData(); }
        }
    };
};
