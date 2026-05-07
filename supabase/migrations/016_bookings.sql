-- Phase 2: Bookings — vendor records confirmed deals (from inquiries or walk-ins)

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  event_type inquiry_event_type,
  guest_count INTEGER,
  event_date DATE NOT NULL,
  venue_slot_id UUID REFERENCES venue_slots(id) ON DELETE SET NULL,
  selected_floor UUID REFERENCES venue_floors(id) ON DELETE SET NULL,
  selected_package UUID REFERENCES venue_catering_packages(id) ON DELETE SET NULL,
  total_amount NUMERIC,
  advance_paid NUMERIC NOT NULL DEFAULT 0,
  booking_status booking_status NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);

-- RLS: vendors see only their bookings; admins see all
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor can select own bookings"
  ON bookings FOR SELECT
  USING (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendor can insert own bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendor can update own bookings"
  ON bookings FOR UPDATE
  USING (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can do all on bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
