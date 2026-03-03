import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all main pages
      { userAgent: '*', allow: '/' },
      // Disallow admin and private areas
      { userAgent: '*', disallow: ['/dashboard/', '/presenter/', '/profile/', '/api/', '/_next/', '/admin/'] },
      // Allow specific sub-pages that might be useful
      { userAgent: '*', allow: ['/discover', '/join', '/login', '/analytics', '/design'] },
      // Disallow query parameters and dynamic content
      { userAgent: '*', disallow: ['/*?', '/search', '/filter'] },
    ],
    sitemap: 'https://quizbase.app/sitemap.xml',
    host: 'https://quizbase.app',
  };
}
