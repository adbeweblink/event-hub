-- Add form_token and form_status to venues, sponsors, speakers, services
-- Enables public form links for external data entry

ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS form_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS form_status TEXT NOT NULL DEFAULT 'pending' CHECK (form_status IN ('pending', 'submitted'));

ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS form_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS form_status TEXT NOT NULL DEFAULT 'pending' CHECK (form_status IN ('pending', 'submitted'));

ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS form_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS form_status TEXT NOT NULL DEFAULT 'pending' CHECK (form_status IN ('pending', 'submitted'));

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS form_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS form_status TEXT NOT NULL DEFAULT 'pending' CHECK (form_status IN ('pending', 'submitted'));

-- RLS: allow anon to read/update rows by form_token
CREATE POLICY "Anon read by form_token" ON venues FOR SELECT TO anon USING (form_token IS NOT NULL);
CREATE POLICY "Anon update by form_token" ON venues FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon read by form_token" ON sponsors FOR SELECT TO anon USING (form_token IS NOT NULL);
CREATE POLICY "Anon update by form_token" ON sponsors FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon read by form_token" ON speakers FOR SELECT TO anon USING (form_token IS NOT NULL);
CREATE POLICY "Anon update by form_token" ON speakers FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon read by form_token" ON services FOR SELECT TO anon USING (form_token IS NOT NULL);
CREATE POLICY "Anon update by form_token" ON services FOR UPDATE TO anon USING (true) WITH CHECK (true);
