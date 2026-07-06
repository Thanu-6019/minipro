-- Create prescription_images storage bucket securely
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescription_images', 'prescription_images', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for prescription_images bucket to ensure strict user isolation
CREATE POLICY "Users can only upload their own prescription images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'prescription_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can only access their own prescription images"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'prescription_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can only delete their own prescription images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'prescription_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
