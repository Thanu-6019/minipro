import { medicineService } from '../src/features/medicines/services/medicine.service';
import { supabase } from '../src/services/api/supabase';

describe('Medicine Service', () => {
  it('fetches medicines', async () => {
    (supabase.from as any).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [], error: null })
    });
    const medicines = await medicineService.getMedicines();
    expect(medicines).toEqual([]);
  });
});
