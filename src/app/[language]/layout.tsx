import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isSupportedLanguage } from '../../lib/languages';
import { generateMetadata as generateLanguageMetadata } from './metadata';

export async function generateMetadata(
  props: {
    params: Promise<{ language: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  return generateLanguageMetadata({ params });
}

export default async function Layout(
  props: {
    children: React.ReactNode;
    params: Promise<{ language: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  // Unknown first segments (e.g. /foo) must return a real 404, not an empty page.
  if (!isSupportedLanguage(params.language)) {
    notFound();
  }

  return <>{children}</>;
}
