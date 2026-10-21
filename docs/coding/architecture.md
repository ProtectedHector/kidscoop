# Architecture

Why: [ADR 0002](../adr/0002-feature-modules-and-lint-boundaries.md).

## Where code goes

| Path | Holds | May import |
| --- | --- | --- |
| `src/app/` | Routes, layouts, route handlers. Thin: parse input, call a feature, render. | everything, features via entry files |
| `src/features/<name>/components/` | UI for that feature | own feature, other features' entry files, infra |
| `src/features/<name>/data/` | Server-only Convex/Brevo access; starts with `import 'server-only'` | own feature, infra |
| `src/features/<name>/model/` | Pure types and logic, client-safe | own feature, infra |
| `src/features/<name>/public.ts` / `public.server.ts` | Named re-exports only: the feature's interface | own feature |
| `src/components/layout/`, `src/components/` | Shared shell (site chrome, language switcher, PWA, `JsonLd`) | infra only |
| `src/lib/` | Shared helpers: env, session, languages, categories, SEO, i18n | infra only |
| `src/lib/server/` | Server-only clients: Convex, Brevo | infra only |
| `convex/` | Convex schema and functions (see [convex.md](convex.md)) | `convex/` only |

Public pages live in `src/app/[language]/(site)/`, whose layout wraps them in `SiteChrome` and fills
its `account` slot. Story pages (`article/`) and `admin/` sit outside the group and have their own header.

## Imports

`@/…` for `src/`, `@convex/…` for `convex/`. Code outside a feature imports `@/features/<name>/public`
or `@/features/<name>/public.server`. `npm run lint` reports a boundary break with the fix in the message.

## Before you finish, check

- [ ] Each new file sits in the segment that matches what it holds (table above).
- [ ] Anything another module needs is re-exported by name from the right entry file.
- [ ] A new feature has `public.ts` and, if it has server code, `public.server.ts`.
- [ ] `npm run lint` shows no errors.
