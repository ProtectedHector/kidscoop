import translations from './translations.json';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'ru';

export function getMetadataTranslations(language: Language = 'en') {
  const translation = (translations as any)[language] || (translations as any).en;
  
  return {
    title: translation.metadata.title,
    description: translation.metadata.description,
  };
}
