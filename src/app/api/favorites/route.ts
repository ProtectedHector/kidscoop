import { NextResponse } from 'next/server';
import {
  mergeAccountFavorites,
  normalizeFavorites,
  upsertAccount,
} from '@/lib/server/account-store';
import { getAuthenticatedIdentity } from '@/lib/server/clerk-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const identity = await getAuthenticatedIdentity();
  if (!identity) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const account = await upsertAccount(identity);
  return NextResponse.json({ favorites: account.favorites });
}

export async function PUT(request: Request) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { favorites?: unknown } | null;
  const favorites = normalizeFavorites(body?.favorites);
  const account = await mergeAccountFavorites(identity, favorites);

  return NextResponse.json({ favorites: account.favorites });
}
