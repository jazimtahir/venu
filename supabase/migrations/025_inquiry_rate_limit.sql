-- Rate limit inquiry submissions by IP (hashed) to prevent spam.
-- Server action checks this table before calling submit_public_inquiry.

CREATE TABLE IF NOT EXISTS inquiry_rate_limit (
  key TEXT PRIMARY KEY,
  last_submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: index for cleanup of old rows (e.g. delete where last_submitted_at < now() - interval '1 hour')
CREATE INDEX IF NOT EXISTS idx_inquiry_rate_limit_last_submitted
  ON inquiry_rate_limit (last_submitted_at);

-- Allow anon and authenticated to read/insert/update (server action uses service role or anon with RLS)
-- For server-side only access, use service role; if action uses anon key, we need policies.
-- Here we allow the backend to do everything; RLS can be enabled and policies added if the table
-- is ever exposed. For now we use it from a server action that uses createClient() (which uses anon key
-- with user context). So we need the action to run as a role that can INSERT/SELECT on this table.
-- Supabase server action typically uses createClient() = anon. So we need:
ALTER TABLE inquiry_rate_limit ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert and select (server action runs as anon); restrict update/delete if desired.
-- We only need: SELECT (to check), INSERT (first time), UPDATE (to refresh last_submitted_at).
CREATE POLICY "Allow anon to manage rate limit for inquiry spam protection"
  ON inquiry_rate_limit FOR ALL
  USING (true)
  WITH CHECK (true);
