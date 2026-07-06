import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type UserSettings } from '../services/settings.service';

const QUERY_KEY = ['settings'];

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: settingsService.getSettings,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (patch: Partial<UserSettings>) => settingsService.saveSettings(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    settings: query.data ?? {
      pushEnabled: true,
      criticalEnabled: true,
      leadTime: 3,
      biometricEnabled: true,
      shareEnabled: false,
    } as UserSettings,
    isLoading: query.isLoading,
    updateSettings: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
