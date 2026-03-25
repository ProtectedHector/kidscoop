import { redirect } from 'next/navigation';

export default function LegacyContentPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/en/article/${params.id}`);
}
