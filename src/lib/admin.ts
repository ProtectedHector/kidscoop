import { getConvexWriter } from './server/convex';
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
  const writer = getConvexWriter();
  if (!writer) {
    throw new Error('Convex admin is not configured. Set KIDZCOOP_CONVEX_WRITE_TOKEN.');
  }

  return writer;
}

export { api };
