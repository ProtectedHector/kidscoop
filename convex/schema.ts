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
});
