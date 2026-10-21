"use client";
import { useEffect } from 'react';
import ArticleSnippet from '@/features/articles/components/article-snippet';
import type { ArticleSummary } from '@/features/articles/model/types';
import { CATEGORY_DEFINITIONS, getCategoryLabel, type CategorySlug } from '@/lib/categories';
import { trackEvent } from '@/lib/analytics';

/** A category page. `articles` are rendered on the server. */
export default function CategoryPageClient({ language, category, articles }: { language: string; category: CategorySlug; articles: ArticleSummary[] }) {
  const spanish = language === 'es';

  useEffect(() => {
    trackEvent('category_view', { category, language });
  }, [category, language]);

  return <main className="min-h-screen bg-[#fbf9ff] px-4 py-10 text-slate-950 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-[#581c87] px-6 py-10 text-white shadow-xl shadow-purple-950/15 sm:px-10">
        <p className="text-5xl" aria-hidden="true">{CATEGORY_DEFINITIONS[category].icon}</p>
        <p className="mt-5 text-sm font-black uppercase tracking-[.2em] text-yellow-300">{spanish ? 'Categoría' : 'Category'}</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">{getCategoryLabel(category, language)}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-purple-100">{spanish ? 'Historias agrupadas para descubrir, leer y conversar en familia.' : 'Grouped stories to discover, read and talk about together.'}</p>
      </div>


      {!articles.length && <div className="mt-8 rounded-3xl border border-purple-100 bg-white p-10 text-center shadow-sm"><h2 className="text-2xl font-black">Aún no hay historias en esta categoría</h2><p className="mt-2 text-slate-600">Vuelve pronto para descubrirlas.</p></div>}

      {articles.length > 0 && <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label={getCategoryLabel(category, language)}>
        {articles.map((article) => <ArticleSnippet key={`${article.id}-${article.category}`} article={article} />)}
      </section>}
    </div>
  </main>;
}
