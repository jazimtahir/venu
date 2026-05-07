-- Phase 3: Blocked dates — vendor can block a date (no booking, just unavailable)

CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(venue_id, date)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_vendor_id ON blocked_dates(vendor_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_venue_id ON blocked_dates(venue_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor can select own blocked dates"
  ON blocked_dates FOR SELECT
  USING (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendor can insert own blocked dates"
  ON blocked_dates FOR INSERT
  WITH CHECK (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM venues v
      WHERE v.id = blocked_dates.venue_id AND v.vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Vendor can delete own blocked dates"
  ON blocked_dates FOR DELETE
  USING (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can do all on blocked_dates"
  ON blocked_dates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
