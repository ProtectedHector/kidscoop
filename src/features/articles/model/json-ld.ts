import type { ArticleDetail } from '@/features/articles/model/types';
import { getArticlePath } from '@/lib/article-routes';
import { getCategoryLabel, getCategoryPath } from '@/lib/categories';
import { cleanDescription } from '@/lib/seo';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/site';

/** `Article` + `BreadcrumbList` structured data for a story page. */
export function buildArticleJsonLd(article: ArticleDetail, language: string) {
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
        {
          '@type': 'ListItem',
          position: 2,
          name: categoryLabel,
          item: absoluteUrl(getCategoryPath(language, article.category || '')),
        },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
  ];
}

/** `ItemList` structured data for a list of stories. */
export function buildArticleItemList(language: string, articles: Array<{ id: number; title: string }>) {
  return {
    '@type': 'ItemList',
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(getArticlePath(language, article.id, article.title)),
      name: article.title,
    })),
  };
}
