-- Venue reviews (optional: aggregate rating + "Starting at" on cards/detail)
CREATE TABLE venue_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(venue_id, user_id)
);

CREATE INDEX idx_venue_reviews_venue_id ON venue_reviews(venue_id);
CREATE INDEX idx_venue_reviews_created_at ON venue_reviews(created_at DESC);

-- RLS
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read venue reviews"
  ON venue_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own review"
  ON venue_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review"
  ON venue_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own review"
  ON venue_reviews FOR DELETE
  USING (auth.uid() = user_id);
