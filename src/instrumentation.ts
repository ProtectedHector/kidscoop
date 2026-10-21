import { clerkEnabled } from '@/lib/env.client';
import { assertServerEnv, isNodeRuntime, isProductionDeployment } from '@/lib/env.server';

/** Runs once when a server instance boots. */
export async function register() {
  // Refuse to start with a broken environment.
  assertServerEnv();

  // Clerk is optional, but on the live site missing keys mean nobody can sign in: tell the admin.
  if (isNodeRuntime() && isProductionDeployment() && !clerkEnabled) {
    const { reportAuthAlert } = await import('@/features/auth/public.server');
    await reportAuthAlert('clerk_not_configured', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
  }
}
