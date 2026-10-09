import { currentUser } from '@clerk/nextjs/server';
import type { AccountIdentity } from '@/lib/server/account-store';

type ClerkEmailAddress = {
  emailAddress?: string | null;
  verification?: {
    status?: string | null;
  } | null;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isVerifiedEmail(email?: ClerkEmailAddress | null) {
  return email?.verification?.status === 'verified';
}

export async function getAuthenticatedIdentity(): Promise<AccountIdentity | null> {
  const user = await currentUser();
  if (!user) return null;

  const primaryEmail = user.primaryEmailAddress as ClerkEmailAddress | null;
  const email = primaryEmail?.emailAddress?.trim().toLowerCase();
  const emailVerified = Boolean(email && isValidEmail(email) && isVerifiedEmail(primaryEmail));

  return {
    id: user.id,
    ...(email && isValidEmail(email) ? { email } : {}),
    emailVerified,
  };
}
