"use client";

import Home from '../../components/Home';
import Image from 'next/image';
import { useTranslation } from '../../hooks/useTranslation';
import SiteChrome from '../../components/SiteChrome';
import NewsletterSignup from '../../components/NewsletterSignup';

export default function Page({ params }: { params: { language: string } }) {
  const { t } = useTranslation();
  const language = params.language;
  const heroTagline = t('hero.tagline');
  const heroTaglineLines = heroTagline
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .filter(Boolean);

  return (
    <SiteChrome language={language}>
      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="KidZcoop Logo"
                  width={400}
                  height={400}
                  className="h-auto max-w-full shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {heroTaglineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0">
            <Home />
          </div>
          <aside className="lg:sticky lg:top-32">
            <NewsletterSignup language={language} variant="compact" />
          </aside>
        </div>
      </section>
    </SiteChrome>
  );
}
