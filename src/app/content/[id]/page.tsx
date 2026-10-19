import { permanentRedirect } from 'next/navigation';

export default function LegacyContentPage({
  params,
}: {
  params: { id: string };
}) {
  permanentRedirect(`/en/article/${params.id}`);
}
