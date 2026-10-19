"use client";

import { Show, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { trackEvent } from '@/lib/analytics';
import { CLERK_ENABLED } from '@/lib/auth';

export default function AuthControls({ language }: { language: string }) {
  return CLERK_ENABLED ? <ClerkAuthControls language={language} /> : null;
}

function ClerkAuthControls({ language }: { language: string }) {
  const { user } = useUser();
  const spanish = language === 'es';
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            onClick={() => trackEvent('login_started', { source: 'header' })}
            className="min-h-10 rounded-full bg-[#581c87] px-4 text-sm font-black text-white shadow-sm transition hover:bg-purple-950"
          >
            {spanish ? 'Iniciar sesión' : 'Sign in'}
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="hidden max-w-[12rem] truncate text-sm font-semibold text-slate-600 xl:block">
          {email || (spanish ? 'Mi cuenta' : 'My account')}
        </div>
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
