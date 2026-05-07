-- Configurable time slots (replace morning/afternoon/evening enum)

-- New table: venue_slots with name and time range
CREATE TABLE IF NOT EXISTS venue_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_venue_slots_venue_id ON venue_slots(venue_id);

-- Default time ranges for legacy slot types (for migration)
-- morning 09:00-14:00, afternoon 12:00-17:00, evening 15:00-22:00, full_day 09:00-22:00

-- Migrate venue_booking_slots -> venue_slots (one row per venue per slot_type with default times)
INSERT INTO venue_slots (venue_id, name, start_time, end_time, display_order)
SELECT venue_id,
  CASE slot_type
    WHEN 'morning' THEN 'Morning (9am–2pm)'
    WHEN 'afternoon' THEN 'Afternoon (12pm–5pm)'
    WHEN 'evening' THEN 'Evening (3pm–10pm)'
    WHEN 'full_day' THEN 'Full day (9am–10pm)'
    ELSE slot_type::text
  END,
  CASE slot_type
    WHEN 'morning' THEN '09:00'::time
    WHEN 'afternoon' THEN '12:00'::time
    WHEN 'evening' THEN '15:00'::time
    WHEN 'full_day' THEN '09:00'::time
    ELSE '09:00'::time
  END,
  CASE slot_type
    WHEN 'morning' THEN '14:00'::time
    WHEN 'afternoon' THEN '17:00'::time
    WHEN 'evening' THEN '22:00'::time
    WHEN 'full_day' THEN '22:00'::time
    ELSE '22:00'::time
  END,
  (ROW_NUMBER() OVER (PARTITION BY venue_id ORDER BY slot_type::text)) - 1
FROM venue_booking_slots;

-- Add venue_slot_id to venue_slot_blocks (nullable first)
ALTER TABLE venue_slot_blocks
  ADD COLUMN IF NOT EXISTS venue_slot_id UUID REFERENCES venue_slots(id) ON DELETE CASCADE;

-- Migrate blocks: set venue_slot_id from matching venue_slots (same venue, and we need to match by slot_type)
-- Match by order: first morning slot, second afternoon, etc. per venue. So we need a stable mapping.
-- Create a mapping: for each (venue_id, slot_type) we have one venue_slots row (we just inserted them in slot_type order).
WITH slot_order AS (
  SELECT id, venue_id, ROW_NUMBER() OVER (PARTITION BY venue_id ORDER BY display_order, name) AS rn
  FROM venue_slots
),
old_slots AS (
  SELECT venue_id, slot_type,
    ROW_NUMBER() OVER (PARTITION BY venue_id ORDER BY slot_type::text) AS rn
  FROM venue_booking_slots
),
mapping AS (
  SELECT o.venue_id, o.slot_type, so.id AS slot_id
  FROM old_slots o
  JOIN slot_order so ON so.venue_id = o.venue_id AND so.rn = o.rn
)
UPDATE venue_slot_blocks b
SET venue_slot_id = m.slot_id
FROM mapping m
WHERE b.venue_id = m.venue_id AND b.slot_type = m.slot_type;

-- Drop old slot_type column (this also drops the unique constraint on venue_id, slot_date, slot_type)
ALTER TABLE venue_slot_blocks DROP COLUMN IF EXISTS slot_type;
ALTER TABLE venue_slot_blocks ALTER COLUMN venue_slot_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_venue_slot_blocks_venue_date_slot
  ON venue_slot_blocks(venue_id, slot_date, venue_slot_id);

-- Inquiries: add preferred_slot_id, migrate from preferred_slot, drop preferred_slot
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS preferred_slot_id UUID REFERENCES venue_slots(id) ON DELETE SET NULL;

-- Migrate inquiry preferred_slot to preferred_slot_id (match by venue and slot type order)
WITH old_order AS (
  SELECT venue_id, slot_type, ROW_NUMBER() OVER (PARTITION BY venue_id ORDER BY slot_type::text) AS rn
  FROM venue_booking_slots
),
new_order AS (
  SELECT id, venue_id, ROW_NUMBER() OVER (PARTITION BY venue_id ORDER BY display_order, name) AS rn
  FROM venue_slots
),
pair AS (
  SELECT oo.venue_id, oo.slot_type, no.id AS slot_id
  FROM old_order oo
  JOIN new_order no ON no.venue_id = oo.venue_id AND no.rn = oo.rn
)
UPDATE inquiries i
SET preferred_slot_id = pair.slot_id
FROM pair
WHERE i.venue_id = pair.venue_id AND i.preferred_slot = pair.slot_type;

ALTER TABLE inquiries DROP COLUMN IF EXISTS preferred_slot;

-- Drop old table and enum
DROP TABLE IF EXISTS venue_booking_slots;
DROP TYPE IF EXISTS booking_slot_type;

-- RLS: venue_slots
ALTER TABLE venue_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_slots"
  ON venue_slots FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue slots"
  ON venue_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_slots.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_slots.venue_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage venue_slots"
  ON venue_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
