-- ============================================================================
-- Migration 0013: Fix production schema mismatches
-- Generated: 2026-07-02
-- Purpose: Align production DB with application code expectations
-- ============================================================================

-- ============================================================================
-- SECTION 1: Add missing columns to existing tables
-- ============================================================================

-- 1a. medicines: add frequency, start_date, end_date, instructions, updated_at
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 1b. schedules: add time_of_day, active
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS time_of_day TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 1c. medicine_logs: add reminder_id, schedule_id, user_id, action_time
ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS reminder_id UUID;
ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS schedule_id UUID;
ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS action_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Add foreign keys for new medicine_logs columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medicine_logs_reminder_id_fkey'
  ) THEN
    ALTER TABLE medicine_logs ADD CONSTRAINT medicine_logs_reminder_id_fkey
      FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medicine_logs_schedule_id_fkey'
  ) THEN
    ALTER TABLE medicine_logs ADD CONSTRAINT medicine_logs_schedule_id_fkey
      FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medicine_logs_user_id_fkey'
  ) THEN
    ALTER TABLE medicine_logs ADD CONSTRAINT medicine_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 1d. expiry_tracking: add exp_date, mfg_date, batch_number, created_at
--     Keep expiry_date for backward compatibility
ALTER TABLE expiry_tracking ADD COLUMN IF NOT EXISTS exp_date DATE;
ALTER TABLE expiry_tracking ADD COLUMN IF NOT EXISTS mfg_date DATE;
ALTER TABLE expiry_tracking ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE expiry_tracking ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Backfill exp_date from expiry_date where exp_date is null
UPDATE expiry_tracking SET exp_date = expiry_date WHERE exp_date IS NULL;

-- 1e. health_metrics: fix value column type from text to decimal
--     Only alter if current type is text
DO $$
DECLARE
  current_type TEXT;
BEGIN
  SELECT data_type INTO current_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'health_metrics'
    AND column_name = 'value';

  IF current_type = 'text' THEN
    ALTER TABLE health_metrics ALTER COLUMN value TYPE DECIMAL USING value::DECIMAL;
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: Create missing tables
-- ============================================================================

-- 2a. push_tokens
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    token TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, token)
);
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own push tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);

-- 2b. ocr_scans (matches application code in prescription.pipeline.ts)
CREATE TABLE IF NOT EXISTS ocr_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    image_url TEXT NOT NULL,
    ocr_text TEXT,
    confidence_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE ocr_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ocr scans" ON ocr_scans FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_scans_user_id ON ocr_scans(user_id);

-- 2c. grok_verifications
CREATE TABLE IF NOT EXISTS grok_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ocr_result_id UUID REFERENCES ocr_scans(id) NOT NULL,
    structured_data JSONB NOT NULL,
    confidence_score FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE grok_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own grok verifications" ON grok_verifications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM ocr_scans WHERE ocr_scans.id = grok_verifications.ocr_result_id AND ocr_scans.user_id = auth.uid()
  ));
CREATE INDEX IF NOT EXISTS idx_grok_verifications_ocr_id ON grok_verifications(ocr_result_id);

-- 2d. meal_reminders
CREATE TABLE IF NOT EXISTS meal_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reminder_id UUID REFERENCES reminders(id) NOT NULL,
    meal_type TEXT NOT NULL,
    timing TEXT NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE meal_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meal reminders" ON meal_reminders
  FOR ALL USING (EXISTS (
    SELECT 1 FROM reminders
    JOIN schedules ON reminders.schedule_id = schedules.id
    JOIN medicines ON schedules.medicine_id = medicines.id
    WHERE reminders.id = meal_reminders.reminder_id AND medicines.user_id = auth.uid()
  ));
CREATE INDEX IF NOT EXISTS idx_meal_reminders_reminder_id ON meal_reminders(reminder_id);

-- 2e. expiry_notifications_log
CREATE TABLE IF NOT EXISTS expiry_notifications_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expiry_id UUID REFERENCES expiry_tracking(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'expiry_reminder',
    urgency TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    tokens_count INTEGER DEFAULT 0
);
ALTER TABLE expiry_notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own expiry notifications" ON expiry_notifications_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_expiry_notifications_log_user_id ON expiry_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_expiry_notifications_log_expiry_id ON expiry_notifications_log(expiry_id);

-- 2f. appointment_notifications_log
CREATE TABLE IF NOT EXISTS appointment_notifications_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'appointment_reminder',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    hours_before INTEGER NOT NULL,
    tokens_count INTEGER DEFAULT 0
);
ALTER TABLE appointment_notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appointment notifications" ON appointment_notifications_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_log_user_id ON appointment_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_log_appointment_id ON appointment_notifications_log(appointment_id);

-- ============================================================================
-- SECTION 3: Create missing RPC functions
-- ============================================================================

-- 3a. calculate_adherence_score
CREATE OR REPLACE FUNCTION calculate_adherence_score(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL AS $$
DECLARE
    v_total_scheduled INTEGER;
    v_total_taken INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_scheduled
    FROM reminders r
    JOIN schedules s ON r.schedule_id = s.id
    JOIN medicines m ON s.medicine_id = m.id
    WHERE m.user_id = p_user_id
      AND r.fire_time::DATE BETWEEN p_start_date AND p_end_date;

    SELECT COUNT(*) INTO v_total_taken
    FROM medicine_logs ml
    JOIN medicines m ON ml.medicine_id = m.id
    WHERE m.user_id = p_user_id
      AND ml.status = 'taken'
      AND ml.log_time::DATE BETWEEN p_start_date AND p_end_date;

    IF v_total_scheduled = 0 THEN
        RETURN 100.0;
    END IF;

    RETURN (v_total_taken::DECIMAL / v_total_scheduled::DECIMAL) * 100.0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3b. get_health_trend
CREATE OR REPLACE FUNCTION get_health_trend(
    p_user_id UUID,
    p_type TEXT,
    p_months INTEGER
) RETURNS TABLE(date_bucket DATE, avg_value DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('day', recorded_at)::DATE as date_bucket,
        AVG(value::DECIMAL) as avg_value
    FROM health_metrics
    WHERE user_id = p_user_id
      AND type = p_type
      AND recorded_at >= NOW() - (p_months || ' months')::INTERVAL
    GROUP BY 1
    ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 4: Create storage bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for prescriptions bucket
DO $$
BEGIN
  -- Upload policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own prescriptions'
  ) THEN
    CREATE POLICY "Users can upload their own prescriptions"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'prescriptions'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can access their own prescriptions'
  ) THEN
    CREATE POLICY "Users can access their own prescriptions"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'prescriptions'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own prescriptions'
  ) THEN
    CREATE POLICY "Users can delete their own prescriptions"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'prescriptions'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: Add missing performance indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(type);
CREATE INDEX IF NOT EXISTS idx_reminders_fire_time ON reminders(fire_time);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_log_time ON medicine_logs(log_time);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON health_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_reminder_id ON medicine_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_schedule_id ON medicine_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_user_id ON medicine_logs(user_id);
