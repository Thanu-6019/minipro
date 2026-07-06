import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicineService } from '../services/medicine.service';

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => medicineService.deleteMedicine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicine'] });
      queryClient.invalidateQueries({ queryKey: ['reminders', 'upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['adherence'] });
      queryClient.invalidateQueries({ queryKey: ['health', 'trend'] });
    },
  });
  return { ...mutation, isPending: mutation.isPending };
};
