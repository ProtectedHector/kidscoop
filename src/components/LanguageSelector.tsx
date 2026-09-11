"use client";

import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

export default function LanguageSelector() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = availableLanguages.find(lang => lang.code === language);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-w-[6.5rem] items-center justify-center space-x-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md transition-all duration-300 hover:bg-white/20"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-xl">{currentLang?.flag || '🌐'}</span>
        <span className="text-white/80 text-sm font-medium">{currentLang?.code.toUpperCase() || 'EN'}</span>
        <svg
          className={`w-4 h-4 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 shadow-2xl backdrop-blur-md md:left-auto md:right-0" role="listbox">
            <div className="max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors duration-200 flex items-center space-x-3 ${
                    language === lang.code ? 'bg-white/15' : ''
                  }`}
                  role="option"
                  aria-selected={language === lang.code}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{lang.name}</div>
                    <div className="text-white/60 text-xs">{lang.code.toUpperCase()}</div>
                  </div>
                  {language === lang.code && (
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
