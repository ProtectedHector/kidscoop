import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkEnabled } from '@/lib/env.client';
import { isProductionDeployment } from '@/lib/env.server';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/lib/languages';
import { LANGUAGE_HEADER, SITE_URL } from '@/lib/site';

const LANGUAGE_COOKIE = 'language';
const CANONICAL_HOST = new URL(SITE_URL).host;

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

function languageRedirect(request: NextRequest) {
  const preferredLanguage = request.cookies.get(LANGUAGE_COOKIE)?.value;
  const language = isSupportedLanguage(preferredLanguage)
    ? preferredLanguage
    : getBrowserLanguage(request.headers.get('accept-language'));

  return NextResponse.redirect(new URL(`/${language}`, request.url));
}

/**
 * In production, send *.vercel.app hosts to the real domain with a 301 so Google
 * only indexes one copy. apex/www is left to Vercel's domain settings, and we
 * never redirect when the canonical host is itself a vercel.app host.
 */
function canonicalHostRedirect(request: NextRequest) {
  if (!isProductionDeployment() || CANONICAL_HOST.endsWith('.vercel.app')) {
    return null;
  }

  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();
  if (!host.endsWith('.vercel.app')) {
    return null;
  }

  const url = new URL(request.nextUrl.pathname + request.nextUrl.search, SITE_URL);
  return NextResponse.redirect(url, 301);
}

function handle(request: NextRequest) {
  const hostRedirect = canonicalHostRedirect(request);
  if (hostRedirect) {
    return hostRedirect;
  }

  if (request.nextUrl.pathname === '/') {
    return languageRedirect(request);
  }

  // Expose the URL language to the root layout so <html lang> is correct on the server.
  const firstSegment = request.nextUrl.pathname.split('/')[1];
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LANGUAGE_HEADER, isSupportedLanguage(firstSegment) ? firstSegment : DEFAULT_LANGUAGE);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

const proxy = clerkEnabled
  ? clerkMiddleware((_auth, request: NextRequest) => handle(request))
  : function proxyWithoutAuth(request: NextRequest) {
      return handle(request);
    };

export default proxy;

export const config = {
  matcher: ['/', '/((?!_next|.*\\..*).*)'],
};
