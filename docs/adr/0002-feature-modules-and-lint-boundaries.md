# ADR 0002: Feature modules and lint-enforced boundaries

Status: accepted (2026-10-21). Adapted from next.js-starter's ADRs 0006 and 0012.

## Context

All UI lived in `src/components` and all data access in `src/lib`, so any file could reach any other.
Changes in one area broke others, and agents had no map of what belongs where.

## Decision

- Each area is a feature: `src/features/{articles,affiliates,favorites,newsletter,auth,admin}`, with
  the segments `components/`, `data/` (server-only, talks to Convex), `model/` (pure, client-safe).
- Code outside a feature imports only its entry files: `public.ts` (client-safe) and
  `public.server.ts` (starts with `import 'server-only'`). Entry files hold named re-exports only.
- Infra (`src/lib`, `src/components`, `src/hooks`) never imports a feature. Routes and layouts compose
  features; `src/app/[language]/(site)/layout.tsx` passes `AuthControls` into `SiteChrome`'s slot.
- Imports under `src/` use `@/` (and `@convex/` for `convex/`), never relative paths.
- Biome replaces ESLint. The grit plugins in `biome-plugins/` enforce all of the above, plus: no
  server-only imports in client code, no `fetch` cache options in server code, and Clerk's server
  API only in `src/lib/session.ts`.
- The formatter and import sorting are off for now, so adopting Biome didn't reformat every file.
  Turning them on later is one config change and one commit.
- Some a11y rules are warnings until the overlay and audio UI are reworked (`biome.json`).

## Consequences

`npm run lint` fails on a boundary violation. A new feature gets the folders and both entry files.
