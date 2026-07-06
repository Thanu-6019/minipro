import { OCRRequest, OCRResponse } from '../../../services/ocr/ocr.types';
import { ocrService } from '../../../services/ocr/ocr.service';

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface IOCRService {
  scanImage(imageUri: string): Promise<OCRResult>;
}

export const scannerOcrService: IOCRService = {
  scanImage: async (imageUri: string): Promise<OCRResult> => {
    const request: OCRRequest = { imagePath: imageUri };
    const response: OCRResponse = await ocrService.processPrescription(request);
    return {
      text: response.text,
      confidence: response.confidence,
    };
  },
};
