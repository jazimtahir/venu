-- Wishlist count per venue (denormalized for admin/vendor dashboards)
ALTER TABLE venues ADD COLUMN IF NOT EXISTS wishlist_count INTEGER NOT NULL DEFAULT 0;

-- Trigger: increment on INSERT into venue_wishlists
CREATE OR REPLACE FUNCTION increment_venue_wishlist_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE venues SET wishlist_count = wishlist_count + 1 WHERE id = NEW.venue_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_venue_wishlists_increment ON venue_wishlists;
CREATE TRIGGER trg_venue_wishlists_increment
  AFTER INSERT ON venue_wishlists
  FOR EACH ROW
  EXECUTE PROCEDURE increment_venue_wishlist_count();

-- Trigger: decrement on DELETE from venue_wishlists
CREATE OR REPLACE FUNCTION decrement_venue_wishlist_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE venues SET wishlist_count = GREATEST(0, wishlist_count - 1) WHERE id = OLD.venue_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_venue_wishlists_decrement ON venue_wishlists;
CREATE TRIGGER trg_venue_wishlists_decrement
  AFTER DELETE ON venue_wishlists
  FOR EACH ROW
  EXECUTE PROCEDURE decrement_venue_wishlist_count();

-- Backfill existing counts
UPDATE venues v
SET wishlist_count = COALESCE(
  (SELECT COUNT(*)::integer FROM venue_wishlists w WHERE w.venue_id = v.id),
  0
);
