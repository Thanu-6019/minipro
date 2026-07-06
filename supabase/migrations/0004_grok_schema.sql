CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 11. Grok Verifications
CREATE TABLE grok_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ocr_result_id UUID REFERENCES ocr_results(id) NOT NULL,
    structured_data JSONB NOT NULL, -- The parsed medicine data
    confidence_score FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_grok_verifications_ocr_id ON grok_verifications(ocr_result_id);
ALTER TABLE grok_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own grok verifications" ON grok_verifications USING (EXISTS (SELECT 1 FROM ocr_results WHERE ocr_results.id = grok_verifications.ocr_result_id AND ocr_results.user_id = auth.uid()));
