import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicineService } from '../services/medicine.service';
import type { Medicine } from '../services/medicine.service.interface';

export const useAddMedicine = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) =>
      medicineService.addMedicine(medicine as Omit<Medicine, 'id'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['reminders', 'upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['adherence'] });
      queryClient.invalidateQueries({ queryKey: ['health', 'trend'] });
    },
  });
  return { ...mutation, isPending: mutation.isPending };
};
