-- Phase 1: Inquiry CRM — status, source, expected_price, notes

-- Enums for inquiry CRM
DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'negotiating', 'confirmed', 'lost');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_source AS ENUM ('marketplace', 'walk_in', 'phone', 'referral');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add columns to inquiries (new policies only; do not alter existing RLS)
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS status inquiry_status NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS expected_price numeric,
  ADD COLUMN IF NOT EXISTS source inquiry_source NOT NULL DEFAULT 'marketplace';

-- Vendor can update inquiries for own venues (new policy)
CREATE POLICY "Vendor can update inquiries for own venues"
  ON inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = inquiries.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = inquiries.venue_id AND vr.user_id = auth.uid()
    )
  );

-- Inquiry notes table
CREATE TABLE IF NOT EXISTS inquiry_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry_id ON inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_vendor_id ON inquiry_notes(vendor_id);

-- RLS for inquiry_notes
ALTER TABLE inquiry_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor can select own inquiry notes"
  ON inquiry_notes FOR SELECT
  USING (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendor can insert own inquiry notes"
  ON inquiry_notes FOR INSERT
  WITH CHECK (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM inquiries i
      JOIN venues v ON v.id = i.venue_id
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE i.id = inquiry_notes.inquiry_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can do all on inquiry notes"
  ON inquiry_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
