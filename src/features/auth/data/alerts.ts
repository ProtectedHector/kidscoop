/**
 * Login-failure alerts: counted in Convex, emailed to the admin through Brevo at most once per
 * kind per hour. Only the live site emails; elsewhere the alert is just logged.
 * Never throws: reporting a failure must not cause another one.
 */
import 'server-only';
import { api } from '@convex/_generated/api';
import { ADMIN_EMAIL } from '@/features/admin/public.server';
import { type AlertKind, buildAlertEmail } from '@/features/auth/model/alert-kinds';
import { isProductionDeployment } from '@/lib/env.server';
import { sendTransactionalEmail } from '@/lib/server/brevo';
import { getConvexWriter } from '@/lib/server/convex';

export async function reportAuthAlert(kind: AlertKind, detail?: string): Promise<void> {
  console.warn(`[auth alert] ${kind}${detail ? `: ${detail}` : ''}`);

  try {
    if (!isProductionDeployment()) return;

    const writer = getConvexWriter();
    if (!writer) return;

    const { send, failures } = await writer.client.mutation(api.alerts.record, {
      token: writer.token,
      kind,
      ...(detail ? { detail } : {}),
    });
    if (!send) return;

    const sent = await sendTransactionalEmail({ to: ADMIN_EMAIL, ...buildAlertEmail(kind, failures, detail) });
    if (!sent) console.warn('[auth alert] BREVO_API_KEY is not set, so no email was sent.');
  } catch (error) {
    console.error('[auth alert] could not record or send the alert:', error);
  }
}
