-- View count per venue (incremented when venue detail page is viewed)
ALTER TABLE venues ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_venue_view_count(p_venue_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE venues SET view_count = view_count + 1 WHERE id = p_venue_id;
$$;
