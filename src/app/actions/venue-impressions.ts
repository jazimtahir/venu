'use server';

import { createClient } from '@/lib/supabase/server';

export type ImpressionSource = 'list' | 'homepage' | 'city';

export async function recordVenueImpression(venueId: string, source: ImpressionSource): Promise<void> {
  const supabase = await createClient();
  await supabase.from('venue_impressions').insert({ venue_id: venueId, source });
}
