export interface OpenFDAMedicine {
  brand_name: string;
  generic_name: string;
  manufacturer_name: string;
  dosage_form: string;
}

export interface OpenFDAResponse {
  results: OpenFDAMedicine[];
  error?: {
    message: string;
  };
}

export interface IOpenFDAService {
  searchMedicine(term: string): Promise<OpenFDAMedicine[]>;
}
