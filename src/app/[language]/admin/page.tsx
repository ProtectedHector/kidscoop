import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminPage as AdminPageClient } from '@/features/admin/public';
import { requireAdminIdentity } from '@/features/admin/public.server';
import { isSupportedLanguage } from '@/lib/languages';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPage(props: { params: Promise<{ language: string }> }) {
  const params = await props.params;
  if (!isSupportedLanguage(params.language)) {
    notFound();
  }

  const admin = await requireAdminIdentity();
  if (!admin) {
    notFound();
  }

  return <AdminPageClient language={params.language} />;
}
