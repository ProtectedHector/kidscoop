import { NextResponse } from 'next/server';
import { fetchArticlesWithContent } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('lang') || searchParams.get('language') || 'en';
  const articleId = parseInt(params.id, 10);

  if (Number.isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  try {
    const articles = await fetchArticlesWithContent(language);
    const article = articles.find((item) => item.id === articleId);

    if (article && article.title) {
      if ((!article.lyrics || article.lyrics.trim() === '') && language !== 'en') {
        try {
          const enArticles = await fetchArticlesWithContent('en');
          const enArticle = enArticles.find((item) => item.id === articleId);
          if (enArticle?.lyrics && enArticle.lyrics.trim() !== '') {
            article.lyrics = enArticle.lyrics;
            article.lyrics_language = 'en';
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.warn('Could not fetch English lyrics fallback:', message);
        }
      } else if (article.lyrics && article.lyrics.trim() !== '') {
        article.lyrics_language = language;
      }

      return NextResponse.json(article);
    }

    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching article:', message);
    return NextResponse.json(
      {
        error: 'Failed to fetch article',
        message,
        hint: 'Check that GOOGLE_SHEETS_ARTICLES_URL and GOOGLE_SHEETS_CONTENT_URL are set.',
      },
      { status: 500 }
    );
  }
}
