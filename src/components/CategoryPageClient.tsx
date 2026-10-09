"use client";
import { useEffect, useState } from 'react';
import ArticleSnippet from './ArticleSnippet';
import { CATEGORY_DEFINITIONS, getCategoryLabel, type CategorySlug } from '../lib/categories';
import { trackEvent } from '../lib/analytics';

interface Article { id: number; title: string; content_text: string; image_path: string; published_date?: string; category?: string }

export default function CategoryPageClient({ language, category }: { language: string; category: CategorySlug }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const spanish = language === 'es';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/articles?lang=${language}&category=${category}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setError(false);
      })
      .catch(() => {
        setArticles([]);
        setError(true);
      })
      .finally(() => setLoading(false));
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

      {loading && <div className="grid min-h-64 place-items-center" role="status"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700"/><span className="sr-only">Cargando historias</span></div>}

      {!loading && (error || !articles.length) && <div className="mt-8 rounded-3xl border border-purple-100 bg-white p-10 text-center shadow-sm"><h2 className="text-2xl font-black">{error ? 'No hemos podido cargar esta categoría' : 'Aún no hay historias en esta categoría'}</h2><p className="mt-2 text-slate-600">{error ? 'Inténtalo de nuevo en unos minutos.' : 'Vuelve pronto para descubrirlas.'}</p></div>}

      {!loading && articles.length > 0 && <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label={getCategoryLabel(category, language)}>
        {articles.map((article) => <ArticleSnippet key={`${article.id}-${article.category}`} article={article} />)}
      </section>}
    </div>
  </main>;
}
