import { timingSafeEqual } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env.server';
import { CONTENT_CACHE_TAG } from '@/lib/server/convex';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request: Request) {
  const expected = env.KIDZCOOP_CONVEX_WRITE_TOKEN || '';
  const header = request.headers.get('authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!expected || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

/**
 * Called by the Make publishing scenario after a story is created in Convex:
 *   POST https://kidzcoop.app/api/revalidate
 *   Authorization: Bearer <KIDZCOOP_CONVEX_WRITE_TOKEN>
 * Expires the one-week content cache so the new story shows up immediately.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag(CONTENT_CACHE_TAG, { expire: 0 });
  revalidatePath('/sitemap.xml');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
