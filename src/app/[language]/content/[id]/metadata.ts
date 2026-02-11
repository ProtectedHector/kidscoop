import { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata({
  params,
}: {
  params: { language: string; id: string };
}): Promise<Metadata> {
  const { language, id } = params;
  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') || 'http';
  const baseUrl =
    (host ? `${protocol}://${host}` : '') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';
  
  try {
    const res = await fetch(
      `${baseUrl}/api/articles/${id}?lang=${language}`,
      { 
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'KidScoop-SEO-Bot/1.0'
        }
      }
    );
    
    if (res.ok) {
      const article = await res.json();
      const title = `${article.title} | KidScoop`;
      const description = article.content_text.substring(0, 160).replace(/\n/g, ' ');
      const imageUrl = `${baseUrl}${article.image_path}`;
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 400,
              alt: article.title,
            },
          ],
          locale: language,
          type: 'article',
          publishedTime: article.published_date,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [imageUrl],
        },
        alternates: {
          canonical: `${baseUrl}/${language}/content/${id}`,
          languages: {
            'en': `${baseUrl}/en/content/${id}`,
            'es': `${baseUrl}/es/content/${id}`,
            'fr': `${baseUrl}/fr/content/${id}`,
            'de': `${baseUrl}/de/content/${id}`,
            'it': `${baseUrl}/it/content/${id}`,
            'pt': `${baseUrl}/pt/content/${id}`,
          },
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Article | KidScoop',
    description: 'Amazing stories for kids',
  };
}
