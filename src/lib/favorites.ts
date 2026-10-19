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

export function clearLocalFavorites() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FAVORITES_KEY);
  window.dispatchEvent(new CustomEvent('kidzcoop:favorites'));
}

export function normalizeFavorites(values: unknown): FavoriteStory[] {
  if (!Array.isArray(values)) return [];

  return values.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const item = value as Record<string, unknown>;
    const id = Number(item.id);
    const title = String(item.title || '').trim();
    const image_path = String(item.image_path || '').trim();
    const language = String(item.language || '').trim();
    const path = String(item.path || '').trim();
    const savedAtValue = String(item.savedAt || '').trim();
    const savedAt = Number.isFinite(Date.parse(savedAtValue)) ? savedAtValue : new Date().toISOString();

    if (!Number.isFinite(id) || !title || !image_path || !language || !path) return [];
    return [{ id, title, image_path, language, path, savedAt }];
  });
}

/** Stores `stories` as the account favorites ('replace') or adds them to it ('merge'). */
export async function saveAccountFavorites(stories: FavoriteStory[], mode: 'replace' | 'merge' = 'replace') {
  const response = await fetch('/api/favorites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorites: stories, mode }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { favorites?: FavoriteStory[] };
  return Array.isArray(data.favorites) ? data.favorites : null;
}

/** After sign-in: merge this device's favorites into the account and adopt the result. */
export async function syncFavoritesWithAccount() {
  const saved = await saveAccountFavorites(getFavorites(), 'merge');
  if (!saved) return null;

  setFavorites(saved);
  return saved;
}
