-- Temporary: allow anon full access until Supabase Auth is implemented
-- TODO: remove after auth is connected, keep only authenticated policies

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
    EXECUTE format('DROP POLICY IF EXISTS "Anon read only" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Anon temp full access" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
