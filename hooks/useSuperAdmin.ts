
import { useState, useEffect, useMemo } from 'react';
import { GymProfile, GymSubscriptionPlan, UserRole } from '../types';
import { getAllGyms, updateGym, deleteGym, createGym } from '../services/gymProfileService';
import { getSaaSConfig, updateSaaSPrice, calculateMRR, fetchSaaSConfigFromServer } from '../services/saasService';

export const useSuperAdmin = () => {
    const [gyms, setGyms] = useState<GymProfile[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [deployedCredentials, setDeployedCredentials] = useState<{ username: string, pass: string, name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [systemLoad, setSystemLoad] = useState(14);
    const [editingGym, setEditingGym] = useState<GymProfile | null>(null);
    const [gymToDelete, setGymToDelete] = useState<GymProfile | null>(null);
    const [saasConfig, setSaaSConfig] = useState(getSaaSConfig());

    const refreshFleet = async () => {
        try {
            const data = await getAllGyms();
            console.log("Refreshed Fleet Count:", data?.length);
            setGyms(data || []);
            // Sync SaaS pricing from server if available
            const serverConfig = await fetchSaaSConfigFromServer();
            setSaaSConfig(serverConfig || getSaaSConfig());
        } catch (error) {
            console.error("Fleet sync failed:", error);
        }
    };

    useEffect(() => {
        refreshFleet();
        const interval = setInterval(() => setSystemLoad(Math.floor(Math.random() * 5) + 12), 5000);
        return () => clearInterval(interval);
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const activeCount = gyms.filter(g => {
            if (!g.isActive) return false;
            if (g.subscriptionExpiry) {
                const expiryDate = new Date(g.subscriptionExpiry);
                return expiryDate >= now;
            }
            return true;
        }).length;

        return {
            total: gyms.length,
            active: activeCount,
            mrr: calculateMRR(gyms),
            apiCalls: typeof window !== 'undefined' ? parseInt(localStorage.getItem('api_call_count') || '0') : 0
        };
    }, [gyms, saasConfig]);

    const filteredGyms = useMemo(() => {
        return gyms.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [gyms, searchTerm]);

    return {
        gyms: filteredGyms,
        stats,
        isFormModalOpen,
        setIsFormModalOpen,
        isNotifModalOpen,
        setIsNotifModalOpen,
        deployedCredentials,
        setDeployedCredentials,
        searchTerm,
        setSearchTerm,
        systemLoad,
        editingGym,
        setEditingGym,
        gymToDelete,
        saasPricing: saasConfig.prices,
        saasPlanDurations: saasConfig.planDurationDays || {},
        actions: {
            updatePrice: (plan: GymSubscriptionPlan, price: number) => {
                const newConfig = updateSaaSPrice(plan, price);
                setSaaSConfig(newConfig);
            },
            handleSaveGym: async (formData: any) => {
                try {
                    if (editingGym) {
                        await updateGym(editingGym.id, formData);
                        setIsFormModalOpen(false);
                    } else {
                        // توليد يوزر نيم احترافي
                        const cleanName = formData.name.toLowerCase().replace(/\s+/g, '_').slice(0, 10);
                        const nextIndex = gyms.length + 1;
                        const generatedUsername = `${cleanName}_${nextIndex}`;
                        const generatedPassword = formData.phone || 'fitflow123';

                        // توليد معرف فريد للسحابة لضمان الصلاحيات
                        const generatedId = `gym_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                        const generatedData = {
                            ...formData,
                            id: generatedId,
                            adminUsername: generatedUsername,
                            adminPassword: generatedPassword,
                            createdAt: new Date().toISOString(),
                            isActive: true
                        };

                        await createGym(generatedData);

                        setDeployedCredentials({
                            username: generatedUsername,
                            pass: generatedPassword,
                            name: formData.name
                        });

                        setIsFormModalOpen(false);
                    }
                    setEditingGym(null);
                    refreshFleet();
                } catch (e: any) {
                    alert(`DEPLOYMENT FAILED: ${e.message}`);
                }
            },
            toggleStatus: async (gym: GymProfile) => {
                const updatedGym = { ...gym, isActive: !gym.isActive };
                setGyms(prev => prev.map(g => g.id === gym.id ? updatedGym : g));
                try {
                    await updateGym(gym.id, updatedGym);
                } catch (e) {
                    refreshFleet();
                }
            },
            impersonate: (gym: GymProfile) => {
                const session = JSON.parse(localStorage.getItem('fitflow_session') || '{}');
                // Ensure we are completely replacing the context
                const newSession = {
                    ...session,
                    id: gym.id, // Using the target gym's ID as the session ID context
                    gymId: gym.id,
                    role: UserRole.ADMIN,
                    name: gym.ownerName || `Admin @ ${gym.name}`,
                    username: gym.adminUsername,
                    impersonated: true
                };
                localStorage.setItem('fitflow_session', JSON.stringify(newSession));
                // Force a hard reload to clear any in-memory state
                window.location.href = '/';
            },
            handleDeleteGym: (id: string) => {
                const gym = gyms.find(g => g.id === id);
                if (gym) setGymToDelete(gym);
            },
            confirmDelete: async () => {
                if (!gymToDelete) return;

                const id = gymToDelete.id;
                console.log("Processing safe deletion for:", id);

                const result: any = await deleteGym(id);
                if (result && result.success) {
                    refreshFleet();
                    setGymToDelete(null);
                } else {
                    console.error("Delete failed result:", result);
                    alert(`Deletion failed. Check console.`);
                }
            },
            cancelDelete: () => setGymToDelete(null)
        }
    };
};
