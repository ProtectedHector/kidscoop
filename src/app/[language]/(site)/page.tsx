import Image from 'next/image';
import InstallAppButton from '@/components/layout/install-app-button';
import { HomeAffiliateRail } from '@/features/affiliates/public';
import { fetchAffiliateAds } from '@/features/affiliates/public.server';
import { buildArticleItemList, HomeStories } from '@/features/articles/public';
import { getArticleSummaries } from '@/features/articles/public.server';
import { NewsletterSignup } from '@/features/newsletter/public';
import { jsonLd } from '@/lib/seo';

export default async function Page(props: { params: Promise<{ language: string }> }) {
  const params = await props.params;
  const language = params.language;
  const spanish = language === 'es';
  const [articles, affiliateAds] = await Promise.all([
    getArticleSummaries(language),
    fetchAffiliateAds().catch(() => []),
  ]);
  const itemList = { '@context': 'https://schema.org', ...buildArticleItemList(language, articles.slice(0, 20)) };
  return <>
    {articles.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(itemList)} />}
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-[#581c87] to-fuchsia-900 px-5 py-14 text-white sm:py-20">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"/><div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl"/>
        <div className="relative mx-auto max-w-5xl text-center"><Image src="/logo.png" alt="KidZcoop" width={160} height={172} priority className="mx-auto mb-5 h-28 w-auto object-contain drop-shadow-2xl sm:h-32" /><p className="text-sm font-black uppercase tracking-[.2em] text-yellow-300">{spanish ? 'Para familias curiosas' : 'For curious families'}</p><h1 className="mx-auto mt-4 max-w-4xl text-balance text-4xl font-black leading-tight tracking-tight sm:text-6xl">{spanish ? 'Historias y descubrimientos para niños curiosos' : 'Stories and discoveries for curious kids'}</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-purple-100">{spanish ? 'Contenido nuevo cada semana para leer, escuchar, imaginar y conversar en familia.' : 'Fresh content every week to read, listen, imagine and talk about together.'}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><a href="#stories" className="inline-flex min-h-12 items-center rounded-full bg-yellow-300 px-6 py-3 font-black text-purple-950 hover:bg-yellow-200">{spanish ? 'Descubrir historias' : 'Discover stories'}</a><InstallAppButton /></div></div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16"><HomeStories articles={articles} /><div id="newsletter" className="mt-16 scroll-mt-24"><NewsletterSignup language={language} /></div><div className="mt-8"><HomeAffiliateRail ads={affiliateAds} language={language} limit={8} /></div></div>
    </main>
  </>;
}
