import { UserRole, UserSession } from '../types';
import { apiClient } from './apiClient';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signInAnonymously, signOut, sendPasswordResetEmail } from "firebase/auth";

export const login = async (email: string, pass: string): Promise<UserSession> => {
    let cleanEmail = email.trim();
    const cleanPass = pass.trim();

    // 0. Resolve Email if Username/Phone is provided & PRE-VALIDATE Password
    let resolvedUser: any = null;
    let resolvedRole: UserRole | null = null;
    let resolvedGym: any = null; // Context gym
    let isLocalPasswordValid = false;

    try {
        console.log("Login Attempt:", { cleanEmail, cleanPass }); // DEBUG
        const gyms = await apiClient.get<any[]>('/gyms'); // Using any[] here as it's a mix of gym objects
        console.log("Loaded Gyms:", gyms.length); // DEBUG

        // A. Check SaaS Admin (Super Admin) FIRST
        try {
            const saasParams = await apiClient.get<any>('/saas_config');
            const saasConfig = Array.isArray(saasParams) ? saasParams.find((d: any) => d.id === 'saas_config') : saasParams;

            if (saasConfig && (
                (saasConfig.adminUsername && saasConfig.adminUsername.toLowerCase() === cleanEmail.toLowerCase()) ||
                (saasConfig.email && saasConfig.email.toLowerCase() === cleanEmail.toLowerCase()) ||
                (saasConfig.adminEmail && saasConfig.adminEmail.toLowerCase() === cleanEmail.toLowerCase())
            )) {
                console.log("Found SaaS Admin:", saasConfig.adminUsername); // DEBUG

                // Resolve email
                cleanEmail = saasConfig.adminEmail || saasConfig.email || cleanEmail;
                resolvedUser = saasConfig;
                resolvedRole = UserRole.SUPER_ADMIN;
                resolvedGym = null; // SUPER_ADMIN has no gym

                // Check password
                const adminPass = saasConfig.adminPassword || saasConfig.admin_password || saasConfig.password;
                console.log("Validating SaaS Password...", { expected: adminPass, received: cleanPass }); // DEBUG

                if (adminPass && String(adminPass) === cleanPass) {
                    isLocalPasswordValid = true;
                    console.log("SaaS Password Valid!"); // DEBUG
                } else {
                    console.log("SaaS Password Invalid"); // DEBUG
                }
            }
        } catch (e) {
            console.warn("SaaS Config check failed in lookup", e);
        }

        // B. Check Gym Admin
        if (!resolvedUser) {
            const foundGym = gyms.find((g: any) =>
                (g.adminUsername && g.adminUsername.toLowerCase() === cleanEmail.toLowerCase()) ||
                (g.email && g.email.toLowerCase() === cleanEmail.toLowerCase())
            );
            if (foundGym) {
                console.log("Found Gym User:", foundGym.adminUsername); // DEBUG
                cleanEmail = foundGym.email;
                resolvedUser = foundGym;
                resolvedRole = UserRole.ADMIN;
                resolvedGym = foundGym;

                // Check password (handle both camelCase from apiClient and snake_case raw)
                const gymPass = foundGym.adminPassword || foundGym.admin_password;
                console.log("Validating Password...", { expected: gymPass, received: cleanPass }); // DEBUG

                if (gymPass && String(gymPass) === cleanPass) {
                    isLocalPasswordValid = true;
                    console.log("Password Valid!"); // DEBUG
                } else {
                    console.log("Password Invalid"); // DEBUG
                }
            }
        }

        // B. Check Member
        if (!resolvedUser) {
            for (const gym of gyms) {
                localStorage.setItem('fitflow_session', JSON.stringify({ gymId: gym.id }));
                try {
                    const gymUsers = await apiClient.get<any[]>('/users');
                    const user = gymUsers.find((u: any) =>
                        (u.phone === cleanEmail) ||
                        (u.email && u.email.toLowerCase() === cleanEmail.toLowerCase())
                    );
                    if (user) {
                        console.log("Found Member:", user.name); // DEBUG
                        cleanEmail = user.email;
                        resolvedUser = user;
                        resolvedRole = UserRole.MEMBER;
                        resolvedGym = gym;

                        // Check password
                        const userPass = user.password; // Usually simple 'password'
                        if (userPass && String(userPass) === cleanPass) {
                            isLocalPasswordValid = true;
                        } else if (!userPass && user.phone === cleanPass) {
                            isLocalPasswordValid = true;
                        }

                        if (isLocalPasswordValid) console.log("Member Password Valid"); // DEBUG
                        break;
                    }
                } catch (e) { continue; }
            }
        }

        // C. Check Trainer
        if (!resolvedUser) {
            for (const gym of gyms) {
                localStorage.setItem('fitflow_session', JSON.stringify({ gymId: gym.id }));
                try {
                    const gymTrainers = await apiClient.get<any[]>('/trainers');
                    const trainer = gymTrainers.find((t: any) =>
                        (t.username && t.username.toLowerCase() === cleanEmail.toLowerCase()) ||
                        (t.email && t.email.toLowerCase() === cleanEmail.toLowerCase())
                    );
                    if (trainer) {
                        console.log("Found Trainer:", trainer.username); // DEBUG
                        cleanEmail = trainer.email;
                        resolvedUser = trainer;
                        resolvedRole = UserRole.TRAINER;
                        resolvedGym = gym;

                        // Check password
                        const trainerPass = trainer.password;
                        if (trainerPass && String(trainerPass) === cleanPass) {
                            isLocalPasswordValid = true;
                        }
                        if (isLocalPasswordValid) console.log("Trainer Password Valid"); // DEBUG
                        break;
                    }
                } catch (e) { continue; }
            }
        }

    } catch (error) {
        console.error("User Lookup Error:", error);
    }

    try {
        // 1. Authenticate with Firebase (Hybrid)
        let firebaseUser;
        try {
            // If we found a valid local user but the email doesn't strictly look like an email to Firebase, we might have issues.
            // But we resolved cleanEmail from the DB, so it should be fine.
            const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
            firebaseUser = userCredential.user;
        } catch (firebaseError: any) {
            // If Local Password was VALID, we allow login even if Firebase fails
            // We just sign in anonymously to satisfy API requirements
            if (isLocalPasswordValid) {
                console.warn("Firebase credentials failed, but Local DB credentials matched. Logging in via Fallback.", firebaseError);
                await signInAnonymously(auth);
                // We don't set firebaseUser regular user, but we proceed to session creation
            } else {
                // If neither match, then it's a real failure
                if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
                    throw new Error("INVALID_CREDENTIALS");
                }
                throw new Error(firebaseError.message || "AUTH_FAILED");
            }
        }

        // 2. Create Session (using resolved data if we have it, or fetching it if standard login)

        // If we already resolved the user during the lookup phase, use it directly!
        if (resolvedUser && isLocalPasswordValid) {
            updateSessionStorage(['appTheme', 'darkMode', 'fitflow_global_alert_dismissed']);

            let session: UserSession;

            if (resolvedRole === UserRole.ADMIN) {
                session = {
                    id: resolvedUser.id,
                    name: resolvedUser.ownerName || resolvedUser.name,
                    role: UserRole.ADMIN,
                    gymId: resolvedUser.id,
                    username: resolvedUser.adminUsername,
                    email: resolvedUser.email
                };
            } else if (resolvedRole === UserRole.MEMBER && resolvedGym) {
                session = {
                    id: resolvedUser.id,
                    name: resolvedUser.name,
                    role: UserRole.MEMBER,
                    gymId: resolvedGym.id,
                    username: resolvedUser.phone,
                    memberData: resolvedUser,
                    email: resolvedUser.email
                };
            } else if (resolvedRole === UserRole.TRAINER && resolvedGym) {
                session = {
                    id: resolvedUser.id,
                    name: resolvedUser.name,
                    role: UserRole.TRAINER,
                    gymId: resolvedGym.id,
                    username: resolvedUser.username,
                    email: resolvedUser.email
                };
            } else {
                throw new Error("UNKNOWN_USER_TYPE");
            }

            localStorage.setItem('fitflow_session', JSON.stringify(session));
            return session;
        }

        // Fallback for standard flow (if lookup somehow missed but Firebase worked - rare but possible)
        const [gyms, users, trainers] = await Promise.all([
            apiClient.get<any[]>('/gyms'),
            apiClient.get<any[]>('/users'),
            apiClient.get<any[]>('/trainers')
        ]);

        // ... (Repeating the search logic is redundant if we did it above, but safe for pure email logins that skipped the "password check" part if regex matched immediately?)

        // 2a. Check SaaS Admin (Super Admin)
        try {
            const saasParams = await apiClient.get<any>('/saas_config');
            // saasParams might be an array or object depending on apiClient
            const saasConfig = Array.isArray(saasParams) ? saasParams.find((d: any) => d.id === 'saas_config') : saasParams;

            if (saasConfig && (
                (saasConfig.email && saasConfig.email.toLowerCase() === cleanEmail.toLowerCase()) ||
                (saasConfig.adminEmail && saasConfig.adminEmail.toLowerCase() === cleanEmail.toLowerCase())
            )) {
                const session: UserSession = {
                    id: saasConfig.id || 'SYSTEM',
                    name: 'System Administrator',
                    role: UserRole.SUPER_ADMIN,
                    gymId: 'SYSTEM',
                    username: saasConfig.adminUsername || 'super_admin',
                    email: cleanEmail
                };
                localStorage.setItem('fitflow_session', JSON.stringify(session));
                return session;
            }
        } catch (e) { console.warn("SaaS Config check failed", e); }

        // 2b. Check Gym Admin
        const foundGym = gyms.find((g: any) => g.email && g.email.toLowerCase() === cleanEmail.toLowerCase());
        if (foundGym) {
            const session: UserSession = {
                id: foundGym.id,
                name: foundGym.ownerName || foundGym.name,
                role: UserRole.ADMIN,
                gymId: foundGym.id,
                username: foundGym.adminUsername,
                email: foundGym.email
            };
            localStorage.setItem('fitflow_session', JSON.stringify(session));
            return session;
        }

        // 2c. Check Member (Fallback for email login)
        for (const gym of gyms) {
            localStorage.setItem('fitflow_session', JSON.stringify({ gymId: gym.id }));
            try {
                const gymUsers = await apiClient.get<any[]>('/users');
                const user = gymUsers.find((u: any) => u.email && u.email.toLowerCase() === cleanEmail.toLowerCase());
                if (user) {
                    const session: UserSession = {
                        id: user.id,
                        name: user.name,
                        role: UserRole.MEMBER,
                        gymId: gym.id,
                        username: user.phone,
                        memberData: user,
                        email: user.email
                    };
                    localStorage.setItem('fitflow_session', JSON.stringify(session));
                    return session;
                }
            } catch (err) { continue; }
        }

        // 2d. Check Trainer (Fallback for email login)
        for (const gym of gyms) {
            localStorage.setItem('fitflow_session', JSON.stringify({ gymId: gym.id }));
            try {
                const gymTrainers = await apiClient.get<any[]>('/trainers');
                const trainer = gymTrainers.find((t: any) => t.email && t.email.toLowerCase() === cleanEmail.toLowerCase());
                if (trainer) {
                    const session: UserSession = {
                        id: trainer.id,
                        name: trainer.name,
                        role: UserRole.TRAINER,
                        gymId: gym.id,
                        username: trainer.username,
                        email: cleanEmail
                    };
                    localStorage.setItem('fitflow_session', JSON.stringify(session));
                    return session;
                }
            } catch (err) { continue; }
        }

        // If authenticated in Firebase but NOT found in our DB
        await signOut(auth);
        throw new Error("ACCOUNT_NOT_LINKED");

    } catch (error: any) {
        console.error("Login Error:", error);
        if (error.message === "INVALID_CREDENTIALS" || error.message === "ACCOUNT_NOT_LINKED") throw error;
        throw new Error(error.message || "AUTH_FAILED");
    }
};



const updateSessionStorage = (preserveKeys: string[]) => {
    const preserved: Record<string, string | null> = {};
    preserveKeys.forEach(k => preserved[k] = localStorage.getItem(k));
    localStorage.clear();
    sessionStorage.clear();
    Object.entries(preserved).forEach(([k, v]) => { if (v !== null) localStorage.setItem(k, v as string); });
}

export const logout = async () => {
    try { await signOut(auth); } catch (e) { }
    localStorage.removeItem('fitflow_session');
    sessionStorage.clear();
    try { window.location.href = '/'; } catch (e) { }
};

// --- Forgot Password (Firebase) ---
// Using Firebase SDK directly in component is preferred, 
// but we can wrap it here for consistency if requested.
// The user asked to update "authService.login", so we keep this clean.
// The UI will use sendPasswordResetEmail directly or via a wrapper here.

export const requestPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
};

export const changePassword = async (role: UserRole, id: string | number, newPass: string) => {
    const endpoint = role === UserRole.SUPER_ADMIN ? '/system' : '/gyms';
    await apiClient.post(endpoint, { id, admin_password: newPass });
};
