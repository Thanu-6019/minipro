export interface OCRRequest {
  imagePath: string;
}

export interface OCRResponse {
  text: string;
  confidence: number;
}

export class OCRError extends Error {
  constructor(public message: string, public code: string) {
    super(message);
    this.name = 'OCRError';
  }
}
