import { permanentRedirect } from 'next/navigation';

export default function LegacyContentPage({
  params,
}: {
  params: { language: string; id: string };
}) {
  permanentRedirect(`/${params.language}/article/${params.id}`);
}
