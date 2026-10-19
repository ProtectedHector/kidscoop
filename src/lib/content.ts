import { ConvexHttpClient } from 'convex/browser';
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

export async function fetchArticles(language: string, category?: string): Promise<ConvexArticle[]> {
  const normalizedCategory = category ? normalizeCategory(category) : undefined;
  const articles = await getClient().query(api.articles.list, {
    language,
    ...(normalizedCategory ? { category: normalizedCategory } : {}),
  }) as ConvexArticle[];

  return sortArticles(articles);
}

export async function fetchArticle(language: string, articleId: number): Promise<ConvexArticle | null> {
  return await getClient().query(api.articles.byExternalId, {
    externalArticleId: articleId,
    language,
  }) as ConvexArticle | null;
}

export async function fetchContentAffiliateAds(articleId?: number): Promise<AffiliateAd[]> {
  return await getClient().query(api.articles.listAffiliates, {
    ...(articleId === undefined ? {} : { externalArticleId: articleId }),
  }) as AffiliateAd[];
}
