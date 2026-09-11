import { Metadata } from 'next';
import { headers } from 'next/headers';
import { AVAILABLE_LANGUAGES } from './languages';
import { getArticlePath } from './articleRoutes';
import { SITE_URL, absoluteUrl } from './site';

interface ArticleSeoData {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
}

export function getRequestBaseUrl(): string {
  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') || 'https';

  return (host ? `${protocol}://${host}` : '') || SITE_URL;
}

export async function fetchArticleForLanguage(
  articleId: string,
  language: string,
  baseUrl: string,
): Promise<ArticleSeoData | null> {
  try {
    const res = await fetch(`${baseUrl}/api/articles/${articleId}?lang=${language}`, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'KidZcoop-SEO-Bot/1.0',
      },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching article for SEO:', error);
    return null;
  }
}

export async function generateArticleMetadata({
  language,
  id,
}: {
  language: string;
  id: string;
}): Promise<Metadata> {
  const baseUrl = getRequestBaseUrl();
  const article = await fetchArticleForLanguage(id, language, baseUrl);

  if (!article) {
    return {
      title: 'Article | KidZcoop',
      description: 'Amazing stories for kids',
    };
  }

  const title = `${article.title} | KidZcoop`;
  const description = article.content_text.substring(0, 160).replace(/\n/g, ' ');
  const imageUrl = absoluteUrl(article.image_path, baseUrl);
  const imageType = article.image_path.toLowerCase().endsWith('.jpg') || article.image_path.toLowerCase().endsWith('.jpeg')
    ? 'image/jpeg'
    : 'image/png';
  const canonicalPath = getArticlePath(language, id, article.title);
  const alternateEntries = await Promise.all(
    AVAILABLE_LANGUAGES.map(async (availableLanguage) => {
      const localizedArticle = availableLanguage.code === language
        ? article
        : await fetchArticleForLanguage(id, availableLanguage.code, baseUrl);

      if (!localizedArticle) {
        return null;
      }

      return [
        availableLanguage.code,
        `${baseUrl}${getArticlePath(
          availableLanguage.code,
          id,
          localizedArticle.title,
        )}`,
      ] as const;
    }),
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${canonicalPath}`,
      siteName: 'KidZcoop',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 400,
          alt: article.title,
          type: imageType,
        },
      ],
      locale: language,
      type: 'article',
      publishedTime: article.published_date,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: Object.fromEntries(alternateEntries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))),
    },
  };
}
