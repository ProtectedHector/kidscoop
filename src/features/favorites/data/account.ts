/** Account favorites in Convex, read and written as the signed-in user (never by user id). */
import 'server-only';
import { api } from '@convex/_generated/api';
import type { FavoriteStory } from '@/features/favorites/model/local-favorites';
import { getConvexForUser } from '@/lib/session';

/** The signed-in user's favorites, or `null` when nobody is signed in. */
export async function listAccountFavorites(): Promise<FavoriteStory[] | null> {
  const session = await getConvexForUser();
  if (!session) return null;
  return await session.client.query(api.favorites.list, {});
}

/**
 * Saves favorites for the signed-in user: `merge` adds them (after sign-in), `replace` makes the
 * account list exactly `favorites` (after a toggle). `null` when nobody is signed in.
 */
export async function saveAccountFavorites(
  favorites: FavoriteStory[],
  mode: 'merge' | 'replace',
): Promise<FavoriteStory[] | null> {
  const session = await getConvexForUser();
  if (!session) return null;
  const mutation = mode === 'merge' ? api.favorites.merge : api.favorites.replace;
  return await session.client.mutation(mutation, { favorites });
}
