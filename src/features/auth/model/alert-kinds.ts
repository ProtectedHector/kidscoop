/** Ways sign-in can fail. Keep in sync with `alertKind` in convex/schema.ts. */
export const ALERT_KINDS = ['clerk_not_configured', 'clerk_load_failed', 'oauth_failed', 'user_sync_failed'] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

/** Kinds a browser may report. The other two are detected on the server, which is more reliable. */
export const CLIENT_ALERT_KINDS = ['clerk_load_failed', 'oauth_failed'] as const satisfies readonly AlertKind[];
export type ClientAlertKind = (typeof CLIENT_ALERT_KINDS)[number];

export function isClientAlertKind(value: unknown): value is ClientAlertKind {
  return typeof value === 'string' && (CLIENT_ALERT_KINDS as readonly string[]).includes(value);
}

/** What the visitor is told for each kind of problem (translation key prefixes). */
export type LoginProblem = 'unavailable' | 'oauth_failed' | 'sync_failed';

const SUBJECTS: Record<AlertKind, string> = {
  clerk_not_configured: 'Sign-in is switched off in production (Clerk keys missing)',
  clerk_load_failed: 'Clerk failed to load for visitors',
  oauth_failed: 'Sign-in with Google is failing',
  user_sync_failed: 'Signed-in users are not being saved to Convex',
};

/** The alert email for `kind`. `failures` is how many failures it covers. */
export function buildAlertEmail(kind: AlertKind, failures: number, detail?: string) {
  const lines = [
    SUBJECTS[kind],
    '',
    `Failures since the last email: ${failures}`,
    `Kind: ${kind}`,
    ...(detail ? [`Last detail: ${detail}`] : []),
    '',
    'You get at most one email per kind per hour. Rows are in the Convex "alerts" table.',
  ];
  return { subject: `[KidZcoop] ${SUBJECTS[kind]}`, text: lines.join('\n') };
}
