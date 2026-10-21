/** The admin area: one verified email, and Convex reads/writes guarded by the shared write token. */
import 'server-only';
import { api } from '@convex/_generated/api';
import { getConvexWriter } from '@/lib/server/convex';
import { getSession } from '@/lib/session';

export const ADMIN_EMAIL = 'ba0344@gmail.com';

/** The signed-in admin, or `null` for everyone else. This is the access control for admin routes. */
export async function requireAdminIdentity() {
  const session = await getSession();
  if (!session?.emailVerified || session.email?.toLowerCase() !== ADMIN_EMAIL) {
    return null;
  }

  return session;
}

function getAdminWriter() {
  const writer = getConvexWriter();
  if (!writer) {
    throw new Error('Convex admin is not configured. Set KIDZCOOP_CONVEX_WRITE_TOKEN.');
  }

  return writer;
}

/** Everything the admin page lists. Call only after `requireAdminIdentity()`. */
export async function getAdminContent() {
  const { client, token } = getAdminWriter();
  return await client.query(api.articles.adminList, { token });
}

export type AffiliateInput = {
  externalArticleId: number;
  productName: string;
  asin: string;
  affiliateUrl: string;
  position: number;
  active: boolean;
  imageUrl: string;
};

/** Creates or updates one affiliate product. Call only after `requireAdminIdentity()`. */
export async function upsertAffiliate(affiliate: AffiliateInput) {
  const { client, token } = getAdminWriter();
  return await client.mutation(api.articles.adminUpsertAffiliate, { token, affiliate });
}
