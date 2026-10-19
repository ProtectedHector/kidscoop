import { cache } from 'react';
import { Metadata } from 'next';
import { AVAILABLE_LANGUAGES } from './languages';
import { getArticlePath } from './articleRoutes';
import { fetchArticle, fetchArticles } from './content';
import { getCategoryLabel, getCategoryPath } from './categories';
import { SITE_NAME, SITE_URL, absoluteUrl } from './site';
import { buildAlternates, buildPageMetadata, cleanDescription } from './seo';

export interface ArticleSeoData {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
  lyrics?: string;
  lyrics_language?: string;
  category?: string;
}

/**
 * Loads an article straight from the content layer (no HTTP round-trip to our
 * own API) and memoises it for the duration of the request, so metadata and
 * page rendering share the same fetch.
 */
export const getArticle = cache(async (articleId: string, language: string): Promise<ArticleSeoData | null> => {
  const id = Number.parseInt(articleId, 10);
  if (Number.isNaN(id)) {
    return null;
  }

  try {
    const article = await fetchArticle(language, id);
    if (!article || !article.title || !article.content_text) {
      return null;
    }

    const result: ArticleSeoData = { ...article };

    if (result.lyrics && result.lyrics.trim() !== '') {
      result.lyrics_language = language;
    } else if (language !== 'en') {
      try {
        const enArticle = await fetchArticle('en', id);
        if (enArticle?.lyrics && enArticle.lyrics.trim() !== '') {
          result.lyrics = enArticle.lyrics;
          result.lyrics_language = 'en';
        }
      } catch {
        // Lyrics fallback is optional.
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching article for SEO:', error);
    return null;
  }
});

/** Lists articles for a language, memoised per request. Never throws. */
export const getArticleList = cache(async (language: string, category?: string) => {
  try {
    return await fetchArticles(language, category);
  } catch (error) {
    console.error(`Error fetching ${language} articles:`, error);
    return [];
  }
});

/** Strips long fields so list pages don't ship every full story to the browser. */
export function toArticleSummary<T extends { content_text: string; lyrics?: string }>(article: T) {
  const { lyrics: _lyrics, ...rest } = article;
  return { ...rest, content_text: article.content_text.slice(0, 320) };
}

const getArticleTitles = cache(async (articleId: string) => {
  const entries = await Promise.all(
    AVAILABLE_LANGUAGES.map(async ({ code }) => {
      const localized = await getArticle(articleId, code);
      return localized ? ([code, localized.title] as const) : null;
    }),
  );

  return Object.fromEntries(entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)));
});

export async function generateArticleMetadata({
  language,
  id,
}: {
  language: string;
  id: string;
}): Promise<Metadata> {
  const article = await getArticle(id, language);

  if (!article) {
    return {
      title: 'Story not found',
      robots: { index: false, follow: true },
    };
  }

  const titles = await getArticleTitles(id);
  const alternates = buildAlternates(language, (code) =>
    titles[code] ? getArticlePath(code, id, titles[code]) : null,
  );

  const metadata = buildPageMetadata({
    language,
    title: article.title,
    description: cleanDescription(article.content_text),
    path: getArticlePath(language, id, article.title),
    alternates,
    image: { url: article.image_path, alt: article.title },
    type: 'article',
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: article.published_date,
      section: getCategoryLabel(article.category, language),
    },
  };
}

export function buildArticleJsonLd(article: ArticleSeoData, language: string) {
  const url = absoluteUrl(getArticlePath(language, article.id, article.title));
  const categoryLabel = getCategoryLabel(article.category, language);
  const wordCount = article.content_text.trim().split(/\s+/).length;
  const published = article.published_date ? new Date(article.published_date) : null;
  const publishedIso = published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: article.title.slice(0, 110),
      description: cleanDescription(article.content_text, 200),
      image: [absoluteUrl(article.image_path)],
      ...(publishedIso ? { datePublished: publishedIso, dateModified: publishedIso } : {}),
      inLanguage: language,
      articleSection: categoryLabel,
      wordCount,
      isFamilyFriendly: true,
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 4, suggestedMaxAge: 12 },
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@id': `${SITE_URL}/#organization` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: absoluteUrl(`/${language}`) },
        { '@type': 'ListItem', position: 2, name: categoryLabel, item: absoluteUrl(getCategoryPath(language, article.category || '')) },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
  ];
}
