-- Event type for inquiries (Pakistan market: Mehndi, Walima, etc.)
DO $$ BEGIN
  CREATE TYPE inquiry_event_type AS ENUM ('mehndi', 'walima', 'baraat', 'nikah', 'engagement', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS event_type inquiry_event_type;
