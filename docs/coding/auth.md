# Auth

Why: [ADR 0004](../adr/0004-auth-with-clerk.md).

- Read the user with `getSession()` (or `getConvexForUser()` for Convex calls) from `src/lib/session.ts`.
  Both answer `null` when nobody is signed in or Clerk is off.
- Client code checks `clerkEnabled` from `src/lib/env.client.ts` before rendering Clerk components.
- Admin routes gate on `requireAdminIdentity()` from `@/features/admin/public.server`.
- Login failures: show the visitor `showLoginProblem(...)`, report with `reportLoginFailure(...)`
  (browser) or `reportAuthAlert(...)` (server, inside `after()` in route handlers).
- New sign-in providers are a Clerk dashboard change only.

## Before you finish, check

- [ ] The change works with Clerk keys unset (signed-out only, sign-in explains it is unavailable).
- [ ] No user id is passed as an argument to a user-scoped Convex function.
- [ ] Account pages are `noindex` and left out of the sitemap.
