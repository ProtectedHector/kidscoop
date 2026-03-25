import { Metadata } from 'next';
import { generateMetadata as generateArticleMetadata } from './metadata';

export async function generateMetadata({
  params,
}: {
  params: { language: string; id: string };
}): Promise<Metadata> {
  return generateArticleMetadata({ params });
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
