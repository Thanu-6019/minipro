CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 10. OCR Results
CREATE TABLE ocr_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    image_url TEXT NOT NULL,
    extracted_text TEXT,
    confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX idx_ocr_results_user_id ON ocr_results(user_id);
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ocr results" ON ocr_results USING (auth.uid() = user_id);
