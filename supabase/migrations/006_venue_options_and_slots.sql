-- Venue options (catering, per-head price) and bookable timing slots

-- Venues: add option columns
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS catering_included BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_per_head_price INTEGER,
  ADD COLUMN IF NOT EXISTS max_per_head_price INTEGER;

-- Slot type enum
DO $$ BEGIN
  CREATE TYPE booking_slot_type AS ENUM ('morning', 'afternoon', 'evening', 'full_day');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Which slots each venue offers (e.g. Morning + Evening)
CREATE TABLE IF NOT EXISTS venue_booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  slot_type booking_slot_type NOT NULL,
  UNIQUE(venue_id, slot_type)
);

CREATE INDEX IF NOT EXISTS idx_venue_booking_slots_venue_id ON venue_booking_slots(venue_id);

-- Blocked/booked slots per date (a row = that slot is taken)
CREATE TABLE IF NOT EXISTS venue_slot_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_type booking_slot_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(venue_id, slot_date, slot_type)
);

CREATE INDEX IF NOT EXISTS idx_venue_slot_blocks_venue_date ON venue_slot_blocks(venue_id, slot_date);

-- Inquiries: preferred slot (optional)
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS preferred_slot booking_slot_type;

-- RLS: venue_booking_slots
ALTER TABLE venue_booking_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_booking_slots"
  ON venue_booking_slots FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue booking slots"
  ON venue_booking_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_booking_slots.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_booking_slots.venue_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage venue_booking_slots"
  ON venue_booking_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS: venue_slot_blocks
ALTER TABLE venue_slot_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_slot_blocks"
  ON venue_slot_blocks FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue slot blocks"
  ON venue_slot_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_slot_blocks.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_slot_blocks.venue_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage venue_slot_blocks"
  ON venue_slot_blocks FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
