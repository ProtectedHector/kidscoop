import { NextResponse } from 'next/server';
import { api, getAdminConvexClient, requireAdminIdentity } from '@/lib/admin';

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
    const { client, token } = getAdminConvexClient();
    const data = await client.query(api.articles.adminList, { token });
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
    const { client, token } = getAdminConvexClient();

    if (body.action === 'upsertAffiliate') {
      const result = await client.mutation(api.articles.adminUpsertAffiliate, {
        token,
        affiliate: {
          externalArticleId: Number(body.affiliate?.externalArticleId || 0),
          productName: String(body.affiliate?.productName || '').trim(),
          asin: String(body.affiliate?.asin || '').trim(),
          affiliateUrl: String(body.affiliate?.affiliateUrl || '').trim(),
          position: Number(body.affiliate?.position || 0),
          active: Boolean(body.affiliate?.active),
          imageUrl: String(body.affiliate?.imageUrl || '').trim(),
        },
      });
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ error: 'Unsupported admin action' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
