import { NextResponse } from 'next/server';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/lib/languages';
import { getAuthenticatedIdentity } from '@/lib/server/clerk-user';
import { markNewsletterSubscribed, upsertAccount } from '@/lib/server/account-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_SHEETS_NEWSLETTER_URL = process.env.GOOGLE_SHEETS_NEWSLETTER_URL || '';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID || process.env.BREVO_KIDZCOOP_LIST_ID || 0);

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

async function subscribeWithBrevo(email: string) {
  if (!BREVO_API_KEY || !Number.isFinite(BREVO_LIST_ID) || BREVO_LIST_ID <= 0) {
    return false;
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      email,
      listIds: [BREVO_LIST_ID],
      updateEnabled: true,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to save Brevo newsletter signup (${response.status})`);
  }

  return true;
}

async function subscribeWithGoogleSheets(email: string, language: string, signedDate: string) {
  if (!GOOGLE_SHEETS_NEWSLETTER_URL) {
    throw new Error('Newsletter integration is not configured');
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
}

export async function GET() {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    return NextResponse.json({ authenticated: false, subscribed: false });
  }

  const account = await upsertAccount(identity);
  return NextResponse.json({
    authenticated: true,
    emailAvailable: Boolean(identity.email && identity.emailVerified),
    subscribed: Boolean(account.newsletterSubscribedAt),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identity = await getAuthenticatedIdentity();
    const accountEmail = identity?.emailVerified ? identity.email : undefined;
    const email = String(accountEmail || body.email || '').trim().toLowerCase();
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

    const brevoHandled = await subscribeWithBrevo(email);
    if (!brevoHandled) {
      await subscribeWithGoogleSheets(email, language, signedDate);
    }

    if (identity) {
      await markNewsletterSubscribed(identity);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Error saving newsletter signup:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
