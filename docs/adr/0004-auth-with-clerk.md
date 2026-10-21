# ADR 0004: Auth with Clerk, Google first, and login-failure alerts

Status: accepted (2026-10-21)

## Context

Sign-in used Clerk's modal with no fallback page. When Clerk was down or misconfigured, the sign-in
button simply did nothing, and nobody noticed.

## Decision

- Clerk, social only. Google now; X and Facebook later (Clerk's free plan allows three social
  providers). Providers are switched on in the Clerk dashboard. Clerk's UI shows whatever is enabled,
  so adding one needs no code.
- The header modal is the main entry point. `/{lang}/sign-in` and `/{lang}/sign-up` are the
  fallback and the target of `ClerkProvider`'s `signInUrl`. Both are `noindex` and disallowed in robots.
- `src/lib/session.ts` is the only reader of the Clerk session (`getSession`, `getConvexForUser`).
  User-scoped Convex functions authenticate with the Clerk JWT template `convex`, never a user-id arg.
- Clerk stays optional (ADR 0001). Without it the sign-in button explains that sign-in is unavailable.
- Login failures are told to the visitor (`LoginProblemNotice`, 12 languages) and emailed to the
  admin (`ADMIN_EMAIL`) from `ALERT_SENDER_EMAIL` through Brevo, only on the live site:

  | Kind | Detected by |
  | --- | --- |
  | `clerk_not_configured` | `src/instrumentation.ts` at boot |
  | `clerk_load_failed` | `<ClerkFailed>` or a 30 s load timeout, in the browser |
  | `oauth_failed` | Clerk sign-in attempt error with an `oauth_*` strategy, in the browser |
  | `user_sync_failed` | `/api/users/sync` |

  `convex/alerts.ts` counts failures per kind and allows one email per kind per hour
  (`@convex-dev/rate-limiter`). Each email says how many failures it covers. Browsers may only report
  the two kinds they can observe (`POST /api/alerts/auth`).

## Consequences

A new sign-in failure mode adds a kind in both `convex/schema.ts` and
`src/features/auth/model/alert-kinds.ts`, plus its detection point.
