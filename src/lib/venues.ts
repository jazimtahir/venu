import type { SupabaseClient } from '@supabase/supabase-js';
import type { VenueType } from '@/types/database';

export type VenueSort = 'price_asc' | 'capacity_desc' | 'featured';

export interface VenueFilters {
  city?: string;
  min_price?: number;
  max_price?: number;
  max_price_per_head?: number;
  min_price_per_head?: number;
  capacity?: number;
  venue_type?: string[];
  features?: string[];
  catering_included?: boolean;
  sort?: VenueSort;
  page?: number;
  perPage?: number;
}

/** True if user range [userMin, userMax] overlaps venue range [venueMin, venueMax]. */
function rangesOverlap(
  userMin: number | undefined,
  userMax: number | undefined,
  venueMin: number | null | undefined,
  venueMax: number | null | undefined
): boolean {
  if (venueMin == null || venueMax == null) return false;
  const uMin = userMin ?? -Infinity;
  const uMax = userMax ?? Infinity;
  return uMin <= venueMax && venueMin <= uMax;
}

type VenueRow = {
  id: string;
  min_price: number | null;
  max_price: number | null;
  capacity: number | null;
  min_per_head_price: number | null;
  max_per_head_price: number | null;
  per_head_with_catering_min?: number | null;
  per_head_with_catering_max?: number | null;
  per_head_without_catering_min?: number | null;
  per_head_without_catering_max?: number | null;
  [key: string]: unknown;
};

/** Venue matches budget filter if user [min_price, max_price] overlaps any of: total range, or derived total from per-head × capacity. */
function venueMatchesBudget(v: VenueRow, userMin: number | undefined, userMax: number | undefined): boolean {
  if (userMin == null && userMax == null) return true;
  if (rangesOverlap(userMin, userMax, v.min_price, v.max_price)) return true;
  const cap = v.capacity ?? 0;
  if (cap > 0 && v.per_head_with_catering_min != null && v.per_head_with_catering_max != null) {
    if (rangesOverlap(userMin, userMax, v.per_head_with_catering_min * cap, v.per_head_with_catering_max * cap))
      return true;
  }
  if (cap > 0 && v.per_head_without_catering_min != null && v.per_head_without_catering_max != null) {
    if (rangesOverlap(userMin, userMax, v.per_head_without_catering_min * cap, v.per_head_without_catering_max * cap))
      return true;
  }
  if (cap > 0 && v.min_per_head_price != null && v.max_per_head_price != null) {
    if (rangesOverlap(userMin, userMax, v.min_per_head_price * cap, v.max_per_head_price * cap)) return true;
  }
  return false;
}

/** Venue matches per-head filter if user range overlaps any per-head range. */
function venueMatchesPerHead(v: VenueRow, userMin: number | undefined, userMax: number | undefined): boolean {
  if (userMin == null && userMax == null) return true;
  if (rangesOverlap(userMin, userMax, v.min_per_head_price, v.max_per_head_price)) return true;
  if (rangesOverlap(userMin, userMax, v.per_head_with_catering_min, v.per_head_with_catering_max)) return true;
  if (rangesOverlap(userMin, userMax, v.per_head_without_catering_min, v.per_head_without_catering_max)) return true;
  return false;
}

const PRICE_FILTER_FETCH_LIMIT = 1000;

