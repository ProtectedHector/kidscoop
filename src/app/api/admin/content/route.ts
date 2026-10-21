import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CONTENT_CACHE_TAG } from '@/lib/server/convex';
import { getAdminContent, requireAdminIdentity, upsertAffiliate } from '@/features/admin/public.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const admin = await requireAdminIdentity();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const data = await getAdminContent();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    if (body.action === 'upsertAffiliate') {
      const result = await upsertAffiliate({
        externalArticleId: Number(body.affiliate?.externalArticleId || 0),
        productName: String(body.affiliate?.productName || '').trim(),
        asin: String(body.affiliate?.asin || '').trim(),
        affiliateUrl: String(body.affiliate?.affiliateUrl || '').trim(),
        position: Number(body.affiliate?.position || 0),
        active: Boolean(body.affiliate?.active),
        imageUrl: String(body.affiliate?.imageUrl || '').trim(),
      });
      revalidateTag(CONTENT_CACHE_TAG, { expire: 0 });
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ error: 'Unsupported admin action' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
