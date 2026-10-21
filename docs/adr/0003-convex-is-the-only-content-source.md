# ADR 0003: Convex is the only content source

Status: accepted (2026-10-21)

## Context

Stories, newsletter rows and affiliate products used to come from Google Sheets (removed in
`9495cce`). Make now publishes into Convex. Old helpers and error hints still mentioned Sheets, and
several components fetched content from `/api/*` in the browser.

## Decision

- Every story, category listing, affiliate product, subscriber, user and favorite is read from and
  written to Convex. Images and mp3s stay in `public/articles/` because Make uploads them to GitHub
  after `create-strict` succeeds. UI copy (`translations.json`, `static-pages.ts`,
  `privacy-policy.ts`) and the category list stay in code.
- Only `src/lib/server/convex.ts` creates Convex clients. Only feature `data/` files and
  `src/lib/session.ts` call Convex functions. `src/test/convex-only-content.test.ts` checks this.
- Public reads are wrapped in `unstable_cache` with `contentCacheOptions`: one week, tag `content`.
  Make calls `POST /api/revalidate` after publishing; admin writes call `revalidateTag('content')`.
- Pages load their data on the server and pass it to client components as props. That covers the
  home and category lists, the article page's previous/next/related stories and affiliate products.
  The `/api/*` read routes stay for external callers.

## Consequences

A new content read is a function in a feature's `data/` folder using `contentCacheOptions`. A new
write path must invalidate the `content` tag.
