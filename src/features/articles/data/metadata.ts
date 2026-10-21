import 'server-only';
import type { Metadata } from 'next';
import { cache } from 'react';
import { getArticle } from '@/features/articles/data/queries';
import { getArticlePath } from '@/lib/article-routes';
import { getCategoryLabel } from '@/lib/categories';
import { AVAILABLE_LANGUAGES } from '@/lib/languages';
import { buildAlternates, buildPageMetadata, cleanDescription } from '@/lib/seo';

/** The story's title in every language it exists in, for hreflang alternates. */
const getArticleTitles = cache(async (articleId: string) => {
  const entries = await Promise.all(
    AVAILABLE_LANGUAGES.map(async ({ code }) => {
      const localized = await getArticle(articleId, code);
      return localized ? ([code, localized.title] as const) : null;
    }),
  );

  return Object.fromEntries(entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)));
});

/** Metadata for `/{language}/article/{id}/{slug}`: canonical, hreflang, Open Graph. */
export async function generateArticleMetadata({ language, id }: { language: string; id: string }): Promise<Metadata> {
  const article = await getArticle(id, language);

  if (!article) {
    return {
      title: 'Story not found',
      robots: { index: false, follow: true },
    };
  }

  const titles = await getArticleTitles(id);
  const alternates = buildAlternates(language, (code) => (titles[code] ? getArticlePath(code, id, titles[code]) : null));

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
