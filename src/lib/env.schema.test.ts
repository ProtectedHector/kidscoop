import { describe, expect, it } from 'vitest';
import { clientEnvSchema, serverEnvSchema } from '@/lib/env.schema';

describe('serverEnvSchema', () => {
  it('accepts a local setup without Clerk, Brevo or the write token', () => {
    const result = serverEnvSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.ALERT_SENDER_EMAIL).toBe('contact@kidzcoop.app');
  });

  it('requires the write token in production', () => {
    const result = serverEnvSchema.safeParse({ VERCEL_ENV: 'production' });
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual(['KIDZCOOP_CONVEX_WRITE_TOKEN']);
  });

  it('rejects a half-configured Clerk', () => {
    const result = serverEnvSchema.safeParse({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_x', CLERK_SECRET_KEY: '' });
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual(['CLERK_SECRET_KEY']);
  });

  it('treats empty values as unset', () => {
    const result = serverEnvSchema.safeParse({ BREVO_LIST_ID: '', ALERT_SENDER_EMAIL: '' });
    expect(result.data?.BREVO_LIST_ID).toBeUndefined();
    expect(result.data?.ALERT_SENDER_EMAIL).toBe('contact@kidzcoop.app');
  });
});

describe('clientEnvSchema', () => {
  it('requires the Convex URL, since every story lives in Convex', () => {
    expect(clientEnvSchema.safeParse({}).success).toBe(false);
    expect(clientEnvSchema.safeParse({ NEXT_PUBLIC_CONVEX_URL: 'https://x.convex.cloud' }).success).toBe(true);
  });
});
