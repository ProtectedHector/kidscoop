/**
 * The one door onto the signed-in Clerk user. Nothing else calls `currentUser()` or `auth()`.
 *
 * - {@link getSession} answers `null` for anonymous visitors, and also when Clerk is not configured,
 *   so callers never need to know whether sign-in is enabled.
 * - {@link getConvexForUser} gives a Convex client that carries the user's Clerk JWT, for the
 *   user-scoped functions in `convex/favorites.ts`.
 *
 * Why it's this way: [ADR 0004](../../docs/adr/0004-auth-with-clerk.md).
 */
import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { ConvexHttpClient } from 'convex/browser';
import { cache } from 'react';
import { clerkEnabled } from '@/lib/env.client';
import { createConvexClientForToken } from '@/lib/server/convex';

export type Session = {
  id: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  imageUrl?: string;
};

type ClerkEmailAddress = {
  emailAddress?: string | null;
  verification?: {
    status?: string | null;
  } | null;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** The signed-in user, or `null`. Memoised per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!clerkEnabled) return null;

  const user = await currentUser();
  if (!user) return null;

  const primaryEmail = user.primaryEmailAddress as ClerkEmailAddress | null;
  const email = primaryEmail?.emailAddress?.trim().toLowerCase();
  const validEmail = email && isValidEmail(email) ? email : undefined;
  const displayName = user.fullName || user.firstName || undefined;

  return {
    id: user.id,
    ...(validEmail ? { email: validEmail } : {}),
    emailVerified: Boolean(validEmail && primaryEmail?.verification?.status === 'verified'),
    ...(displayName ? { displayName } : {}),
    ...(user.imageUrl ? { imageUrl: user.imageUrl } : {}),
  };
});

/**
 * Convex client authenticated as the signed-in user (Clerk JWT template "convex"),
 * or `null` when nobody is signed in.
 */
export async function getConvexForUser(): Promise<{ client: ConvexHttpClient; userId: string } | null> {
  if (!clerkEnabled) return null;

  const { userId, getToken } = await auth();
  if (!userId) return null;

  const token = await getToken({ template: 'convex' }).catch(() => null);
  if (!token) return null;

  return { client: createConvexClientForToken(token), userId };
}
