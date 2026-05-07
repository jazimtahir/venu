-- Catering / menu packages (with catering – multiple packages and dishes)
CREATE TABLE IF NOT EXISTS venue_catering_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  per_head_price INTEGER NOT NULL,
  description TEXT,
  menu_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_venue_catering_packages_venue_id ON venue_catering_packages(venue_id);

-- Optional: inquiry can indicate interested package
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS interested_package_id UUID REFERENCES venue_catering_packages(id) ON DELETE SET NULL;

-- RLS: venue_catering_packages
ALTER TABLE venue_catering_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_catering_packages"
  ON venue_catering_packages FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue catering packages"
  ON venue_catering_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_catering_packages.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_catering_packages.venue_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage venue_catering_packages"
  ON venue_catering_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
