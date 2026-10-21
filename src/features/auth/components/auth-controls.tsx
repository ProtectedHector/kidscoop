"use client";

import { ClerkFailed, Show, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { showLoginProblem } from '@/features/auth/model/login-problems';
import { trackEvent } from '@/lib/analytics';
import { clerkEnabled } from '@/lib/env.client';
import { translate } from '@/lib/i18n';

const buttonClass =
  'min-h-10 rounded-full bg-[#581c87] px-4 text-sm font-black text-white shadow-sm transition hover:bg-purple-950';

/** Shown when sign-in can't work (Clerk off or failed to load): explains instead of doing nothing. */
function UnavailableSignInButton({ language }: { language: string }) {
  return (
    <button type="button" onClick={() => showLoginProblem('unavailable')} className={buttonClass}>
      {translate(language, 'auth.signIn')}
    </button>
  );
}

/** Header sign-in button (Google, in Clerk's modal) or the account menu once signed in. */
export default function AuthControls({ language }: { language: string }) {
  return clerkEnabled ? <ClerkAuthControls language={language} /> : <UnavailableSignInButton language={language} />;
}

function ClerkAuthControls({ language }: { language: string }) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex items-center gap-2">
      <ClerkFailed>
        <UnavailableSignInButton language={language} />
      </ClerkFailed>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" onClick={() => trackEvent('login_started', { source: 'header' })} className={buttonClass}>
            {translate(language, 'auth.signIn')}
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="hidden max-w-[12rem] truncate text-sm font-semibold text-slate-600 xl:block">{email}</div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-10 w-10',
            },
          }}
        />
      </Show>
    </div>
  );
}
