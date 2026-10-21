import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules, WRITE_TOKEN } from "./test.setup";

const HOUR = 60 * 60 * 1000;

function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  return t;
}

describe("alerts.record", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-21T10:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("rejects a missing or wrong token", async () => {
    const t = setup();
    await expect(t.mutation(api.alerts.record, { token: "wrong", kind: "oauth_failed" })).rejects.toThrow(/Unauthorized/);
    await expect(t.mutation(api.alerts.record, { token: "", kind: "oauth_failed" })).rejects.toThrow(/Unauthorized/);
    const rows = await t.run(async (ctx) => await ctx.db.query("alerts").collect());
    expect(rows).toEqual([]);
  });

  test("rejects an unknown kind", async () => {
    const t = setup();
    await expect(
      t.mutation(api.alerts.record, { token: WRITE_TOKEN, kind: "something_else" as "oauth_failed" }),
    ).rejects.toThrow();
  });

  test("emails on the first failure, then counts until the hour has passed", async () => {
    const t = setup();
    const record = () => t.mutation(api.alerts.record, { token: WRITE_TOKEN, kind: "oauth_failed", detail: "oauth_access_denied" });

    expect(await record()).toEqual({ send: true, failures: 1 });
    expect(await record()).toEqual({ send: false, failures: 1 });
    expect(await record()).toEqual({ send: false, failures: 2 });

    vi.advanceTimersByTime(HOUR + 1000);
    // This email covers the two suppressed failures plus this one.
    expect(await record()).toEqual({ send: true, failures: 3 });
    expect(await record()).toEqual({ send: false, failures: 1 });
  });

  test("throttles each kind separately", async () => {
    const t = setup();
    expect((await t.mutation(api.alerts.record, { token: WRITE_TOKEN, kind: "oauth_failed" })).send).toBe(true);
    expect((await t.mutation(api.alerts.record, { token: WRITE_TOKEN, kind: "user_sync_failed" })).send).toBe(true);
    expect((await t.mutation(api.alerts.record, { token: WRITE_TOKEN, kind: "oauth_failed" })).send).toBe(false);
  });

  test("keeps only a bounded detail", async () => {
    const t = setup();
    await t.mutation(api.alerts.record, { token: WRITE_TOKEN, kind: "clerk_load_failed", detail: "x".repeat(2000) });
    const row = await t.run(async (ctx) =>
      ctx.db.query("alerts").withIndex("by_kind", (q) => q.eq("kind", "clerk_load_failed")).unique(),
    );
    expect(row?.lastDetail).toHaveLength(500);
  });
});
