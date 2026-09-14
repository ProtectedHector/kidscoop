import { NextResponse } from 'next/server';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/lib/languages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_SHEETS_NEWSLETTER_URL = process.env.GOOGLE_SHEETS_NEWSLETTER_URL || '';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeLanguage(value: unknown) {
  const language = String(value || '').trim().toLowerCase();
  return isSupportedLanguage(language) ? language : null;
}

function getLanguageFromReferer(request: Request) {
  const referer = request.headers.get('referer');
  if (!referer) {
    return null;
  }

  try {
    const [, language] = new URL(referer).pathname.split('/');
    return normalizeLanguage(language);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const language =
      normalizeLanguage(body.language) ||
      normalizeLanguage(body.lang) ||
      normalizeLanguage(request.headers.get('x-kidzcoop-language')) ||
      getLanguageFromReferer(request) ||
      DEFAULT_LANGUAGE;
    const signedDate = new Date().toISOString();

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    if (!GOOGLE_SHEETS_NEWSLETTER_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'Newsletter Google Sheets URL is not configured',
        },
        { status: 500 }
      );
    }

    const response = await fetch(GOOGLE_SHEETS_NEWSLETTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        email,
        subscribed: 'TRUE',
        signed_date: signedDate,
        language,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to save newsletter signup (${response.status})`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Error saving newsletter signup:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
