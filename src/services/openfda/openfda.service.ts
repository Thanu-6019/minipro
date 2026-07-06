import { supabase } from '../api/supabase';
import { withRetry } from '../../utils/retry';
import { OpenFDAMedicine } from './openfda.types';

export const openfdaService = {
  searchMedicine: async (term: string): Promise<OpenFDAMedicine[]> => {
    return withRetry(async () => {
      const { data, error } = await supabase.functions.invoke('search-medicine', {
        body: { term },
      });

      if (error) {
        throw new Error(`OpenFDA Search Error: ${error.message}`);
      }

      return (data as { results: OpenFDAMedicine[] }).results || [];
    });
  }
};
