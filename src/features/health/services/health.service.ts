import { supabase } from '../../../services/api/supabase';

export type MetricType = 'bp_systolic' | 'bp_diastolic' | 'blood_sugar' | 'weight' | 'bmi' | 'heart_rate' | 'spo2';

export interface HealthMetric {
  id: string;
  type: MetricType;
  value: number;
  recorded_at: string;
}

export const healthService = {
  addMetric: async (type: MetricType, value: number) => {
    // Basic validation
    if (value < 0) throw new Error('Value must be positive');
    
    const { error } = await supabase.from('health_metrics').insert({
      type,
      value
    });
    if (error) throw new Error(error.message);
  },
  
  getMetricsHistory: async (type: MetricType): Promise<HealthMetric[]> => {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('type', type)
      .order('recorded_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as HealthMetric[];
  }
};
