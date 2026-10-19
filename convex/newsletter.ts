import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function authorize(token: string) {
  if (!process.env.KIDZCOOP_CONVEX_WRITE_TOKEN || token !== process.env.KIDZCOOP_CONVEX_WRITE_TOKEN) {
    throw new Error("Unauthorized");
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/** Subscribes (or re-subscribes) an email. Called server-side from the Next.js API. */
export const subscribe = mutation({
  args: {
    token: v.string(),
    email: v.string(),
    language: v.string(),
  },
  returns: v.object({ created: v.boolean() }),
  handler: async (ctx, args) => {
    authorize(args.token);
    const email = normalizeEmail(args.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email");
    }

    const now = Date.now();
    const language = (args.language || "es").trim().toLowerCase();
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        subscribed: true,
        language,
        signedDate: existing.subscribed ? existing.signedDate : new Date(now).toISOString(),
        updatedAt: now,
      });
      return { created: false };
    }

    await ctx.db.insert("newsletter", {
      email,
      subscribed: true,
      signedDate: new Date(now).toISOString(),
      language,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    });
    return { created: true };
  },
});

/** Returns whether an email is currently subscribed. Token-protected so emails can't be probed. */
export const status = query({
  args: {
    token: v.string(),
    email: v.string(),
  },
  returns: v.object({ subscribed: v.boolean() }),
  handler: async (ctx, args) => {
    authorize(args.token);
    const row = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(args.email)))
      .unique();
    return { subscribed: Boolean(row?.subscribed) };
  },
});
