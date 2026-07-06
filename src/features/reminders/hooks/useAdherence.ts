import { useQuery } from '@tanstack/react-query';
import { adherenceService } from '../services/adherence.service';

export const useAdherenceScore = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['adherence', startDate, endDate],
    queryFn: () => adherenceService.getAdherenceScore(startDate, endDate),
  });
};
