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
        className="flex min-h-11 min-w-[5.5rem] items-center justify-center space-x-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-2 transition-all duration-300 hover:bg-purple-100 sm:min-w-[6.5rem] sm:px-4"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-xl">{currentLang?.flag || '🌐'}</span>
        <span className="text-sm font-bold text-purple-950">{currentLang?.code.toUpperCase() || 'ES'}</span>
        <svg
          className={`h-4 w-4 text-purple-700 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-2xl" role="listbox">
            <div className="max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-purple-50 ${
                    language === lang.code ? 'bg-purple-50' : ''
                  }`}
                  role="option"
                  aria-selected={language === lang.code}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{lang.name}</div>
                    <div className="text-xs text-slate-500">{lang.code.toUpperCase()}</div>
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
