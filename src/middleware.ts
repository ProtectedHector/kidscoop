import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from './lib/languages';

const LANGUAGE_COOKIE = 'language';

function getBrowserLanguage(acceptLanguage: string | null) {
  if (!acceptLanguage) {
    return DEFAULT_LANGUAGE;
  }

  const languages = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, qualityValue] = part.trim().split(';q=');
      return {
        code: tag.toLowerCase().split('-')[0],
        quality: qualityValue ? Number(qualityValue) : 1,
      };
    })
    .filter(({ code, quality }) => code && Number.isFinite(quality))
    .sort((a, b) => b.quality - a.quality);

  return languages.find(({ code }) => isSupportedLanguage(code))?.code || DEFAULT_LANGUAGE;
}

export function middleware(request: NextRequest) {
  const preferredLanguage = request.cookies.get(LANGUAGE_COOKIE)?.value;
  const language = isSupportedLanguage(preferredLanguage)
    ? preferredLanguage
    : getBrowserLanguage(request.headers.get('accept-language'));

  return NextResponse.redirect(new URL(`/${language}`, request.url));
}

export const config = {
  matcher: '/',
};
