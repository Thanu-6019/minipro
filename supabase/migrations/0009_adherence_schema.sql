-- 13. Adherence Score Calculation Function
CREATE OR REPLACE FUNCTION calculate_adherence_score(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL AS $$
DECLARE
    v_total_scheduled INTEGER;
    v_total_taken INTEGER;
BEGIN
    -- This is a simplified calculation based on logs vs active schedules
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
