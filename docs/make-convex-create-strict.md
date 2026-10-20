# Make to Convex create-strict flow

This document records the safe Make -> Convex publishing flow for KidZcoop articles.

## Goal

Make generates a new article, content rows, affiliates, and images. Convex must be the first system that accepts the new article id. GitHub image uploads must only happen after Convex confirms the write.

The flow is designed to avoid:

- overwriting existing Convex rows;
- creating orphan GitHub images for the wrong article id;
- accidentally using Convex Admin API credentials in Make;
- continuing the scenario after a failed Convex write.

## Endpoint

Use the Convex HTTP action endpoint, not the Convex query/mutation API.

```text
POST https://<deployment>.convex.site/api/articles/create-strict
```

For the current deployment we tested:

```text
https://enchanted-mouse-14.convex.site/api/articles/create-strict
```

Do not use `.convex.cloud` for this Make HTTP action. `.convex.cloud` is for Convex query/mutation/admin API calls. The HTTP action is served from `.convex.site`.

## Authentication

The endpoint checks the app-specific shared secret:

```text
KIDZCOOP_CONVEX_WRITE_TOKEN
```

This is not a Convex Admin Key.

For Make, use the header form that was confirmed to work:

```text
Header name: x-kidzcoop-token
Header value: <the raw KIDZCOOP_CONVEX_WRITE_TOKEN value>
```

In Make keychain:

```text
Name: Convex create-strict token
API key placement: In the header
API Key parameter name: x-kidzcoop-token
Key: <raw token only, without Bearer>
```

Do not put these values in the key field:

```text
KIDZCOOP_CONVEX_WRITE_TOKEN
Bearer token
Bearer KIDZCOOP_CONVEX_WRITE_TOKEN
```

The key must contain the actual secret value stored in the Convex environment variable.

The endpoint also supports `Authorization: Bearer <token>` in code, but Make was easier to diagnose and configure with `x-kidzcoop-token`. Prefer `x-kidzcoop-token` for this scenario.

## Request body

Use this structure:

```json
{
  "articleGroup": {
    "externalArticleId": 72,
    "name": "Internal article group name",
    "deleted": false,
    "post": "",
    "category": "curiosidades",
    "categories": ["curiosidades", "ciencia"],
    "imagePath": "/articles/72.png"
  },
  "content": {
    "externalArticleId": 72,
    "externalContentId": 567,
    "language": "es",
    "slug": "titulo-del-articulo",
    "title": "Titulo del articulo",
    "contentText": "Contenido completo...",
    "lyrics": "",
    "imagePath": "/articles/72.png",
    "publishedDate": "2026-10-14T09:00:00.000Z",
    "published": true,
    "category": "curiosidades",
    "categories": ["curiosidades", "ciencia"]
  },
  "affiliates": [
    {
      "externalArticleId": 72,
      "productName": "Producto 1",
      "asin": "B000000001",
      "affiliateUrl": "https://...",
      "position": 1,
      "active": true,
      "imageUrl": "https://..."
    },
    {
      "externalArticleId": 72,
      "productName": "Producto 2",
      "asin": "B000000002",
      "affiliateUrl": "https://...",
      "position": 2,
      "active": true,
      "imageUrl": "https://..."
    },
    {
      "externalArticleId": 72,
      "productName": "Producto 3",
      "asin": "B000000003",
      "affiliateUrl": "https://...",
      "position": 3,
      "active": true,
      "imageUrl": "https://..."
    }
  ]
}
```

## Affiliates

For a new article, Make must send exactly 3 affiliates.

Each affiliate must include:

```text
externalArticleId
productName
asin
affiliateUrl
position
active
imageUrl
```

Rules:

- `externalArticleId` must match `articleGroup.externalArticleId` and `content.externalArticleId`.
- `position` must be `1`, `2`, and `3`.
- `active` should be `true`.
- `asin` must be unique for that article.
- `imageUrl` must be a real product image URL.
- `affiliateUrl` must be the final affiliate URL.

Convex links the affiliates to the internal Convex article id when it writes the rows.

## Additional languages

For additional languages of the same article, use the same structure but send an empty affiliates array:

```json
{
  "articleGroup": {
    "externalArticleId": 72,
    "name": "Internal article group name",
    "deleted": false,
    "post": "",
    "category": "curiosidades",
    "categories": ["curiosidades", "ciencia"],
    "imagePath": "/articles/72.png"
  },
  "content": {
    "externalArticleId": 72,
    "externalContentId": 568,
    "language": "en",
    "slug": "article-title",
    "title": "Article title",
    "contentText": "Full content...",
    "lyrics": "",
    "imagePath": "/articles/72.png",
    "publishedDate": "2026-10-14T09:00:00.000Z",
    "published": true,
    "category": "curiosidades",
    "categories": ["curiosidades", "ciencia"]
  },
  "affiliates": []
}
```

