import type { Metadata } from 'next';
import AuthPageShell from '@/components/layout/auth-page-shell';
import { SignInPanel } from '@/features/auth/public';
import { clerkEnabled } from '@/lib/env.client';
import { translate } from '@/lib/i18n';

type Params = { language: string };

// Account pages stay out of Google and out of the sitemap.
export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const { language } = await props.params;
  return { title: translate(language, 'auth.signInTitle'), robots: { index: false, follow: false } };
}

export default async function SignInPage(props: { params: Promise<Params> }) {
  const { language } = await props.params;
  return (
    <AuthPageShell title={translate(language, 'auth.signInTitle')} intro={translate(language, 'auth.signInIntro')}>
      {clerkEnabled ? (
        <SignInPanel language={language} />
      ) : (
        <p className="rounded-2xl border border-purple-100 bg-white p-6 text-slate-600 shadow-sm">
          <strong className="block text-[#581c87]">{translate(language, 'auth.unavailableTitle')}</strong>
          {translate(language, 'auth.unavailableBody')}
        </p>
      )}
    </AuthPageShell>
  );
}
