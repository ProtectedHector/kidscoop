import { NextResponse } from 'next/server';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/lib/languages';
import { getSession } from '@/lib/session';
import { isSubscribed, subscribeToNewsletter } from '@/features/newsletter/public.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false, subscribed: false });
  }

  const subscribed = session.email ? await isSubscribed(session.email) : false;

  return NextResponse.json({
    authenticated: true,
    emailAvailable: Boolean(session.email && session.emailVerified),
    subscribed,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const session = await getSession();
    const accountEmail = session?.emailVerified ? session.email : undefined;
    const email = String(accountEmail || body.email || '').trim().toLowerCase();
    const language =
      normalizeLanguage(body.language) ||
      normalizeLanguage(body.lang) ||
      normalizeLanguage(request.headers.get('x-kidzcoop-language')) ||
      getLanguageFromReferer(request) ||
      DEFAULT_LANGUAGE;

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    await subscribeToNewsletter(email, language);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Error saving newsletter signup:', message);
    return NextResponse.json({ success: false, error: 'Could not save subscription' }, { status: 500 });
  }
}
