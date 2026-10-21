import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { alertKind } from "./schema";

/** At most one email per alert kind per hour; failures in between are counted. */
const rateLimiter = new RateLimiter(components.rateLimiter, {
  authAlertEmail: { kind: "fixed window", rate: 1, period: HOUR },
});

const MAX_DETAIL_LENGTH = 500;

function authorize(token: string) {
  if (!process.env.KIDZCOOP_CONVEX_WRITE_TOKEN || token !== process.env.KIDZCOOP_CONVEX_WRITE_TOKEN) {
    throw new Error("Unauthorized");
  }
}

/**
 * Records one sign-in failure and says whether the admin should be emailed now.
 * Called from Next.js server code with the shared write token (src/features/auth/data/alerts.ts).
 * When `send` is true, `failures` is how many failures this email covers (including this one).
 */
export const record = mutation({
  args: { token: v.string(), kind: alertKind, detail: v.optional(v.string()) },
  returns: v.object({ send: v.boolean(), failures: v.number() }),
  handler: async (ctx, args) => {
    authorize(args.token);
    const now = Date.now();
    const detail = args.detail?.slice(0, MAX_DETAIL_LENGTH);

    const existing = await ctx.db
      .query("alerts")
      .withIndex("by_kind", (q) => q.eq("kind", args.kind))
      .unique();
    const failures = (existing?.failuresSinceLastEmail ?? 0) + 1;
    const { ok } = await rateLimiter.limit(ctx, "authAlertEmail", { key: args.kind });

    const row = {
      failuresSinceLastEmail: ok ? 0 : failures,
      lastFailureAt: now,
      ...(ok ? { lastEmailAt: now } : {}),
      ...(detail ? { lastDetail: detail } : {}),
    };
    if (existing) {
      await ctx.db.patch(existing._id, row);
    } else {
      await ctx.db.insert("alerts", { kind: args.kind, ...row });
    }

    return { send: ok, failures };
  },
});
