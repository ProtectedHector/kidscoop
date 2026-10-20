import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { ISSUER, modules, WRITE_TOKEN } from "./test.setup";

const story = (id: number, savedAt = "2026-10-01T10:00:00.000Z", language = "es") => ({
  id,
  title: `Historia ${id}`,
  image_path: `/articles/${id}.png`,
  language,
  path: `/${language}/article/${id}/historia-${id}`,
  savedAt,
});

const asUser = (t: ReturnType<typeof convexTest>, subject: string) =>
  t.withIdentity({ subject, issuer: ISSUER, tokenIdentifier: `${ISSUER}|${subject}` });

describe("favorites", () => {
  test("anonymous callers get an empty list and cannot write", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.favorites.list, {})).toEqual([]);
    await expect(t.mutation(api.favorites.merge, { favorites: [story(1)] })).rejects.toThrow(/Unauthenticated/);
  });

  test("tokens from another issuer are rejected", async () => {
    const t = convexTest(schema, modules);
    const stranger = t.withIdentity({ subject: "user_1", issuer: "https://evil.example" });
    await expect(stranger.mutation(api.favorites.replace, { favorites: [story(1)] })).rejects.toThrow(/Unauthenticated/);
  });

  test("merge keeps the newest savedAt and replace removes stories", async () => {
    const t = convexTest(schema, modules);
    const ana = asUser(t, "user_ana");

    await ana.mutation(api.favorites.merge, { favorites: [story(1), story(2, "2026-10-02T10:00:00.000Z")] });
    const merged = await ana.mutation(api.favorites.merge, {
      favorites: [story(1, "2026-10-05T10:00:00.000Z"), story(2, "2026-09-01T10:00:00.000Z")],
    });
    expect(merged.map((f) => [f.id, f.savedAt])).toEqual([
      [1, "2026-10-05T10:00:00.000Z"],
      [2, "2026-10-02T10:00:00.000Z"],
    ]);

    const replaced = await ana.mutation(api.favorites.replace, { favorites: [story(2)] });
    expect(replaced.map((f) => f.id)).toEqual([2]);
    expect(await ana.query(api.favorites.list, {})).toHaveLength(1);
  });

  test("the same story in two languages is two favorites", async () => {
    const t = convexTest(schema, modules);
    const ana = asUser(t, "user_ana");
    const saved = await ana.mutation(api.favorites.replace, { favorites: [story(7, undefined, "es"), story(7, undefined, "en")] });
    expect(saved.map((f) => f.language).sort()).toEqual(["en", "es"]);
  });

  test("users only see their own favorites", async () => {
    const t = convexTest(schema, modules);
    await asUser(t, "user_ana").mutation(api.favorites.replace, { favorites: [story(1)] });
    expect(await asUser(t, "user_ben").query(api.favorites.list, {})).toEqual([]);
  });

  test("syncUser upserts the profile and favorites reuse that row", async () => {
    const t = convexTest(schema, modules);
    const id = await t.mutation(api.users.syncUser, {
      token: WRITE_TOKEN,
      clerkUserId: "user_ana",
      email: "Ana@Example.com",
      emailVerified: true,
    });
    await asUser(t, "user_ana").mutation(api.favorites.replace, { favorites: [story(1)] });
    const users = await t.run((ctx) => ctx.db.query("users").collect());
    expect(users).toHaveLength(1);
    expect(users[0]._id).toBe(id);
    expect(users[0].email).toBe("ana@example.com");

    await expect(
      t.mutation(api.users.syncUser, { token: "wrong", clerkUserId: "user_x", emailVerified: false }),
    ).rejects.toThrow(/Unauthorized/);
  });
});
