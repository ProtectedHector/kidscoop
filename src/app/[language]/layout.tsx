import { Metadata } from 'next';
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
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
