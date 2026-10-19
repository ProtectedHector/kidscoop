import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isSupportedLanguage } from '../../lib/languages';
import { generateMetadata as generateLanguageMetadata } from './metadata';

export async function generateMetadata({
  params,
}: {
  params: { language: string };
}): Promise<Metadata> {
  return generateLanguageMetadata({ params });
}

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { language: string };
}) {
  // Unknown first segments (e.g. /foo) must return a real 404, not an empty page.
  if (!isSupportedLanguage(params.language)) {
    notFound();
  }

  return <>{children}</>;
}
