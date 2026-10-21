# Convex and content

Why: [ADR 0003](../adr/0003-convex-is-the-only-content-source.md). Read
`convex/_generated/ai/guidelines.md` before writing Convex code.

## Reading content from the app

- Call Convex only from a feature's `data/` file, through `getConvexClient()` / `getConvexWriter()` /
  `createConvexClientForToken()` in `src/lib/server/convex.ts`.
- Wrap public reads in `unstable_cache(fn, [key], contentCacheOptions)`.
- Load data in the page (server) and pass it down as props; client components hold no content fetches.

## Writing Convex functions

- Write mutations check the `token` arg against `KIDZCOOP_CONVEX_WRITE_TOKEN`; the app sends it from
  server code only.
- User-scoped functions use `getClerkUserId` / `ensureCurrentUser` from `convex/users.ts`.
- `create-strict` (`convex/http.ts`) never overwrites rows and answers 401/400/409/500; Make depends
  on those codes. Its contract is `docs/make-convex-create-strict.md`.
- Schema changes to existing tables add `v.optional` fields first, migrate, then tighten.
- Categories are a fixed union in `convex/schema.ts` and `src/lib/categories.ts`; change both.
- Components are mounted in `convex/convex.config.ts` (currently `@convex-dev/rate-limiter`).

## Deployments

`CONVEX_DEPLOYMENT` in `.env.local` decides where `npx convex dev` / `deploy` go. Check it before
running either; deploying to production needs the owner's explicit go-ahead. `npx convex codegen`
only regenerates `convex/_generated/` and is safe.

## Before you finish, check

- [ ] Every new public Convex function has a test in `convex/*.test.ts`, including unauthorized calls.
- [ ] Every new write path invalidates the `content` cache tag.
- [ ] `npm test` passes (it includes `src/test/convex-only-content.test.ts`).
- [ ] `npx convex codegen` succeeds and `convex/_generated/` is committed.
