-- Verified listing: admin can mark venues as verified; show verified badge on listing
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_venues_is_verified ON venues(is_verified) WHERE is_verified = TRUE;

COMMENT ON COLUMN venues.is_verified IS 'Admin-verified listing; shown with a verified badge.';
