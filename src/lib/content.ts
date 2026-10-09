import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import {
  fetchAffiliateAds as fetchGoogleAffiliateAds,
  fetchArticlesWithContent,
  type AffiliateAd,
  type Article,
} from './googleSheets';
import { normalizeCategory, type CategorySlug } from './categories';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || '';
const CONTENT_SOURCE = (process.env.KIDZCOOP_CONTENT_SOURCE || 'sheets').toLowerCase();

type ConvexArticle = Article & {
  convex_id?: string;
  category?: CategorySlug;
  slug?: string;
};

let client: ConvexHttpClient | null = null;

function getClient() {
  if (!CONVEX_URL || CONTENT_SOURCE === 'sheets') {
    return null;
  }

  client ||= new ConvexHttpClient(CONVEX_URL);
  return client;
}

function shouldRequireConvex() {
  return CONTENT_SOURCE === 'convex';
}

function sortArticles<T extends { published_date?: string }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.published_date || 0).getTime();
    const dateB = new Date(b.published_date || 0).getTime();
    return dateB - dateA;
  });
}

function hasContent(article: Article | null | undefined): article is Article {
  return Boolean(article && article.title && article.content_text);
}

export async function fetchArticles(language: string, category?: string): Promise<ConvexArticle[]> {
  const normalizedCategory = category ? normalizeCategory(category) : undefined;
  const convex = getClient();

  if (convex) {
    try {
      const articles = await convex.query(api.articles.list, {
        language,
        ...(normalizedCategory ? { category: normalizedCategory } : {}),
      }) as ConvexArticle[];

      if (articles.length || shouldRequireConvex()) {
        return sortArticles(articles);
      }
    } catch (error) {
      if (shouldRequireConvex()) {
        throw error;
      }
      console.warn('Convex articles unavailable, falling back to Google Sheets:', error);
    }
  }

  const googleArticles = await fetchArticlesWithContent(language);
  const categorized = googleArticles.map((article) => ({
    ...article,
    category: normalizeCategory((article as ConvexArticle).category),
  }));

  return sortArticles(
    normalizedCategory
      ? categorized.filter((article) => article.category === normalizedCategory)
      : categorized,
  );
}

export async function fetchArticle(language: string, articleId: number): Promise<ConvexArticle | null> {
  const convex = getClient();

  if (convex) {
    try {
      const article = await convex.query(api.articles.byExternalId, {
        externalArticleId: articleId,
        language,
      }) as ConvexArticle | null;

      if (hasContent(article) || shouldRequireConvex()) {
        return article;
      }
    } catch (error) {
      if (shouldRequireConvex()) {
        throw error;
      }
      console.warn('Convex article unavailable, falling back to Google Sheets:', error);
    }
  }

  const articles = await fetchArticlesWithContent(language);
  return articles.find((item) => item.id === articleId) || null;
}

export async function fetchContentAffiliateAds(articleId?: number): Promise<AffiliateAd[]> {
  const convex = getClient();

  if (convex) {
    try {
      const affiliates = await convex.query(api.articles.listAffiliates, {
        ...(articleId === undefined ? {} : { externalArticleId: articleId }),
      }) as AffiliateAd[];

      if (affiliates.length || shouldRequireConvex()) {
        return affiliates;
      }
    } catch (error) {
      if (shouldRequireConvex()) {
        throw error;
      }
      console.warn('Convex affiliates unavailable, falling back to Google Sheets:', error);
    }
  }

  return fetchGoogleAffiliateAds(articleId);
}
