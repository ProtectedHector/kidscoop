import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { getAuthenticatedIdentity } from '@/lib/server/clerk-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Upserts the signed-in Clerk user in Convex (called once per session by UserFavoritesSync). */
export async function POST() {
  const identity = await getAuthenticatedIdentity();
  if (!identity) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  const token = process.env.KIDZCOOP_CONVEX_WRITE_TOKEN;
  if (!url || !token) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  try {
    await new ConvexHttpClient(url).mutation(api.users.syncUser, {
      token,
      clerkUserId: identity.id,
      emailVerified: identity.emailVerified,
      ...(identity.email ? { email: identity.email } : {}),
      ...(identity.displayName ? { displayName: identity.displayName } : {}),
      ...(identity.imageUrl ? { imageUrl: identity.imageUrl } : {}),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Could not sync Clerk user with Convex', error);
    return NextResponse.json({ error: 'Could not sync profile' }, { status: 500 });
  }
}
