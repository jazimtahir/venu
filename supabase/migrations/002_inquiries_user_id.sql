-- Optional: link inquiry to user for "My inquiries" in customer dashboard
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);

-- Allow customers to read own inquiries
DROP POLICY IF EXISTS "Customer can read own inquiries" ON inquiries;
CREATE POLICY "Customer can read own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);
