# Context

Terms used across the code, docs and Make scenario.

- **Story / article**: one piece of content, keyed by the numeric `externalArticleId` used in URLs
  (`/{lang}/article/{id}/{slug}`) and image names (`public/articles/{id}.png`, `{id}c.png` for the
  colouring page, `{id}_{lang}.mp3` for audio).
- **Content row**: one story in one language (`content` table): title, text, slug, lyrics.
- **Category**: one of eight fixed slugs (`historias`, `ciencia`, …), many per story.
- **Affiliate ad**: an Amazon product attached to a story (`affiliateAds`).
- **Make**: the external scenario that writes stories into Convex (`create-strict`) and calls
  `POST /api/revalidate`.
- **Write token**: `KIDZCOOP_CONVEX_WRITE_TOKEN`, the shared secret for Convex write mutations and
  `/api/revalidate`. Server-only.
- **Content tag**: the `content` cache tag on every Convex content read; expiring it refreshes the site.
- **Feature**: a folder under `src/features/` with `components/`, `data/`, `model/` and its
  **entry files** `public.ts` / `public.server.ts`.
- **Infra**: `src/lib`, `src/components`, `src/hooks`, shared code that knows no feature.
- **Session**: the signed-in Clerk user as `src/lib/session.ts` returns it.
- **Alert kind**: a way sign-in can fail (`clerk_not_configured`, `clerk_load_failed`,
  `oauth_failed`, `user_sync_failed`); each is emailed to the admin at most once an hour.
- **Live site**: the Vercel production deployment (`VERCEL_ENV=production`) at kidzcoop.app.
