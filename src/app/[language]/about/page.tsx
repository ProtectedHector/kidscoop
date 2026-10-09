import SiteChrome from '@/components/SiteChrome';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getStaticPageCopy } from '@/lib/staticPages';

export default function AboutPage({ params }: { params: { language: string } }) {
  const copy = getStaticPageCopy(params.language, 'about');

  return (
    <SiteChrome language={params.language}>
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="rounded-3xl bg-gradient-to-br from-purple-950 to-[#581c87] p-7 text-white shadow-2xl md:p-10">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-yellow-300">KidZcoop</p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">{copy.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-purple-100">{copy.intro}</p>
          </section>

          <div className="space-y-5">
            {copy.sections.map((section) => (
              <section key={section.title} className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="rounded-3xl border border-purple-100 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">{copy.contactTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{copy.contactBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="rounded-full bg-[#581c87] px-5 py-3 text-sm font-black text-white transition hover:bg-purple-800" href="https://www.instagram.com/kidzcoop/" target="_blank" rel="noreferrer">
                {copy.instagram}
              </a>
              <a className="rounded-full border border-purple-200 px-5 py-3 text-sm font-black text-purple-900 transition hover:bg-purple-50" href="https://www.facebook.com/profile.php?id=61593987484167" target="_blank" rel="noreferrer">
                {copy.facebook}
              </a>
            </div>
          </div>
          <NewsletterSignup language={params.language} />
        </section>
      </main>
    </SiteChrome>
  );
}
