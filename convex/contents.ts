import { query } from "./_generated/server";
import { v } from "convex/values";

export const lastId = query({
  args: {},
  returns: v.union(v.number(), v.null()),
  handler: async (ctx) => {
    const latestContent = await ctx.db
      .query("content")
      .withIndex("by_external_content_id")
      .order("desc")
      .first();

    return latestContent?.externalContentId ?? null;
  },
});
