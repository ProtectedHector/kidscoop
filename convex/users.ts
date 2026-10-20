import { mutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";

function authorize(token: string) {
  if (!process.env.KIDZCOOP_CONVEX_WRITE_TOKEN || token !== process.env.KIDZCOOP_CONVEX_WRITE_TOKEN) {
    throw new Error("Unauthorized");
  }
}

/**
 * Clerk user id of the caller, taken from the Clerk JWT ("convex" template).
 * Only tokens issued by our Clerk instance are accepted.
 */
export async function getClerkUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !process.env.CLERK_JWT_ISSUER_DOMAIN || identity.issuer !== process.env.CLERK_JWT_ISSUER_DOMAIN) {
    return null;
  }
  return identity.subject;
}

export async function findUser(ctx: QueryCtx | MutationCtx, clerkUserId: string): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

/** Returns the caller's user row, creating a minimal one if the profile sync has not run yet. */
export async function ensureCurrentUser(ctx: MutationCtx): Promise<Id<"users">> {
  const clerkUserId = await getClerkUserId(ctx);
  if (!clerkUserId) {
    throw new Error("Unauthenticated");
  }

  const existing = await findUser(ctx, clerkUserId);
  if (existing) {
    return existing._id;
  }

  const now = Date.now();
  return await ctx.db.insert("users", {
    clerkUserId,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
  });
}

/**
 * Upserts the Clerk profile. Called server-side from /api/users/sync with the
 * shared write token, after Next.js has verified the Clerk session.
 */
export const syncUser = mutation({
  args: {
    token: v.string(),
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    emailVerified: v.boolean(),
    displayName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    authorize(args.token);
    const now = Date.now();
    const profile = {
      emailVerified: args.emailVerified,
      updatedAt: now,
      lastSeenAt: now,
      ...(args.email ? { email: args.email.trim().toLowerCase() } : {}),
      ...(args.displayName ? { displayName: args.displayName } : {}),
      ...(args.imageUrl ? { imageUrl: args.imageUrl } : {}),
    };

    const existing = await findUser(ctx, args.clerkUserId);
    if (existing) {
      await ctx.db.patch(existing._id, profile);
      return existing._id;
    }

    return await ctx.db.insert("users", { clerkUserId: args.clerkUserId, createdAt: now, ...profile });
  },
});
