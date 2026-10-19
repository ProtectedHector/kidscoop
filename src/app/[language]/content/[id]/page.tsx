import { permanentRedirect } from 'next/navigation';

export default async function LegacyContentPage(
  props: {
    params: Promise<{ language: string; id: string }>;
  }
) {
  const params = await props.params;
  permanentRedirect(`/${params.language}/article/${params.id}`);
}
