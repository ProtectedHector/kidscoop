import type { CategorySlug } from '@/lib/categories';

/** One story in one language, as `convex/articles.ts` returns it. */
export interface Article {
  id: number;
  content_id: number;
  name: string;
  language: string;
  title: string;
  content_text: string;
  lyrics: string;
  image_path: string;
  published_date: string;
  lyrics_language?: string;
  convex_id?: string;
  category?: CategorySlug;
  slug?: string;
}

/** What an article page needs, with lyrics resolved (falling back to English). */
export interface ArticleDetail {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
  lyrics?: string;
  lyrics_language?: string;
  category?: string;
}

/** A list entry: no lyrics, text cut short, so list pages don't ship every full story. */
export type ArticleSummary = Omit<Article, 'lyrics'>;
