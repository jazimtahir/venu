-- Impressions: when a venue appears in a listing (list page, city page, homepage)
ALTER TABLE venues ADD COLUMN IF NOT EXISTS impression_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS venue_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('list', 'homepage', 'city')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_venue_impressions_venue_id ON venue_impressions(venue_id);
CREATE INDEX idx_venue_impressions_created_at ON venue_impressions(created_at);

ALTER TABLE venue_impressions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert (recording impressions from public pages)
CREATE POLICY "Allow insert venue impressions"
  ON venue_impressions FOR INSERT
  WITH CHECK (true);

-- Only service role or backend can read (for admin/vendor dashboards we use impression_count on venues)
CREATE POLICY "No public read venue_impressions"
  ON venue_impressions FOR SELECT
  USING (false);

-- Trigger to increment venue.impression_count on insert
CREATE OR REPLACE FUNCTION increment_venue_impression_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE venues SET impression_count = impression_count + 1 WHERE id = NEW.venue_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_venue_impressions_increment ON venue_impressions;
CREATE TRIGGER trg_venue_impressions_increment
  AFTER INSERT ON venue_impressions
  FOR EACH ROW
  EXECUTE PROCEDURE increment_venue_impression_count();
