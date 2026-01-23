"use client";

import Home from '../../components/Home';
import Image from 'next/image';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';

export default function Page({ params }: { params: { language: string } }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>


      {/* Floating Navigation */}
      <nav className="fixed top-8 right-8 z-50 flex items-center space-x-4">
        <LanguageSelector />
        <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          <div className="flex space-x-4 text-white/80 text-sm">
            <a href="#" className="hover:text-white transition-colors">{t('nav.home')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('nav.about')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('nav.contact')}</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="KidScoop Logo"
                  width={400}
                  height={400}
                  className="shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('hero.tagline')}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <Home />
        </div>
      </section>

      {/* Floating Footer */}
      <footer className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-8 py-4 border border-white/20">
          <p className="text-white/60 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>

    </div>
  );
}
