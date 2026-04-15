-- Fix RLS: restrict to authenticated role only
-- Drop overly permissive policies and recreate with TO authenticated

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'users','vendors','venues','venue_images','speakers','sponsors',
    'sponsor_past_events','services','events','event_venues',
    'event_sponsors','event_rundown','event_persons','event_expenses',
    'event_checklist','settings','event_services'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can do everything" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Authenticated full access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
    -- Allow anon read-only on non-sensitive tables
    IF tbl IN ('venues','venue_images','speakers','events','event_venues','event_rundown') THEN
      EXECUTE format('CREATE POLICY "Anon read only" ON %I FOR SELECT TO anon USING (true)', tbl);
    END IF;
  END LOOP;
END $$;

-- Fix storage policies
DROP POLICY IF EXISTS "Authenticated upload venue images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete venue images" ON storage.objects;

CREATE POLICY "Authenticated upload venue images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'venue-images');

CREATE POLICY "Authenticated delete venue images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'venue-images');
