import type { Metadata } from 'next';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from './languages';
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE, absoluteUrl } from './site';

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  pt: 'pt_PT',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  ar: 'ar_AR',
  hi: 'hi_IN',
  ru: 'ru_RU',
};

export function getOgLocale(language: string) {
  return OG_LOCALES[language] || 'en_US';
}

/**
 * Builds canonical + hreflang alternates (including x-default) for a page that
 * exists under every language prefix. `pathFor` returns the path for a given
 * language, or null when that language version doesn't exist.
 */
export function buildAlternates(
  language: string,
  pathFor: (language: string) => string | null,
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {};

  for (const { code } of AVAILABLE_LANGUAGES) {
    const path = pathFor(code);
    if (path) {
      languages[code] = absoluteUrl(path);
    }
  }

  const defaultPath = pathFor(DEFAULT_LANGUAGE);
  if (defaultPath) {
    languages['x-default'] = absoluteUrl(defaultPath);
  }

  const canonicalPath = pathFor(language);

  return {
    canonical: canonicalPath ? absoluteUrl(canonicalPath) : undefined,
    languages,
  };
}

export function cleanDescription(text: string, maxLength = 158) {
  const plain = text.replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) {
    return plain;
  }

  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : maxLength).replace(/[\s,;:.-]+$/, '')}…`;
}

export function buildPageMetadata({
  language,
  title,
  description,
  path,
  alternates,
  image,
  type = 'website',
}: {
  language: string;
  title: string;
  description: string;
  path: string;
  alternates?: Metadata['alternates'];
  image?: { url: string; alt: string; width?: number; height?: number };
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image
    ? { url: absoluteUrl(image.url), alt: image.alt, width: image.width, height: image.height }
    : {
        url: absoluteUrl(SOCIAL_IMAGE.path),
        width: SOCIAL_IMAGE.width,
        height: SOCIAL_IMAGE.height,
        alt: SOCIAL_IMAGE.alt,
        type: SOCIAL_IMAGE.type,
      };

  return {
    title,
    description,
    alternates: alternates || { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: getOgLocale(language),
      type,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export function jsonLd(data: unknown) {
  // Escape "<" so article text can never close the script tag.
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}

export { SITE_URL };
