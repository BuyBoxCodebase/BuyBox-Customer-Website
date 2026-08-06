import type { MetadataRoute } from 'next';

// To tell search engine crawlers which URLs they can access.

// Must match BASE_URL in sitemap.ts — a mismatch makes crawlers treat the
// sitemap's URLs as out of scope and ignore them.
const BASE_URL = 'https://www.buyboxie.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}