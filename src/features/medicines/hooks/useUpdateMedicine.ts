import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicineService } from '../services/medicine.service';
import type { Medicine } from '../services/medicine.service.interface';

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (medicine: Medicine) =>
      medicineService.updateMedicine(medicine),
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
