-- Post-event data fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS actual_attendees INT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS satisfaction_score NUMERIC(3,1);
ALTER TABLE events ADD COLUMN IF NOT EXISTS post_event_notes TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_url TEXT DEFAULT '';
