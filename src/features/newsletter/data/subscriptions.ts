/** Newsletter subscriptions: Convex is the source of truth, Brevo is kept in sync when configured. */
import 'server-only';
import { api } from '@convex/_generated/api';
import { addNewsletterContact } from '@/lib/server/brevo';
import { getConvexWriter } from '@/lib/server/convex';

function getWriter() {
  const writer = getConvexWriter();
  if (!writer) {
    throw new Error('Newsletter storage is not configured. Set KIDZCOOP_CONVEX_WRITE_TOKEN.');
  }
  return writer;
}

/** Saves the subscription in Convex, then adds the contact in Brevo (a Brevo failure is only logged). */
export async function subscribeToNewsletter(email: string, language: string): Promise<void> {
  const { client, token } = getWriter();
  await client.mutation(api.newsletter.subscribe, { token, email, language });

  try {
    await addNewsletterContact(email);
  } catch (error) {
    console.warn('Brevo sync failed:', error instanceof Error ? error.message : error);
  }
}

/** Whether `email` is subscribed. `false` when storage isn't configured or the read fails. */
export async function isSubscribed(email: string): Promise<boolean> {
  const writer = getConvexWriter();
  if (!writer) return false;

  try {
    const result = await writer.client.query(api.newsletter.status, { token: writer.token, email });
    return result.subscribed;
  } catch (error) {
    console.warn('Could not read newsletter status:', error instanceof Error ? error.message : error);
    return false;
  }
}
