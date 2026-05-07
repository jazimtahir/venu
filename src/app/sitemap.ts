import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://venue.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [venuesRes, citiesRes] = await Promise.all([
    supabase.from('venues').select('slug, created_at').order('created_at', { ascending: false }),
    supabase.from('venues').select('city').order('city'),
  ]);

  const venues = venuesRes.data ?? [];
  const cities = [...new Set((citiesRes.data ?? []).map((r) => r.city))];

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/venues`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const venuePages: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${baseUrl}/venue/${v.slug}`,
    lastModified: v.created_at ? new Date(v.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/city/${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...venuePages, ...cityPages];
}
