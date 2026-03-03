import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://quizbase.app';
  const currentDate = new Date();
  
  return [
    // Main pages
    { url: base, lastModified: currentDate, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/join`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/discover`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/analytics`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.6 },
    
    // Legal pages
    { url: `${base}/legal`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/impressum`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/datenschutz`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.2 },
    
    // Additional pages
    { url: `${base}/design`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
