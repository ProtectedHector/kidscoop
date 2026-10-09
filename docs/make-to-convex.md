# Make -> Convex -> KidZcoop

The final write path for new articles is:

```text
Make HTTP module -> Convex HTTP action -> KidZcoop reads Convex
```

## Convex project

Use a dedicated Convex project/database named `kidzcoop`.

Required environment variables:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
CONVEX_SITE_URL=https://<deployment>.convex.site
KIDZCOOP_CONVEX_WRITE_TOKEN=<long random secret>
KIDZCOOP_CONTENT_SOURCE=sheets
```

`KIDZCOOP_CONTENT_SOURCE=sheets` keeps the public app on Google Sheets while Convex is being prepared. Use `auto` to read Convex first and fall back to Google Sheets during verification. Change it to `convex` only after counts and content checks pass.

Create `KIDZCOOP_CONVEX_WRITE_TOKEN` locally with a random value:

```bash
openssl rand -hex 32
```

Store the same value in:

```bash
# Next.js / hosting env
KIDZCOOP_CONVEX_WRITE_TOKEN=<generated value>

# Convex env
npx convex env set KIDZCOOP_CONVEX_WRITE_TOKEN <generated value>
```

This token is not a Convex account token. It is an app-specific shared secret used by Make and the Next.js admin API to authorize writes. Do not expose it as `NEXT_PUBLIC_*`.

## Make HTTP module

Use a `POST` request:

```text
{{CONVEX_SITE_URL}}/api/articles/publish
```

Headers:

```text
Content-Type: application/json
Authorization: Bearer {{KIDZCOOP_CONVEX_WRITE_TOKEN}}
```

Body:

```json
{
  "articleGroup": {
    "externalArticleId": 72,
    "name": "Internal article group name",
    "deleted": false,
    "post": "",
    "category": "curiosidades",
    "imagePath": "/articles/72.png"
  },
  "content": {
    "externalArticleId": 72,
    "externalContentId": 901,
    "language": "es",
    "slug": "titulo-del-articulo",
    "title": "Titulo del articulo",
    "contentText": "Contenido completo...",
    "lyrics": "",
    "imagePath": "/articles/72.png",
    "publishedDate": "2026-10-09T09:00:00.000Z",
    "published": true,
    "category": "curiosidades"
  },
  "affiliates": [
    {
      "externalArticleId": 72,
      "productName": "Producto",
      "asin": "B000000000",
      "affiliateUrl": "https://...",
      "position": 1,
      "active": true,
      "imageUrl": "https://..."
    }
  ]
}
```

Allowed `category` values:

```text
historias, ciencia, mundo, arte, naturaleza, espacio, animales, curiosidades
```

If Make cannot classify an article confidently, send `curiosidades`.

## Migration commands

Dry-run from the exported Excel:

```bash
npm run migrate:articles -- --xlsx "/Users/nisuyaves/Downloads/KidScoop Articles.xlsx" --dry-run
```

Write to Convex:

```bash
npm run migrate:articles -- --xlsx "/Users/nisuyaves/Downloads/KidScoop Articles.xlsx"
```

Verify Convex counts after migration:

```bash
npm run verify:articles
```

Google Sheets is not modified by any migration script.

## Admin

The in-app admin is available at:

```text
/<language>/admin
```

It is server-protected and only allows the verified Clerk email:

```text
ba0344@gmail.com
```

The browser never receives `KIDZCOOP_CONVEX_WRITE_TOKEN`. Admin writes go through `/api/admin/content`, and that server route calls Convex with the secret.
