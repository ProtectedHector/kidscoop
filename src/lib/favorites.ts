export const FAVORITES_KEY = 'kidzcoop:favorites:v1';
export const FAVORITES_ACCOUNT_KEY = 'kidzcoop:favorites:account-user:v1';

export type FavoriteStory = {
  id: number;
  title: string;
  image_path: string;
  language: string;
  path: string;
  savedAt: string;
};

export function getFavorites(): FavoriteStory[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function setFavorites(stories: FavoriteStory[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(stories));
  window.dispatchEvent(new CustomEvent('kidzcoop:favorites'));
}

export function mergeFavorites(...groups: FavoriteStory[][]): FavoriteStory[] {
  const byKey = new Map<string, FavoriteStory>();

  for (const stories of groups) {
    for (const story of stories) {
      if (!Number.isFinite(story.id) || !story.language || !story.path) continue;

      const key = `${story.language}:${story.id}`;
      const current = byKey.get(key);
      if (!current || Date.parse(story.savedAt) > Date.parse(current.savedAt)) {
        byKey.set(key, story);
      }
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt),
  );
}

export function clearLocalFavorites() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FAVORITES_KEY);
  window.dispatchEvent(new CustomEvent('kidzcoop:favorites'));
}

export async function saveAccountFavorites(stories: FavoriteStory[]) {
  const response = await fetch('/api/favorites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorites: stories }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { favorites?: FavoriteStory[] };
  return Array.isArray(data.favorites) ? data.favorites : null;
}

export async function syncFavoritesWithAccount() {
  const localFavorites = getFavorites();
  const response = await fetch('/api/favorites', { cache: 'no-store' });

  if (!response.ok) return null;

  const data = (await response.json()) as { favorites?: FavoriteStory[] };
  const accountFavorites = Array.isArray(data.favorites) ? data.favorites : [];
  const merged = mergeFavorites(accountFavorites, localFavorites);
  const saved = await saveAccountFavorites(merged);
  const next = saved || merged;

  setFavorites(next);
  return next;
}
