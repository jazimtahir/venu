'use server';

import { createClient } from '@/lib/supabase/server';

export async function recordVenueView(venueId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc('increment_venue_view_count', { p_venue_id: venueId });
}
