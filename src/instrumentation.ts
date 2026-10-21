import { assertServerEnv } from '@/lib/env.server';

/** Runs once when a server instance boots: refuse to start with a broken environment. */
export function register() {
  assertServerEnv();
}
