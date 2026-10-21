import { NextResponse } from 'next/server';
import { normalizeFavorites } from '@/features/favorites/public';
import { listAccountFavorites, saveAccountFavorites } from '@/features/favorites/public.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const favorites = await listAccountFavorites();
  if (!favorites) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return NextResponse.json({ favorites });
}

/**
 * Body: { favorites, mode }.
 * - mode "merge" (after sign-in): adds this device's favorites to the account.
 * - mode "replace" (default, after a toggle): the account list becomes exactly `favorites`.
 */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as { favorites?: unknown; mode?: unknown } | null;
  const favorites = normalizeFavorites(body?.favorites);

  try {
    const saved = await saveAccountFavorites(favorites, body?.mode === 'merge' ? 'merge' : 'replace');
    if (!saved) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ favorites: saved });
  } catch (error) {
    console.error('Could not save favorites in Convex', error);
    return NextResponse.json({ error: 'Could not save favorites' }, { status: 500 });
  }
}
