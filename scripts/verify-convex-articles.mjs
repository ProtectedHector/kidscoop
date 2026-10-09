#!/usr/bin/env node
import 'dotenv/config';
import process from 'node:process';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  const token = process.env.KIDZCOOP_CONVEX_WRITE_TOKEN;

  if (!convexUrl || !token) {
    throw new Error('Set NEXT_PUBLIC_CONVEX_URL/CONVEX_URL and KIDZCOOP_CONVEX_WRITE_TOKEN first.');
  }

  const client = new ConvexHttpClient(convexUrl);
  const summary = await client.query(api.articles.migrationSummary, { token });
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
