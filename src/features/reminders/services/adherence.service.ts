import { supabase } from '../../../services/api/supabase';

export interface AdherenceService {
  getAdherenceScore(startDate: string, endDate: string): Promise<number>;
}

export const adherenceService: AdherenceService = {
  getAdherenceScore: async (startDate: string, endDate: string): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('calculate_adherence_score', {
      p_user_id: user.id,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw new Error(error.message);
    return (data ?? 0) as number;
  }
};
