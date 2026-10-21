import { after, NextResponse } from 'next/server';
import { isClientAlertKind, reportAuthAlert } from '@/features/auth/public.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Browsers report sign-in failures they see (Clerk didn't load, Google sign-in failed).
 * Public on purpose; Convex throttles emails to one per kind per hour, and the detail is capped.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { kind?: unknown; detail?: unknown } | null;
  if (!isClientAlertKind(body?.kind)) {
    return NextResponse.json({ error: 'Unknown alert kind' }, { status: 400 });
  }

  const detail = typeof body?.detail === 'string' ? body.detail.slice(0, 200) : undefined;
  const page = request.headers.get('referer')?.slice(0, 200);
  const kind = body.kind;
  after(() => reportAuthAlert(kind, [detail, page && `page ${page}`].filter(Boolean).join(' | ') || undefined));
  return NextResponse.json({ ok: true });
}
