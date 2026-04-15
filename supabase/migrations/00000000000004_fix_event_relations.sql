-- event_sponsors: add fee + contact per event
ALTER TABLE event_sponsors ADD COLUMN fee INT;
ALTER TABLE event_sponsors ADD COLUMN contact_name TEXT DEFAULT '';
ALTER TABLE event_sponsors ADD COLUMN contact_phone TEXT DEFAULT '';

-- event_services: track which services an event needs
CREATE TABLE event_services (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, service_id)
);

ALTER TABLE event_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can do everything" ON event_services FOR ALL USING (true);
CREATE INDEX idx_event_services_event ON event_services(event_id);
