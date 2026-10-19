import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import ArticlePageClient from '../../../../../components/ArticlePageClient';
import { getArticlePath, slugifyTitle } from '../../../../../lib/articleRoutes';
import {
  buildArticleJsonLd,
  generateArticleMetadata as generateArticleMetadataForRoute,
  getArticle,
} from '../../../../../lib/articleSeo';
import { jsonLd } from '../../../../../lib/seo';

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
  const article = await getArticle(params.id, params.language);

  // Missing stories must answer with a real 404 so Google drops them (no soft 404s).
  if (!article) {
    notFound();
  }

  if (params.slug !== slugifyTitle(article.title)) {
    permanentRedirect(getArticlePath(params.language, params.id, article.title));
  }

  return (
    <>
      {buildArticleJsonLd(article, params.language).map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      ))}
      <ArticlePageClient initialArticle={article} />
    </>
  );
}
