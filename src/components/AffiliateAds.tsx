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

export function AffiliateCard({ ad, compact = false }: { ad: AffiliateAd; compact?: boolean }) {
  return (
    <a
      href={ad.affiliate_url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="group block rounded-2xl border border-white/15 bg-white/10 p-3 shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-200/50 hover:bg-white/15"
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
          <h3 className="max-h-14 overflow-hidden text-sm font-black leading-snug text-white">
            {ad.product_name}
          </h3>
          {ad.asin && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/45">
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
}: {
  ads: AffiliateAd[];
  language: string;
  compact?: boolean;
}) {
  const copy = copyByLanguage[language] || copyByLanguage.en;

  if (ads.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md md:p-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-200">
        {copy.eyebrow}
      </p>
      <h2 className="text-xl font-black text-white">{copy.title}</h2>
      <div className={compact ? 'mt-4 space-y-3' : 'mt-5 grid gap-4 sm:grid-cols-3'}>
        {ads.map((ad) => (
          <AffiliateCard
            key={`${ad.article_id}-${ad.asin}-${ad.position}`}
            ad={ad}
            compact={compact}
          />
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

  return <AffiliateSection ads={sessionAds} language={language} compact />;
}
