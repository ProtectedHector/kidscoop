import type { ReactNode } from 'react';

/** Title, intro and centred card around a Clerk form (or the "not available" message). */
export default function AuthPageShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center px-4 py-12 text-center sm:px-6">
      <h1 className="text-3xl font-black text-[#581c87] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-slate-600">{intro}</p>
      <div className="mt-8 flex w-full justify-center">{children}</div>
    </main>
  );
}
