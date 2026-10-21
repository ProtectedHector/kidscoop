import { describe, expect, it } from 'vitest';
import { buildAlertEmail, isClientAlertKind } from '@/features/auth/model/alert-kinds';

describe('alert kinds', () => {
  it('lets browsers report only what they can see', () => {
    expect(isClientAlertKind('oauth_failed')).toBe(true);
    expect(isClientAlertKind('clerk_load_failed')).toBe(true);
    expect(isClientAlertKind('user_sync_failed')).toBe(false);
    expect(isClientAlertKind('clerk_not_configured')).toBe(false);
    expect(isClientAlertKind({ kind: 'oauth_failed' })).toBe(false);
  });

  it('builds an email with the failure count', () => {
    const email = buildAlertEmail('oauth_failed', 3, 'oauth_access_denied');
    expect(email.subject).toBe('[KidZcoop] Sign-in with Google is failing');
    expect(email.text).toContain('Failures since the last email: 3');
    expect(email.text).toContain('Last detail: oauth_access_denied');
  });
});
