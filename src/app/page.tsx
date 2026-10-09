import { redirect } from 'next/navigation';

export default function RootPage() {
  // Keep the root deterministic for SEO; middleware also respects a saved preference.
  redirect('/es');
}
