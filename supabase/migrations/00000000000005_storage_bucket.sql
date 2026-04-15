-- Create storage bucket for venue images
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public read venue images" ON storage.objects
  FOR SELECT USING (bucket_id = 'venue-images');

-- Allow authenticated upload
CREATE POLICY "Authenticated upload venue images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'venue-images');

-- Allow authenticated delete
CREATE POLICY "Authenticated delete venue images" ON storage.objects
  FOR DELETE USING (bucket_id = 'venue-images');
