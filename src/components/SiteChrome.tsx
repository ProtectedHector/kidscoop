"use client";

import Link from 'next/link';
import type { ReactNode } from 'react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';

interface SiteChromeProps {
  children: ReactNode;
  language: string;
}

export default function SiteChrome({ children, language }: SiteChromeProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden scroll-stable">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="fixed left-0 right-0 top-4 z-50 px-4 md:left-auto md:right-8 md:top-8 md:w-auto md:px-0">
        <div className="flex w-full items-start gap-3 md:w-auto md:items-center">
          <LanguageSelector />
          <div className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-md md:flex-none md:px-5">
            <div className="flex items-center justify-around gap-2 text-center text-sm text-white/80 sm:gap-4 md:justify-start">
              <Link href={`/${language}`} className="whitespace-nowrap hover:text-white transition-colors">{t('nav.home')}</Link>
              <Link href={`/${language}/about`} className="whitespace-nowrap hover:text-white transition-colors">{t('nav.about')}</Link>
              <Link href={`/${language}/contact`} className="whitespace-nowrap hover:text-white transition-colors">{t('nav.contact')}</Link>
            </div>
          </div>
        </div>
      </nav>

      {children}

      <footer className="relative z-10 pb-8 text-center">
        <div className="inline-flex bg-white/10 rounded-full px-8 py-4 border border-white/20">
          <p className="text-white/60 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
