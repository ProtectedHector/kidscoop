import { NextResponse } from 'next/server';
import { fetchArticles } from '@/features/articles/public.server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('lang') || searchParams.get('language') || 'en';
  const category = searchParams.get('category') || undefined;

  try {
    const articles = await fetchArticles(language, category);
    return NextResponse.json(articles);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching articles:', message);
    return NextResponse.json(
      {
        error: 'Failed to fetch articles',
        message,
        hint: 'Check NEXT_PUBLIC_CONVEX_URL and the Convex deployment.',
      },
      { status: 500 }
    );
  }
}
