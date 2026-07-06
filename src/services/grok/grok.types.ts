export interface MedicationParsed {
  medicineName: string;
  dosage: string;
  frequency: string;
  beforeAfterMeal: string;
  duration: string;
}

export interface GrokAnalysisRequest {
  rawText: string;
}

export interface GrokAnalysisResponse {
  medications: MedicationParsed[];
  confidenceScore?: number;
}
