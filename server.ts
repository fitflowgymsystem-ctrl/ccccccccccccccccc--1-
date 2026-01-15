import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

console.log('🔧 Loading Environment from:', envPath);

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.resolve(__dirname, 'database.json');
const DB_TEMP_FILE = path.resolve(__dirname, 'database.json.tmp');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Type Definitions ---
interface Entity {
    id: string | number;
    [key: string]: any;
}

interface Database {
    gyms: Entity[];
    users: Entity[];
    logs: Entity[];
    financials: Entity[];
    trainers: Entity[];
    products: Entity[];
    plans: Entity[];
    offers: Entity[];
    equipment: Entity[];
    saas_config?: any;
    priceChangeLogs?: Entity[];
    broadcasts?: Entity[];
    [key: string]: any;
}

// --- Initial Data ---
const initDB: Database = {
    gyms: [],
    users: [],
    logs: [],
    financials: [],
    trainers: [],
    products: [],
    plans: [
        { id: '1', type: 'Daily', price: 50, durationDays: 1 },
        { id: '2', type: 'Monthly', price: 400, durationDays: 30 },
        { id: '3', type: 'Quarterly', price: 1000, durationDays: 90 },
        { id: '4', type: 'Biannual', price: 1800, durationDays: 180 },
        { id: '5', type: 'Yearly', price: 3200, durationDays: 365 },
        { id: '6', type: 'Lifetime', price: 10000, durationDays: 9999 }
    ],
    offers: [],
    equipment: [],
    broadcasts: [],
    // Global SaaS config stored here for SuperAdmin control
    saas_config: {
        prices: {
            TRIAL: 0,
            BASIC: 80,
            PRO: 150,
            ELITE: 300,
            ENTERPRISE: 500
        },
        planDurationDays: {
            TRIAL: 14,
            BASIC: 30,
            PRO: 90,
            ELITE: 180,
            ENTERPRISE: 365
        },
        trialDurationDays: 14
    },
    priceChangeLogs: []
};

// --- In-Memory Store ---
let db: Database = { ...initDB };

// --- Persistence Layer ---

// Load data synchronously ONLY at startup
const loadDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const fileData = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(fileData);
            // Merge with initDB to ensure all keys exist
            db = { ...initDB, ...parsed };
            console.log('✅ Database loaded successfully.');
        } else {
            console.log('✨ No database found, creating new one.');
            saveDB(); // Create the file
        }
    } catch (error) {
        console.error('❌ Failed to load database:', error);
        // Fallback to initDB if load fails to keep server running
        db = { ...initDB };
    }
};

// Save data asynchronously and atomically
let isSaving = false;
let needsSave = false;

const saveDB = async () => {
    if (isSaving) {
        needsSave = true;
        return;
    }

    isSaving = true;

    try {
        const data = JSON.stringify(db, null, 2);

        // 1. Write to temp file first
        await fs.promises.writeFile(DB_TEMP_FILE, data);

        // 2. Rename temp file to actual file (Atomic operation)
        await fs.promises.rename(DB_TEMP_FILE, DB_FILE);

    } catch (error) {
        console.error('❌ Failed to save database:', error);
    } finally {
        isSaving = false;
        if (needsSave) {
            needsSave = false;
            saveDB(); // Trigger pending save
        }
    }
};

// --- API Routes ---

const createCrudRoutes = (entity: string) => {
    // GET: Read directly from memory (Instant)
    app.get(`/api/${entity}`, (req: Request, res: Response) => {
        res.json(db[entity] || []);
    });

    // POST: Update memory -> Trigger Save -> Return
    app.post(`/api/${entity}`, (req: Request, res: Response) => {
        const item = req.body;

        if (!db[entity]) db[entity] = [];

        const index = db[entity].findIndex((i) => String(i.id) === String(item.id));

        if (index > -1) {
            db[entity][index] = item;
        } else {
            db[entity].unshift(item);
        }

        saveDB(); // Trigger background save
        res.json(item);
    });

    // DELETE: Update memory -> Trigger Save -> Return
    app.delete(`/api/${entity}/:id`, (req: Request, res: Response) => {
        if (!db[entity]) {
            res.json({ success: false });
            return;
        }

        db[entity] = db[entity].filter((i) => String(i.id) !== String(req.params.id));
        saveDB();
        res.json({ success: true });
    });
};

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'connected', time: new Date() }));

// Register standard CRUD routes (saas_config handled separately to enable audit logging)
['gyms', 'users', 'logs', 'financials', 'trainers', 'products', 'plans', 'offers', 'equipment', 'broadcasts'].forEach(createCrudRoutes);

// --- Special SaaS Config Routes with Audit Logging ---
app.get('/api/saas_config', (req: Request, res: Response) => {
    res.json(db.saas_config || {});
});

app.post('/api/saas_config', (req: Request, res: Response) => {
    const incoming = req.body || {};
    const actorFromBody = incoming.actor || undefined;
    const actorFromHeader = (req.headers['x-actor'] as string) || undefined;
    const actor = actorFromBody || actorFromHeader || 'SYSTEM';

    const oldConfig = db.saas_config ? JSON.parse(JSON.stringify(db.saas_config)) : null;

    // Persist the new config object directly
    db.saas_config = incoming;

    // Create an audit entry capturing old/new values, timestamp and actor
    const audit = {
        id: Date.now(),
        type: 'SAAS_CONFIG_UPDATE',
        actor,
        timestamp: new Date().toISOString(),
        oldValue: oldConfig,
        newValue: incoming
    };

    if (!db.priceChangeLogs) db.priceChangeLogs = [];
    db.priceChangeLogs.unshift(audit as any);

    // Also record a compact log into general logs for visibility
    if (!db.logs) db.logs = [];
    db.logs.unshift({ id: Date.now() + 1, time: new Date().toISOString(), action: 'SAAS_CONFIG_UPDATE', actor, message: 'SaaS pricing updated' } as any);

    saveDB();
    res.json(db.saas_config);
});

// Special Logic: Access Control (Updated for Barcode Support)
app.post('/api/validate-access', (req: Request, res: Response) => {
    const { identifier } = req.body;

    // Clean the identifier from asterisks if the scanner sends them (Code 39 standard often wraps data in *)
    // Example: Scanner reads *101* -> we convert it to 101 to match the ID
    const cleanIdentifier = String(identifier).replace(/\*/g, '').trim();

    // Check against Member ID (for barcode), Fingerprint ID, or Phone
    const user = db.users.find((u) =>
        String(u.id) === cleanIdentifier ||
        u.fingerprintId === cleanIdentifier ||
        u.phone === cleanIdentifier
    );

    if (!user) {
        res.status(404).json({ status: 'DENIED', message: 'USER_NOT_FOUND' });
        return;
    }

    const isExpired = new Date(user.expiryDate) < new Date();
    const status = isExpired ? 'DENIED' : 'GRANTED';
    const message = isExpired ? 'EXPIRED' : 'WELCOME';

    const log = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
        status,
        reason: message,
        deviceId: 'Server_Node'
    };

    db.logs.unshift(log as any);
    saveDB();

    res.json({ status, user, message });
});

// --- Forgot Password & Email Logic ---
// Removed: Handled by Firebase Authentication Client SDK

// Start Server
loadDB(); // Load data before we listen
app.listen(PORT, () => console.log(`🚀 FitFlow Core Server: http://localhost:${PORT}`));