import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://venue.example.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/vendor/', '/admin', '/api/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
