import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const category = v.union(
  v.literal("historias"),
  v.literal("ciencia"),
  v.literal("mundo"),
  v.literal("arte"),
  v.literal("naturaleza"),
  v.literal("espacio"),
  v.literal("animales"),
  v.literal("curiosidades"),
);

const source = v.union(v.literal("migration"), v.literal("make"), v.literal("manual"));

/** Ways sign-in can fail. Keep in sync with src/features/auth/model/alert-kinds.ts. */
export const alertKind = v.union(
  v.literal("clerk_not_configured"),
  v.literal("clerk_load_failed"),
  v.literal("oauth_failed"),
  v.literal("user_sync_failed"),
);

export default defineSchema({
  articles: defineTable({
    externalArticleId: v.number(),
    name: v.string(),
    deleted: v.boolean(),
    post: v.optional(v.string()),
    category,
    imagePath: v.string(),
    source,
    rawFields: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_external_article_id", ["externalArticleId"])
    .index("by_category", ["category"]),

  articleCategories: defineTable({
    articleId: v.id("articles"),
    externalArticleId: v.number(),
    category,
    position: v.number(),
    source,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_article_id", ["articleId"])
    .index("by_external_article", ["externalArticleId"])
    .index("by_category", ["category"])
    .index("by_category_and_external_article", ["category", "externalArticleId"]),

  content: defineTable({
    articleId: v.id("articles"),
    externalArticleId: v.number(),
    externalContentId: v.number(),
    language: v.string(),
    slug: v.string(),
    title: v.string(),
    contentText: v.string(),
    publishedDate: v.string(),
    published: v.boolean(),
    lyrics: v.optional(v.string()),
    category,
    imagePath: v.string(),
    source,
    rawFields: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_external_content_id", ["externalContentId"])
    .index("by_external_article_and_language", ["externalArticleId", "language"])
    .index("by_slug_and_language", ["slug", "language"])
    .index("by_language", ["language"])
    .index("by_category_and_language", ["category", "language"]),

  affiliateAds: defineTable({
    articleId: v.id("articles"),
    externalArticleId: v.number(),
    productName: v.string(),
    asin: v.string(),
    affiliateUrl: v.string(),
    position: v.number(),
    active: v.boolean(),
    imageUrl: v.string(),
    source,
    rawFields: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_article_id", ["articleId"])
    .index("by_external_article", ["externalArticleId"])
    .index("by_external_article_and_asin", ["externalArticleId", "asin"]),

  newsletter: defineTable({
    email: v.string(),
    subscribed: v.boolean(),
    signedDate: v.string(),
    language: v.string(),
    source,
    rawFields: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  newsletterTemplates: defineTable({
    language: v.string(),
    template: v.string(),
    source,
    rawFields: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_language", ["language"]),

  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    emailVerified: v.boolean(),
    displayName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  favorites: defineTable({
    userId: v.id("users"),
    externalArticleId: v.number(),
    language: v.string(),
    title: v.string(),
    imagePath: v.string(),
    path: v.string(),
    savedAt: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id_and_saved_at", ["userId", "savedAt"])
    .index("by_user_id_and_external_article_id_and_language", ["userId", "externalArticleId", "language"]),

  /** One row per alert kind: failures counted since the last email to the admin. */
  alerts: defineTable({
    kind: alertKind,
    failuresSinceLastEmail: v.number(),
    lastFailureAt: v.number(),
    lastEmailAt: v.optional(v.number()),
    lastDetail: v.optional(v.string()),
  }).index("by_kind", ["kind"]),
});
