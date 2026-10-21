import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getArticleAffiliateAds } from '@/features/affiliates/public.server';
import { ArticlePage, buildArticleJsonLd, findStoryNeighbours } from '@/features/articles/public';
import { generateArticleMetadata, getArticle, getArticleSummaries } from '@/features/articles/public.server';
import { getArticlePath, slugifyTitle } from '@/lib/article-routes';
import { jsonLd } from '@/lib/seo';

type Params = { language: string; id: string; slug: string };

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  return generateArticleMetadata({ language: params.language, id: params.id });
}

export default async function ArticleSlugPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const article = await getArticle(params.id, params.language);

  // Missing stories must answer with a real 404 so Google drops them (no soft 404s).
  if (!article) {
    notFound();
  }

  if (params.slug !== slugifyTitle(article.title)) {
    permanentRedirect(getArticlePath(params.language, params.id, article.title));
  }

  const [articles, affiliateAds] = await Promise.all([
    getArticleSummaries(params.language),
    getArticleAffiliateAds(article.id),
  ]);

  return (
    <>
      {buildArticleJsonLd(article, params.language).map((schema) => (
        <script key={schema['@type']} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      ))}
      <ArticlePage article={article} neighbours={findStoryNeighbours(articles, article)} affiliateAds={affiliateAds} />
    </>
  );
}
