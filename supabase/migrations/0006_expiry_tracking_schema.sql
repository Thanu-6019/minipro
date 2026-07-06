CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 6. Expiry Tracking (Updated)
DROP TABLE IF EXISTS expiry_tracking;

CREATE TABLE expiry_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id) NOT NULL,
    mfg_date DATE,
    exp_date DATE NOT NULL,
    batch_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_expiry_tracking_medicine_id ON expiry_tracking(medicine_id);
ALTER TABLE expiry_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own expiry data" ON expiry_tracking USING (EXISTS (SELECT 1 FROM medicines WHERE medicines.id = expiry_tracking.medicine_id AND medicines.user_id = auth.uid()));
