export class MedicineError extends Error {
  constructor(public message: string, public code: string) {
    super(message);
    this.name = 'MedicineError';
  }
}
