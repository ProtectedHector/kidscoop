/**
 * `articles`' client-safe entry file: the story UI and its types. Code outside this feature imports
 * the feature through here or through [public.server.ts](public.server.ts), never its folders.
 */
export { default as ArticleColoringStudio } from '@/features/articles/components/article-coloring-studio';
export { default as ArticlePage } from '@/features/articles/components/article-page';
export { default as CategoryStories } from '@/features/articles/components/category-stories';
export { default as HomeStories } from '@/features/articles/components/home-stories';
export { buildArticleItemList, buildArticleJsonLd } from '@/features/articles/model/json-ld';
export { findStoryNeighbours, type StoryNeighbours } from '@/features/articles/model/story-neighbours';
export type { Article, ArticleDetail, ArticleSummary } from '@/features/articles/model/types';
