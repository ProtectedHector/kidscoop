import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || '';

/**
 * Convex client authenticated as the signed-in Clerk user (JWT template "convex").
 * Returns null when there is no session or Convex/Clerk are not configured.
 */
export async function getConvexForUser(): Promise<{ client: ConvexHttpClient; userId: string } | null> {
  if (!CONVEX_URL) return null;

  const { userId, getToken } = await auth();
  if (!userId) return null;

  const token = await getToken({ template: 'convex' }).catch(() => null);
  if (!token) return null;

  const client = new ConvexHttpClient(CONVEX_URL);
  client.setAuth(token);
  return { client, userId };
}
