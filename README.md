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

Environment variables go in `.env.local` (see `.env` for the list of names and
`AGENTS.md` → "Environment & secrets").

## Structure

- `src/app/` — Next.js App Router pages and API route handlers
- `src/components/` — React components
- `src/lib/content.ts` — content access layer (Convex)
- `src/translations/` — UI strings for every language
- `convex/` — schema, queries/mutations and HTTP actions used by Make
- `public/articles/` — `{id}.png` (colour) and `{id}c.png` (colouring page)

See `AGENTS.md` for conventions and `docs/make-convex-create-strict.md` for the
Make → Convex publishing contract.

## Deployment

The site is deployed on Vercel; Convex functions are deployed with `npx convex deploy`.
