# AGENTS.md — KidZcoop

KidZcoop (kidzcoop.app) is a multilingual site of short educational stories for children and
parents. Each story has a colour illustration, a colouring page, optional lyrics and audio, Amazon
affiliate products and text in up to 12 languages. A **Make** scenario publishes stories into
**Convex**; the site is **Next.js 16** (App Router) on **Vercel**, with optional **Clerk** sign-in
(Google) and **Brevo** for email.

Scripts are in `package.json`. Verify every change with `npm test`, `npm run lint`,
`npm run typecheck` and `npm run build`.

## What to read

Read every row that matches what you are doing. Each page in `docs/coding/` ends with a
"Before you finish, check" list; run it before calling the task done.

| When you… | Read |
| --- | --- |
| add, move or delete a file under `src/`, or import across modules | [docs/coding/architecture.md](docs/coding/architecture.md) |
| read or write content, or touch `convex/` | [docs/coding/convex.md](docs/coding/convex.md) |
| touch sign-in, sessions, admin access or login alerts | [docs/coding/auth.md](docs/coding/auth.md) |
| add or change an environment variable | [docs/coding/config.md](docs/coding/config.md) |
| add UI text, a route, metadata or structured data | [docs/coding/i18n-and-seo.md](docs/coding/i18n-and-seo.md) |
| write or run a test, or finish any change | [docs/coding/testing.md](docs/coding/testing.md) |
| change the Make → Convex publishing endpoint | [docs/make-convex-create-strict.md](docs/make-convex-create-strict.md) |
| meet a term you haven't seen defined | [CONTEXT.md](CONTEXT.md) |
| want to override a convention | its ADR in [docs/adr/](docs/adr/) |

## Guardrails

- Content comes only from Convex, through feature `data/` files and the week-long `content` cache.
- Secrets stay server-side: never print, commit or log them, and never put one in a `NEXT_PUBLIC_*`
  variable. Config lives in `.env.local`; `.env.example` lists every key.
- `CONVEX_DEPLOYMENT` in `.env.local` may point at production. Push, `npx convex deploy`, `npx convex dev`
  against production and migrations happen only when the owner asks.
- The audience is children and parents: friendly copy, no new tracking or third-party scripts
  without asking.
- Ignore local artefacts: `dev-backup*`, `snapshot.zip`, `output/`, `tmp/`, `logs/`, `.next/`.

## Git

`main` is production, `dev` is integration; feature branches come off `dev` and PR into `dev`, then
`dev` into `main`. Commit messages are short, Spanish or English.

## Finishing

End with a summary of what changed and every manual step the owner must take (env vars in Vercel or
Convex, Clerk or Brevo dashboard settings, Make scenario changes, Convex deploys).
