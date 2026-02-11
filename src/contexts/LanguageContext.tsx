"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const AVAILABLE_LANGUAGES = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
  { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
  { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>('en');

  // Extract language from URL path
  useEffect(() => {
    const pathParts = pathname.split('/').filter(Boolean);
    const urlLanguage = pathParts[0] as Language;
    
    if (urlLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === urlLanguage)) {
      setLanguageState(urlLanguage);
      localStorage.setItem('language', urlLanguage);
    } else {
      // If no valid language in URL, redirect to default
      const savedLanguage = (localStorage.getItem('language') || 'en') as Language;
      if (pathname === '/' || !AVAILABLE_LANGUAGES.some(lang => lang.code === urlLanguage)) {
        router.replace(`/${savedLanguage}`);
      }
    }
  }, [pathname, router]);

  // Navigate to new URL when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Get current path and replace language segment
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && AVAILABLE_LANGUAGES.some(l => l.code === pathParts[0])) {
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
