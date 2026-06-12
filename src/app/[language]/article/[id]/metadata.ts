import { Metadata } from 'next';
import { headers } from 'next/headers';
import { AVAILABLE_LANGUAGES } from '../../../../lib/languages';
import { SITE_URL, absoluteUrl } from '../../../../lib/site';

export async function generateMetadata({
  params,
}: {
  params: { language: string; id: string };
}): Promise<Metadata> {
  const { language, id } = params;
  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') || 'https';
  const baseUrl =
    (host ? `${protocol}://${host}` : '') ||
    SITE_URL;
  
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
      const imageUrl = absoluteUrl(article.image_path, baseUrl);
      const imageType = article.image_path.toLowerCase().endsWith('.jpg') || article.image_path.toLowerCase().endsWith('.jpeg')
        ? 'image/jpeg'
        : 'image/png';
      const languageAlternates = Object.fromEntries(
        AVAILABLE_LANGUAGES.map((availableLanguage) => [
          availableLanguage.code,
          `${baseUrl}/${availableLanguage.code}/article/${id}`,
        ])
      );
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/${language}/article/${id}`,
          siteName: 'KidScoop',
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 400,
              alt: article.title,
              type: imageType,
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
          canonical: `${baseUrl}/${language}/article/${id}`,
          languages: languageAlternates,
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
