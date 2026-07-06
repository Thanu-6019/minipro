-- Optimizing chronological queries for reminders and health tracking
CREATE INDEX IF NOT EXISTS idx_reminders_fire_time ON reminders(fire_time);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_log_time ON medicine_logs(log_time);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON health_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
