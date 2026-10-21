import { after, NextResponse } from 'next/server';
import { reportAuthAlert, syncCurrentUser } from '@/features/auth/public.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Upserts the signed-in Clerk user in Convex (called once per session by AccountSync). */
export async function POST() {
  try {
    const result = await syncCurrentUser();
    if (result === 'signed-out') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (result === 'not-configured') {
      after(() => reportAuthAlert('user_sync_failed', 'KIDZCOOP_CONVEX_WRITE_TOKEN is not set'));
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Could not sync Clerk user with Convex', error);
    after(() => reportAuthAlert('user_sync_failed', error instanceof Error ? error.message : String(error)));
    return NextResponse.json({ error: 'Could not sync profile' }, { status: 500 });
  }
}
