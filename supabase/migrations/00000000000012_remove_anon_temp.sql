-- Remove temporary anon full access policies (auth is now connected)
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
    EXECUTE format('DROP POLICY IF EXISTS "Anon temp full access" ON %I', tbl);
  END LOOP;
END $$;
