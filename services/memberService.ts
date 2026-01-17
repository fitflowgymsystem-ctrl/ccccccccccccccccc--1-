import { User, AccessLog, AccessStatus, Trainer, PerkLog, PrivateSessionLog, ServiceSubscription, GymService } from '../types';
import { apiClient } from './apiClient';
import { load, save, getCurrentGymId } from './storage';

export const getUsers = async () => {
    const data = await apiClient.get('/users');
    if (data) { save('users', data); return data; }
    return load<User[]>('users', []);
};

export const getLogs = async () => {
    const data = await apiClient.get('/logs');
    if (data) { save('logs', data); return data; }
    return load<AccessLog[]>('logs', []);
};

export const checkInUser = async (identifier: string) => {
    // Clean the identifier from asterisks if the scanner sends them (Code 39 standard often wraps data in *)
    const cleanId = String(identifier).replace(/\*/g, '').trim();
    if (!cleanId) return { status: AccessStatus.DENIED, message: "EMPTY_IDENTIFIER" };
    const gymId = getCurrentGymId();
    if (!gymId) return { status: AccessStatus.DENIED, message: "NO_GYM_SELECTED" };

    try {
        // 1. Search in Members
        let userMatch = await apiClient.findOne('users', { id: cleanId });
        if (!userMatch) userMatch = await apiClient.findOne('users', { phone: cleanId });
        if (!userMatch) userMatch = await apiClient.findOne('users', { fingerprintId: cleanId });

        // 2. Search in Trainers if not found in members
        let trainerMatch = null;
        if (!userMatch) {
            trainerMatch = await apiClient.findOne('trainers', { id: cleanId });
            if (!trainerMatch) trainerMatch = await apiClient.findOne('trainers', { phone: cleanId });
            if (!trainerMatch) trainerMatch = await apiClient.findOne('trainers', { fingerprintId: cleanId });
        }

        const person = userMatch || trainerMatch;

        if (!person) {
            return { status: AccessStatus.DENIED, message: "USER_NOT_FOUND" };
        }

        const isTrainer = !!trainerMatch;
        let isExpired = false;
        let isFrozen = false;

        if (!isTrainer) {
            if (person.expiryDate) {
                isExpired = new Date(person.expiryDate) < new Date();
            }
            if (person.isFrozen) {
                isFrozen = true;
            }
        }

        const status = (isExpired || isFrozen) ? AccessStatus.DENIED : AccessStatus.GRANTED;
        let message = 'WELCOME';
        if (isTrainer) message = 'COACH_WELCOME';
        else if (isFrozen) message = 'FROZEN';
        else if (isExpired) message = 'EXPIRED';

        // Create Remote Log
        const logEntry: AccessLog = {
            id: Date.now(),
            gymId: person.gymId || gymId,
            userId: person.id,
            userName: person.name,
            timestamp: new Date().toISOString(),
            status,
            reason: message,
            deviceId: 'Cloud_Node',
            userPhoto: person.photoUrl
        };

        // Fire and forget log saving
        apiClient.post('/logs', logEntry);

        return {
            status,
            user: person,
            message,
            isTrainer
        };
    } catch (e) {
        console.error("[checkInUser] Cloud Error:", e);
        return { status: AccessStatus.DENIED, message: "CONNECTION_ERROR" };
    }
};

export const addMockUser = (u: User) => apiClient.post('/users', { ...u, gymId: getCurrentGymId() });
export const updateMockUser = (u: User) => {
    return apiClient.post('/users', u);
};
export const deleteMockUser = (id: number) => apiClient.delete(`/users/${id}`);

export const simulateScan = async (identifier: string, deviceId: string) => {
    return await checkInUser(identifier);
};

export const updateWaterLog = async (userId: number, amountMl: number) => {
    const users = load<User[]>('users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx > -1) {
        const today = new Date().toISOString().split('T')[0];
        if (!users[idx].waterLogs) users[idx].waterLogs = [];
        const logIdx = users[idx].waterLogs!.findIndex(l => l.date === today);
        if (logIdx > -1) users[idx].waterLogs![logIdx].amountMl = amountMl;
        else users[idx].waterLogs!.push({ date: today, amountMl });
        save('users', users);
        await apiClient.post('/users', users[idx]);
    }
};

