import { notFound } from 'next/navigation';
import AdminPageClient from '../../../components/AdminPageClient';
import { requireAdminIdentity } from '../../../lib/admin';
import { isSupportedLanguage } from '../../../lib/languages';

export default async function AdminPage({ params }: { params: { language: string } }) {
  if (!isSupportedLanguage(params.language)) {
    notFound();
  }

  const admin = await requireAdminIdentity();
  if (!admin) {
    notFound();
  }

  return <AdminPageClient language={params.language} />;
}
