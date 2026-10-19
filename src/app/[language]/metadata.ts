import { Metadata } from 'next';
import { buildAlternates, buildPageMetadata } from '../../lib/seo';
import { getMetadataTranslations } from '../../translations/metadata';

export async function generateMetadata({
  params,
}: {
  params: { language: string };
}): Promise<Metadata> {
  const { language } = params;
  const { title, description } = getMetadataTranslations(
    language as Parameters<typeof getMetadataTranslations>[0],
  );

  const metadata = buildPageMetadata({
    language,
    title,
    description,
    path: `/${language}`,
    alternates: buildAlternates(language, (code) => `/${code}`),
  });

  // Translated titles already contain the brand, so skip the "| KidZcoop" template.
  return { ...metadata, title: { absolute: title } };
}
