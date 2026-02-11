import { NextResponse } from 'next/server';
import { fetchArticlesWithContent } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('lang') || searchParams.get('language') || 'en';

  try {
    const articles = await fetchArticlesWithContent(language);
    articles.sort((a, b) => {
      const dateA = new Date(a.published_date).getTime();
      const dateB = new Date(b.published_date).getTime();
      return dateB - dateA;
    });
    return NextResponse.json(articles);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching articles:', message);
    return NextResponse.json(
      {
        error: 'Failed to fetch articles',
        message,
        hint: 'Check that GOOGLE_SHEETS_ARTICLES_URL and GOOGLE_SHEETS_CONTENT_URL are set.',
      },
      { status: 500 }
    );
  }
}
