# KidZcoop - Amazing Stories for Kids

Multilingual website of short educational stories for kids — [kidzcoop.app](https://kidzcoop.app).

## Features

- 🌍 12 languages, every route under `/{lang}`
- 📚 Content stored in Convex, published automatically from a Make scenario
- 🖍️ Colour illustration + colouring page per story, puzzle and colouring studio
- 🎵 Optional lyrics/audio
- ⭐ Favourites (local, synced to the account in Convex when signed in with Clerk)
- 🔍 SEO: canonical URLs, hreflang, JSON-LD, sitemap
- 📱 Installable PWA

## Getting started

Prerequisites: Node.js 20+.

```bash
npm install
npx convex dev   # Convex dev deployment, regenerates convex/_generated
npm run dev      # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill it in; every variable is validated by
`src/lib/env.schema.ts`.

## Structure

- `src/app/` — routes; public pages in `src/app/[language]/(site)/`, API route handlers in `src/app/api/`
- `src/features/` — one folder per area (articles, affiliates, favorites, newsletter, auth, admin),
  each with `components/`, `data/` (Convex access), `model/` and its `public.ts` / `public.server.ts`
- `src/components/layout/` — shared site shell
- `src/lib/` — env, session, languages, categories, SEO and server clients (`src/lib/server/`)
- `src/translations/` — UI strings for every language
- `convex/` — schema, queries/mutations and HTTP actions used by Make
- `public/articles/` — `{id}.png` (colour) and `{id}c.png` (colouring page)
- `docs/coding/`, `docs/adr/`, `CONTEXT.md` — conventions, decisions and glossary

See `AGENTS.md` for conventions and `docs/make-convex-create-strict.md` for the
Make → Convex publishing contract.

## Deployment

The site is deployed on Vercel; Convex functions are deployed with `npx convex deploy`.
