import { notFound, permanentRedirect } from 'next/navigation';
import { getArticle } from '@/features/articles/public.server';
import { getArticlePath } from '@/lib/article-routes';

export default async function ArticleRedirectPage(props: { params: Promise<{ language: string; id: string }> }) {
  const params = await props.params;
  const article = await getArticle(params.id, params.language);

  if (!article) {
    notFound();
  }

  permanentRedirect(getArticlePath(params.language, params.id, article.title));
}