export const logPrivateSession = async (userId: number, trainerId: number, price: number, operator: string = 'System') => {
    const users = load<User[]>('users', []);
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx > -1) {
        const trainers = load<Trainer[]>('trainers', []);
        const trainer = trainers.find(t => t.id === trainerId);
        if (trainer) {
            const newLog: PrivateSessionLog = { id: Date.now(), date: new Date().toISOString(), trainerId, trainerName: trainer.name, price };
            if (!users[userIdx].privateLogs) users[userIdx].privateLogs = [];
            users[userIdx].privateLogs!.push(newLog);
            users[userIdx].balance -= price;
            save('users', users);
            await apiClient.post('/users', users[userIdx]);

            const trainerIdx = trainers.findIndex(t => t.id === trainerId);
            if (trainerIdx > -1) {
                trainers[trainerIdx].totalCommissionEarned += (price * (trainers[trainerIdx].commissionRate / 100));
                save('trainers', trainers);
                await apiClient.post('/trainers', trainers[trainerIdx]);
            }

            // إضافة سجل مالي للجلسة الخاصة
            const { addFinancialRecord } = await import('./financeService');
            await addFinancialRecord({
                id: Date.now(),
                gymId: getCurrentGymId() || '',
                type: 'INCOME',
                category: 'OTHER',
                amount: price,
                description: `Private Session - ${users[userIdx].name} with ${trainer.name}`,
                date: new Date().toISOString(),
                paymentMethod: 'CASH',
                processedBy: operator
            } as any);
        }
    }
};

export const logServiceSession = async (userId: number, serviceId: number, price: number, serviceName: string, operator: string = 'System') => {
    const users = load<User[]>('users', []);
    const userIdx = users.findIndex(u => u.id === userId);

    if (userIdx > -1) {
        // 0. Get Service Details to check type
        const services = load<GymService[]>('services', []);
        const service = services.find(s => s.id === serviceId);
        const isSubscriptionTimeBased = service?.pricingType === 'SUBSCRIPTION';

        // 1. Update the subscription count
        const subscriptions = load<ServiceSubscription[]>('serviceSubscriptions', []);
        const subIdx = subscriptions.findIndex(s =>
            s.userId === userId &&
            s.serviceId === serviceId &&
            s.status === 'active' &&
            (isSubscriptionTimeBased || s.remainingSessions > 0)
        );

        if (subIdx > -1) {
            // Check Payment Status (Skip for PER_SESSION as it is pay-as-you-go)
            if (subscriptions[subIdx].paymentStatus === 'unpaid' && service?.pricingType !== 'PER_SESSION') {
                throw new Error("UNPAID_SERVICE");
            }

            if (!isSubscriptionTimeBased) {
                subscriptions[subIdx].remainingSessions--;
                if (subscriptions[subIdx].remainingSessions === 0) {
                    subscriptions[subIdx].status = 'depleted';
                }
            }
            save('serviceSubscriptions', subscriptions);
            await apiClient.post('/serviceSubscriptions', subscriptions[subIdx]);
        }

        // 2. Add to logs
        // For PER_SESSION: Charge now (Price > 0). For others: Prepaid (Price = 0)
        const sessionPrice = service?.pricingType === 'PER_SESSION' ? price : 0;

        const newLog: PrivateSessionLog = {
            id: Date.now(),
            date: new Date().toISOString(),
            trainerId: serviceId,
            trainerName: serviceName,
            price: sessionPrice
        };
        if (!users[userIdx].privateLogs) users[userIdx].privateLogs = [];
        users[userIdx].privateLogs!.push(newLog);

        // Balance Deduction (ONLY for PER_SESSION)
        if (service?.pricingType === 'PER_SESSION') {
            users[userIdx].balance -= sessionPrice;
        }

        save('users', users);
        await apiClient.post('/users', users[userIdx]);

        // 3. Financial Record (ONLY for PER_SESSION)
        if (service?.pricingType === 'PER_SESSION') {
            const { addFinancialRecord } = await import('./financeService');
            await addFinancialRecord({
                id: Date.now(),
                gymId: getCurrentGymId() || '',
                type: 'INCOME',
                category: 'OTHER',
                amount: sessionPrice,
                description: `Service Session (Per Session) - ${users[userIdx].name} (${serviceName})`,
                date: new Date().toISOString(),
                paymentMethod: 'CASH',
                processedBy: operator
            } as any);
        }
    }
};

