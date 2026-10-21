# ADR 0001: Env and config convention

Status: accepted (2026-10-21)

## Context

Variables were read with `process.env.X || ''` in a dozen files. A missing value showed up as a blank
page or a silent no-op in production (for example, a placeholder Clerk key in the tracked `.env`).

## Decision

- `src/lib/env.schema.ts` (zod) is the only list of variables the Next app reads.
- `src/lib/env.server.ts` reads secrets lazily behind a `Proxy`, so `next build` needs no secrets;
  `src/instrumentation.ts` forces one parse at boot, so a broken server refuses to start.
- `src/lib/env.client.ts` parses `NEXT_PUBLIC_*` eagerly, because Next inlines them at build time.
- Production-only requirements (`KIDZCOOP_CONVEX_WRITE_TOKEN`) key off `VERCEL_ENV=production`.
- Clerk stays optional: no publishable key means signed-out only; a key without its secret fails.
- `.env.example` is tracked; `.env` and `.env.local` are ignored. Biome's `noProcessEnv` enforces it.
- Convex functions read their own env from the Convex dashboard and are exempt.

## Consequences

Adding a variable is: schema line, `.env.example` line, Vercel (and Convex if it is used there).
