"use client";

import { ClerkFailed, ClerkLoaded, ClerkLoading, useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';
import { reportLoginFailure, showLoginProblem } from '@/features/auth/model/login-problems';

/** How long Clerk may take to load before it counts as a failure. */
const LOAD_TIMEOUT_MS = 30_000;

function ReportLoadFailure({ detail }: { detail: string }) {
  useEffect(() => {
    reportLoginFailure('clerk_load_failed', detail);
  }, [detail]);
  return null;
}

function LoadTimeout() {
  useEffect(() => {
    const timer = window.setTimeout(() => reportLoginFailure('clerk_load_failed', 'timeout'), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}

/** Google sign-in errors land on the client's sign-in attempt; Clerk shows them, we also report them. */
function OAuthErrorWatcher() {
  const clerk = useClerk();

  useEffect(
    () =>
      clerk.addListener(({ client }) => {
        const verification = client?.signIn?.firstFactorVerification;
        const error = verification?.error;
        if (!error || !verification?.strategy?.startsWith('oauth_')) return;

        reportLoginFailure('oauth_failed', `${verification.strategy}: ${error.code}`);
        showLoginProblem('oauth_failed');
      }),
    [clerk],
  );
  return null;
}

/** Watches Clerk inside <ClerkProvider> and reports when visitors can't sign in. Renders nothing. */
export default function ClerkHealth() {
  return (
    <>
      <ClerkLoading>
        <LoadTimeout />
      </ClerkLoading>
      <ClerkFailed>
        <ReportLoadFailure detail="clerk-js failed to initialise" />
      </ClerkFailed>
      <ClerkLoaded>
        <OAuthErrorWatcher />
      </ClerkLoaded>
    </>
  );
}
