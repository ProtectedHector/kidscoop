/**
 * Proves the site reads its content from Convex only (ADR 0003): Google Sheets is gone, and the
 * only code that talks to Convex is the shared client in `src/lib/server/convex.ts`, the session
 * helper, and server-only `data/` files inside features.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '../..');

function sourceFiles(directory: string): string[] {
  return readdirSync(path.join(ROOT, directory), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ts|tsx|mjs|js)$/.test(entry.name))
    .map((entry) => path.relative(ROOT, path.join(entry.parentPath, entry.name)))
    .filter((file) => !file.includes('_generated') && !file.endsWith('.test.ts'));
}

const appFiles = sourceFiles('src');
const allFiles = [...appFiles, ...sourceFiles('convex'), ...sourceFiles('scripts')];
const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8');

/** Files allowed to construct a Convex client. */
const CLIENT_FACTORIES = ['src/lib/server/convex.ts'];
/** Files allowed to call Convex functions: the session helper and feature data files. */
const isConvexCaller = (file: string) => file === 'src/lib/session.ts' || /^src\/features\/[^/]+\/data\//.test(file);

describe('content comes only from Convex', () => {
  it('has no Google Sheets code left anywhere', () => {
    const sheetsPattern = /docs\.google\.com\/spreadsheets|googleapis|gviz|google-spreadsheet|\bsheets?\.googleapis/i;
    expect(allFiles.filter((file) => sheetsPattern.test(read(file)))).toEqual([]);
  });

  it('creates Convex clients only in src/lib/server/convex.ts', () => {
    const offenders = appFiles.filter((file) => /new ConvexHttpClient\(/.test(read(file)) && !CLIENT_FACTORIES.includes(file));
    expect(offenders).toEqual([]);
  });

  it('calls Convex functions only from feature data files', () => {
    const offenders = appFiles.filter((file) => /@convex\/_generated\/api/.test(read(file)) && !isConvexCaller(file));
    expect(offenders).toEqual([]);
  });

  it('keeps every Convex caller server-only', () => {
    const callers = appFiles.filter((file) => /@convex\/_generated\/api|convex\/browser/.test(read(file)));
    const clientSide = callers.filter((file) => !/^\s*(\/\*\*[\s\S]*?\*\/\s*)?import 'server-only';/.test(read(file)));
    expect(clientSide.filter((file) => !file.endsWith('.d.ts'))).toEqual([]);
  });

  it('reads public content through the week-long cache', () => {
    for (const file of ['src/features/articles/data/queries.ts', 'src/features/affiliates/data/queries.ts']) {
      expect(read(file)).toContain('contentCacheOptions');
    }
  });
});
