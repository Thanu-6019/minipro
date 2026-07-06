import { supabase } from '../../services/api/supabase';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import { scannerOcrService, OCRResult } from './services/ocr.service';
import { scannerGrokService, GrokAnalysis } from './services/grok.service';
import { openfdaService } from '../../services/openfda/openfda.service';
import { medicineService } from '../medicines/services/medicine.service';

const OCR_CONFIDENCE_THRESHOLD = 0.7;
const IMAGE_BUCKET = 'prescriptions';

function parseFrequencyHours(frequency: string): number {
  const lower = frequency.toLowerCase();
  if (lower.includes('once a day') || lower.includes('once daily') || lower === 'daily') return 24;
  if (lower.includes('twice a day') || lower.includes('twice daily') || lower.includes('bid')) return 12;
  if (lower.includes('three times') || lower.includes('tid')) return 8;
  if (lower.includes('every 4 hours')) return 4;
  if (lower.includes('every 6 hours')) return 6;
  if (lower.includes('every 8 hours')) return 8;
  if (lower.includes('every 12 hours')) return 12;
  const match = lower.match(/every\s+(\d+)\s+hours?/);
  if (match) return parseInt(match[1], 10);
  if (lower.includes('weekly') || lower.includes('once a week')) return 168;
  return 24;
}

function computeFirstFireTime(frequency: string): string {
  const hours = parseFrequencyHours(frequency);
  const now = new Date();
  const next = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return next.toISOString();
}

async function createScheduleAndReminder(
  medicineId: string,
  frequency: string,
): Promise<void> {
  const { data: schedule, error: scheduleError } = await supabase
    .from('schedules')
    .insert({
      medicine_id: medicineId,
      frequency,
      time_of_day: '08:00',
      active: true,
    })
    .select('id')
    .single();

  if (scheduleError || !schedule) {
    logger.error('Failed to create schedule', scheduleError);
    return;
  }

  const fireTime = computeFirstFireTime(frequency);

  const { error: reminderError } = await supabase
    .from('reminders')
    .insert({
      schedule_id: schedule.id,
      fire_time: fireTime,
      status: 'pending',
    });

  if (reminderError) {
    logger.error('Failed to create reminder', reminderError);
  }
}

export interface PipelineResult {
  success: boolean;
  ocrText: string;
  confidence: number;
  requiresManualReview: boolean;
  medications: GrokAnalysis[];
  verifiedMedicines: (GrokAnalysis & { verified: boolean })[];
  imageReference: string;
  error?: string;
}

export interface PrescriptionPipeline {
  processImage(imageUri: string): Promise<PipelineResult>;
}

async function uploadImageToStorage(imageUri: string): Promise<string> {
  const timestamp = Date.now();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'public';
  const filename = `${userId}/${timestamp}.jpg`;

  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);
  if (!data?.path) throw new Error('Image upload failed: no path returned');

  const { data: urlData } = supabase.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(data.path);

  if (!urlData?.publicUrl) throw new Error('Image upload failed: could not get public URL');
  return urlData.publicUrl;
}

async function saveOCRMetadata(imageUrl: string, ocrText: string, confidence: number): Promise<void> {
  const { error } = await supabase.from('ocr_scans').insert({
    image_url: imageUrl,
    ocr_text: ocrText,
    confidence_score: confidence,
    created_at: new Date().toISOString(),
  });

  if (error) {
    logger.error('Failed to save OCR metadata', error);
  }
}

export const prescriptionPipeline: PrescriptionPipeline = {
  processImage: async (imageUri: string): Promise<PipelineResult> => {
    try {
      const imageUrl = await uploadImageToStorage(imageUri);

      const ocrResult: OCRResult = await withRetry(() => scannerOcrService.scanImage(imageUri));

      await saveOCRMetadata(imageUrl, ocrResult.text, ocrResult.confidence);

      const requiresManualReview = ocrResult.confidence < OCR_CONFIDENCE_THRESHOLD;

      if (requiresManualReview) {
        logger.warn(`OCR confidence ${ocrResult.confidence} below threshold ${OCR_CONFIDENCE_THRESHOLD}`);
      }

      if (!ocrResult.text || ocrResult.text.trim().length === 0) {
        return {
          success: false,
          ocrText: '',
          confidence: ocrResult.confidence,
          requiresManualReview: true,
          medications: [],
          verifiedMedicines: [],
          imageReference: imageUrl,
          error: 'No text extracted from prescription image',
        };
      }

      const medications = await scannerGrokService.analyzePrescriptionText(ocrResult.text);

      const verifiedMedicines = await Promise.all(
        medications.map(async (med) => {
          try {
            const results = await openfdaService.searchMedicine(med.medicineName);
            return { ...med, verified: results.length > 0 };
          } catch {
            return { ...med, verified: false };
          }
        })
      );

      for (const med of verifiedMedicines) {
        if (med.verified) {
          try {
            // FIX: Pass the required camelCase properties to satisfy TypeScript.
            // The service will internally map these to snake_case for the DB.
            const safePayload = {
              name: med.medicineName,
              dosage: med.dosage,
              frequency: med.frequency,
              startDate: new Date().toISOString(),
              endDate: undefined,
              instructions: `${med.beforeAfterMeal} meal - Duration: ${med.duration}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const savedMedicine = await medicineService.addMedicine(safePayload);
            await createScheduleAndReminder(savedMedicine.id, med.frequency);
          } catch (err) {
            logger.error(`Failed to save medicine: ${med.medicineName}`, err);
          }
        }
      }

      return {
        success: true,
        ocrText: ocrResult.text,
        confidence: ocrResult.confidence,
        requiresManualReview,
        medications,
        verifiedMedicines,
        imageReference: imageUrl,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown pipeline error';
      logger.error('Prescription pipeline failed', error);
      return {
        success: false,
        ocrText: '',
        confidence: 0,
        requiresManualReview: true,
        medications: [],
        verifiedMedicines: [],
        imageReference: imageUri,
        error: message,
      };
    }
  },
};