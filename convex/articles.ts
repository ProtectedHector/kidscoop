import { mutation, query } from "./_generated/server";
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

const articleInput = v.object({
  externalArticleId: v.number(),
  name: v.optional(v.string()),
  deleted: v.optional(v.boolean()),
  post: v.optional(v.string()),
  category: v.optional(category),
  imagePath: v.optional(v.string()),
  rawFields: v.optional(v.any()),
});

const contentInput = v.object({
  externalArticleId: v.number(),
  externalContentId: v.optional(v.number()),
  language: v.string(),
  slug: v.optional(v.string()),
  title: v.string(),
  contentText: v.string(),
  lyrics: v.optional(v.string()),
  imagePath: v.optional(v.string()),
  publishedDate: v.optional(v.string()),
  published: v.optional(v.boolean()),
  category: v.optional(category),
  rawFields: v.optional(v.any()),
});

const affiliateInput = v.object({
  externalArticleId: v.number(),
  productName: v.string(),
  asin: v.string(),
  affiliateUrl: v.string(),
  position: v.number(),
  active: v.boolean(),
  imageUrl: v.string(),
  rawFields: v.optional(v.any()),
});

const newsletterInput = v.object({
  email: v.string(),
  subscribed: v.boolean(),
  signedDate: v.string(),
  language: v.string(),
  rawFields: v.optional(v.any()),
});

const newsletterTemplateInput = v.object({
  language: v.string(),
  template: v.string(),
  rawFields: v.optional(v.any()),
});

type ArticleInput = {
  externalArticleId: number;
  name?: string;
  deleted?: boolean;
  post?: string;
  category?: "historias" | "ciencia" | "mundo" | "arte" | "naturaleza" | "espacio" | "animales" | "curiosidades";
  imagePath?: string;
  rawFields?: unknown;
};

type Source = "migration" | "make" | "manual";

function authorize(token: string) {
  if (!process.env.KIDZCOOP_CONVEX_WRITE_TOKEN || token !== process.env.KIDZCOOP_CONVEX_WRITE_TOKEN) {
    throw new Error("Unauthorized");
  }
}

function normalizeLanguage(language: string) {
  return (language || "es").trim().toLowerCase();
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "article";
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function presentContent(content: {
  _id: unknown;
  externalArticleId: number;
  externalContentId: number;
  language: string;
  title: string;
  contentText: string;
  lyrics?: string;
  imagePath: string;
  publishedDate: string;
  category: string;
  slug: string;
}) {
  return {
    convex_id: String(content._id),
    id: content.externalArticleId,
    content_id: content.externalContentId,
    name: content.slug,
    language: content.language,
    title: content.title,
    content_text: content.contentText,
    lyrics: content.lyrics ?? "",
    image_path: content.imagePath,
    published_date: content.publishedDate,
    category: content.category,
    slug: content.slug,
  };
}

async function upsertArticleRow(ctx: any, article: ArticleInput, rowSource: Source) {
  const now = Date.now();
  const normalizedCategory = article.category ?? "curiosidades";
  const imagePath = article.imagePath || `/articles/${article.externalArticleId}.png`;
  const existing = await ctx.db
    .query("articles")
    .withIndex("by_external_article_id", (q: any) => q.eq("externalArticleId", article.externalArticleId))
    .unique();

  const data = {
    externalArticleId: article.externalArticleId,
    name: article.name || `Article ${article.externalArticleId}`,
    deleted: article.deleted ?? false,
    post: article.post,
    category: normalizedCategory,
    imagePath,
    source: rowSource,
    rawFields: article.rawFields,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, data);
    return existing._id;
  }

  return ctx.db.insert("articles", { ...data, createdAt: now });
}

export const list = query({
  args: {
    language: v.string(),
    category: v.optional(category),
  },
  handler: async (ctx, args) => {
    const language = normalizeLanguage(args.language);
    const rows = args.category
      ? await ctx.db
          .query("content")
          .withIndex("by_category_and_language", (q) => q.eq("category", args.category!).eq("language", language))
          .collect()
      : await ctx.db
          .query("content")
          .withIndex("by_language", (q) => q.eq("language", language))
          .collect();

    return rows
      .filter((row) => row.published)
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
      .map(presentContent);
  },
});

