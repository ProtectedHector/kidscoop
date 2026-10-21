import type { ArticleSummary } from '@/features/articles/model/types';

export type StoryNeighbours = {
  previous: ArticleSummary | null;
  next: ArticleSummary | null;
  /** Up to four other stories, same category first. */
  related: ArticleSummary[];
};

/** Previous/next stories (in list order, newest first) and related stories for `article`. */
export function findStoryNeighbours(
  articles: ArticleSummary[],
  article: { id: number; category?: string },
): StoryNeighbours {
  const index = articles.findIndex((item) => item.id === article.id);
  const sameCategory = (item: ArticleSummary) => (item.category && item.category === article.category ? 1 : 0);

  return {
    previous: index > 0 ? articles[index - 1] : null,
    next: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
    related: articles
      .filter((item) => item.id !== article.id)
      .sort((a, b) => sameCategory(b) - sameCategory(a))
      .slice(0, 4),
  };
}
