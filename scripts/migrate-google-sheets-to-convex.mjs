#!/usr/bin/env node
import 'dotenv/config';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import xlsx from 'xlsx';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const CATEGORY_SLUGS = ['historias', 'ciencia', 'mundo', 'arte', 'naturaleza', 'espacio', 'animales', 'curiosidades'];
const DEFAULT_CATEGORY = 'curiosidades';

const KEYWORDS = {
  ciencia: ['science', 'ciencia', 'experiment', 'experimento', 'laboratory', 'laboratorio', 'robot', 'energy', 'energia', 'energía', 'discover', 'descubre'],
  espacio: ['space', 'espacio', 'planet', 'planeta', 'moon', 'luna', 'star', 'estrella', 'rocket', 'cohete', 'galaxy', 'galaxia', 'astronaut'],
  animales: ['animal', 'animals', 'animales', 'bird', 'pajaro', 'pájaro', 'fish', 'pez', 'dinosaur', 'dinosaurio', 'cat', 'dog', 'perro', 'gato', 'bear', 'oso'],
  naturaleza: ['nature', 'naturaleza', 'forest', 'bosque', 'tree', 'arbol', 'árbol', 'plant', 'planta', 'flower', 'flor', 'ocean', 'mar', 'river', 'rio', 'río'],
  arte: ['art', 'arte', 'paint', 'pintar', 'painting', 'pintura', 'music', 'musica', 'música', 'artist', 'artista', 'color', 'colour', 'colorear'],
  mundo: ['world', 'mundo', 'travel', 'viaje', 'country', 'pais', 'país', 'city', 'ciudad', 'culture', 'cultura', 'map', 'mapa'],
  historias: ['story', 'stories', 'historia', 'cuento', 'cuentos', 'tale', 'adventure', 'aventura', 'character', 'personaje'],
};

function parseArgs() {
  const args = {
    xlsxPath: '',
    dryRun: false,
    batchSize: 50,
  };

  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg === '--xlsx') {
      args.xlsxPath = process.argv[index + 1] || '';
      index += 1;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--batch-size') {
      args.batchSize = Number(process.argv[index + 1] || 50);
      index += 1;
    }
  }

  if (!args.xlsxPath) {
    args.xlsxPath = process.env.KIDZCOOP_MIGRATION_XLSX || '';
  }

  return args;
}

function normalizeHeader(value) {
  return String(value || '').replace(/^\uFEFF/, '').trim();
}

function rowsFromSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return [];
  }

  return xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false }).map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), String(value ?? '').trim()])),
  );
}

function numberField(row, key) {
  const value = Number.parseInt(row[key] || '0', 10);
  return Number.isFinite(value) ? value : 0;
}

function boolField(row, key, defaultValue = false) {
  if (row[key] === undefined || row[key] === '') {
    return defaultValue;
  }
  return ['1', 'true', 'yes', 'sí', 'si'].includes(String(row[key]).trim().toLowerCase());
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'article';
}

function normalizeCategory(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return CATEGORY_SLUGS.includes(normalized) ? normalized : '';
}

