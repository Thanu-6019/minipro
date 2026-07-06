import { supabase } from '../../../services/api/supabase';

export interface ExpiryData {
  id: string;
  medicine_id: string;
  mfg_date?: string;
  exp_date: string;
  batch_number?: string;
}

export const expiryService = {
  addExpiryInfo: async (data: Omit<ExpiryData, 'id'>) => {
    const { error } = await supabase.from('expiry_tracking').insert(data);
    if (error) throw new Error(error.message);
  },
  
  getExpiries: async (userId: string) => {
    // Join with medicines to filter by user
    const { data, error } = await supabase
      .from('expiry_tracking')
      .select('*, medicines!inner(user_id)')
      .eq('medicines.user_id', userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
};
