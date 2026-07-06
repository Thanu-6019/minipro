import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService, MetricType } from '../services/health.service';

export const useHealthMetrics = (type: MetricType) => {
  return useQuery({
    queryKey: ['health', type],
    queryFn: () => healthService.getMetricsHistory(type),
  });
};

export const useAddHealthMetric = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ type, value }: { type: MetricType, value: number }) => 
      healthService.addMetric(type, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['health', variables.type] });
      queryClient.invalidateQueries({ queryKey: ['health', 'trend', variables.type] });
    },
  });
  return { ...mutation, isPending: mutation.isPending };
};