function classifyArticle(text) {
  const normalized = String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const scores = Object.fromEntries(CATEGORY_SLUGS.map((category) => [category, 0]));

  for (const [category, words] of Object.entries(KEYWORDS)) {
    for (const word of words) {
      const needle = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const matches = normalized.match(new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'));
      scores[category] += matches ? matches.length : 0;
    }
  }

  const [bestCategory, bestScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return bestScore > 0 ? bestCategory : DEFAULT_CATEGORY;
}

function loadWorkbook(xlsxPath) {
  const resolved = path.resolve(xlsxPath);
  readFileSync(resolved);
  return xlsx.readFile(resolved);
}

function buildPayloads(workbook) {
  const articleRows = rowsFromSheet(workbook, 'Articles');
  const contentRows = rowsFromSheet(workbook, 'Content');
  const affiliateRows = rowsFromSheet(workbook, 'Afiliados');
  const newsletterRows = rowsFromSheet(workbook, 'Newsletter');
  const newsletterTemplateRows = rowsFromSheet(workbook, 'Newsletter Template');
  const articlesById = new Map();
  const articlePayloads = [];

  for (const row of articleRows) {
    const id = numberField(row, 'id');
    const deleted = numberField(row, 'deleted');
    if (id > 0) {
      articlePayloads.push({
        externalArticleId: id,
        name: row.name || '',
        deleted: deleted !== 0,
        post: row.post || '',
        category: DEFAULT_CATEGORY,
        imagePath: `/articles/${id}.png`,
        rawFields: row,
      });
    }

    if (id > 0 && deleted === 0) {
      articlesById.set(id, {
        id,
        name: row.name || '',
        rawFields: row,
      });
    }
  }

  const activeContentRows = contentRows.filter((row) => {
    const articleId = numberField(row, 'article_id');
    return articleId > 0 && articlesById.has(articleId) && boolField(row, 'published') && (row.title || row.content_text);
  });

  const textByArticle = new Map();
  for (const row of activeContentRows) {
    const articleId = numberField(row, 'article_id');
    const text = [row.title, row.content_text, row.lyrics].filter(Boolean).join('\n');
    textByArticle.set(articleId, `${textByArticle.get(articleId) || ''}\n${text}`);
  }

  const categoryByArticle = new Map();
  for (const [articleId, text] of textByArticle) {
    const rowCategory = normalizeCategory(activeContentRows.find((row) => numberField(row, 'article_id') === articleId)?.category);
    categoryByArticle.set(articleId, rowCategory || classifyArticle(text));
  }

  const affiliatesByArticle = new Map();
  for (const row of affiliateRows) {
    const externalArticleId = numberField(row, 'article_id');
    if (!externalArticleId || !boolField(row, 'active')) {
      continue;
    }

    const ad = {
      externalArticleId,
      productName: row.product_name || '',
      asin: row.asin || '',
      affiliateUrl: row.affiliate_url || '',
      position: numberField(row, 'position'),
      active: boolField(row, 'active'),
      imageUrl: row.image_url || '',
    };

    if (!ad.productName || !ad.affiliateUrl || !ad.imageUrl) {
      continue;
    }

    const current = affiliatesByArticle.get(externalArticleId) || [];
    current.push(ad);
    affiliatesByArticle.set(externalArticleId, current);
  }

  const seen = new Set();
  const duplicateRows = [];
  const payloads = [];
  const byLanguage = {};
  const byCategory = {};
  let fallbackCategoryCount = 0;

  for (const row of activeContentRows) {
    const externalArticleId = numberField(row, 'article_id');
    const externalContentId = numberField(row, 'id');
    const language = String(row.language || 'es').trim().toLowerCase();
    const key = `${externalArticleId}:${language}`;

    if (seen.has(key)) {
      duplicateRows.push({ key, externalContentId, title: row.title });
      continue;
    }
    seen.add(key);

    const category = categoryByArticle.get(externalArticleId) || DEFAULT_CATEGORY;
    if (category === DEFAULT_CATEGORY) {
      fallbackCategoryCount += 1;
    }

    byLanguage[language] = (byLanguage[language] || 0) + 1;
    byCategory[category] = (byCategory[category] || 0) + 1;

    payloads.push({
      articleGroup: {
        externalArticleId,
        name: articlesById.get(externalArticleId)?.name || row.title,
        deleted: false,
        post: articlesById.get(externalArticleId)?.rawFields?.post || '',
        category,
        imagePath: `/articles/${externalArticleId}.png`,
        rawFields: articlesById.get(externalArticleId)?.rawFields || {},
      },
      content: {
        externalArticleId,
        externalContentId,
        language,
        slug: slugify(row.title),
        title: row.title || articlesById.get(externalArticleId)?.name || `Article ${externalArticleId}`,
        contentText: row.content_text || '',
        lyrics: row.lyrics || '',
        imagePath: `/articles/${externalArticleId}.png`,
        publishedDate: row.published_date || new Date().toISOString(),
        published: true,
        category,
        rawFields: row,
      },
      affiliates: affiliatesByArticle.get(externalArticleId) || [],
    });
  }

  const newsletterPayloads = newsletterRows
    .filter((row) => row.email)
    .map((row) => ({
      email: String(row.email || '').trim().toLowerCase(),
      subscribed: boolField(row, 'subscribed', true),
      signedDate: row.signed_date || row.signedDate || new Date().toISOString(),
      language: String(row.language || 'es').trim().toLowerCase(),
      rawFields: row,
    }));

  const newsletterTemplatePayloads = newsletterTemplateRows
    .filter((row) => row.language && row.template)
    .map((row) => ({
      language: String(row.language || 'es').trim().toLowerCase(),
      template: row.template || '',
      rawFields: row,
    }));

  return {
    source: {
      articleRows: articleRows.length,
      activeArticles: articlesById.size,
      contentRows: contentRows.length,
      activeContentRows: activeContentRows.length,
      affiliateRows: affiliateRows.length,
      newsletterRows: newsletterRows.length,
      newsletterTemplateRows: newsletterTemplateRows.length,
    },
    articlePayloads,
    payloads,
    newsletterPayloads,
    newsletterTemplatePayloads,
    duplicateRows,
    fallbackCategoryCount,
    byLanguage,
    byCategory,
  };
}

async function migrate(prepared, batchSize) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  const token = process.env.KIDZCOOP_CONVEX_WRITE_TOKEN;

  if (!convexUrl || !token) {
    throw new Error('Set NEXT_PUBLIC_CONVEX_URL/CONVEX_URL and KIDZCOOP_CONVEX_WRITE_TOKEN before running without --dry-run.');
  }

  const client = new ConvexHttpClient(convexUrl);
  const summary = { articles: null, contentCreated: 0, contentUpdated: 0, newsletter: null, newsletterTemplates: null, errors: [], verified: 0, verificationErrors: [] };
  const affiliatesSent = new Set();

  summary.articles = await client.mutation(api.articles.importArticles, {
    token,
    rows: prepared.articlePayloads,
    source: 'migration',
  });

  for (let index = 0; index < prepared.payloads.length; index += batchSize) {
    const batch = prepared.payloads.slice(index, index + batchSize);
    for (const payload of batch) {
      try {
        const shouldSendAffiliates = !affiliatesSent.has(payload.content.externalArticleId);
        const result = await client.mutation(api.articles.upsertContentFromMake, {
          token,
          article: payload.articleGroup,
          content: payload.content,
          affiliates: shouldSendAffiliates ? payload.affiliates : [],
          source: 'migration',
        });
        affiliatesSent.add(payload.content.externalArticleId);
        if (result.action === 'created') {
          summary.contentCreated += 1;
        } else {
          summary.contentUpdated += 1;
        }
      } catch (error) {
        summary.errors.push({
          externalArticleId: payload.content.externalArticleId,
          language: payload.content.language,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  summary.newsletter = await client.mutation(api.articles.importNewsletter, {
    token,
    rows: prepared.newsletterPayloads,
    source: 'migration',
  });
  summary.newsletterTemplates = await client.mutation(api.articles.importNewsletterTemplates, {
    token,
    rows: prepared.newsletterTemplatePayloads,
    source: 'migration',
  });

  for (const payload of prepared.payloads) {
    if (summary.verificationErrors.length >= 20) {
      break;
    }
    const article = await client.query(api.articles.byExternalId, {
      externalArticleId: payload.content.externalArticleId,
      language: payload.content.language,
    });

    if (!article || article.title !== payload.content.title || article.content_text !== payload.content.contentText) {
      summary.verificationErrors.push({
        externalArticleId: payload.content.externalArticleId,
        language: payload.content.language,
        reason: article ? 'content mismatch' : 'missing in Convex',
      });
    } else {
      summary.verified += 1;
    }
  }

  summary.convex = await client.query(api.articles.migrationSummary, { token });
  return summary;
}

async function main() {
  const args = parseArgs();
  if (!args.xlsxPath) {
    throw new Error('Usage: npm run migrate:articles -- --xlsx "/path/to/KidScoop Articles.xlsx" [--dry-run]');
  }

  const workbook = loadWorkbook(args.xlsxPath);
  const prepared = buildPayloads(workbook);
  const baseSummary = {
    source: prepared.source,
    articleRowsPrepared: prepared.articlePayloads.length,
    articlesPrepared: prepared.payloads.length,
    newsletterPrepared: prepared.newsletterPayloads.length,
    newsletterTemplatesPrepared: prepared.newsletterTemplatePayloads.length,
    duplicatesDetected: prepared.duplicateRows.length,
    duplicateSamples: prepared.duplicateRows.slice(0, 10),
    articlesWithoutStrongCategory: prepared.fallbackCategoryCount,
    classifiedByCategory: prepared.byCategory,
    byLanguage: prepared.byLanguage,
  };

  if (args.dryRun) {
    console.log(JSON.stringify({ mode: 'dry-run', ...baseSummary }, null, 2));
    return;
  }

  const migration = await migrate(prepared, args.batchSize);
  console.log(JSON.stringify({ mode: 'migration', ...baseSummary, migration }, null, 2));
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] === scriptPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
