import { NextResponse } from 'next/server';
import { fetchArticle, withLyricsFallback } from '@/features/articles/public.server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('lang') || searchParams.get('language') || 'en';
  const articleId = Number.parseInt(params.id, 10);

  if (Number.isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  try {
    const article = await fetchArticle(language, articleId);
    if (!article?.title) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(await withLyricsFallback(article, language));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching article:', message);
    return NextResponse.json(
      {
        error: 'Failed to fetch article',
        message,
        hint: 'Check NEXT_PUBLIC_CONVEX_URL and the Convex deployment.',
      },
      { status: 500 },
    );
  }
}
