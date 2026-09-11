import { MetadataRoute } from 'next';
import { getArticlePath } from '../lib/articleRoutes';
import { fetchArticlesWithContent } from '../lib/googleSheets';
import { AVAILABLE_LANGUAGES } from '../lib/languages';

const languages = AVAILABLE_LANGUAGES.map((language) => language.code);
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articlesByLanguage = await Promise.all(
    languages.map(async (lang) => {
      try {
        return [lang, await fetchArticlesWithContent(lang)] as const;
      } catch (error) {
        console.error(`Error fetching ${lang} articles for sitemap:`, error);
      }

      return [lang, []] as const;
    }),
  );

  // Generate URLs for all language home pages
  const languagePages: MetadataRoute.Sitemap = languages.map(lang => ({
    url: `${baseUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Generate URLs for all article pages in all languages
  const articlePages: MetadataRoute.Sitemap = articlesByLanguage.flatMap(([lang, articles]) =>
    (articles as Array<{ id: number; title: string }>).map(article => ({
      url: `${baseUrl}${getArticlePath(lang, article.id, article.title)}`,
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
