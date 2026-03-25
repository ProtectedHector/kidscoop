import { redirect } from 'next/navigation';

export default function LegacyContentPage({
  params,
}: {
  params: { language: string; id: string };
}) {
  redirect(`/${params.language}/article/${params.id}`);
}
