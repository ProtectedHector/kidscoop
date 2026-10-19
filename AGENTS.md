# AGENTS.md — KidZcoop

Guide for AI coding agents working in this repo. Read it before making changes.

## What this is

KidZcoop (kidzcoop.app) is a multilingual website of short educational stories for kids.
Each story ("article") has a colour illustration, a colouring page, optional lyrics/audio,
affiliate product links and per-language text. Content is generated upstream by a
**Make** scenario and published into **Convex**; the site is a **Next.js 16 App Router**
app deployed on **Vercel**.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS 3
- Convex (`convex/`) — primary content database and HTTP endpoints for Make
- Clerk — optional auth (enabled only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set)
- Brevo — newsletter list; Cloudflare Web Analytics + optional GA4
- Python scripts at the root (`generate_*.py`) — OpenAI image/translation helpers, run manually

## Commands

```bash
npm install
npm run dev            # Next dev server on :3000
npx convex dev         # Convex dev deployment + regenerates convex/_generated
npm run lint           # eslint (flat config, next core-web-vitals)
npm run build          # production build — run before declaring work done
npm run verify:articles    # check Convex article data
```

There is no test suite. Verify with `npm run lint`, `npx tsc --noEmit` and `npm run build`.

## Layout

```
src/app/[language]/...      Pages, all prefixed by language code
  page.tsx                  Home (article list)
  [category]/               Category listing
  article/[id]/[slug]/      Canonical article page (article/[id] redirects/resolves slug)
  content/[id]/             Legacy content route — keep working for old links
  favorites, admin, about, contact
src/app/api/                Route handlers: articles, favorites, newsletter, affiliates, admin/content
src/app/sitemap.ts, robots.ts
src/proxy.ts                Language redirect for "/", canonical-host 301 in prod, Clerk wrapper
src/lib/content.ts          ⭐ Content access layer (Convex)
src/lib/types.ts            Article / AffiliateAd shapes returned to the UI
src/lib/languages.ts        Supported languages (12) and DEFAULT_LANGUAGE = 'es'
src/lib/categories.ts       Category slugs, labels per language, aliases
src/lib/seo.ts, articleSeo.ts, articleRoutes.ts, site.ts   SEO, URLs, SITE_URL
src/lib/admin.ts            Admin guard (single admin email) + Convex write client
src/lib/server/             Server-only stores (account/favorites JSON store, newsletter)
src/components/             UI components (client components where interactive)
src/translations/translations.json   UI strings for every language
src/hooks/useTranslation.ts          Typed translation keys
convex/schema.ts            Tables: articles, articleCategories, content, affiliateAds,
                            newsletter, newsletterTemplates
convex/articles.ts          Queries + import/upsert mutations
convex/http.ts              HTTP actions for Make: /api/articles/publish, /api/articles/create-strict
convex/contents.ts, newsletter.ts
scripts/                    Migration/verification scripts (Node ESM)
docs/make-convex-create-strict.md   Make → Convex publishing contract (read before touching http.ts)
public/articles/            {id}.png (colour) and {id}c.png (colouring page) images
```

## Data model (Convex)

- `articles` = one story, keyed by numeric `externalArticleId` (the id used in URLs and image names).
- `content` = one row per article × language (`externalContentId`, `slug`, `title`,
  `contentText`, `published`, `publishedDate`, `lyrics`).
- `articleCategories` = many-to-many article ↔ category with `position`.
- `affiliateAds` = Amazon affiliate products per article (`asin`, `position`, `active`).
- `source` on every table: `"migration" | "make" | "manual"`.
- Categories are a fixed union in `convex/schema.ts` **and** `src/lib/categories.ts`
  (`historias, ciencia, mundo, arte, naturaleza, espacio, animales, curiosidades`).
  Change both together.

## Convex rules

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

Project-specific:

- Write mutations are protected by a shared secret: the `token` arg must equal the Convex
  env var `KIDZCOOP_CONVEX_WRITE_TOKEN`. Keep that check on any new write function.
  The Next app sends it from server code only (`src/lib/admin.ts`, `newsletter-store.ts`) —
  never expose it to the client or a `NEXT_PUBLIC_*` var.
- `create-strict` must never overwrite existing rows: it returns 401 (bad token),
  400 (validation), 409 (already exists), 500 (other). Make relies on these status codes
  to decide whether to upload images to GitHub. Don't change the contract without updating
  `docs/make-convex-create-strict.md`.
- HTTP actions are served from `*.convex.site`; queries/mutations from `*.convex.cloud`.
- Don't hand-edit `convex/_generated/` (except that it is committed so the app typechecks).
- Schema changes on existing tables must be backward compatible with stored data
  (add `v.optional` fields first, migrate, then tighten).

## Content access

All page/API code reads content through `src/lib/content.ts`, never by calling Convex
directly from pages, so caching and data shaping stay in one place.

## Conventions

- **i18n**: every route lives under `/[language]`. Use `isSupportedLanguage` /
  `LANGUAGE_CODES` from `src/lib/languages.ts`; never hard-code the list.
  New UI strings go in `translations.json` for **all 12 languages** and the key is added
  to the `TranslationKey` union in `useTranslation.ts`. `ar` is RTL.
- **SEO matters** (current focus): keep canonical URLs, `hreflang` alternates, JSON-LD,
  sitemap entries and Open Graph data consistent when adding/changing routes. Use
  `SITE_URL` from `src/lib/site.ts`, never a literal domain.
- Article URLs: `/{lang}/article/{externalArticleId}/{slug}` — build them with helpers in
  `src/lib/articleRoutes.ts`.
- Images: `public/articles/{id}.png` (colour) and `{id}c.png` (black-and-white colouring
  page). Use `next/image`.
- Server components by default; add `"use client"` only for interactivity.
- Clerk is optional: code must work when `CLERK_ENABLED` is false (check `src/lib/auth.ts`).
- Admin = the single verified email in `src/lib/admin.ts`; guard admin API routes with
  `requireAdminIdentity()`.
- TypeScript strict-ish, 2-space indent, single quotes in `src/`, double quotes in `convex/`
  (match the surrounding file).
- The audience is children and parents: keep copy friendly, no tracking beyond what exists,
  no third-party scripts without asking.

## Environment & secrets

Config lives in `.env.local` (git-ignored). Key vars: `NEXT_PUBLIC_CONVEX_URL`,
`CONVEX_DEPLOYMENT`, `KIDZCOOP_CONVEX_WRITE_TOKEN`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
`BREVO_API_KEY`, `BREVO_LIST_ID`, `NEXT_PUBLIC_SITE_URL`, `OPENAI_API_KEY`.

- Never print, commit or log secret values. Don't add new secrets to `.env` (it is tracked).
- Ignore local artefacts: `dev-backup*`, `snapshot.zip`, `output/`, `tmp/`, `logs/`,
  `.kidzcoop-data/`, `.next/` — they are backups/data exports, not source.

## Git workflow

- Branches: `main` (production), `dev` (integration), feature branches off `dev`.
  PRs go feature → `dev` → `main`.
- Commit messages are short and may be in Spanish or English.
- Don't push, deploy (`npx convex deploy`) or run migrations against production unless
  explicitly asked.

## Before finishing a task

1. `npm run lint` and `npm run build` pass.
2. Convex changes: `npx convex dev --once` (or `npx convex codegen`) succeeds.
3. New UI text is translated in all languages.
4. Routes/SEO changes reflected in `sitemap.ts` and metadata.
5. Summarise what changed and anything that needs manual action (env vars, Make scenario).