export const byExternalId = query({
  args: {
    externalArticleId: v.number(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("content")
      .withIndex("by_external_article_and_language", (q) =>
        q.eq("externalArticleId", args.externalArticleId).eq("language", normalizeLanguage(args.language)),
      )
      .unique();

    if (!content || !content.published) {
      return null;
    }

    return presentContent(content);
  },
});

export const listAffiliates = query({
  args: {
    externalArticleId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rows =
      args.externalArticleId === undefined
        ? await ctx.db.query("affiliateAds").collect()
        : await ctx.db
            .query("affiliateAds")
            .withIndex("by_external_article", (q) => q.eq("externalArticleId", args.externalArticleId!))
            .collect();

    return rows
      .filter((row) => row.active)
      .sort((a, b) => a.externalArticleId - b.externalArticleId || a.position - b.position)
      .map((row) => ({
        article_id: row.externalArticleId,
        product_name: row.productName,
        asin: row.asin,
        affiliate_url: row.affiliateUrl,
        position: row.position,
        active: row.active,
        image_url: row.imageUrl,
      }));
  },
});

export const adminList = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    authorize(args.token);
    const [articles, content, affiliateAds, newsletter, newsletterTemplates] = await Promise.all([
      ctx.db.query("articles").collect(),
      ctx.db.query("content").collect(),
      ctx.db.query("affiliateAds").collect(),
      ctx.db.query("newsletter").collect(),
      ctx.db.query("newsletterTemplates").collect(),
    ]);

    return {
      articles: articles.sort((a, b) => a.externalArticleId - b.externalArticleId),
      content: content.sort((a, b) => a.externalArticleId - b.externalArticleId || a.language.localeCompare(b.language)),
      affiliateAds: affiliateAds.sort((a, b) => a.externalArticleId - b.externalArticleId || a.position - b.position),
      newsletter: newsletter.sort((a, b) => b.signedDate.localeCompare(a.signedDate)),
      newsletterTemplates: newsletterTemplates.sort((a, b) => a.language.localeCompare(b.language)),
    };
  },
});

export const migrationSummary = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    authorize(args.token);
    const [articles, content, affiliates, newsletter, newsletterTemplates] = await Promise.all([
      ctx.db.query("articles").collect(),
      ctx.db.query("content").collect(),
      ctx.db.query("affiliateAds").collect(),
      ctx.db.query("newsletter").collect(),
      ctx.db.query("newsletterTemplates").collect(),
    ]);
    const byCategory: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};

    for (const row of content.filter((item) => item.published)) {
      byCategory[row.category] = (byCategory[row.category] || 0) + 1;
      byLanguage[row.language] = (byLanguage[row.language] || 0) + 1;
    }

    return {
      articles: articles.length,
      content: content.length,
      publishedContent: content.filter((row) => row.published).length,
      affiliates: affiliates.length,
      newsletter: newsletter.length,
      newsletterTemplates: newsletterTemplates.length,
      byCategory,
      byLanguage,
    };
  },
});

export const importArticles = mutation({
  args: {
    token: v.string(),
    rows: v.array(articleInput),
    source: v.optional(source),
  },
  handler: async (ctx, args) => {
    authorize(args.token);
    let created = 0;
    let updated = 0;

    for (const row of args.rows) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_external_article_id", (q) => q.eq("externalArticleId", row.externalArticleId))
        .unique();
      await upsertArticleRow(ctx, row, args.source ?? "migration");
      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }
    }

    return { created, updated };
  },
});

export const upsertContentFromMake = mutation({
  args: {
    token: v.string(),
    article: articleInput,
    content: contentInput,
    affiliates: v.optional(v.array(affiliateInput)),
    source: v.optional(source),
  },
  handler: async (ctx, args) => {
    authorize(args.token);
    const now = Date.now();
    const rowSource = args.source ?? "make";
    const articleId = await upsertArticleRow(ctx, args.article, rowSource);
    const normalizedLanguage = normalizeLanguage(args.content.language);
    const normalizedCategory = args.content.category ?? args.article.category ?? "curiosidades";
    const imagePath = args.content.imagePath || args.article.imagePath || `/articles/${args.content.externalArticleId}.png`;
    const slug = normalizeSlug(args.content.slug || args.content.title);
    const externalContentId = args.content.externalContentId ?? args.content.externalArticleId;

    const existingContent = await ctx.db
      .query("content")
      .withIndex("by_external_article_and_language", (q) =>
        q.eq("externalArticleId", args.content.externalArticleId).eq("language", normalizedLanguage),
      )
      .unique();

    const contentData = {
      articleId,
      externalArticleId: args.content.externalArticleId,
      externalContentId,
      language: normalizedLanguage,
      slug,
      title: args.content.title,
      contentText: args.content.contentText,
      lyrics: args.content.lyrics,
      imagePath,
      publishedDate: args.content.publishedDate || new Date(now).toISOString(),
      published: args.content.published ?? true,
      category: normalizedCategory,
      source: rowSource,
      rawFields: args.content.rawFields,
      updatedAt: now,
    };

    let contentId;
    let action: "created" | "updated";

    if (existingContent) {
      await ctx.db.patch(existingContent._id, contentData);
      contentId = existingContent._id;
      action = "updated";
    } else {
      contentId = await ctx.db.insert("content", { ...contentData, createdAt: now });
      action = "created";
    }

    let affiliatesUpserted = 0;
    for (const ad of args.affiliates || []) {
      const existingAd = await ctx.db
        .query("affiliateAds")
        .withIndex("by_external_article_and_asin", (q) =>
          q.eq("externalArticleId", ad.externalArticleId).eq("asin", ad.asin),
        )
        .first();
      const adData = {
        articleId,
        externalArticleId: ad.externalArticleId,
        productName: ad.productName,
        asin: ad.asin,
        affiliateUrl: ad.affiliateUrl,
        position: ad.position,
        active: ad.active,
        imageUrl: ad.imageUrl,
        source: rowSource,
        rawFields: ad.rawFields,
        updatedAt: now,
      };

      if (existingAd) {
        await ctx.db.patch(existingAd._id, adData);
      } else {
        await ctx.db.insert("affiliateAds", { ...adData, createdAt: now });
      }
      affiliatesUpserted += 1;
    }

    return { action, articleId, contentId, externalArticleId: args.content.externalArticleId, language: normalizedLanguage, affiliatesUpserted };
  },
});

