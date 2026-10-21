import { describe, expect, it } from 'vitest';
import { findStoryNeighbours } from '@/features/articles/model/story-neighbours';
import type { ArticleSummary } from '@/features/articles/model/types';

const story = (id: number, category: ArticleSummary['category']) =>
  ({ id, category, title: `Story ${id}`, content_text: '', image_path: '', published_date: '' }) as ArticleSummary;

describe('findStoryNeighbours', () => {
  const list = [story(5, 'ciencia'), story(4, 'arte'), story(3, 'ciencia'), story(2, 'arte'), story(1, 'arte')];

  it('finds previous and next in list order', () => {
    const { previous, next } = findStoryNeighbours(list, { id: 3, category: 'ciencia' });
    expect(previous?.id).toBe(4);
    expect(next?.id).toBe(2);
  });

  it('has no previous for the newest story and no next for the oldest', () => {
    expect(findStoryNeighbours(list, { id: 5 }).previous).toBeNull();
    expect(findStoryNeighbours(list, { id: 1 }).next).toBeNull();
  });

  it('lists up to four related stories, same category first, never the story itself', () => {
    const { related } = findStoryNeighbours(list, { id: 3, category: 'ciencia' });
    expect(related.map((item) => item.id)).toEqual([5, 4, 2, 1]);
  });
});
