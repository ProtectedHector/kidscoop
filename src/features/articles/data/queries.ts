/**
 * Every story read in the app goes through here: Convex, cached for a week under the `content` tag.
 * Make expires the tag with `POST /api/revalidate` after publishing.
 */
import 'server-only';
import { api } from '@convex/_generated/api';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Article, ArticleDetail, ArticleSummary } from '@/features/articles/model/types';
import { type CategorySlug, normalizeCategory } from '@/lib/categories';
import { contentCacheOptions, getConvexClient } from '@/lib/server/convex';

function sortNewestFirst<T extends { published_date?: string }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.published_date || 0).getTime();
    const dateB = new Date(b.published_date || 0).getTime();
    return dateB - dateA;
  });
}

const cachedArticles = unstable_cache(
  async (language: string, category?: CategorySlug) =>
    (await getConvexClient().query(api.articles.list, {
      language,
      ...(category ? { category } : {}),
    })) as Article[],
  ['convex-articles-list'],
  contentCacheOptions,
);

const cachedArticle = unstable_cache(
  async (language: string, articleId: number) =>
    (await getConvexClient().query(api.articles.byExternalId, {
      externalArticleId: articleId,
      language,
    })) as Article | null,
  ['convex-article'],
  contentCacheOptions,
);

/** Stories for a language (and optional category), newest first. Throws if Convex fails. */
export async function fetchArticles(language: string, category?: string): Promise<Article[]> {
  const normalizedCategory = category ? normalizeCategory(category) : undefined;
  return sortNewestFirst(await cachedArticles(language, normalizedCategory));
}

/** One story in one language, or `null`. Throws if Convex fails. */
export async function fetchArticle(language: string, articleId: number): Promise<Article | null> {
  return await cachedArticle(language, articleId);
}

/** Fills in English lyrics when the story has none in `language`. Never throws. */
export async function withLyricsFallback<T extends { id: number; lyrics?: string; lyrics_language?: string }>(
  article: T,
  language: string,
): Promise<T> {
  if (article.lyrics && article.lyrics.trim() !== '') {
    return { ...article, lyrics_language: language };
  }
  if (language === 'en') return article;

  try {
    const english = await fetchArticle('en', article.id);
    if (english?.lyrics && english.lyrics.trim() !== '') {
      return { ...article, lyrics: english.lyrics, lyrics_language: 'en' };
    }
  } catch {
    // The English lyrics are optional.
  }
  return article;
}

/** The story for an article page, memoised per request so metadata and page share one read. */
export const getArticle = cache(async (articleId: string, language: string): Promise<ArticleDetail | null> => {
  const id = Number.parseInt(articleId, 10);
  if (Number.isNaN(id)) return null;

  try {
    const article = await fetchArticle(language, id);
    if (!article || !article.title || !article.content_text) return null;

    return await withLyricsFallback<ArticleDetail>(
      {
        id: article.id,
        title: article.title,
        content_text: article.content_text,
        image_path: article.image_path,
        published_date: article.published_date,
        lyrics: article.lyrics,
        category: article.category,
      },
      language,
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
});

/** Lists stories for a language, memoised per request. Never throws: an outage renders an empty list. */
export const getArticleList = cache(async (language: string, category?: string): Promise<Article[]> => {
  try {
    return await fetchArticles(language, category);
  } catch (error) {
    console.error(`Error fetching ${language} articles:`, error);
    return [];
  }
});

/** Strips long fields so list pages don't ship every full story to the browser. */
export function toArticleSummary(article: Article): ArticleSummary {
  const { lyrics: _lyrics, ...rest } = article;
  return { ...rest, content_text: article.content_text.slice(0, 320) };
}

/** `getArticleList` already cut down to summaries. */
export async function getArticleSummaries(language: string, category?: string): Promise<ArticleSummary[]> {
  return (await getArticleList(language, category)).map(toArticleSummary);
}
