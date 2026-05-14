-- Create a public bucket for tickets
INSERT INTO storage.buckets (id, name, public) VALUES ('tickets', 'tickets', true);

-- Allow public access to view tickets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'tickets');

-- Allow authenticated users to upload tickets
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tickets' AND auth.role() = 'authenticated');
