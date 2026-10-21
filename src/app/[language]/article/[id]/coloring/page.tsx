import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleColoringStudio } from '@/features/articles/public';
import { getArticle } from '@/features/articles/public.server';
import { getArticlePath } from '@/lib/article-routes';
import { translate } from '@/lib/i18n';

type Params = { language: string; id: string };

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const { language, id } = await props.params;
  const article = await getArticle(id, language);

  // A tool page, not content: keep it out of search results.
  return {
    title: article ? `${translate(language, 'content.coloringFun')} · ${article.title}` : 'KidZcoop',
    robots: { index: false, follow: true },
  };
}

/** Full-screen, no-scroll colouring for tablets. Linked from the colouring card on the story page. */
export default async function ColoringFullscreenPage(props: { params: Promise<Params> }) {
  const { language, id } = await props.params;
  const article = await getArticle(id, language);

  if (!article) {
    notFound();
  }

  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <ArticleColoringStudio
      variant="fullscreen"
      imageId={article.id}
      imageAlt={article.title}
      backHref={getArticlePath(language, article.id, article.title)}
      labels={{
        title: t('content.coloringFun'),
        description: t('content.coloringStudioDescription'),
        hint: t('content.coloringStudioHint'),
        undo: t('content.coloringUndo'),
        redo: t('content.coloringRedo'),
        reset: t('content.coloringReset'),
        downloadArtwork: t('content.coloringDownloadArtwork'),
        downloadPage: t('content.coloringDownloadPage'),
        loading: t('content.coloringLoading'),
        backToStory: t('content.coloringBackToStory'),
      }}
    />
  );
}
