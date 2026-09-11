import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import ArticlePageClient from '../../../../../components/ArticlePageClient';
import { getArticlePath, slugifyTitle } from '../../../../../lib/articleRoutes';
import {
  fetchArticleForLanguage,
  generateArticleMetadata as generateArticleMetadataForRoute,
  getRequestBaseUrl,
} from '../../../../../lib/articleSeo';

export async function generateMetadata({
  params,
}: {
  params: { language: string; id: string; slug: string };
}): Promise<Metadata> {
  return generateArticleMetadataForRoute({
    language: params.language,
    id: params.id,
  });
}

export default async function ArticleSlugPage({
  params,
}: {
  params: { language: string; id: string; slug: string };
}) {
  const article = await fetchArticleForLanguage(
    params.id,
    params.language,
    getRequestBaseUrl(),
  );

  if (article && params.slug !== slugifyTitle(article.title)) {
    permanentRedirect(getArticlePath(params.language, params.id, article.title));
  }

  return <ArticlePageClient />;
}
