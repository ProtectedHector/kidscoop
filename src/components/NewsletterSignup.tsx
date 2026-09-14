"use client";

import { FormEvent, useMemo, useState } from 'react';

type NewsletterCopy = {
  eyebrow: string;
  title: string;
  body: string;
  placeholder: string;
  button: string;
  submitting: string;
  success: string;
  error: string;
  privacy: string;
};

const copyByLanguage: Record<string, NewsletterCopy> = {
  es: {
    eyebrow: 'Newsletter',
    title: 'Una historia nueva en tu buzón',
    body: 'Apúntate para recibir una historia semanal de KidZcoop y algunas sorpresas para leer, escuchar, colorear o jugar en familia.',
    placeholder: 'tu@email.com',
    button: 'Apuntarme',
    submitting: 'Guardando...',
    success: 'Listo. Te avisaremos con la próxima historia.',
    error: 'No hemos podido guardar tu email. Inténtalo de nuevo en un momento.',
    privacy: 'Solo usaremos tu email para enviarte la newsletter de KidZcoop.',
  },
  en: {
    eyebrow: 'Newsletter',
    title: 'A new story in your inbox',
    body: 'Sign up to receive one weekly KidZcoop story and a few surprises for reading, listening, coloring, or playing together.',
    placeholder: 'you@email.com',
    button: 'Sign up',
    submitting: 'Saving...',
    success: 'You are in. We will send the next story your way.',
    error: 'We could not save your email. Please try again in a moment.',
    privacy: 'We will only use your email for the KidZcoop newsletter.',
  },
};

interface NewsletterSignupProps {
  language: string;
  variant?: 'panel' | 'inline' | 'compact';
}

export default function NewsletterSignup({ language, variant = 'panel' }: NewsletterSignupProps) {
  const copy = useMemo(() => copyByLanguage[language] || copyByLanguage.en, [language]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kidzcoop-Language': language,
        },
        body: JSON.stringify({ email, language }),
      });

      if (!response.ok) {
        throw new Error('Newsletter signup failed');
      }

      setEmail('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const panelClass = {
    panel: 'rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md md:p-8',
    compact: 'rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md',
    inline: '',
  }[variant];
  const titleClass = variant === 'compact'
    ? 'text-xl font-black text-white'
    : 'text-2xl font-black text-white md:text-3xl';
  const bodyClass = variant === 'compact'
    ? 'mt-3 text-sm leading-relaxed text-white/75'
    : 'mt-3 max-w-2xl text-base leading-relaxed text-white/75';
  const formClass = variant === 'compact'
    ? 'mt-5 flex flex-col gap-3'
    : 'mt-6 flex flex-col gap-3 sm:flex-row';

  return (
    <section className={panelClass} aria-labelledby="newsletter-title">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-200">{copy.eyebrow}</p>
      <h2 id="newsletter-title" className={titleClass}>{copy.title}</h2>
      <p className={bodyClass}>{copy.body}</p>

      <form onSubmit={handleSubmit} className={formClass}>
        <label className="sr-only" htmlFor="newsletter-email">Email</label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.placeholder}
          className="min-h-12 flex-1 rounded-full border border-white/20 bg-white/95 px-5 text-base text-slate-900 outline-none transition focus:border-yellow-200 focus:ring-4 focus:ring-yellow-200/30"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="min-h-12 rounded-full bg-yellow-300 px-6 text-base font-black text-slate-950 shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'submitting' ? copy.submitting : copy.button}
        </button>
      </form>

      <p className="mt-3 text-sm text-white/55">{copy.privacy}</p>
      {status === 'success' && <p className="mt-4 text-sm font-semibold text-emerald-200">{copy.success}</p>}
      {status === 'error' && <p className="mt-4 text-sm font-semibold text-rose-200">{copy.error}</p>}
    </section>
  );
}
