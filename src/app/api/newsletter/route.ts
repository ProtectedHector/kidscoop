import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LOG_DIR = process.env.VERCEL
  ? '/tmp/kidzcoop-logs'
  : path.join(process.cwd(), 'logs');
const GOOGLE_SHEETS_NEWSLETTER_URL = process.env.GOOGLE_SHEETS_NEWSLETTER_URL || '';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function ensureNewsletterFile(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, 'email,subscribed,signed_date\n', 'utf8');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const signedDate = new Date().toISOString();

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    if (GOOGLE_SHEETS_NEWSLETTER_URL) {
      const response = await fetch(GOOGLE_SHEETS_NEWSLETTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          email,
          subscribed: 'TRUE',
          signed_date: signedDate,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to save newsletter signup (${response.status})`);
      }

      return NextResponse.json({ success: true });
    }

    const logDir = process.env.LOG_DIR || DEFAULT_LOG_DIR;
    const logFile = path.join(logDir, 'newsletter.csv');
    const row = [email, 'TRUE', signedDate].map(escapeCsv).join(',');

    await ensureNewsletterFile(logFile);
    await fs.appendFile(logFile, `${row}\n`, 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Error saving newsletter signup:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
