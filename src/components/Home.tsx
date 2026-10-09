"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ArticleSnippet from './ArticleSnippet';
import { getArticlePath } from '../lib/articleRoutes';
import { trackEvent } from '../lib/analytics';
import { CATEGORY_DEFINITIONS, CATEGORY_SLUGS, getCategoryLabel, getCategoryPath, type CategorySlug } from '../lib/categories';
interface Article { id: number; title: string; content_text: string; image_path: string; published_date?: string; category?: CategorySlug }

export default function Home() {
  const language = (useParams().language as string) || 'es';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(13);
  const spanish = language === 'es';
  useEffect(() => {
    setLoading(true);
    fetch(`/api/articles?lang=${language}`).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => { setArticles(Array.isArray(data) ? data : []); setVisibleCount(13); setError(false); }).catch(() => { setArticles([]); setError(true); }).finally(() => setLoading(false));
    trackEvent('page_view', { page: 'home', language });
  }, [language]);
  if (loading) return <div className="grid min-h-64 place-items-center" role="status"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700"/><span className="sr-only">Cargando historias</span></div>;
  if (error || !articles.length) return <div className="rounded-3xl border border-purple-100 bg-white p-10 text-center shadow-sm"><p className="text-5xl">✨</p><h2 className="mt-4 text-2xl font-black">{error ? 'No hemos podido cargar las historias' : 'Muy pronto habrá nuevas historias'}</h2><p className="mt-2 text-slate-600">{error ? 'Inténtalo de nuevo en unos minutos.' : 'Vuelve pronto para descubrirlas.'}</p></div>;
  const featured = articles[0];
  return <div className="space-y-14">
    <section aria-labelledby="this-week-title"><p className="text-sm font-black uppercase tracking-[.18em] text-purple-700">{spanish ? 'Esta semana en KidZcoop' : 'This week at KidZcoop'}</p><h2 id="this-week-title" className="mb-5 mt-1 text-3xl font-black tracking-tight sm:text-4xl">{spanish ? 'Una historia para descubrir juntos' : 'A story to discover together'}</h2><Link href={getArticlePath(language, featured.id, featured.title)} className="group grid overflow-hidden rounded-[2rem] bg-[#581c87] shadow-xl shadow-purple-950/15 md:grid-cols-[1.1fr_.9fr]"><div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[25rem]"><Image src={featured.image_path} alt={featured.title} fill priority sizes="(min-width:768px) 55vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" /></div><div className="flex flex-col justify-center p-6 text-white sm:p-9"><span className="w-fit rounded-full bg-white/15 px-3 py-1 text-sm font-bold">{spanish ? 'Historia destacada' : 'Featured story'}</span><h3 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">{featured.title}</h3><p className="mt-4 line-clamp-3 text-base leading-relaxed text-purple-100">{featured.content_text}</p><span className="mt-6 font-black text-yellow-300">{spanish ? 'Leer en familia →' : 'Read together →'}</span></div></Link></section>
    <section aria-labelledby="categories-title"><h2 id="categories-title" className="text-2xl font-black">{spanish ? 'Explora por curiosidad' : 'Explore by curiosity'}</h2><div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8">{CATEGORY_SLUGS.map((slug) => <Link key={slug} href={getCategoryPath(language, slug)} onClick={() => trackEvent('category_view', { category: slug, language })} className="flex min-w-[8.5rem] snap-start flex-col items-center rounded-2xl border border-purple-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"><span className="text-3xl">{CATEGORY_DEFINITIONS[slug].icon}</span><span className="mt-2 text-sm font-black">{getCategoryLabel(slug, language)}</span></Link>)}</div></section>
    <section id="stories" className="scroll-mt-24" aria-labelledby="more-stories-title"><p className="text-sm font-black uppercase tracking-[.18em] text-purple-700">{spanish ? 'Descubre más' : 'Discover more'}</p><h2 id="more-stories-title" className="mt-1 text-3xl font-black tracking-tight">{spanish ? 'También te puede gustar' : 'You may also like'}</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{articles.slice(1, visibleCount).map((article) => <ArticleSnippet key={article.id} article={article} />)}</div>{visibleCount < articles.length && <div className="mt-8 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + 12)} className="min-h-12 rounded-full border-2 border-purple-200 bg-white px-7 py-3 font-black text-purple-900 hover:bg-purple-50">{spanish ? 'Ver más historias' : 'Show more stories'}</button></div>}</section>
  </div>;
}
