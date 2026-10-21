"use client";

import { useLanguage } from '@/components/layout/language-context';
import { type TranslationKey, translate } from '@/lib/i18n';

/**
 * `t()` for the current language. Pass `language` when the component already knows it (from route
 * params), so the first render is in the right language instead of waiting for LanguageContext.
 */
export function useTranslation(languageOverride?: string) {
  const { language: contextLanguage } = useLanguage();
  const language = languageOverride || contextLanguage;
  const t = (key: TranslationKey): string => translate(language, key);
  return { t, language };
}
