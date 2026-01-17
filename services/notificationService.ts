import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, limit, setDoc } from 'firebase/firestore';
import { GymNotification, NotificationType } from '../types/notification.types';
import { User, UserRole } from '../types/user.types';
import { apiClient } from './apiClient';

// ... (existing code)

export const notifyAllUsers = async (
    title: string,
    message: string,
    type: NotificationType = 'info',
    targetGymId?: string | null,
    link?: string
) => {
    try {
        console.log('[Broadcast] Fetching recipients from API...');

        // Fetch all user types to ensure broad coverage
        const [gyms, members, trainers] = await Promise.all([
            apiClient.get('/gyms').catch(() => []),
            apiClient.get('/users').catch(() => []),
            apiClient.get('/trainers').catch(() => [])
        ]);

        let recipients: { id: string | number }[] = [];

        // 1. Admins (Gym Owners)
        // If targetGymId is set, only that gym's admin. Else all admins.
        if (targetGymId) {
            // Find gym with id == targetGymId
            const gym = (gyms as any[]).find(g => g.id === targetGymId);
            if (gym) recipients.push({ id: gym.id });
        } else {
            recipients.push(...(gyms as any[]).map(g => ({ id: g.id })));
        }

        // 2. Members
        let activeMembers = (members as any[]);
        if (targetGymId) {
            activeMembers = activeMembers.filter(u => u.gymId === targetGymId);
        }
        // Filter inactive members if isActive property exists
        activeMembers = activeMembers.filter(u => u.isActive !== false);
        recipients.push(...activeMembers.map(u => ({ id: u.id })));

        // 3. Trainers
        let activeTrainers = (trainers as any[]);
        if (targetGymId) {
            activeTrainers = activeTrainers.filter(t => t.gymId === targetGymId);
        }
        recipients.push(...activeTrainers.map(t => ({ id: t.id })));

        console.log(`[Broadcast] Sending to ${recipients.length} recipients...`);

        // Send in chunks
        const chunkSize = 50;
        for (let i = 0; i < recipients.length; i += chunkSize) {
            const chunk = recipients.slice(i, i + chunkSize);
            await Promise.all(chunk.map(user =>
                sendNotification(user.id, title, message, type, 'System Broadcast', undefined, link)
            ));
        }

        console.log(`[Broadcast] Completed.`);
        return recipients.length;
    } catch (error) {
        console.error('[Broadcast] Failed:', error);
        throw error;
    }
};

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Send a single notification to a specific user.
 * Supports customId for idempotency (deduplication).
 */
export const sendNotification = async (
    recipientId: string | number,
    title: string,
    message: string,
    type: NotificationType = 'info',
    branchId: string = 'General',
    relatedMemberId?: string | number,
    link?: string,
    customId?: string
) => {
    try {
        const newNotification: any = {
            recipientId: recipientId.toString(),
            title,
            message,
            timestamp: new Date().toISOString(),
            isRead: false,
            type,
            branchId
        };

        if (relatedMemberId) newNotification.relatedMemberId = relatedMemberId.toString();
        if (link) newNotification.link = link;

        if (customId) {
            await setDoc(doc(db, NOTIFICATIONS_COLLECTION, customId), newNotification);
            console.log(`[Notification] Sent (Idempotent) to ${recipientId}: ${title}`);
        } else {
            await addDoc(collection(db, NOTIFICATIONS_COLLECTION), newNotification);
            console.log(`[Notification] Sent to ${recipientId}: ${title}`);
        }
    } catch (error) {
        console.error('[Notification] Failed to send:', error);
    }
};

/**
 * Broadcast notification to all Staff (Admins, Employees, Trainers) of a specific branch.
 * Also sends to all SUPER_ADMINs regardless of branch.
 * Supports idPrefix for idempotency (e.g. 'expiry-123-2023-10-10')
 */
export const notifyBranchStaff = async (
    users: User[], // We pass the full user list to avoid excessive DB reads
    branchName: string,
    title: string,
    message: string,
    type: NotificationType = 'info',
    relatedMemberId?: string | number,
    idPrefix?: string
) => {
    // 1. Identify recipients
    const recipients = users.filter(u => {
        // Include Super Admins always
        if (u.role === UserRole.SUPER_ADMIN) return true;

        // For others, must match branch (if branch is specified) and be staff
        // If branchName is 'All', send to all staff? Assuming branchName is specific here.
        const matchesBranch = !branchName || u.branch === branchName || u.gymId === branchName; // Fallback to gymId if branch matches
        const isStaff = [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.TRAINER].includes(u.role as UserRole);

        return matchesBranch && isStaff;
    });

    // 2. Send to each (Parallel)
    await Promise.all(recipients.map(user => {
        const customId = idPrefix ? `${idPrefix}-${user.id}` : undefined;
        return sendNotification(user.id, title, message, type, branchName, relatedMemberId, undefined, customId);
    }));

    console.log(`[Notification] Broadcasted to ${recipients.length} staff members in ${branchName}`);
};

