"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE,
  Language,
  isSupportedLanguage,
} from '../lib/languages';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: typeof AVAILABLE_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function persistLanguage(lang: Language) {
  localStorage.setItem('language', lang);
  document.cookie = `language=${lang}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  // Extract language from URL path
  useEffect(() => {
    const pathParts = pathname.split('/').filter(Boolean);
    const urlLanguage = pathParts[0];
    
    if (isSupportedLanguage(urlLanguage)) {
      setLanguageState(urlLanguage);
      persistLanguage(urlLanguage);
    } else {
      // If no valid language in URL, redirect to default
      const savedLanguage = localStorage.getItem('language');
      const languageToUse = isSupportedLanguage(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
      if (pathname === '/' || !isSupportedLanguage(urlLanguage)) {
        router.replace(`/${languageToUse}`);
      }
    }
  }, [pathname, router]);

  // Navigate to new URL when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    persistLanguage(lang);
    
    // Get current path and replace language segment
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && isSupportedLanguage(pathParts[0])) {
      // Replace language in URL
      pathParts[0] = lang;
      router.push(`/${pathParts.join('/')}`);
    } else {
      // If no language in path, just go to home with new language
      router.push(`/${lang}`);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        availableLanguages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
