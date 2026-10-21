import Link from 'next/link';
import type { Metadata } from 'next';
import SiteChrome from '@/components/SiteChrome';
import { getPrivacyPolicyCopy } from '@/lib/privacyPolicy';
import { buildAlternates, buildPageMetadata, cleanDescription } from '@/lib/seo';

const TRANSLATED = ['es', 'en'];

export async function generateMetadata(props: { params: Promise<{ language: string }> }): Promise<Metadata> {
  const params = await props.params;
  const copy = getPrivacyPolicyCopy(params.language);
  return buildPageMetadata({
    language: params.language,
    title: copy.title,
    description: cleanDescription(copy.intro),
    path: `/${params.language}/privacy`,
    // Only es/en have their own copy; other languages show English, so point them at /en.
    alternates: buildAlternates(
      TRANSLATED.includes(params.language) ? params.language : 'en',
      (code) => (TRANSLATED.includes(code) ? `/${code}/privacy` : null),
    ),
  });
}

export default async function PrivacyPage(props: { params: Promise<{ language: string }> }) {
  const params = await props.params;
  const copy = getPrivacyPolicyCopy(params.language);
  const contactLabel = params.language === 'es' ? 'Ir a contacto' : 'Go to contact';

  return (
    <SiteChrome language={params.language}>
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12 md:py-16">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-purple-700">KidZcoop</p>
        <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{copy.updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-slate-700">{copy.intro}</p>

        <div className="mt-8 space-y-5">
          {copy.sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-base leading-relaxed text-slate-600">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <Link href={`/${params.language}/contact`} className="mt-8 inline-block rounded-full bg-[#581c87] px-5 py-3 text-sm font-black text-white transition hover:bg-purple-800">
          {contactLabel}
        </Link>
      </main>
    </SiteChrome>
  );
}
