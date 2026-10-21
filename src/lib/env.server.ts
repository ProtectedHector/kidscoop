/**
 * Server-side environment access. The only module allowed to read a secret out of `process.env`.
 *
 * Validation is lazy, behind a `Proxy`, so `next build` never needs runtime secrets. One parse is
 * forced at server boot from `src/instrumentation.ts`, so a misconfigured server still fails fast.
 * Read properties at the point of use; destructuring `env` at module scope defeats the laziness.
 *
 * Why it's this way: [ADR 0001](../../docs/adr/0001-env-and-config-convention.md).
 */
import 'server-only';
import { formatEnvError, type ServerEnv, serverEnvSchema } from '@/lib/env.schema';

let parsed: ServerEnv | undefined;

function parseOnce(): ServerEnv {
  if (parsed) return parsed;

  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) throw new Error(formatEnvError(result.error, 'server'));

  parsed = result.data;
  return parsed;
}

/** Validated server environment. The first read parses everything and reports every problem at once. */
export const env: ServerEnv = new Proxy({} as ServerEnv, {
  get: (_target, key: string) => parseOnce()[key as keyof ServerEnv],
  has: (_target, key: string) => key in parseOnce(),
  ownKeys: () => Reflect.ownKeys(parseOnce()),
  getOwnPropertyDescriptor: (_target, key: string) => ({
    value: parseOnce()[key as keyof ServerEnv],
    enumerable: true,
    configurable: true,
    writable: false,
  }),
});

/** True on the live site only. Alerts are emailed there and just logged everywhere else. */
export function isProductionDeployment(): boolean {
  return env.VERCEL_ENV === 'production';
}

/** True in the Node.js server runtime (not Edge, not the browser). */
export function isNodeRuntime(): boolean {
  return process.env.NEXT_RUNTIME === 'nodejs';
}

/** Forces the one parse at server boot. Called from `register()` in `src/instrumentation.ts`. */
export function assertServerEnv(): void {
  if (!isNodeRuntime()) return;

  parseOnce();
}
