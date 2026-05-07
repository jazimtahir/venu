-- Callback / "Help me find a venue" leads
CREATE TABLE callback_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  event_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_callback_leads_created_at ON callback_leads(created_at DESC);

ALTER TABLE callback_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit callback lead"
  ON callback_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read callback leads"
  ON callback_leads FOR SELECT
  USING (auth.role() = 'authenticated');
