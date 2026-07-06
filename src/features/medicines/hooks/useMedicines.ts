import { useQuery } from '@tanstack/react-query';
import { medicineService } from '../services/medicine.service';

export const useMedicines = () => {
  return useQuery({
    queryKey: ['medicines'],
    queryFn: () => medicineService.getMedicines(),
  });
};
