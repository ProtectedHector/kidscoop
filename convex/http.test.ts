import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "./schema";
import { modules, WRITE_TOKEN } from "./test.setup";

const payload = (externalContentId = 567) => ({
  articleGroup: {
    externalArticleId: 72,
    name: "Grupo",
    deleted: false,
    category: "curiosidades",
    categories: ["curiosidades", "ciencia"],
    imagePath: "/articles/72.png",
  },
  content: {
    externalArticleId: 72,
    externalContentId,
    language: "es",
    slug: "titulo-del-articulo",
    title: "Titulo del articulo",
    contentText: "Contenido completo...",
    imagePath: "/articles/72.png",
    publishedDate: "2026-10-14T09:00:00.000Z",
    published: true,
    category: "curiosidades",
  },
  affiliates: [1, 2, 3].map((position) => ({
    externalArticleId: 72,
    productName: `Producto ${position}`,
    asin: `B00000000${position}`,
    affiliateUrl: `https://www.amazon.es/dp/B00000000${position}`,
    position,
    active: true,
    imageUrl: `https://m.media-amazon.com/images/I/${position}.jpg`,
  })),
});

const post = (t: ReturnType<typeof convexTest>, body: unknown, token = WRITE_TOKEN) =>
  t.fetch("/api/articles/create-strict", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

// Make depends on these status codes (docs/make-convex-create-strict.md).
describe("POST /api/articles/create-strict", () => {
  test("200: creates the story once", async () => {
    const t = convexTest(schema, modules);
    const response = await post(t, payload());
    expect(response.status).toBe(200);
    const contents = await t.run((ctx) => ctx.db.query("content").collect());
    expect(contents).toHaveLength(1);
  });

  test("401 with a wrong token, without leaking it", async () => {
    const t = convexTest(schema, modules);
    const response = await post(t, payload(), "nope");
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain(WRITE_TOKEN);
  });

  test("400 when the body fails validation", async () => {
    const t = convexTest(schema, modules);
    const response = await post(t, { content: { externalArticleId: "72" } });
    expect(response.status).toBe(400);
  });

  test("409 when the story already exists, and nothing is overwritten", async () => {
    const t = convexTest(schema, modules);
    expect((await post(t, payload())).status).toBe(200);
    const again = payload();
    again.content.title = "Otro titulo";
    expect((await post(t, again)).status).toBe(409);
    const contents = await t.run((ctx) => ctx.db.query("content").collect());
    expect(contents.map((c) => c.title)).toEqual(["Titulo del articulo"]);
  });
});
