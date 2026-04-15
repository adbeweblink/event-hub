-- Add partner role to event_sponsors
CREATE TYPE partner_role AS ENUM ('organizer', 'co_organizer', 'co_sponsor', 'partner', 'media');
ALTER TABLE event_sponsors ADD COLUMN role partner_role NOT NULL DEFAULT 'partner';