export const importNewsletter = mutation({
  args: {
    token: v.string(),
    rows: v.array(newsletterInput),
    source: v.optional(source),
  },
  handler: async (ctx, args) => {
    authorize(args.token);
    const now = Date.now();
    let created = 0;
    let updated = 0;

    for (const row of args.rows) {
      const email = normalizeEmail(row.email);
      if (!email) continue;
      const existing = await ctx.db.query("newsletter").withIndex("by_email", (q) => q.eq("email", email)).unique();
      const data = {
        email,
        subscribed: row.subscribed,
        signedDate: row.signedDate,
        language: normalizeLanguage(row.language),
        source: args.source ?? "migration",
        rawFields: row.rawFields,
        updatedAt: now,
      };
      if (existing) {
        await ctx.db.patch(existing._id, data);
        updated += 1;
      } else {
        await ctx.db.insert("newsletter", { ...data, createdAt: now });
        created += 1;
      }
    }

    return { created, updated };
  },
});

export const importNewsletterTemplates = mutation({
  args: {
    token: v.string(),
    rows: v.array(newsletterTemplateInput),
    source: v.optional(source),
  },
  handler: async (ctx, args) => {
    authorize(args.token);
    const now = Date.now();
    let created = 0;
    let updated = 0;

    for (const row of args.rows) {
      const language = normalizeLanguage(row.language);
      const existing = await ctx.db.query("newsletterTemplates").withIndex("by_language", (q) => q.eq("language", language)).unique();
      const data = {
        language,
        template: row.template,
        source: args.source ?? "migration",
        rawFields: row.rawFields,
        updatedAt: now,
      };
      if (existing) {
        await ctx.db.patch(existing._id, data);
        updated += 1;
      } else {
        await ctx.db.insert("newsletterTemplates", { ...data, createdAt: now });
        created += 1;
      }
    }

    return { created, updated };
  },
});

export const adminUpsertAffiliate = mutation({
  args: { token: v.string(), affiliate: affiliateInput },
  handler: async (ctx, args) => {
    authorize(args.token);
    const article = await ctx.db
      .query("articles")
      .withIndex("by_external_article_id", (q) => q.eq("externalArticleId", args.affiliate.externalArticleId))
      .unique();
    if (!article) throw new Error("Article not found for affiliate");

    const now = Date.now();
    const existing = await ctx.db
      .query("affiliateAds")
      .withIndex("by_external_article_and_asin", (q) =>
        q.eq("externalArticleId", args.affiliate.externalArticleId).eq("asin", args.affiliate.asin),
      )
      .first();
    const data = {
      articleId: article._id,
      externalArticleId: args.affiliate.externalArticleId,
      productName: args.affiliate.productName,
      asin: args.affiliate.asin,
      affiliateUrl: args.affiliate.affiliateUrl,
      position: args.affiliate.position,
      active: args.affiliate.active,
      imageUrl: args.affiliate.imageUrl,
      source: "manual" as const,
      rawFields: args.affiliate.rawFields,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return { action: "updated", id: existing._id };
    }

    return { action: "created", id: await ctx.db.insert("affiliateAds", { ...data, createdAt: now }) };
  },
});
