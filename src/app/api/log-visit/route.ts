import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LOG_DIR = process.env.VERCEL
  ? '/tmp/kidscoop-logs'
  : path.join(process.cwd(), 'logs');
const GOOGLE_SHEETS_VISITS_URL = process.env.GOOGLE_SHEETS_VISITS_URL || '';

async function ensureLogFile(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, 'date,type,article_id,language\n', 'utf8');
  }
}

export async function POST(request: Request) {
  try {
    const { article_id, language, type } = await request.json();
    const today = new Date().toISOString().split('T')[0];
    const articleIdValue = type === 'home' || !article_id ? '' : article_id;

    if (GOOGLE_SHEETS_VISITS_URL) {
      const response = await fetch(GOOGLE_SHEETS_VISITS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          date: today,
          type: type || 'unknown',
          article_id: articleIdValue,
          language: language || 'unknown',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to log visit to Google Sheets (${response.status})`);
      }

      return NextResponse.json({ success: true });
    }

    const logEntry = `${today},${type || 'unknown'},${articleIdValue},${language || 'unknown'}\n`;

    const logDir = process.env.LOG_DIR || DEFAULT_LOG_DIR;
    const logFile = path.join(logDir, 'visits.csv');

    await ensureLogFile(logFile);
    await fs.appendFile(logFile, logEntry, 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Error logging visit:', message);
    return NextResponse.json({ success: false, error: message });
  }
}
