-- Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users table (linked to auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

-- 2. Medicines
CREATE TABLE medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_medicines_user_id ON medicines(user_id);
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own medicines" ON medicines USING (auth.uid() = user_id);

-- 3. Schedules
CREATE TABLE schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id) NOT NULL,
    frequency TEXT NOT NULL, -- e.g., 'daily', 'weekly'
    days INTEGER[], -- Array of days (1-7)
    times TEXT[] NOT NULL, -- Array of timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_schedules_medicine_id ON schedules(medicine_id);
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own schedules" ON schedules USING (EXISTS (SELECT 1 FROM medicines WHERE medicines.id = schedules.medicine_id AND medicines.user_id = auth.uid()));

-- 4. Reminders
CREATE TABLE reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES schedules(id) NOT NULL,
    fire_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL -- 'pending', 'taken', 'skipped'
);
CREATE INDEX idx_reminders_schedule_id ON reminders(schedule_id);
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reminders" ON reminders USING (EXISTS (SELECT 1 FROM schedules JOIN medicines ON schedules.medicine_id = medicines.id WHERE schedules.id = reminders.schedule_id AND medicines.user_id = auth.uid()));

-- 5. Medicine Logs
CREATE TABLE medicine_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id) NOT NULL,
    log_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL -- 'taken', 'skipped'
);
CREATE INDEX idx_medicine_logs_medicine_id ON medicine_logs(medicine_id);
ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own logs" ON medicine_logs USING (EXISTS (SELECT 1 FROM medicines WHERE medicines.id = medicine_logs.medicine_id AND medicines.user_id = auth.uid()));

-- 6. Expiry Tracking
CREATE TABLE expiry_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id) NOT NULL,
    expiry_date DATE NOT NULL
);
CREATE INDEX idx_expiry_tracking_medicine_id ON expiry_tracking(medicine_id);
ALTER TABLE expiry_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own expiry data" ON expiry_tracking USING (EXISTS (SELECT 1 FROM medicines WHERE medicines.id = expiry_tracking.medicine_id AND medicines.user_id = auth.uid()));

-- 7. Health Metrics
CREATE TABLE health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    type TEXT NOT NULL, -- 'bp', 'sugar', 'weight'
    value TEXT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own metrics" ON health_metrics USING (auth.uid() = user_id);

-- 8. Appointments
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    title TEXT NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT
);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own appointments" ON appointments USING (auth.uid() = user_id);

-- 9. Adherence Scores
CREATE TABLE adherence_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    score INTEGER NOT NULL
);
CREATE INDEX idx_adherence_scores_user_id ON adherence_scores(user_id);
ALTER TABLE adherence_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own scores" ON adherence_scores USING (auth.uid() = user_id);
