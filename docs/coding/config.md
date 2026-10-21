# Config

Why: [ADR 0001](../adr/0001-env-and-config-convention.md).

## Adding a variable

1. Add it to `serverEnvSchema` or `clientEnvSchema` in `src/lib/env.schema.ts`, with a one-line doc comment.
2. Client variables: add the literal `process.env.NEXT_PUBLIC_X` line in `src/lib/env.client.ts`.
3. Add it to `.env.example`.
4. Tell the owner to set it in Vercel (and in the Convex dashboard if Convex reads it).

Read it as `env.X` (server) or `clientEnv.X` (client), at the point of use.

## Before you finish, check

- [ ] No `process.env` outside the env modules, `next.config.mjs`, `scripts/` and `convex/` (Biome enforces it).
- [ ] No secret in `.env.example`, in a `NEXT_PUBLIC_*` variable, or in logs.
- [ ] The summary lists every variable the owner must set.
