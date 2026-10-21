import 'server-only';
import { api } from '../../../convex/_generated/api';
import { getConvexWriter } from './convex';

export function isConvexNewsletterConfigured() {
  return getConvexWriter() !== null;
}

function getWriter() {
  const writer = getConvexWriter();
  if (!writer) {
    throw new Error('Newsletter storage is not configured. Set KIDZCOOP_CONVEX_WRITE_TOKEN.');
  }
  return writer;
}

export async function subscribeNewsletterInConvex(email: string, language: string) {
  const { client, token } = getWriter();
  return client.mutation(api.newsletter.subscribe, { token, email, language });
}

export async function getNewsletterStatusFromConvex(email: string) {
  const { client, token } = getWriter();
  const result = await client.query(api.newsletter.status, { token, email });
  return result.subscribed;
}
