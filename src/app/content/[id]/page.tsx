import { permanentRedirect } from 'next/navigation';

export default async function LegacyContentPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  permanentRedirect(`/en/article/${params.id}`);
}
