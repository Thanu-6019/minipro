import { supabase } from '../../../services/api/supabase';
import { MetricType } from '../../health/services/health.service';

export interface TrendData {
  date_bucket: string;
  avg_value: number;
}

export const analyticsService = {
  getTrend: async (type: MetricType, months: number): Promise<TrendData[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('get_health_trend', {
      p_user_id: user.id,
      p_type: type,
      p_months: months
    });

    if (error) throw new Error(error.message);
    return (data ?? []) as TrendData[];
  }
};
