/**
 * Brevo, the only email provider. Newsletter contacts and transactional emails both go through here.
 * Every call answers `false` (instead of throwing) when Brevo isn't configured.
 */
import 'server-only';
import { env } from '@/lib/env.server';

const BREVO_API = 'https://api.brevo.com/v3';

async function brevoPost(path: string, body: unknown): Promise<boolean> {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return false;

  const response = await fetch(`${BREVO_API}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Brevo ${path} failed (${response.status})`);
  }
  return true;
}

/** Adds (or updates) a contact on the newsletter list. */
export async function addNewsletterContact(email: string): Promise<boolean> {
  const listId = env.BREVO_LIST_ID;
  if (!listId) return false;
  return await brevoPost('/contacts', { email, listIds: [listId], updateEnabled: true });
}

/** Sends one plain-text transactional email from `ALERT_SENDER_EMAIL`. */
export async function sendTransactionalEmail(message: { to: string; subject: string; text: string }): Promise<boolean> {
  return await brevoPost('/smtp/email', {
    sender: { email: env.ALERT_SENDER_EMAIL, name: 'KidZcoop' },
    to: [{ email: message.to }],
    subject: message.subject,
    textContent: message.text,
  });
}
