-- Allow public inquiry submit by calling a SECURITY DEFINER function (bypasses RLS).
-- Fixes: "new row violates row-level security policy for table inquiries"

CREATE OR REPLACE FUNCTION public.submit_public_inquiry(
  p_venue_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_phone TEXT,
  p_event_date DATE DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_preferred_slot_id UUID DEFAULT NULL,
  p_interested_package_id UUID DEFAULT NULL,
  p_floor_id UUID DEFAULT NULL,
  p_event_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_event_type_enum inquiry_event_type;
BEGIN
  -- Cast event_type text to enum if provided
  IF p_event_type IS NOT NULL AND p_event_type <> '' THEN
    BEGIN
      v_event_type_enum := p_event_type::inquiry_event_type;
    EXCEPTION WHEN OTHERS THEN
      v_event_type_enum := NULL;
    END;
  ELSE
    v_event_type_enum := NULL;
  END IF;

  INSERT INTO inquiries (
    venue_id,
    user_id,
    name,
    phone,
    event_date,
    message,
    preferred_slot_id,
    interested_package_id,
    floor_id,
    event_type
  ) VALUES (
    p_venue_id,
    p_user_id,
    trim(p_name),
    trim(p_phone),
    p_event_date,
    nullif(trim(coalesce(p_message, '')), ''),
    p_preferred_slot_id,
    p_interested_package_id,
    p_floor_id,
    v_event_type_enum
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Allow anon and authenticated to call (used by front website form)
GRANT EXECUTE ON FUNCTION public.submit_public_inquiry(UUID, UUID, TEXT, TEXT, DATE, TEXT, UUID, UUID, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_public_inquiry(UUID, UUID, TEXT, TEXT, DATE, TEXT, UUID, UUID, UUID, TEXT) TO authenticated;