Do not resend affiliates for language continuation calls. The strict endpoint is expected to reject that because it would create duplicates.

## Safe execution order in Make

The scenario must run in this order:

1. Calculate the planned `externalArticleId`, `externalContentId`, slug, image path, and affiliate data.
2. Call Convex `POST /api/articles/create-strict`.
3. Continue only if Convex returns HTTP `200` and `ok: true`.
4. Upload or commit generated images to GitHub only after Convex accepted the id.
5. If Convex returns `409`, `ok: false`, `Unauthorized`, or any HTTP error, stop the scenario.

Keep Make `stopOnHttpError=true`.

## Expected responses

Successful response:

```json
{
  "ok": true,
  "result": {
    "action": "created",
    "articleAction": "created",
    "externalArticleId": 72,
    "externalContentId": 567,
    "language": "es",
    "categoriesInserted": 2,
    "affiliatesInserted": 3
  }
}
```

Conflict or validation response:

```json
{
  "ok": false,
  "error": "..."
}
```

The endpoint returns HTTP `409` for errors caught by the HTTP action. Make must treat that as a hard stop.

## Troubleshooting

### Unauthorized

Meaning: the request reached the endpoint, but the token did not match `KIDZCOOP_CONVEX_WRITE_TOKEN` in that Convex deployment.

Check:

- Make keychain uses header `x-kidzcoop-token`.
- Make key value is the raw token only, without `Bearer`.
- The token is not the literal text `KIDZCOOP_CONVEX_WRITE_TOKEN`.
- The same token value exists in the Convex env var for the exact deployment behind the `.convex.site` URL.
- The Convex deployment was redeployed or refreshed after env changes if needed.

### ArgumentValidationError

Meaning: authentication worked, but the JSON body shape is wrong or incomplete.

This is good for auth diagnostics. In testing, a request with an empty body returned:

```text
Object is missing the required field `externalArticleId`
Path: .article
```

That confirmed the token was valid because the code reached Convex argument validation.

### 409 with duplicate/content errors

Meaning: the strict endpoint prevented an overwrite.

Examples:

- content already exists for the same `externalArticleId` and `language`;
- `externalContentId` already exists;
- affiliate already exists for the same `externalArticleId` and `asin`;
- new article did not include exactly 3 affiliates;
- affiliates were sent for an existing article/language continuation.

Do not bypass these errors with the old upsert endpoint.

## Do not use these for Make-generated new articles

Do not use:

```text
/api/articles/publish
articles:upsertContentFromMake
/api/query
/api/mutation
Convex Admin Key
```

`/api/articles/publish` and `articles:upsertContentFromMake` can modify existing rows, so they are not safe for the automated article generation flow.

## Prompt for Maia

```text
Use the strict Convex HTTP action for new KidZcoop articles.

Endpoint:
POST {{CONVEX_SITE_URL}}/api/articles/create-strict

Use Make keychain:
Header name: x-kidzcoop-token
Header value: raw KIDZCOOP_CONVEX_WRITE_TOKEN value, without Bearer

Do not use /api/query, /api/mutation, Convex Admin Key, /api/articles/publish, or articles:upsertContentFromMake.

Payload shape:
{
  "articleGroup": {...},
  "content": {...},
  "affiliates": [...]
}

For a new article:
- send exactly 3 affiliates;
- each affiliate must include externalArticleId, productName, asin, affiliateUrl, position, active, imageUrl;
- positions must be 1, 2, and 3;
- active must be true;
- each affiliate externalArticleId must match articleGroup/content externalArticleId.

For additional languages of an existing article:
- send affiliates as an empty array;
- do not resend affiliate rows.

Keep stopOnHttpError=true.

Only continue to GitHub image upload/commit if Convex returns HTTP 200 and ok=true.
If Convex returns 409, ok=false, Unauthorized, or any HTTP error, stop the scenario and do not upload anything to GitHub.
```


## Refrescar la caché de la web

La web cachea el contenido de Convex durante 1 semana. Después de crear la historia
(y de subir las imágenes a GitHub), añade en Make un módulo HTTP:

- Método: `POST`
- URL: `https://kidzcoop.app/api/revalidate`
- Cabecera: `Authorization: Bearer <KIDZCOOP_CONVEX_WRITE_TOKEN>`

Respuesta `200 {"revalidated": true}`; `401` si el token no coincide.
Sin este paso, la historia nueva tarda hasta una semana en aparecer.
