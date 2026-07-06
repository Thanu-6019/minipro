import { Medicine } from '../services/medicine.service.interface';
import { MedicineError } from '../types/medicine.errors';

export const validateMedicine = (medicine: Omit<Medicine, 'id'>) => {
  if (!medicine.name || medicine.name.trim() === '') {
    throw new MedicineError('Medicine name is required', 'INVALID_NAME');
  }
  if (!medicine.dosage || medicine.dosage.trim() === '') {
    throw new MedicineError('Dosage is required', 'INVALID_DOSAGE');
  }
};
