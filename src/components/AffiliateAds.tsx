"use client";

import { useEffect, useMemo, useState } from 'react';

export interface AffiliateAd {
  article_id: number;
  product_name: string;
  asin: string;
  affiliate_url: string;
  position: number;
  active: boolean;
  image_url: string;
}

const copyByLanguage: Record<string, { title: string; eyebrow: string }> = {
  es: { title: 'Ideas relacionadas', eyebrow: 'Enlaces afiliados' },
  en: { title: 'Related picks', eyebrow: 'Affiliate links' },
  fr: { title: 'Idees liees', eyebrow: 'Liens affilies' },
  de: { title: 'Passende Ideen', eyebrow: 'Affiliate-Links' },
  it: { title: 'Idee correlate', eyebrow: 'Link affiliati' },
  pt: { title: 'Ideias relacionadas', eyebrow: 'Links afiliados' },
};

function getSessionSeed() {
  if (typeof window === 'undefined') {
    return 1;
  }

  const key = 'kidzcoop-affiliate-seed';
  const existing = window.sessionStorage.getItem(key);
  if (existing) {
    const parsed = Number(existing);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const seed = Math.floor(Math.random() * 2147483647) || 1;
  window.sessionStorage.setItem(key, String(seed));
  return seed;
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function shuffleForSession<T>(items: T[], seed: number) {
  const random = seededRandom(seed);
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function AffiliateCard({
  ad,
  compact = false,
  tone = 'dark',
}: {
  ad: AffiliateAd;
  compact?: boolean;
  tone?: 'dark' | 'light';
}) {
  const cardClass = tone === 'dark'
    ? 'group block rounded-2xl border border-white/15 bg-white/10 p-3 shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-200/50 hover:bg-white/15'
    : 'group block rounded-2xl border border-purple-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg';
  const titleClass = tone === 'dark'
    ? 'max-h-14 overflow-hidden text-sm font-black leading-snug text-white'
    : 'max-h-14 overflow-hidden text-sm font-black leading-snug text-slate-900';
  const asinClass = tone === 'dark'
    ? 'mt-1 text-xs font-semibold uppercase tracking-wide text-white/45'
    : 'mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400';

  return (
    <a
      href={ad.affiliate_url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={cardClass}
    >
      <div className={compact ? 'flex gap-3' : 'flex h-full flex-col gap-3'}>
        <div
          className={
            compact
              ? 'h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/95'
              : 'aspect-square overflow-hidden rounded-xl bg-white/95'
          }
        >
          <img
            src={ad.image_url}
            alt={ad.product_name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0">
          <h3 className={titleClass}>
            {ad.product_name}
          </h3>
          {ad.asin && (
            <p className={asinClass}>
              {ad.asin}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

export function AffiliateSection({
  ads,
  language,
  compact = false,
  tone = 'dark',
  layout = 'grid',
}: {
  ads: AffiliateAd[];
  language: string;
  compact?: boolean;
  tone?: 'dark' | 'light';
  layout?: 'grid' | 'carousel';
}) {
  const copy = copyByLanguage[language] || copyByLanguage.en;

  if (ads.length === 0) {
    return null;
  }

  return (
    <section className={tone === 'dark' ? 'rounded-3xl border border-white/20 bg-gradient-to-br from-purple-950 to-[#581c87] p-5 shadow-2xl shadow-purple-950/20 md:p-6' : 'rounded-3xl border border-purple-100 bg-purple-50/60 p-5 shadow-sm md:p-6'}>
      <p className={tone === 'dark' ? 'mb-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-200' : 'mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#581c87]'}>
        {copy.eyebrow}
      </p>
      <h2 className={tone === 'dark' ? 'text-xl font-black text-white' : 'text-xl font-black text-slate-950'}>{copy.title}</h2>
      <div className={
        layout === 'carousel'
          ? 'mt-5 flex snap-x gap-4 overflow-x-auto pb-3'
          : compact
            ? 'mt-4 space-y-3'
            : 'mt-5 grid gap-4 sm:grid-cols-3'
      }>
        {ads.map((ad) => (
          <div key={`${ad.article_id}-${ad.asin}-${ad.position}`} className={layout === 'carousel' ? 'min-w-[16rem] snap-start' : undefined}>
            <AffiliateCard
              ad={ad}
              compact={compact}
              tone={tone}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomeAffiliateRail({ language, limit = 10 }: { language: string; limit?: number }) {
  const [ads, setAds] = useState<AffiliateAd[]>([]);
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    setSeed(getSessionSeed());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAds() {
      try {
        const response = await fetch('/api/affiliates');
        if (!response.ok) {
          throw new Error('Failed to fetch affiliate ads');
        }
        const data = await response.json();
        if (!cancelled) {
          setAds(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setAds([]);
        }
      }
    }

    fetchAds();
    return () => {
      cancelled = true;
    };
  }, []);

  const sessionAds = useMemo(
    () => shuffleForSession(ads, seed).slice(0, limit),
    [ads, limit, seed]
  );

  return <AffiliateSection ads={sessionAds} language={language} compact tone="light" layout="carousel" />;
}
