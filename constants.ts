
export const APP_NAME = "FitFlow";

export const SQL_SCHEMA = `-- 1. تفعيل الإضافات
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. إنشاء الجداول الأساسية
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    admin_username TEXT UNIQUE,
    admin_password TEXT,
    logo_url TEXT,
    subscription_plan TEXT DEFAULT 'Trial',
    subscription_expiry TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
    is_active BOOLEAN DEFAULT TRUE,
    enabled_modules JSONB DEFAULT '{"pos": true, "trainers": true, "attendance": true, "financials": true, "workoutPlans": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    gender TEXT,
    membership_type TEXT,
    join_date DATE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE,
    fingerprint_id TEXT,
    photo_url TEXT,
    balance DECIMAL DEFAULT 0,
    perks JSONB DEFAULT '{"inbody_sessions": 0, "guest_passes": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- (بقية الجداول: plans, offers, equipment, logs, financials, trainers, products)

-- 3. تفعيل الحماية RLS وإضافة السياسات
-- ملاحظة: نستخدم سياسة "Public Access" مع المفتاح anon لتبسيط المزامنة في هذا النموذج
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Gyms" ON gyms FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Plans" ON plans FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Offers" ON offers FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Equip" ON equipment FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Fin" ON financials FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Trainers" ON trainers FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Products" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Logs" ON logs FOR ALL TO anon USING (true) WITH CHECK (true);`;

export const IOT_PSEUDO_CODE = `// Logic for Multi-Tenant Biometric Sync
async function validateAccess(fingerprintId, deviceToken) {
    const { data: device } = await supabase.from('devices').select('gym_id').eq('gym_id', device.gym_id).single();
    // ...
}
`;