import { MetadataRoute } from 'next';
import { getArticlePath } from '../lib/articleRoutes';
import { fetchArticles } from '../lib/content';
import { CATEGORY_SLUGS, getCategoryPath } from '../lib/categories';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../lib/languages';
import { absoluteUrl } from '../lib/site';

const languages = AVAILABLE_LANGUAGES.map((language) => language.code);

export const revalidate = 3600;

function toDate(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

function alternatesFor(paths: Record<string, string>) {
  const entries = Object.entries(paths).map(([code, path]) => [code, absoluteUrl(path)]);
  if (paths[DEFAULT_LANGUAGE]) {
    entries.push(['x-default', absoluteUrl(paths[DEFAULT_LANGUAGE])]);
  }
  return { languages: Object.fromEntries(entries) };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articlesByLanguage = await Promise.all(
    languages.map(async (lang) => {
      try {
        return [lang, await fetchArticles(lang)] as const;
      } catch (error) {
        console.error(`Error fetching ${lang} articles for sitemap:`, error);
        return [lang, []] as const;
      }
    }),
  );

  // Languages that actually have content; empty language sections are not submitted.
  const activeLanguages = articlesByLanguage.filter(([, articles]) => articles.length > 0).map(([lang]) => lang);
  const sitemapLanguages = activeLanguages.length ? activeLanguages : [DEFAULT_LANGUAGE];

  const latestByLanguage = new Map<string, Date | undefined>();
  for (const [lang, articles] of articlesByLanguage) {
    const dates = articles.map((article) => toDate(article.published_date)).filter(Boolean) as Date[];
    latestByLanguage.set(lang, dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined);
  }

  const homePaths = Object.fromEntries(sitemapLanguages.map((lang) => [lang, `/${lang}`]));
  const homePages: MetadataRoute.Sitemap = sitemapLanguages.map((lang) => ({
    url: absoluteUrl(`/${lang}`),
    lastModified: latestByLanguage.get(lang),
    changeFrequency: 'daily',
    priority: 1,
    alternates: alternatesFor(homePaths),
  }));

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.flatMap((category) => {
    const paths = Object.fromEntries(sitemapLanguages.map((lang) => [lang, getCategoryPath(lang, category)]));
    return sitemapLanguages.map((lang) => ({
      url: absoluteUrl(getCategoryPath(lang, category)),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: alternatesFor(paths),
    }));
  });

  const staticPages: MetadataRoute.Sitemap = (['about', 'contact'] as const).flatMap((page) => {
    const paths = { es: `/es/${page}`, en: `/en/${page}` };
    return Object.values(paths).map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
      alternates: alternatesFor(paths),
    }));
  });

  // Group translations of the same story so each URL lists its hreflang siblings.
  const articlePathsById = new Map<number, Record<string, string>>();
  for (const [lang, articles] of articlesByLanguage) {
    for (const article of articles) {
      const paths = articlePathsById.get(article.id) || {};
      paths[lang] = getArticlePath(lang, article.id, article.title);
      articlePathsById.set(article.id, paths);
    }
  }

  const articlePages: MetadataRoute.Sitemap = articlesByLanguage.flatMap(([lang, articles]) =>
    articles.map((article) => ({
      url: absoluteUrl(getArticlePath(lang, article.id, article.title)),
      lastModified: toDate(article.published_date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: alternatesFor(articlePathsById.get(article.id) || {}),
    })),
  );

  return [...homePages, ...categoryPages, ...staticPages, ...articlePages];
}
