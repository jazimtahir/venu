-- Wedding Services Marketplace MVP – Initial Schema
-- Run in Supabase SQL Editor or via Supabase CLI

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE vendor_type AS ENUM ('venue', 'photographer', 'decorator', 'makeup_artist', 'catering');
CREATE TYPE venue_type AS ENUM ('indoor', 'outdoor', 'farmhouse', 'marquee');

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendors (future-proof; only venue active in UI for MVP)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  vendor_type vendor_type NOT NULL DEFAULT 'venue',
  city TEXT NOT NULL,
  description TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Venues
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  area TEXT,
  min_price INTEGER,
  max_price INTEGER,
  capacity INTEGER,
  venue_type venue_type NOT NULL,
  description TEXT,
  address TEXT,
  google_maps_link TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_min_max_price ON venues(min_price, max_price);
CREATE INDEX idx_venues_capacity ON venues(capacity);
CREATE INDEX idx_venues_is_featured ON venues(is_featured) WHERE is_featured = TRUE;

-- Venue features
CREATE TABLE venue_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL
);

CREATE INDEX idx_venue_features_venue_id ON venue_features(venue_id);

-- Venue images (image_url = path or full URL in Storage)
CREATE TABLE venue_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_venue_images_venue_id ON venue_images(venue_id);

-- Inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_date DATE,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_venue_id ON inquiries(venue_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Trigger: create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow insert for new user (trigger handles it; anon can't insert arbitrary)"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS: vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read vendors"
  ON vendors FOR SELECT
  USING (true);

CREATE POLICY "Vendors can update own"
  ON vendors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vendor"
  ON vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin: allow all for service role; for anon we use app check. Optional admin policy:
-- CREATE POLICY "Admin full access vendors" ON vendors FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );
-- We'll rely on service role or a single admin policy for delete. For MVP, admin can use dashboard with anon key if we add policy:
CREATE POLICY "Admin can update any vendor"
  ON vendors FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS: venues
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venues"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Vendor can insert own venue"
  ON venues FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Vendor can update own venue"
  ON venues FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Vendor can delete own venue"
  ON venues FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Admin can update any venue"
  ON venues FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS: venue_features
ALTER TABLE venue_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_features"
  ON venue_features FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue features"
  ON venue_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_features.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_features.venue_id AND vr.user_id = auth.uid()
    )
  );

-- RLS: venue_images
ALTER TABLE venue_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venue_images"
  ON venue_images FOR SELECT
  USING (true);

CREATE POLICY "Vendor can manage own venue images"
  ON venue_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_images.venue_id AND vr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = venue_images.venue_id AND vr.user_id = auth.uid()
    )
  );

-- RLS: inquiries
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiry"
  ON inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Vendor can read inquiries for own venues"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN vendors vr ON vr.id = v.vendor_id
      WHERE v.id = inquiries.venue_id AND vr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete inquiries"
  ON inquiries FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage: create bucket "venue-images" in Supabase Dashboard (Storage).
-- Set bucket to Public. Add policy: allow public read (SELECT), allow authenticated upload (INSERT).
