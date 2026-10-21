"use client";

import { useEffect, useState } from 'react';
import type { LoginProblem } from '@/features/auth/model/alert-kinds';
import { onLoginProblem } from '@/features/auth/model/login-problems';
import type { TranslationKey } from '@/lib/i18n';
import { translate } from '@/lib/i18n';

const COPY: Record<LoginProblem, { title: TranslationKey; body: TranslationKey }> = {
  unavailable: { title: 'auth.unavailableTitle', body: 'auth.unavailableBody' },
  oauth_failed: { title: 'auth.oauthFailedTitle', body: 'auth.oauthFailedBody' },
  sync_failed: { title: 'auth.syncFailedTitle', body: 'auth.syncFailedBody' },
};

/** A friendly, dismissible message when sign-in can't work. The rest of the site keeps working. */
export default function LoginProblemNotice({ language }: { language: string }) {
  const [problem, setProblem] = useState<LoginProblem | null>(null);

  useEffect(() => onLoginProblem(setProblem), []);

  if (!problem) return null;
  const copy = COPY[problem];

  return (
    <div
      role="status"
      className="fixed inset-x-3 top-[calc(4.5rem+env(safe-area-inset-top))] z-[60] mx-auto max-w-lg rounded-2xl border border-purple-100 bg-white p-4 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-2xl">🔑</span>
        <div className="flex-1">
          <p className="font-black text-[#581c87]">{translate(language, copy.title)}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{translate(language, copy.body)}</p>
        </div>
        <button
          type="button"
          onClick={() => setProblem(null)}
          className="rounded-full px-3 py-1 text-sm font-bold text-purple-800 hover:bg-purple-50"
        >
          {translate(language, 'auth.dismiss')}
        </button>
      </div>
    </div>
  );
}
