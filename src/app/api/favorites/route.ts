import { NextResponse } from 'next/server';
import { api } from '../../../../convex/_generated/api';
import { getConvexForUser } from '@/lib/server/convex-user';
import { normalizeFavorites } from '@/lib/favorites';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getConvexForUser();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const favorites = await session.client.query(api.favorites.list, {});
  return NextResponse.json({ favorites });
}

/**
 * Body: { favorites, mode }.
 * - mode "merge" (after sign-in): adds this device's favorites to the account.
 * - mode "replace" (default, after a toggle): the account list becomes exactly `favorites`.
 */
export async function PUT(request: Request) {
  const session = await getConvexForUser();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { favorites?: unknown; mode?: unknown } | null;
  const favorites = normalizeFavorites(body?.favorites);
  const mutation = body?.mode === 'merge' ? api.favorites.merge : api.favorites.replace;

  try {
    const saved = await session.client.mutation(mutation, { favorites });
    return NextResponse.json({ favorites: saved });
  } catch (error) {
    console.error('Could not save favorites in Convex', error);
    return NextResponse.json({ error: 'Could not save favorites' }, { status: 500 });
  }
}
