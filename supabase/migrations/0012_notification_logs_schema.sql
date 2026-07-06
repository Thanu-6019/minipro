CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 14. Expiry Notifications Log
CREATE TABLE expiry_notifications_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expiry_id UUID REFERENCES expiry_tracking(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'expiry_reminder',
    urgency TEXT NOT NULL, -- 'tomorrow', 'this_week', 'this_month'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    tokens_count INTEGER DEFAULT 0
);
CREATE INDEX idx_expiry_notifications_log_user_id ON expiry_notifications_log(user_id);
CREATE INDEX idx_expiry_notifications_log_expiry_id ON expiry_notifications_log(expiry_id);
ALTER TABLE expiry_notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own expiry notifications" ON expiry_notifications_log FOR SELECT USING (auth.uid() = user_id);

-- 15. Appointment Notifications Log
CREATE TABLE appointment_notifications_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'appointment_reminder',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    hours_before INTEGER NOT NULL,
    tokens_count INTEGER DEFAULT 0
);
CREATE INDEX idx_appointment_notifications_log_user_id ON appointment_notifications_log(user_id);
CREATE INDEX idx_appointment_notifications_log_appointment_id ON appointment_notifications_log(appointment_id);
ALTER TABLE appointment_notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appointment notifications" ON appointment_notifications_log FOR SELECT USING (auth.uid() = user_id);

-- 16. Push Tokens (for Expo push notifications)
CREATE TABLE push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    token TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'ios', 'android'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, token)
);
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own push tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);
