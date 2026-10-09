"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { getFavorites, type FavoriteStory } from '../lib/favorites';
import { trackEvent } from '@/lib/analytics';
import { CLERK_ENABLED } from '@/lib/auth';

export default function FavoritesPage({ language }: { language: string }) {
  const [favorites, setFavorites] = useState<FavoriteStory[]>([]);
  useEffect(() => {
    const refresh = () => setFavorites(getFavorites().filter((item) => item.language === language));
    refresh();
    window.addEventListener('kidzcoop:favorites', refresh);
    return () => window.removeEventListener('kidzcoop:favorites', refresh);
  }, [language]);
  const spanish = language === 'es';

  return <main className="mx-auto min-h-[65vh] max-w-6xl px-4 py-12 sm:px-6"><p className="text-sm font-black uppercase tracking-[.18em] text-purple-700">{spanish ? 'Tu biblioteca' : 'Your library'}</p><h1 className="mt-2 text-4xl font-black">{spanish ? 'Mis favoritas' : 'My favorites'}</h1><p className="mt-3 max-w-2xl text-slate-600">{spanish ? 'Guarda historias en este dispositivo o inicia sesión para tenerlas en todos tus dispositivos.' : 'Save stories on this device or sign in to keep them across devices.'}</p>{CLERK_ENABLED && <><SignedOut><div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-[#581c87]">{spanish ? 'Guarda tus favoritos en cualquier dispositivo' : 'Keep your favorites on any device'}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{spanish ? 'Inicia sesión para sincronizarlos y no perderlos. Puedes seguir usando favoritos sin cuenta.' : 'Sign in to sync them and avoid losing them. You can still use favorites without an account.'}</p><SignInButton mode="modal"><button type="button" onClick={() => trackEvent('login_started', { source: 'favorites' })} className="mt-4 inline-flex min-h-11 rounded-full bg-[#581c87] px-5 py-2.5 font-black text-white">{spanish ? 'Continuar con Google' : 'Continue with Google'}</button></SignInButton></div></SignedOut><SignedIn><p className="mt-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">{spanish ? 'Favoritos sincronizados con tu cuenta' : 'Favorites synced with your account'}</p></SignedIn></>}{favorites.length === 0 ? <div className="mt-10 rounded-3xl border border-purple-100 bg-white p-10 text-center"><p className="text-5xl">♡</p><h2 className="mt-4 text-2xl font-black">{spanish ? 'Aún no has guardado historias' : 'No saved stories yet'}</h2><Link href={`/${language}#stories`} className="mt-6 inline-flex rounded-full bg-[#581c87] px-6 py-3 font-bold text-white">{spanish ? 'Descubrir historias' : 'Discover stories'}</Link></div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favorites.map((story) => <Link key={`${story.language}-${story.id}`} href={story.path} className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm"><div className="relative aspect-[4/3]"><Image src={story.image_path} alt={story.title} fill sizes="(min-width:1024px) 30vw, 50vw" className="object-cover" /></div><h2 className="p-5 text-xl font-black">{story.title}</h2></Link>)}</div>}</main>;
}
