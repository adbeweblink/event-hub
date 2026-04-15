INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true) ON CONFLICT DO NOTHING;
CREATE POLICY "event_images_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-images');
CREATE POLICY "event_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'event-images');
