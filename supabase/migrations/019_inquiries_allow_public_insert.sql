-- Ensure anyone (including anonymous visitors) can submit an inquiry from the front website.
-- Fixes: "new row violates row-level security policy for table inquiries"

DROP POLICY IF EXISTS "Anyone can insert inquiry" ON inquiries;
CREATE POLICY "Anyone can insert inquiry"
  ON inquiries FOR INSERT
  WITH CHECK (true);
