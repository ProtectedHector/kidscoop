import { NextResponse } from 'next/server';
import { fetchContentAffiliateAds } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawArticleId = searchParams.get('articleId') || searchParams.get('article_id');
  const articleId = rawArticleId ? parseInt(rawArticleId, 10) : undefined;

  if (rawArticleId && Number.isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  try {
    const affiliates = await fetchContentAffiliateAds(articleId);
    return NextResponse.json(affiliates);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching affiliate ads:', message);
    return NextResponse.json(
      {
        error: 'Failed to fetch affiliate ads',
        message,
        hint: 'Check Convex configuration or GOOGLE_SHEETS_AFFILIATES_URL fallback.',
      },
      { status: 500 }
    );
  }
}
