-- Per head with catering vs without catering (Pakistan market)
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS per_head_with_catering_min INTEGER,
  ADD COLUMN IF NOT EXISTS per_head_with_catering_max INTEGER,
  ADD COLUMN IF NOT EXISTS per_head_without_catering_min INTEGER,
  ADD COLUMN IF NOT EXISTS per_head_without_catering_max INTEGER;
