"use client";

import { useLanguage } from '../contexts/LanguageContext';
import translations from '../translations/translations.json';

type TranslationKey = 
  | 'nav.home'
  | 'nav.about'
  | 'nav.contact'
  | 'hero.tagline'
  | 'loading.stories'
  | 'loading.story'
  | 'empty.title'
  | 'empty.message'
  | 'footer.copyright'
  | 'content.backToStories'
  | 'content.readMoreStories'
  | 'content.storyNotFound'
  | 'content.storyNotFoundMessage'
  | 'content.readStory'
  | 'content.storySong'
  | 'content.storySongDescription'
  | 'content.coloringFun'
  | 'content.coloringDescription'
  | 'content.clickToDownload'
  | 'content.audioNotSupported'
  | 'content.lyrics'
  | 'content.lyricsInLanguage'
  | 'metadata.title'
  | 'metadata.description';

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    const translation = (translations as any)[language];
    
    if (!translation) {
      console.warn(`Translation not found for language: ${language}`);
      // Fallback to English
      const enValue = (translations as any).en;
      let fallback: any = enValue;
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      return fallback || key;
    }
    
    let value: any = translation;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English
        const enValue = (translations as any).en;
        let fallback: any = enValue;
        for (const fallbackKey of keys) {
          fallback = fallback?.[fallbackKey];
        }
        return fallback || key;
      }
    }
    
    return value || key;
  };
  
  return { t, language };
}
