import { currentUser } from '@clerk/nextjs/server';

export type AccountIdentity = {
  id: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  imageUrl?: string;
};

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

  const displayName = user.fullName || user.firstName || undefined;

  return {
    id: user.id,
    ...(email && isValidEmail(email) ? { email } : {}),
    emailVerified,
    ...(displayName ? { displayName } : {}),
    ...(user.imageUrl ? { imageUrl: user.imageUrl } : {}),
  };
}
