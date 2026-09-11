import { permanentRedirect } from 'next/navigation';
import { getArticlePath } from '../../../../lib/articleRoutes';
import { fetchArticleForLanguage, getRequestBaseUrl } from '../../../../lib/articleSeo';

export default async function ArticleRedirectPage({
  params,
}: {
  params: { language: string; id: string };
}) {
  const article = await fetchArticleForLanguage(
    params.id,
    params.language,
    getRequestBaseUrl(),
  );

  permanentRedirect(
    getArticlePath(params.language, params.id, article?.title || 'article'),
  );
}
