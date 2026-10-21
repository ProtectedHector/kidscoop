/**
 * The schema for every environment variable the Next app reads, and the only place new ones are added.
 *
 * This module must stay free of `server-only` and of top-level reads of the variables it validates:
 * the server, the browser bundle and plain Node (vitest, scripts) all import it.
 * Convex functions read their own env (`KIDZCOOP_CONVEX_WRITE_TOKEN`, `CLERK_JWT_ISSUER_DOMAIN`) from
 * the Convex dashboard, not from here.
 *
 * Why it's this way: [ADR 0001](../../docs/adr/0001-env-and-config-convention.md).
 */
import { z } from 'zod';

/** Next sets `NODE_ENV`; plain Node entrypoints may leave it unset, which counts as development. */
export const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';

/** An unset variable and an empty one (`FOO=` in a `.env` file) both mean "not configured". */
function optional<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => (value === '' ? undefined : value), schema.optional());
}

/** Server-side variables. Never inlined, never sent to the browser. */
export const serverEnvSchema = z
  .object({
    /** `production` only on the live site. Unset locally. */
    VERCEL_ENV: optional(z.enum(['production', 'preview', 'development'])),
    /** Shared secret for Convex write mutations and for Make's `POST /api/revalidate`. */
    KIDZCOOP_CONVEX_WRITE_TOKEN: optional(z.string()),
    /** Read here only to check it is set whenever the publishable key is. */
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optional(z.string()),
    CLERK_SECRET_KEY: optional(z.string()),
    BREVO_API_KEY: optional(z.string()),
    BREVO_LIST_ID: optional(z.coerce.number().int().positive()),
    /** Verified Brevo sender for the login-failure alert emails. */
    ALERT_SENDER_EMAIL: z.preprocess((value) => (value === '' ? undefined : value), z.email().default('contact@kidzcoop.app')),
  })
  .superRefine((env, context) => {
    if (env.VERCEL_ENV === 'production' && !env.KIDZCOOP_CONVEX_WRITE_TOKEN) {
      context.addIssue({
        code: 'custom',
        path: ['KIDZCOOP_CONVEX_WRITE_TOKEN'],
        message: 'is required in production (newsletter, admin, user sync and /api/revalidate use it)',
      });
    }
    // A half-configured Clerk breaks every request, so it fails here instead.
    if (env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !env.CLERK_SECRET_KEY) {
      context.addIssue({
        code: 'custom',
        path: ['CLERK_SECRET_KEY'],
        message: 'is required when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set',
      });
    }
  });

/** Browser-side variables, every one prefixed `NEXT_PUBLIC_`. Frozen into the bundle at build time. */
export const clientEnvSchema = z.object({
  /** Every story, newsletter row and favorite lives in Convex, so the site cannot run without it. */
  NEXT_PUBLIC_CONVEX_URL: z.url({
    error: (issue) =>
      typeof issue.input === 'string' ? 'must be a URL like https://<deployment>.convex.cloud' : 'is required',
  }),
  /** Unset means Clerk is off: the site works, sign-in shows a "not available" message. */
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optional(z.string()),
  NEXT_PUBLIC_SITE_URL: optional(z.string()),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optional(z.string()),
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: optional(z.string()),
  /** Set by next.config.mjs on every build; versions the service worker. */
  NEXT_PUBLIC_BUILD_ID: optional(z.string()),
});

export type ServerEnv = z.output<typeof serverEnvSchema>;
export type ClientEnv = z.output<typeof clientEnvSchema>;

/** Formats a failed parse as every issue at once, so one restart shows every missing variable. */
export function formatEnvError(error: z.ZodError, source: string): string {
  const issues = error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'} ${issue.message}`)
    .sort()
    .join('\n');

  return [`Invalid environment (${source}):`, issues, '', 'Compare your .env.local against .env.example.'].join('\n');
}
