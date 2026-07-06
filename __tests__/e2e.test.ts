import { authService } from '../src/features/auth/services/auth.service';
import { ocrService } from '../src/services/ocr/ocr.service';
import { grokService } from '../src/services/grok/grok.service';
import { openfdaService } from '../src/services/openfda/openfda.service';
import { medicineService } from '../src/features/medicines/services/medicine.service';
import { adherenceService } from '../src/features/reminders/services/adherence.service';

describe('End-to-End Workflow Simulation', () => {
  it('should complete the prescription-to-medicine workflow', async () => {
    // 1. Auth Login (Simulated)
    const auth = await authService.signIn('test@test.com', 'password');
    expect(auth).toBeDefined();

    // 2. Scan & OCR
    const ocrResult = await ocrService.processPrescription({ imagePath: 'path/to/img' });
    expect(ocrResult.text).toBeDefined();

    // 3. Grok Verification
    const grokResult = await grokService.analyzeText({ rawText: ocrResult.text });
    expect(grokResult.medications.length).toBeGreaterThan(0);

    // 4. OpenFDA Validation
    const fdaResult = await openfdaService.searchMedicine(grokResult.medications[0].medicineName);
    expect(fdaResult).toBeDefined();

    // 5. Medicine Creation
    const medicine = await medicineService.addMedicine({
      name: grokResult.medications[0].medicineName,
      dosage: grokResult.medications[0].dosage,
      frequency: grokResult.medications[0].frequency,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    expect(medicine.id).toBeDefined();
  });

  it('should calculate adherence score', async () => {
    const score = await adherenceService.getAdherenceScore('2026-06-01', '2026-06-21');
    expect(typeof score).toBe('number');
  });
});
