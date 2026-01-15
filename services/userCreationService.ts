import { updateMonthlyStats } from './statsService';
import { getCurrentGymId } from './storage';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { apiClient } from './apiClient';

export interface CreateMemberData {
    name: string;
    phone: string;
    email: string;
    gender: string;
    membershipType: string;
    joinDate: string;
    expiryDate: string;
    isActive: boolean;
    fingerprintId?: string;
    photoUrl?: string;
    activeOfferId?: string | number;
    isPrivate?: boolean;
    assignedTrainerId?: string | number;
    privateSessionPrice?: number;
    inbodySessions?: number;
    guestPasses?: number;
    ptSessions?: number;
    groupClasses?: boolean;
    spaAccess?: boolean;
    privateLocker?: boolean;
    towelService?: boolean;
    barDiscount?: boolean;
    // New Fields
    dob?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    branch?: string;
    fitnessGoal?: string;
    weight?: number;
    height?: number;
    fatPercentage?: number;
    medicalConditions?: string;
    bloodType?: string;
    paymentMethod?: string;
    totalPaid?: number;
    gymId?: string;
    isFrozen?: boolean;
}

export interface CreateTrainerData {
    name: string;
    email: string;
    username: string;
    password: string;
    commissionRate: number;
    baseSalary: number;
    fingerprintId?: string;
}

/**
 * Create a new member with Firebase Authentication
 * Uses phone number as default password
 */
export const createMemberWithAuth = async (memberData: CreateMemberData) => {
    try {
        // 1. Create Firebase user with email and phone as password
        const password = memberData.phone;
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            memberData.email,
            password
        );

        const firebaseUid = userCredential.user.uid;

        // 2. Save member data to database with Firebase UID
        const memberWithAuth = {
            ...memberData,
            firebaseUid,
            // Ensure proper types
            balance: 0,
            perks: {
                inbodySessions: memberData.inbodySessions || 0,
                guestPasses: memberData.guestPasses || 0,
                ptSessions: memberData.ptSessions || 0,
                groupClasses: !!memberData.groupClasses,
                spaAccess: !!memberData.spaAccess,
                privateLocker: !!memberData.privateLocker,
                towelService: !!memberData.towelService,
                barDiscount: !!memberData.barDiscount
            },
            id: Date.now()
        };

        // Remove temporary fields used only for form
        delete (memberWithAuth as any).inbodySessions;
        delete (memberWithAuth as any).guestPasses;
        delete (memberWithAuth as any).ptSessions;
        delete (memberWithAuth as any).groupClasses;
        delete (memberWithAuth as any).spaAccess;
        delete (memberWithAuth as any).privateLocker;
        delete (memberWithAuth as any).towelService;
        delete (memberWithAuth as any).barDiscount;

        await apiClient.post('/users', memberWithAuth);

        // Trigger atomic update for Monthly Archive (New Member)
        // Trigger atomic update for Monthly Archive (New Member)
        try {
            // Fire and forget
            const gymId = memberWithAuth.gymId || getCurrentGymId() || 'SYSTEM';
            updateMonthlyStats(gymId, 'NEW_MEMBER', 1).catch(e => console.error("Stats bg error", e));
        } catch (e) { console.error("Stats trigger failed", e); }

        return { success: true, data: memberWithAuth };
    } catch (error: any) {
        console.error('Member creation error:', error);

        // Handle Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('EMAIL_EXISTS');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('INVALID_EMAIL');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('WEAK_PASSWORD');
        }

        throw new Error('CREATE_FAILED');
    }
};

/**
 * Create a new trainer with Firebase Authentication
 * Uses the password provided in the form
 */
export const createTrainerWithAuth = async (trainerData: CreateTrainerData) => {
    try {
        // 1. Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            trainerData.email,
            trainerData.password
        );

        const firebaseUid = userCredential.user.uid;

        // 2. Save trainer data to database with Firebase UID
        const trainerWithAuth = {
            ...trainerData,
            firebaseUid,
            totalCommissionEarned: 0,
            id: Date.now()
        };

        await apiClient.post('/trainers', trainerWithAuth);

        return { success: true, data: trainerWithAuth };
    } catch (error: any) {
        console.error('Trainer creation error:', error);

        // Handle Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('EMAIL_EXISTS');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('INVALID_EMAIL');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('WEAK_PASSWORD');
        }

        throw new Error('CREATE_FAILED');
    }
};

/**
 * Create a new staff member (Trainer or Employee) with Firebase Authentication
 */
export const createStaffWithAuth = async (staffData: any, role: string) => {
    try {
        // 1. Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            staffData.email,
            staffData.password
        );

        const firebaseUid = userCredential.user.uid;

        // 2. Prepare data
        const staffWithAuth = {
            ...staffData,
            firebaseUid,
            id: Date.now(),
            role: role // Ensure role is set correctly
        };

        const endpoint = role === 'TRAINER' ? '/trainers' : '/employees';
        await apiClient.post(endpoint, staffWithAuth);

        return { success: true, data: staffWithAuth };
    } catch (error: any) {
        console.error('Staff creation error:', error);
        if (error.code === 'auth/email-already-in-use') throw new Error('EMAIL_EXISTS');
        if (error.code === 'auth/invalid-email') throw new Error('INVALID_EMAIL');
        if (error.code === 'auth/weak-password') throw new Error('WEAK_PASSWORD');
        throw new Error('CREATE_FAILED');
    }
};

/**
 * Update existing member/trainer without touching Firebase
 */
export const updateUserData = async (endpoint: '/users' | '/trainers' | '/employees', userData: any) => {
    try {
        await apiClient.post(endpoint, userData);
        return { success: true };
    } catch (error) {
        console.error('Update error:', error);
        throw new Error('UPDATE_FAILED');
    }
};
