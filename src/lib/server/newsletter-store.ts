import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || '';
const WRITE_TOKEN = process.env.KIDZCOOP_CONVEX_WRITE_TOKEN || '';

let client: ConvexHttpClient | null = null;

export function isConvexNewsletterConfigured() {
  return Boolean(CONVEX_URL && WRITE_TOKEN);
}

function getClient() {
  if (!isConvexNewsletterConfigured()) {
    throw new Error('Newsletter storage is not configured. Set NEXT_PUBLIC_CONVEX_URL and KIDZCOOP_CONVEX_WRITE_TOKEN.');
  }
  client ||= new ConvexHttpClient(CONVEX_URL);
  return client;
}

export async function subscribeNewsletterInConvex(email: string, language: string) {
  return getClient().mutation(api.newsletter.subscribe, { token: WRITE_TOKEN, email, language });
}

export async function getNewsletterStatusFromConvex(email: string) {
  const result = await getClient().query(api.newsletter.status, { token: WRITE_TOKEN, email });
  return result.subscribed;
}
