-- Phase 6: Notifications — in-app and email triggers for vendors

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS notification_email TEXT;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('new_inquiry', 'booking_confirmed', 'event_reminder');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_vendor_id ON notifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor can select own notifications"
  ON notifications FOR SELECT
  USING (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendor can update own notifications"
  ON notifications FOR UPDATE
  USING (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role or app can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can do all on notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
