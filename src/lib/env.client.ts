/**
 * Browser-side environment access, safe to import from a `"use client"` file.
 *
 * Validation is eager: `NEXT_PUBLIC_*` values are inlined at `next build`, so the build is the moment
 * to check them. Every read must be a literal `process.env.NEXT_PUBLIC_X`, or Next won't inline it.
 *
 * Why it's this way: [ADR 0001](../../docs/adr/0001-env-and-config-convention.md).
 */
import { type ClientEnv, clientEnvSchema, formatEnvError } from '@/lib/env.schema';

const result = clientEnvSchema.safeParse({
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID,
});

if (!result.success) throw new Error(formatEnvError(result.error, 'client'));

/** Validated public environment. */
export const clientEnv: ClientEnv = result.data;

/** Clerk is optional: without its publishable key the site runs signed-out only. */
export const clerkEnabled = Boolean(clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
