import { supabase } from '../../../services/api/supabase';
import { IMedicineService, Medicine } from './medicine.service.interface';
import { MedicineError } from '../types/medicine.errors';
import { validateMedicine } from '../utils/medicine.validator';

import { withRetry } from '../../../utils/retry';
import { logger } from '../../../utils/logger';

// Helper to convert DB snake_case rows into Frontend camelCase
function toCamelCase(dbRow: any): Medicine {
  if (!dbRow) return dbRow;
  return {
    id: dbRow.id,
    name: dbRow.name,
    dosage: dbRow.dosage,
    frequency: dbRow.frequency,
    startDate: dbRow.start_date,
    endDate: dbRow.end_date,
    instructions: dbRow.instructions,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
}

export const medicineService: IMedicineService = {
  getMedicines: async (): Promise<Medicine[]> => {
    return withRetry(async () => {
      const { data, error } = await supabase.from('medicines').select('*');
      if (error) {
        logger.error('Failed to fetch medicines', error);
        throw new MedicineError(error.message, 'FETCH_ERROR');
      }
      return (data ?? []).map(toCamelCase);
    });
  },

  getMedicine: async (id: string): Promise<Medicine> => {
    const { data, error } = await supabase.from('medicines').select('*').eq('id', id).single();
    if (error) throw new MedicineError(error.message, 'FETCH_ERROR');
    if (!data) throw new MedicineError('Medicine not found', 'FETCH_ERROR');
    return toCamelCase(data);
  },

  addMedicine: async (medicine: Omit<Medicine, 'id'>): Promise<Medicine> => {
    validateMedicine(medicine);
    
    // FIX: Map the incoming camelCase properties to snake_case for Supabase
    const dbPayload = {
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      start_date: medicine.startDate,
      end_date: medicine.endDate,
      instructions: medicine.instructions,
      created_at: medicine.createdAt || new Date().toISOString(),
      updated_at: medicine.updatedAt || new Date().toISOString(),
    };

    const { data, error } = await supabase.from('medicines').insert(dbPayload).select().single();
    if (error) throw new MedicineError(error.message, 'INSERT_ERROR');
    if (!data) throw new MedicineError('Failed to create medicine', 'INSERT_ERROR');
    return toCamelCase(data);
  },

  updateMedicine: async (medicine: Medicine): Promise<Medicine> => {
    validateMedicine(medicine);
    
    const dbPayload = {
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      start_date: medicine.startDate,
      end_date: medicine.endDate,
      instructions: medicine.instructions,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('medicines').update(dbPayload).eq('id', medicine.id).select().single();
    if (error) throw new MedicineError(error.message, 'UPDATE_ERROR');
    if (!data) throw new MedicineError('Failed to update medicine', 'UPDATE_ERROR');
    return toCamelCase(data);
  },

  deleteMedicine: async (id: string): Promise<void> => {
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    if (error) throw new MedicineError(error.message, 'DELETE_ERROR');
  }
};