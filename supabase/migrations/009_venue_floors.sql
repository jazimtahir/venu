-- Floors / halls per venue (Pakistan market)
CREATE TABLE IF NOT EXISTS venue_floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_venue_floors_venue_id ON venue_floors(venue_id);

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS floor_id UUID REFERENCES venue_floors(id) ON DELETE SET NULL;

-- RLS: venue_floors
ALTER TABLE venue_floors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_floors"
  ON venue_floors FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue floors"
  ON venue_floors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_floors.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_floors.venue_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage venue_floors"
  ON venue_floors FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
