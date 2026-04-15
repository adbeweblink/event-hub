-- Add price field to services table for quotation reference
ALTER TABLE services ADD COLUMN IF NOT EXISTS price INT DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_note TEXT DEFAULT '';
