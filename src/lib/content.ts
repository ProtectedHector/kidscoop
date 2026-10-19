import { ConvexHttpClient } from 'convex/browser';
import { unstable_cache } from 'next/cache';
import { api } from '../../convex/_generated/api';
import { normalizeCategory, type CategorySlug } from './categories';
import type { AffiliateAd, Article } from './types';

export type { AffiliateAd, Article } from './types';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || '';

export type ConvexArticle = Article & {
  convex_id?: string;
  category?: CategorySlug;
  slug?: string;
};

/** Content changes only when Make publishes, so cache Convex reads for a week. */
export const CONTENT_REVALIDATE_SECONDS = 60 * 60 * 24 * 7;
/** Cache tag for every content read; invalidate it with POST /api/revalidate. */
export const CONTENT_CACHE_TAG = 'content';

const cacheOptions = { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] };

let client: ConvexHttpClient | null = null;

function getClient() {
  if (!CONVEX_URL) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  }

  client ||= new ConvexHttpClient(CONVEX_URL);
  return client;
}

function sortArticles<T extends { published_date?: string }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.published_date || 0).getTime();
    const dateB = new Date(b.published_date || 0).getTime();
    return dateB - dateA;
  });
}

const cachedArticles = unstable_cache(
  async (language: string, category?: CategorySlug) =>
    await getClient().query(api.articles.list, {
      language,
      ...(category ? { category } : {}),
    }) as ConvexArticle[],
  ['convex-articles-list'],
  cacheOptions,
);

const cachedArticle = unstable_cache(
  async (language: string, articleId: number) =>
    await getClient().query(api.articles.byExternalId, {
      externalArticleId: articleId,
      language,
    }) as ConvexArticle | null,
  ['convex-article'],
  cacheOptions,
);

const cachedAffiliates = unstable_cache(
  async (articleId?: number) =>
    await getClient().query(api.articles.listAffiliates, {
      ...(articleId === undefined ? {} : { externalArticleId: articleId }),
    }) as AffiliateAd[],
  ['convex-affiliates'],
  cacheOptions,
);

export async function fetchArticles(language: string, category?: string): Promise<ConvexArticle[]> {
  const normalizedCategory = category ? normalizeCategory(category) : undefined;
  return sortArticles(await cachedArticles(language, normalizedCategory));
}

export async function fetchArticle(language: string, articleId: number): Promise<ConvexArticle | null> {
  return await cachedArticle(language, articleId);
}

export async function fetchContentAffiliateAds(articleId?: number): Promise<AffiliateAd[]> {
  return await cachedAffiliates(articleId);
}
