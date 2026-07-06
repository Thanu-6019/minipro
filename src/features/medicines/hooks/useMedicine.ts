import { useQuery } from '@tanstack/react-query';
import { medicineService } from '../services/medicine.service';

export const useMedicine = (id: string) => {
  return useQuery({
    queryKey: ['medicine', id],
    queryFn: () => medicineService.getMedicine(id),
    enabled: !!id,
  });
};
