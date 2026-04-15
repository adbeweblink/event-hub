-- ============================================================
-- Event Hub Schema v1.0
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== ENUMS =====

CREATE TYPE user_role AS ENUM ('viewer', 'executor', 'pm', 'admin', 'super_admin');
CREATE TYPE vendor_category AS ENUM (
  'venue', 'catering', 'equipment', 'printing', 'photography',
  'livestream', 'staffing', 'design', 'gift', 'transport',
  'insurance', 'pr', 'talent_fee', 'media_ad', 'other'
);
CREATE TYPE speaker_sub_type AS ENUM ('internal', 'creative', 'ai');
CREATE TYPE sponsor_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze', 'media', 'reciprocal', 'other');
CREATE TYPE sponsor_status AS ENUM ('active', 'negotiating', 'paused', 'ended');
CREATE TYPE event_type AS ENUM ('seminar', 'workshop', 'launch', 'press', 'other');
CREATE TYPE event_format AS ENUM ('onsite', 'online', 'hybrid');
CREATE TYPE event_status AS ENUM ('draft', 'planning', 'preparing', 'marketing', 'executing', 'closing', 'archived');
CREATE TYPE fy_system AS ENUM ('adobe', 'weblink');
CREATE TYPE fiscal_quarter AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');
CREATE TYPE venue_type AS ENUM ('hotel', 'studio', 'coworking', 'restaurant', 'other');
CREATE TYPE district AS ENUM ('taipei', 'newtaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung', 'other_dist');
CREATE TYPE service_category AS ENUM (
  'venue', 'catering', 'photography', 'hosting', 'livestream', 'design',
  'printing', 'equipment', 'staffing', 'gift', 'transport', 'meal',
  'talent_fee', 'pr', 'media_ad', 'insurance', 'misc'
);
CREATE TYPE person_status AS ENUM ('pending', 'invited', 'tentative', 'confirmed', 'cancelled');

-- ===== USERS =====

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== VENDORS (廠商建檔) =====

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category vendor_category NOT NULL DEFAULT 'other',
  tax_id TEXT DEFAULT '',
  bank_code TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  bank_account TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== VENUES (場館瀏覽) =====

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type venue_type NOT NULL DEFAULT 'other',
  district district NOT NULL DEFAULT 'taipei',
  address TEXT DEFAULT '',
  capacity_min INT,
  capacity_max INT,
  price_half_day INT,
  price_full_day INT,
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  nearest_mrt TEXT DEFAULT '',
  parking_info TEXT DEFAULT '',
  min_rental_hours INT,
  deposit_policy TEXT DEFAULT '',
  equipment TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  rating SMALLINT DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE venue_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

-- ===== SPEAKERS (講者列表) =====

CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sub_type speaker_sub_type,
  title TEXT DEFAULT '',
  company TEXT DEFAULT '',
  specialties TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  fee INT,
  fee_unit TEXT DEFAULT 'per_event',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  social_links TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  rating SMALLINT DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== SPONSORS (贊助廠商) =====

CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tier sponsor_tier NOT NULL DEFAULT 'other',
  status sponsor_status NOT NULL DEFAULT 'negotiating',
  logo TEXT DEFAULT '',
  website TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_title TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  sponsor_fee INT,
  sponsor_benefits TEXT DEFAULT '',
  contract_note TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sponsor_past_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL
);

-- ===== SERVICES (其他服務 — 通訊錄) =====

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category service_category NOT NULL DEFAULT 'misc',
  service_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== EVENTS (活動專案) =====

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fy_system fy_system NOT NULL DEFAULT 'adobe',
  year INT NOT NULL,
  quarter fiscal_quarter NOT NULL DEFAULT 'Q1',
  name TEXT NOT NULL DEFAULT '',
  type event_type NOT NULL DEFAULT 'seminar',
  format event_format NOT NULL DEFAULT 'onsite',
  event_url TEXT DEFAULT '',
  status event_status NOT NULL DEFAULT 'draft',
  -- Audience & copy
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  highlights TEXT DEFAULT '',
  audience_keywords TEXT DEFAULT '',
  audience_description TEXT DEFAULT '',
  -- Attendees
  expected_attendees INT DEFAULT 0,
  -- Dates
  tentative_dates DATE[] DEFAULT '{}',
  confirmed_date DATE,
  -- Schedule
  setup_time TIME,
  start_time TIME,
  end_time TIME,
  -- Marketing
  key_visual_url TEXT DEFAULT '',
  marketing_channels TEXT[] DEFAULT '{}',
  registration_method TEXT DEFAULT '',
  promotion_start_date DATE,
  -- Calendar invite
  calendar_emails TEXT DEFAULT '',
  calendar_subject TEXT DEFAULT '',
  calendar_body TEXT DEFAULT '',
  -- Meta
  completion_percent SMALLINT DEFAULT 0,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event ↔ Venue (many-to-many)
CREATE TABLE event_venues (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, venue_id)
);

-- Event ↔ Sponsor (many-to-many)
CREATE TABLE event_sponsors (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, sponsor_id)
);

-- Rundown items
CREATE TABLE event_rundown (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'other_r',
  duration_min INT NOT NULL DEFAULT 30,
  speaker_name TEXT DEFAULT '',
  speaker_status person_status DEFAULT 'pending',
  note TEXT DEFAULT ''
);

-- Event persons (speakers/hosts/staff assigned to event)
CREATE TABLE event_persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'speaker',
  name TEXT NOT NULL,
  status person_status NOT NULL DEFAULT 'pending',
  fee INT,
  speaker_id UUID REFERENCES speakers(id) ON DELETE SET NULL
);

-- Event expenses (費用清單 — 掛在活動底下)
CREATE TABLE event_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category service_category NOT NULL DEFAULT 'misc',
  description TEXT NOT NULL,
  amount INT NOT NULL DEFAULT 0,
  tax_included BOOLEAN DEFAULT TRUE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name TEXT DEFAULT '',
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  receipt_no TEXT DEFAULT '',
  paid_by TEXT DEFAULT '',
  date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Closing checklist
CREATE TABLE event_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- ===== SETTINGS =====

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  UNIQUE (user_id, key)
);

-- ===== INDEXES =====

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_venues_type ON venues(type);
CREATE INDEX idx_venues_district ON venues(district);
CREATE INDEX idx_speakers_sub_type ON speakers(sub_type);
CREATE INDEX idx_sponsors_tier ON sponsors(tier);
CREATE INDEX idx_sponsors_status ON sponsors(status);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_year_quarter ON events(year, quarter);
CREATE INDEX idx_event_expenses_event ON event_expenses(event_id);
CREATE INDEX idx_event_rundown_event ON event_rundown(event_id);

-- ===== ROW LEVEL SECURITY (基本) =====

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_past_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rundown ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (will tighten later with role-based policies)
CREATE POLICY "Authenticated users can do everything" ON users FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON vendors FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON venues FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON venue_images FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON speakers FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON sponsors FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON sponsor_past_events FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON services FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON events FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON event_venues FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON event_sponsors FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON event_rundown FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON event_persons FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON event_expenses FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON event_checklist FOR ALL USING (true);
CREATE POLICY "Authenticated users can do everything" ON settings FOR ALL USING (true);

-- ===== updated_at TRIGGER =====

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_speakers_updated_at BEFORE UPDATE ON speakers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sponsors_updated_at BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
