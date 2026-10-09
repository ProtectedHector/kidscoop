"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getArticlePath } from '../lib/articleRoutes';
import { getCategoryLabel } from '../lib/categories';
interface Article { id: number; title: string; content_text: string; image_path: string; published_date?: string; category?: string }
export default function ArticleSnippet({ article }: { article: Article }) {
  const language = (useParams().language as string) || 'es';
  const date = article.published_date ? new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(article.published_date)) : '';
  return <Link href={getArticlePath(language, article.id, article.title)} className="group overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"><div className="relative aspect-[4/3] overflow-hidden bg-purple-50"><Image src={article.image_path} alt={article.title} fill sizes="(min-width:1280px) 28vw, (min-width:640px) 45vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" /></div><div className="p-5"><div className="flex items-center justify-between gap-2 text-xs font-bold text-purple-700"><span>{getCategoryLabel(article.category, language)}</span><time>{date}</time></div><h3 className="mt-3 line-clamp-2 text-xl font-black leading-tight group-hover:text-purple-800">{article.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{article.content_text}</p><p className="mt-4 text-sm font-black text-purple-800">{language === 'es' ? 'Leer historia →' : 'Read story →'}</p></div></Link>;
}
