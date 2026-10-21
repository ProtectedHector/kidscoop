import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const alias = {
  '@convex': fileURLToPath(new URL('./convex', import.meta.url)),
  '@': fileURLToPath(new URL('./src', import.meta.url)),
};

export default defineConfig({
  test: {
    projects: [
      {
        // Convex functions, run against convex-test's in-memory backend.
        test: {
          name: 'convex',
          environment: 'edge-runtime',
          server: { deps: { inline: ['convex-test'] } },
          include: ['convex/**/*.test.ts'],
        },
      },
      {
        // App code and repo-wide checks.
        resolve: { alias },
        test: {
          name: 'app',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
    ],
  },
});
