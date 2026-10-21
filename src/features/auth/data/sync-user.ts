import 'server-only';
import { api } from '@convex/_generated/api';
import { getConvexWriter } from '@/lib/server/convex';
import { getSession } from '@/lib/session';

export type SyncUserResult = 'synced' | 'signed-out' | 'not-configured';

/** Upserts the signed-in Clerk user in Convex. Throws when the Convex write fails. */
export async function syncCurrentUser(): Promise<SyncUserResult> {
  const session = await getSession();
  if (!session) return 'signed-out';

  const writer = getConvexWriter();
  if (!writer) return 'not-configured';

  await writer.client.mutation(api.users.syncUser, {
    token: writer.token,
    clerkUserId: session.id,
    emailVerified: session.emailVerified,
    ...(session.email ? { email: session.email } : {}),
    ...(session.displayName ? { displayName: session.displayName } : {}),
    ...(session.imageUrl ? { imageUrl: session.imageUrl } : {}),
  });
  return 'synced';
}
