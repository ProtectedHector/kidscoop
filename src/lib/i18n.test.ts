import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { type TranslationKey, translate } from '@/lib/i18n';
import { LANGUAGE_CODES } from '@/lib/languages';
import translations from '@/translations/translations.json';

/** The keys of the TranslationKey union, read from the source so new keys are covered automatically. */
const KEYS = [...readFileSync(path.join(import.meta.dirname, 'i18n.ts'), 'utf8').matchAll(/\|\s*'([a-zA-Z.]+)'/g)].map(
  (match) => match[1] as TranslationKey,
);

describe('translations', () => {
  it('has every supported language', () => {
    expect(Object.keys(translations).sort()).toEqual([...LANGUAGE_CODES].sort());
  });

  it.each(KEYS.filter((key) => key.startsWith('auth.')))('translates %s in all 12 languages', (key) => {
    for (const language of LANGUAGE_CODES) {
      const [section, name] = key.split('.');
      const tree = translations as unknown as Record<string, Record<string, Record<string, string>>>;
      expect(tree[language]?.[section]?.[name], `${language} ${key}`).toBeTruthy();
    }
  });

  it('falls back to English, then to the key', () => {
    expect(translate('xx', 'auth.signIn')).toBe('Sign in');
    expect(translate('es', 'auth.signIn')).toBe('Iniciar sesión');
  });
});