export const useMockPerk = async (userId: number, type: 'InBody' | 'Guest Pass' | 'PT Session' | 'Free Group Class') => {
    const users = load<User[]>('users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx > -1) {
        if (type === 'InBody' && (users[idx].perks.inbodySessions || 0) > 0) {
            users[idx].perks.inbodySessions--;
        } else if (type === 'Guest Pass' && (users[idx].perks.guestPasses || 0) > 0) {
            users[idx].perks.guestPasses--;
        } else if (type === 'PT Session' && ((users[idx].perks as any).ptSessions || 0) > 0) {
            (users[idx].perks as any).ptSessions--;
        } else if (type === 'Free Group Class' && (users[idx].perks.freeGroupClassCount || 0) > 0) {
            users[idx].perks.freeGroupClassCount!--;
        } else {
            return;
        }

        if (!users[idx].perkLogs) users[idx].perkLogs = [];
        users[idx].perkLogs!.push({ id: Date.now(), type, date: new Date().toISOString() } as PerkLog);
        save('users', users);
        await apiClient.post('/users', users[idx]);
    }
};

export const purchaseServiceWithFinance = async (userId: number, service: GymService, paymentMethod: 'CASH' | 'CARD' = 'CASH', operator: string = 'System') => {
    const users = load<User[]>('users', []);
    const userIdx = users.findIndex(u => u.id === userId);

    if (userIdx > -1) {
        // 1. Create Subscription
        const purchaseDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(purchaseDate.getDate() + (service.validityDays || 30));

        const newSub: ServiceSubscription = {
            id: Date.now(),
            userId,
            serviceId: service.id,
            serviceName: service.name,
            purchaseDate: purchaseDate.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            totalSessions: service.pricingType === 'SUBSCRIPTION' ? 0 : (service.packageSessions || (service.pricingType === 'PER_SESSION' ? 1 : 1)),
            remainingSessions: service.pricingType === 'SUBSCRIPTION' ? 0 : (service.packageSessions || (service.pricingType === 'PER_SESSION' ? 1 : 1)),
            status: 'active',
            paymentStatus: operator === 'System' ? 'unpaid' : (paymentMethod === 'CASH' ? 'paid' : 'unpaid'),
            price: service.price
        };

        const subscriptions = load<ServiceSubscription[]>('serviceSubscriptions', []);
        subscriptions.push(newSub);
        save('serviceSubscriptions', subscriptions);
        await apiClient.post('/serviceSubscriptions', newSub);

        const isPerSession = service.pricingType === 'PER_SESSION';

        // 2. Deduct Balance (SKIP if Per Session)
        if (!isPerSession) {
            users[userIdx].balance -= service.price;
        }
        save('users', users);
        await apiClient.post('/users', users[userIdx]);

        // 3. Add Financial Record (SKIP if Per Session)
        if (!isPerSession) {
            const { addFinancialRecord } = await import('./financeService');
            await addFinancialRecord({
                id: Date.now(),
                gymId: getCurrentGymId() || '',
                type: 'INCOME',
                category: 'OTHER',
                amount: service.price,
                description: `Self-Subscription - ${users[userIdx].name} (${service.name})`,
                date: new Date().toISOString(),
                paymentMethod,
                processedBy: operator
            } as any);

            // Trigger atomic update for Monthly Archive (Class Sale)
            try {
                import('./statsService').then(({ updateMonthlyStats }) => {
                    updateMonthlyStats(getCurrentGymId() || '', 'CLASS_SALE', 1, service.name).catch(e => console.error("Stats bg error", e));
                });
            } catch (e) { console.error("Stats trigger failed", e); }
        }

        // 4. Send Subscription Confirmation Notification to Member
        try {
            import('./notificationService').then(({ notifySubscriptionConfirmation }) => {
                notifySubscriptionConfirmation(
                    userId,
                    users[userIdx].name,
                    service.name,
                    newSub.expiryDate,
                    users[userIdx].branch || 'General'
                ).catch(e => console.error("Notification error", e));
            });
        } catch (e) { console.error("Notification trigger failed", e); }

        return newSub;
    }
    throw new Error("User not found");
};

export const confirmSubscriptionPayment = async (subscriptionId: number) => {
    const subscriptions = load<ServiceSubscription[]>('serviceSubscriptions', []);
    console.log(`[MemberService] Confirming payment for sub ID: ${subscriptionId}. Total subs loaded: ${subscriptions.length}`);

    const idx = subscriptions.findIndex(s => String(s.id) === String(subscriptionId));
    if (idx > -1) {
        console.log(`[MemberService] Found sub: ${subscriptions[idx].serviceName} for user: ${subscriptions[idx].userId}. Current Status: ${subscriptions[idx].paymentStatus}`);
        subscriptions[idx].paymentStatus = 'paid';
        save('serviceSubscriptions', subscriptions);
        await apiClient.post('/serviceSubscriptions', subscriptions[idx]);
        return subscriptions[idx];
    }
    console.error(`[MemberService] Subscription ${subscriptionId} not found in local cache.`);
    throw new Error("Subscription not found");
};