# i18n and SEO

## Languages

- Every route lives under `/[language]`. Use `isSupportedLanguage` / `LANGUAGE_CODES` from
  `src/lib/languages.ts`. `ar` is right-to-left.
- UI strings go in `src/translations/translations.json` for all 12 languages, and the key goes in the
  `TranslationKey` union in `src/lib/i18n.ts`. Use `translate(language, key)` where the language is
  known (server components, components with a `language` prop), `useTranslation()` elsewhere.

## SEO

- Use `SITE_URL` / `absoluteUrl` from `src/lib/site.ts` and the builders in `src/lib/seo.ts`.
- Story URLs come from `getArticlePath()` in `src/lib/article-routes.ts`.
- Structured data goes through `<JsonLd data={…} />` (`src/components/json-ld.tsx`).
- Indexable pages: canonical plus `hreflang` alternates (`buildAlternates`), and an entry in
  `src/app/sitemap.ts`. Personal and account pages: `robots: { index: false }` and a `robots.ts` disallow.
- Missing content answers a real 404 (`notFound()`), never an empty 200.

## Before you finish, check

- [ ] New UI text exists in all 12 languages (`src/lib/i18n.test.ts` checks the `auth.*` keys).
- [ ] New or changed routes are reflected in metadata, the sitemap and robots.
- [ ] Pages render their main content in the server HTML (view source, not just the browser).
