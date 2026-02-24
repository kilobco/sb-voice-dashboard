-- 004_restaurant_contact_fields.sql
-- Add optional contact fields to the restaurants table.

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS website text;
