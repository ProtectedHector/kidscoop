import { MetadataRoute } from 'next';

const languages = ['en', 'es', 'fr', 'de', 'it', 'pt'];
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidscoop.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch articles from API to generate dynamic URLs
  let articles: Array<{ id: number }> = [];
  
  try {
    const apiUrl = process.env.API_URL || (typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/api/articles?lang=en`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });
      if (res.ok) {
        articles = await res.json();
      }
    }
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
  }

  // Generate URLs for all language home pages
  const languagePages: MetadataRoute.Sitemap = languages.map(lang => ({
    url: `${baseUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Generate URLs for all article pages in all languages
  const articlePages: MetadataRoute.Sitemap = articles.flatMap(article =>
    languages.map(lang => ({
      url: `${baseUrl}/${lang}/content/${article.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...languagePages,
    ...articlePages,
  ];
}
