-- Create a public bucket for tickets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tickets', 'tickets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view tickets
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'tickets');

-- Allow authenticated users to upload tickets
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tickets' AND auth.role() = 'authenticated');