/**
 * Check for expiring memberships and trigger notifications.
 * Uses deterministic IDs to prevent duplication.
 */
export const checkAndTriggerExpirations = async (users: User[]) => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // Filter expiring users
    const expiring = users.filter(u => {
        if (!u.isActive || !u.expiryDate) return false;
        const exp = new Date(u.expiryDate);
        // Check if expiring in next 3 days (and not already past)
        // Also ensuring we don't spam for expired users, just "approaching"
        return exp <= threeDaysLater && exp >= today;
    });

    if (expiring.length === 0) return;

    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    for (const user of expiring) {
        // ID prefix: expiry-{memberId}-{date}
        // This ensures for a given member on a given day, we only send ONE set of notifications
        const idPrefix = `expiry-${user.id}-${dateStr}`;

        await notifyBranchStaff(
            users,
            user.branch || '',
            'Membership Expiring',
            `Subscription for ${user.name} expires on ${user.expiryDate?.split('T')[0]}`,
            'warning',
            user.id,
            idPrefix
        );
    }
    console.log(`[Notification] Checked expirations. Triggered for ${expiring.length} members.`);
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string) => {
    try {
        const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await updateDoc(docRef, { isRead: true });
    } catch (error) {
        console.error('[Notification] Failed to mark as read:', error);
    }
};

/**
 * Custom hook logic to subscribe to unread notifications for a user.
 * (Usually implemented inside a React component or custom hook file, strictly logic here)
 */
export const subscribeToNotifications = (
    userId: string | number,
    onUpdate: (notifications: GymNotification[]) => void
) => {
    // Removed orderBy to avoid needing a specific composite index immediately.
    // We sort client-side which is fine for limit(50).
    const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('recipientId', '==', userId.toString()),
        where('isRead', '==', false),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as GymNotification[];

        // Sort Newest First (Desc)
        notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        onUpdate(notifications);
    }, (error) => {
        console.error('[Notification] Subscription error:', error);
    });
};

/**
 * Check for upcoming installment payments and notify members & staff.
 * Uses deterministic IDs to prevent duplication.
 */
export const checkAndNotifyInstallmentsDue = async (users: User[]) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    let notifiedCount = 0;

    for (const user of users) {
        if (!user.installmentPlans || user.installmentPlans.length === 0) continue;

        for (const plan of user.installmentPlans) {
            if (plan.status === 'COMPLETED') continue;

            for (const installment of plan.installments || []) {
                if (installment.status === 'PAID') continue;

                const dueDate = new Date(installment.dueDate);
                // Check if due within next 3 days (and not past)
                if (dueDate >= today && dueDate <= threeDaysLater) {
                    const idPrefix = `installment-${user.id}-${installment.id}-${dateStr}`;

                    // Notify the Member
                    await sendNotification(
                        user.id,
                        'قسط مستحق قريباً',
                        `لديك قسط بقيمة ${installment.amount} ج.م مستحق في ${installment.dueDate.split('T')[0]}`,
                        'warning',
                        user.branch || 'General',
                        user.id,
                        undefined,
                        `${idPrefix}-member`
                    );

                    // Notify Staff
                    await notifyBranchStaff(
                        users,
                        user.branch || '',
                        'Installment Due',
                        `${user.name} has an installment of ${installment.amount} EGP due on ${installment.dueDate.split('T')[0]}`,
                        'warning',
                        user.id,
                        idPrefix
                    );

                    notifiedCount++;
                }
            }
        }
    }

    console.log(`[Notification] Checked installments. Triggered for ${notifiedCount} upcoming payments.`);
};

/**
 * Send a notification to a specific member.
 */
export const notifyMember = async (
    memberId: string | number,
    title: string,
    message: string,
    type: NotificationType = 'info',
    branchId: string = 'General',
    link?: string,
    customId?: string
) => {
    return sendNotification(memberId, title, message, type, branchId, undefined, link, customId);
};

/**
 * Notify a member when they subscribe to a new service.
 */
export const notifySubscriptionConfirmation = async (
    memberId: string | number,
    memberName: string,
    serviceName: string,
    expiryDate: string,
    branchId: string = 'General'
) => {
    const customId = `sub-confirm-${memberId}-${Date.now()}`;

    await sendNotification(
        memberId,
        'تأكيد الاشتراك',
        `تم اشتراكك بنجاح في ${serviceName}. صالح حتى ${expiryDate.split('T')[0]}`,
        'success',
        branchId,
        memberId,
        undefined,
        customId
    );

    console.log(`[Notification] Subscription confirmation sent to ${memberName} for ${serviceName}`);
};
