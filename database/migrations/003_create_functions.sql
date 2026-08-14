-- Function to get monthly spending summary
CREATE OR REPLACE FUNCTION get_monthly_spending(p_user_id UUID, p_month INTEGER, p_year INTEGER)
RETURNS TABLE (
  total_spent DECIMAL,
  trip_count BIGINT,
  avg_fare DECIMAL,
  transport_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(th.fare), 0) as total_spent,
    COUNT(*) as trip_count,
    COALESCE(AVG(th.fare), 0) as avg_fare,
    COALESCE(
      jsonb_object_agg(
        mode,
        mode_total
      ),
      '{}'::jsonb
    ) as transport_breakdown
  FROM public.trip_history th
  LEFT JOIN LATERAL (
    SELECT
      unnest(th.transport_modes) as mode,
      th.fare as mode_total
  ) modes ON true
  WHERE th.user_id = p_user_id
    AND EXTRACT(MONTH FROM th.created_at) = p_month
    AND EXTRACT(YEAR FROM th.created_at) = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily spending for a date range
CREATE OR REPLACE FUNCTION get_daily_spending(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  spend_date DATE,
  daily_total DECIMAL,
  trip_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    th.created_at::DATE as spend_date,
    SUM(th.fare) as daily_total,
    COUNT(*) as trip_count
  FROM public.trip_history th
  WHERE th.user_id = p_user_id
    AND th.created_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY th.created_at::DATE
  ORDER BY spend_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
