import { supabase } from '../../../services/api/supabase';
import { withRetry } from '../../../utils/retry';

export interface GrokAnalysis {
  medicineName: string;
  dosage: string;
  frequency: string;
  beforeAfterMeal: string;
  duration: string;
}

export interface IGrokService {
  analyzePrescriptionText(text: string): Promise<GrokAnalysis[]>;
}

export const scannerGrokService: IGrokService = {
  analyzePrescriptionText: async (text: string): Promise<GrokAnalysis[]> => {
    return withRetry(async () => {
      const { data, error } = await supabase.functions.invoke('analyze-prescription', {
        body: { rawText: text },
      });

      if (error) throw new Error(error.message);

      const parsed = data as { medications?: GrokAnalysis[] } | null;
      return parsed?.medications || [];
    });
  },
};
