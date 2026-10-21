import { NextResponse } from 'next/server';
import { syncCurrentUser } from '@/features/auth/public.server';

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
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Could not sync Clerk user with Convex', error);
    return NextResponse.json({ error: 'Could not sync profile' }, { status: 500 });
  }
}
