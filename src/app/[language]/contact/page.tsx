import SiteChrome from '@/components/SiteChrome';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getStaticPageCopy } from '@/lib/staticPages';

export default function ContactPage({ params }: { params: { language: string } }) {
  const copy = getStaticPageCopy(params.language, 'contact');

  return (
    <SiteChrome language={params.language}>
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-36 md:pt-44">
        <section className="max-w-4xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-yellow-200">KidZcoop</p>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">{copy.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80">{copy.intro}</p>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-md md:p-8">
            <h2 className="text-2xl font-black text-white">{copy.contactTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-white/75">{copy.contactBody}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a className="rounded-2xl bg-white px-5 py-5 text-slate-950 transition hover:bg-yellow-200" href="https://www.instagram.com/kidzcoop/" target="_blank" rel="noreferrer">
                <span className="block text-sm font-bold uppercase tracking-[0.18em] text-purple-700">{copy.instagram}</span>
                <span className="mt-2 block text-lg font-black">@kidzcoop</span>
              </a>
              <a className="rounded-2xl border border-white/25 bg-slate-950/25 px-5 py-5 text-white transition hover:bg-white/10" href="https://www.facebook.com/profile.php?id=61593987484167" target="_blank" rel="noreferrer">
                <span className="block text-sm font-bold uppercase tracking-[0.18em] text-yellow-200">{copy.facebook}</span>
                <span className="mt-2 block text-lg font-black">KidZcoop</span>
              </a>
            </div>
          </section>

          <div className="space-y-5">
            {copy.sections.map((section) => (
              <section key={section.title} className="rounded-3xl border border-white/15 bg-slate-950/35 p-6 backdrop-blur-md">
                <h2 className="text-xl font-black text-white">{section.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-white/75">{section.body}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <NewsletterSignup language={params.language} />
        </div>
      </main>
    </SiteChrome>
  );
}
