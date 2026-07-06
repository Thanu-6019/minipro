CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 7. Health Metrics (Updated)
DROP TABLE IF EXISTS health_metrics;

CREATE TABLE health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    type TEXT NOT NULL, -- 'bp_systolic', 'bp_diastolic', 'blood_sugar', 'weight', 'bmi', 'heart_rate', 'spo2'
    value DECIMAL NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_type ON health_metrics(type);
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own metrics" ON health_metrics USING (auth.uid() = user_id);
