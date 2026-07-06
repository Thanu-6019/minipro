import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import { MetricType } from '../../health/services/health.service';

export const useHealthTrend = (type: MetricType, months: number) => {
  return useQuery({
    queryKey: ['health', 'trend', type, months],
    queryFn: () => analyticsService.getTrend(type, months),
  });
};
