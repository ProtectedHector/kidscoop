import 'server-only';
import { auth } from '@clerk/nextjs/server';
import type { ConvexHttpClient } from 'convex/browser';
import { createConvexClientForToken } from './convex';

/**
 * Convex client authenticated as the signed-in Clerk user (JWT template "convex").
 * Returns null when there is no session.
 */
export async function getConvexForUser(): Promise<{ client: ConvexHttpClient; userId: string } | null> {
  const { userId, getToken } = await auth();
  if (!userId) return null;

  const token = await getToken({ template: 'convex' }).catch(() => null);
  if (!token) return null;

  return { client: createConvexClientForToken(token), userId };
}