export async function getVenues(
  supabase: SupabaseClient,
  filters: VenueFilters
) {
  const {
    city,
    min_price,
    max_price,
    min_price_per_head,
    max_price_per_head,
    capacity,
    venue_type,
    features,
    catering_included,
    sort = 'featured',
    page = 1,
    perPage = 12,
  } = filters;

  const hasBudgetFilter = min_price != null || max_price != null;
  const hasPerHeadFilter = min_price_per_head != null || max_price_per_head != null;
  const usePricePostFilter = hasBudgetFilter || hasPerHeadFilter;

  let query = supabase
    .from('venues')
    .select(
      `
      *,
      venue_images ( image_url ),
      venue_features ( feature_name )
    `,
      { count: usePricePostFilter ? 'exact' : 'exact' }
    );

  if (city) query = query.eq('city', city);
  if (!usePricePostFilter) {
    if (min_price != null) query = query.gte('max_price', min_price);
    if (max_price != null) query = query.lte('min_price', max_price);
    if (min_price_per_head != null) query = query.gte('max_per_head_price', min_price_per_head);
    if (max_price_per_head != null) query = query.lte('min_per_head_price', max_price_per_head);
  }
  if (capacity != null) query = query.gte('capacity', capacity);
  if (venue_type?.length) query = query.in('venue_type', venue_type);
  if (catering_included === true) query = query.eq('catering_included', true);

  if (sort === 'price_asc') query = query.order('min_price', { ascending: true, nullsFirst: false });
  else if (sort === 'capacity_desc') query = query.order('capacity', { ascending: false, nullsFirst: false });
  else query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

  if (usePricePostFilter) {
    query = query.range(0, PRICE_FILTER_FETCH_LIMIT - 1);
  } else {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  let venues = (data ?? []) as VenueListItem[];

  if (usePricePostFilter) {
    venues = venues.filter(
      (v) =>
        venueMatchesBudget(v as VenueRow, min_price, max_price) &&
        venueMatchesPerHead(v as VenueRow, min_price_per_head, max_price_per_head)
    );
    if (features?.length) {
      venues = venues.filter((v) =>
        features.every((f) => v.venue_features?.some((ff) => ff.feature_name === f))
      );
    }
    const total = venues.length;
    const from = (page - 1) * perPage;
    venues = venues.slice(from, from + perPage);
    const venueIds = venues.map((v) => v.id);
    const ratings = await getVenueRatings(supabase, venueIds);
    venues = venues.map((v) => ({ ...v, rating: ratings[v.id] }));
    return { venues, total };
  }

  if (features?.length) {
    venues = venues.filter((v) =>
      features.every((f) => v.venue_features?.some((ff) => ff.feature_name === f))
    );
  }

  const venueIds = venues.map((v) => v.id);
  const ratings = await getVenueRatings(supabase, venueIds);
  venues = venues.map((v) => ({ ...v, rating: ratings[v.id] }));

  return { venues, total: count ?? 0 };
}

export async function getVenueBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('venues')
    .select(
      `
      *,
      venue_images ( id, image_url, display_order ),
      venue_features ( id, feature_name ),
      venue_catering_packages ( id, name, per_head_price, description, menu_text, display_order ),
      venue_floors ( id, name, capacity, display_order ),
      venue_slots ( id, name, start_time, end_time, display_order ),
      venue_videos ( id, video_url, display_order ),
      vendors ( business_name, is_verified )
    `
    )
    .eq('slug', slug)
    .single();

  if (error) return { data: null, error };
  if (data) {
    const ratings = await getVenueRatings(supabase, [data.id]);
    (data as { rating?: { average: number; count: number } }).rating = ratings[data.id];
  }
  return { data, error: null };
}

export type VenueListItem = {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  city: string;
  area: string | null;
  min_price: number | null;
  max_price: number | null;
  capacity: number | null;
  venue_type: VenueType;
  description: string | null;
  address: string | null;
  google_maps_link: string | null;
  is_featured: boolean;
  is_verified: boolean;
  catering_included: boolean;
  min_per_head_price: number | null;
  max_per_head_price: number | null;
  per_head_with_catering_min: number | null;
  per_head_with_catering_max: number | null;
  per_head_without_catering_min: number | null;
  per_head_without_catering_max: number | null;
  created_at: string;
  venue_images?: { image_url: string }[];
  venue_features?: { feature_name: string }[];
  rating?: { average: number; count: number };
};

export async function getSimilarVenues(
  supabase: SupabaseClient,
  venueId: string,
  city: string,
  limit: number = 4
): Promise<VenueListItem[]> {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *,
      venue_images ( image_url )
    `)
    .eq('city', city)
    .neq('id', venueId)
    .limit(limit);

  if (error) return [];
  const list = (data ?? []) as VenueListItem[];
  const venueIds = list.map((v) => v.id);
  const ratings = await getVenueRatings(supabase, venueIds);
  return list.map((v) => ({ ...v, rating: ratings[v.id] }));
}

export async function getDistinctCities(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('venues')
    .select('city')
    .order('city');

  if (error) return [];
  const cities = [...new Set((data ?? []).map((r) => r.city))];
  return cities;
}

/** Returns aggregate rating (average + count) per venue. Omit venueIds or empty to skip query. */
export async function getVenueRatings(
  supabase: SupabaseClient,
  venueIds: string[]
): Promise<Record<string, { average: number; count: number }>> {
  if (venueIds.length === 0) return {};
  const { data, error } = await supabase
    .from('venue_reviews')
    .select('venue_id, rating')
    .in('venue_id', venueIds);
  if (error) return {};
  const byVenue: Record<string, number[]> = {};
  for (const row of data ?? []) {
    const id = row.venue_id;
    if (!byVenue[id]) byVenue[id] = [];
    byVenue[id].push(row.rating);
  }
  const result: Record<string, { average: number; count: number }> = {};
  for (const [id, ratings] of Object.entries(byVenue)) {
    const count = ratings.length;
    const average = ratings.reduce((a, b) => a + b, 0) / count;
    result[id] = { average: Math.round(average * 10) / 10, count };
  }
  return result;
}
