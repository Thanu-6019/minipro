export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMedicineService {
  getMedicines(): Promise<Medicine[]>;
  getMedicine(id: string): Promise<Medicine>;
  addMedicine(medicine: Omit<Medicine, 'id'>): Promise<Medicine>;
  updateMedicine(medicine: Medicine): Promise<Medicine>;
  deleteMedicine(id: string): Promise<void>;
}