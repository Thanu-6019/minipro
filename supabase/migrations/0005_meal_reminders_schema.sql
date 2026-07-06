CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 12. Meal Reminders
CREATE TABLE meal_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reminder_id UUID REFERENCES reminders(id) NOT NULL,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner'
    timing TEXT NOT NULL, -- 'before', 'after'
    confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_meal_reminders_reminder_id ON meal_reminders(reminder_id);
ALTER TABLE meal_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meal reminders" ON meal_reminders USING (EXISTS (SELECT 1 FROM reminders JOIN schedules ON reminders.schedule_id = schedules.id JOIN medicines ON schedules.medicine_id = medicines.id WHERE reminders.id = meal_reminders.reminder_id AND medicines.user_id = auth.uid()));
