import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { ensureCurrentUser, findUser, getClerkUserId } from "./users";

const MAX_FAVORITES = 500;

const favoriteInput = v.object({
  id: v.number(),
  title: v.string(),
  image_path: v.string(),
  language: v.string(),
  path: v.string(),
  savedAt: v.string(),
});

const favoriteOutput = favoriteInput;

type FavoriteInput = typeof favoriteInput.type;

function present(row: Doc<"favorites">): FavoriteInput {
  return {
    id: row.externalArticleId,
    title: row.title,
    image_path: row.imagePath,
    language: row.language,
    path: row.path,
    savedAt: row.savedAt,
  };
}

function normalize(favorites: FavoriteInput[]): FavoriteInput[] {
  const byKey = new Map<string, FavoriteInput>();
  for (const favorite of favorites) {
    const language = favorite.language.trim().toLowerCase();
    const path = favorite.path.trim();
    if (!Number.isFinite(favorite.id) || !language || !path.startsWith("/")) continue;
    const savedAt = Number.isFinite(Date.parse(favorite.savedAt)) ? favorite.savedAt : new Date().toISOString();
    const item = { ...favorite, language, path, title: favorite.title.trim(), image_path: favorite.image_path.trim(), savedAt };
    const key = `${language}:${favorite.id}`;
    const current = byKey.get(key);
    if (!current || Date.parse(item.savedAt) > Date.parse(current.savedAt)) byKey.set(key, item);
  }
  if (byKey.size > MAX_FAVORITES) {
    throw new Error(`Too many favorites (max ${MAX_FAVORITES})`);
  }
  return [...byKey.values()];
}

async function listRows(ctx: MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("favorites")
    .withIndex("by_user_id_and_saved_at", (q) => q.eq("userId", userId))
    .order("desc")
    .take(MAX_FAVORITES);
}

async function upsert(ctx: MutationCtx, userId: Id<"users">, existing: Doc<"favorites"> | undefined, favorite: FavoriteInput) {
  const now = Date.now();
  const fields = {
    title: favorite.title,
    imagePath: favorite.image_path,
    path: favorite.path,
    savedAt: favorite.savedAt,
    updatedAt: now,
  };
  if (existing) {
    await ctx.db.patch(existing._id, fields);
  } else {
    await ctx.db.insert("favorites", {
      userId,
      externalArticleId: favorite.id,
      language: favorite.language,
      createdAt: now,
      ...fields,
    });
  }
}

const key = (row: { externalArticleId: number; language: string }) => `${row.language}:${row.externalArticleId}`;

/** Favorites of the signed-in user, newest first. Empty for anonymous callers. */
export const list = query({
  args: {},
  returns: v.array(favoriteOutput),
  handler: async (ctx) => {
    const clerkUserId = await getClerkUserId(ctx);
    if (!clerkUserId) return [];
    const user = await findUser(ctx, clerkUserId);
    if (!user) return [];
    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_user_id_and_saved_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(MAX_FAVORITES);
    return rows.map(present);
  },
});

/**
 * Adds the given favorites to the account (used once after sign-in to merge the
 * favorites saved on this device). Keeps the newest `savedAt` per story.
 */
export const merge = mutation({
  args: { favorites: v.array(favoriteInput) },
  returns: v.array(favoriteOutput),
  handler: async (ctx, args) => {
    const userId = await ensureCurrentUser(ctx);
    const rows = await listRows(ctx, userId);
    const byKey = new Map(rows.map((row) => [key(row), row]));

    for (const favorite of normalize(args.favorites)) {
      const existing = byKey.get(`${favorite.language}:${favorite.id}`);
      if (existing && Date.parse(existing.savedAt) >= Date.parse(favorite.savedAt)) continue;
      await upsert(ctx, userId, existing, favorite);
    }

    return (await listRows(ctx, userId)).map(present);
  },
});

/** Makes the account favorites exactly equal to `favorites` (adds and removals). */
export const replace = mutation({
  args: { favorites: v.array(favoriteInput) },
  returns: v.array(favoriteOutput),
  handler: async (ctx, args) => {
    const userId = await ensureCurrentUser(ctx);
    const rows = await listRows(ctx, userId);
    const wanted = new Map(normalize(args.favorites).map((favorite) => [`${favorite.language}:${favorite.id}`, favorite]));
    const byKey = new Map(rows.map((row) => [key(row), row]));

    for (const row of rows) {
      if (!wanted.has(key(row))) await ctx.db.delete(row._id);
    }
    for (const [favoriteKey, favorite] of wanted) {
      await upsert(ctx, userId, byKey.get(favoriteKey), favorite);
    }

    return (await listRows(ctx, userId)).map(present);
  },
});
