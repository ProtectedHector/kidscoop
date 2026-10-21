/**
 * The Next app's way in to Convex. Feature `data/` files build on these clients; pages and
 * components never create a Convex client themselves.
 *
 * Why it's this way: [ADR 0003](../../../docs/adr/0003-convex-is-the-only-content-source.md).
 */
import 'server-only';
import { ConvexHttpClient } from 'convex/browser';
import { clientEnv } from '@/lib/env.client';
import { env } from '@/lib/env.server';

/** Content changes only when Make publishes, so Convex content reads are cached for a week. */
export const CONTENT_REVALIDATE_SECONDS = 60 * 60 * 24 * 7;
/** Cache tag on every content read. Make expires it with `POST /api/revalidate`. */
export const CONTENT_CACHE_TAG = 'content';
/** Options for `unstable_cache` around a content read. */
export const contentCacheOptions = { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] };

let publicClient: ConvexHttpClient | null = null;

/** Unauthenticated client for public queries. */
export function getConvexClient(): ConvexHttpClient {
  publicClient ||= new ConvexHttpClient(clientEnv.NEXT_PUBLIC_CONVEX_URL);
  return publicClient;
}

/**
 * Client plus the shared write token, for mutations guarded by `KIDZCOOP_CONVEX_WRITE_TOKEN`.
 * Null when the token isn't configured (only possible outside production).
 */
export function getConvexWriter(): { client: ConvexHttpClient; token: string } | null {
  const token = env.KIDZCOOP_CONVEX_WRITE_TOKEN;
  return token ? { client: getConvexClient(), token } : null;
}

/** A fresh client carrying a user's Clerk JWT. Never shared, since it holds one user's auth. */
export function createConvexClientForToken(jwt: string): ConvexHttpClient {
  const client = new ConvexHttpClient(clientEnv.NEXT_PUBLIC_CONVEX_URL);
  client.setAuth(jwt);
  return client;
}
