import { NextResponse } from 'next/server';
import { env } from '@/lib/env.server';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/lib/languages';
import { getAuthenticatedIdentity } from '@/lib/server/clerk-user';
import {
  getNewsletterStatusFromConvex,
  isConvexNewsletterConfigured,
  subscribeNewsletterInConvex,
} from '@/lib/server/newsletter-store';

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

async function subscribeWithBrevo(email: string) {
  const apiKey = env.BREVO_API_KEY;
  const listId = env.BREVO_LIST_ID;
  if (!apiKey || !listId) {
    return false;
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to save Brevo newsletter signup (${response.status})`);
  }

  return true;
}

export async function GET() {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    return NextResponse.json({ authenticated: false, subscribed: false });
  }

  let subscribed = false;

  if (identity.email && isConvexNewsletterConfigured()) {
    try {
      subscribed = await getNewsletterStatusFromConvex(identity.email);
    } catch (error) {
      console.warn('Could not read newsletter status:', error instanceof Error ? error.message : error);
    }
  }

  return NextResponse.json({
    authenticated: true,
    emailAvailable: Boolean(identity.email && identity.emailVerified),
    subscribed,
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

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    // Convex is the source of truth for subscribers; Brevo (if configured) is synced too.
    await subscribeNewsletterInConvex(email, language);

    try {
      await subscribeWithBrevo(email);
    } catch (error) {
      console.warn('Brevo sync failed:', error instanceof Error ? error.message : error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Error saving newsletter signup:', message);
    return NextResponse.json({ success: false, error: 'Could not save subscription' }, { status: 500 });
  }
}
