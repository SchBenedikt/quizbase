import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/presenter/', '/profile/'] },
    ],
    sitemap: 'https://quizbase.app/sitemap.xml',
  };
}
