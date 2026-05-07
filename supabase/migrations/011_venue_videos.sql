-- Venue videos (upload or external URL)
CREATE TABLE IF NOT EXISTS venue_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_venue_videos_venue_id ON venue_videos(venue_id);

-- RLS: venue_videos
ALTER TABLE venue_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_videos"
  ON venue_videos FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue videos"
  ON venue_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_videos.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_videos.venue_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage venue_videos"
  ON venue_videos FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
