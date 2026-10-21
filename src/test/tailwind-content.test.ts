import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Feature folders moved out of src/components once and every class in them silently vanished.
describe('tailwind content globs', () => {
  it('scan all of src/', () => {
    const config = readFileSync(join(process.cwd(), 'tailwind.config.ts'), 'utf8');
    expect(config).toContain('"./src/**/*.{js,ts,jsx,tsx,mdx}"');
  });
});
