import { OCRRequest, OCRResponse, OCRError } from './ocr.types';

const OCR_PROCESSOR_API_URL = process.env.OCR_PROCESSOR_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.medtrack.ai/backend/ocr_processor'
    : 'http://localhost:8000/process_ocr_image');

export const ocrService = {
  processPrescription: async (request: OCRRequest): Promise<OCRResponse> => {
    const response = await fetch(OCR_PROCESSOR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_input: request.imagePath,
        confidence_threshold: 0.7
      }),
      signal: AbortSignal.timeout(60000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new OCRError(`OCR processor failed: ${errorText}`, 'BACKEND_OCR_ERROR');
    }

    const result = await response.json();

    if (result.success && result.text) {
      return {
        text: result.text,
        confidence: result.confidence || 0,
      } as OCRResponse;
    }

    throw new OCRError(result.error || 'OCR processing failed', 'OCR_PROCESSING_ERROR');
  }
};
