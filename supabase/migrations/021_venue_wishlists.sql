-- Venue wishlists (saved/favourite venues per user)
CREATE TABLE venue_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

CREATE INDEX idx_venue_wishlists_user_id ON venue_wishlists(user_id);
CREATE INDEX idx_venue_wishlists_venue_id ON venue_wishlists(venue_id);

ALTER TABLE venue_wishlists ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own wishlist rows
CREATE POLICY "Users can view own wishlist"
  ON venue_wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist"
  ON venue_wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist"
  ON venue_wishlists FOR DELETE
  USING (auth.uid() = user_id);
