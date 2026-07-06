-- 8. Analytics Aggregation Function
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
