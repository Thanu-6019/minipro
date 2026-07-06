import { supabase } from '../api/supabase';
import { withRetry } from '../../utils/retry';
import { GrokAnalysisRequest, GrokAnalysisResponse } from './grok.types';

export const grokService = {
  analyzeText: async (request: GrokAnalysisRequest): Promise<GrokAnalysisResponse> => {
    return withRetry(async () => {
      const { data, error } = await supabase.functions.invoke('analyze-prescription', {
        body: request,
      });

      if (error) throw new Error(error.message);
      return data as GrokAnalysisResponse;
    });
  }
};
