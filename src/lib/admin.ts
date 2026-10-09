import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { getAuthenticatedIdentity } from './server/clerk-user';

export const ADMIN_EMAIL = 'ba0344@gmail.com';

export async function requireAdminIdentity() {
  const identity = await getAuthenticatedIdentity();
  if (!identity?.emailVerified || identity.email?.toLowerCase() !== ADMIN_EMAIL) {
    return null;
  }

  return identity;
}

export function getAdminConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  const token = process.env.KIDZCOOP_CONVEX_WRITE_TOKEN;

  if (!convexUrl || !token) {
    throw new Error('Convex admin is not configured. Set NEXT_PUBLIC_CONVEX_URL and KIDZCOOP_CONVEX_WRITE_TOKEN.');
  }

  return { client: new ConvexHttpClient(convexUrl), token };
}

export { api };
