"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import LanguageSelector from './LanguageSelector';
import InstallAppButton from './InstallAppButton';
import AuthControls from './AuthControls';
import UserFavoritesSync from './UserFavoritesSync';

export default function SiteChrome({ children, language }: { children: ReactNode; language: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = language === 'es' ? { home: 'Inicio', stories: 'Historias', favorites: 'Favoritas', about: 'Sobre KidZcoop', contact: 'Contacto', more: 'Más', newsletter: 'Newsletter' } : { home: 'Home', stories: 'Stories', favorites: 'Favorites', about: 'About KidZcoop', contact: 'Contact', more: 'More', newsletter: 'Newsletter' };
  return <div className="min-h-screen bg-[#fbf9ff] text-slate-900">
    <UserFavoritesSync />
    <header className="sticky top-0 z-50 border-b border-purple-100/80 bg-white/90 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={`/${language}`} className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"><Image src="/social-logo.png" alt="KidZcoop" width={44} height={44} className="h-11 w-11 rounded-xl object-contain" priority /><span className="text-xl font-black tracking-tight text-[#581c87]">KidZcoop</span></Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegación principal"><Link href={`/${language}`} className="font-semibold hover:text-purple-800">{copy.home}</Link><Link href={`/${language}#stories`} className="font-semibold hover:text-purple-800">{copy.stories}</Link><Link href={`/${language}/favorites`} className="font-semibold hover:text-purple-800">{copy.favorites}</Link><Link href={`/${language}/about`} className="font-semibold hover:text-purple-800">{copy.about}</Link><LanguageSelector /><InstallAppButton compact /><AuthControls language={language} /></nav>
        <div className="flex items-center gap-2 lg:hidden"><AuthControls language={language} /><LanguageSelector /><button type="button" onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full bg-purple-50 text-xl text-purple-950" aria-expanded={menuOpen} aria-label={copy.more}>☰</button></div>
      </div>
      {menuOpen && <div className="absolute inset-x-3 top-[calc(4rem+env(safe-area-inset-top))] rounded-3xl border border-purple-100 bg-white p-4 shadow-2xl lg:hidden"><nav className="grid gap-1" aria-label={copy.more}><Link onClick={() => setMenuOpen(false)} href={`/${language}`} className="rounded-xl px-4 py-3 font-bold hover:bg-purple-50">⌂ {copy.home}</Link><Link onClick={() => setMenuOpen(false)} href={`/${language}#stories`} className="rounded-xl px-4 py-3 font-bold hover:bg-purple-50">◫ {copy.stories}</Link><Link onClick={() => setMenuOpen(false)} href={`/${language}/favorites`} className="rounded-xl px-4 py-3 font-bold hover:bg-purple-50">♡ {copy.favorites}</Link><Link onClick={() => setMenuOpen(false)} href={`/${language}#newsletter`} className="rounded-xl px-4 py-3 font-bold hover:bg-purple-50">✉ {copy.newsletter}</Link><Link onClick={() => setMenuOpen(false)} href={`/${language}/about`} className="rounded-xl px-4 py-3 font-bold hover:bg-purple-50">● {copy.about}</Link><Link onClick={() => setMenuOpen(false)} href={`/${language}/contact`} className="rounded-xl px-4 py-3 font-bold hover:bg-purple-50">@ {copy.contact}</Link><div className="px-4 py-3"><InstallAppButton /></div></nav></div>}
    </header>
    {children}
    <footer className="border-t border-purple-100 bg-white px-6 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-10 text-center md:pb-10"><p className="font-black text-[#581c87]">KidZcoop</p><p className="mt-2 text-sm text-slate-500">Historias y descubrimientos para disfrutar en familia.</p></footer>
    <nav className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-4 rounded-2xl border border-purple-100 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl md:hidden" aria-label="Navegación móvil"><Link href={`/${language}`} className="mobile-nav-item"><span aria-hidden="true">⌂</span>{copy.home}</Link><Link href={`/${language}#stories`} className="mobile-nav-item"><span aria-hidden="true">◫</span>{copy.stories}</Link><Link href={`/${language}/favorites`} className="mobile-nav-item"><span aria-hidden="true">♡</span>{copy.favorites}</Link><button type="button" onClick={() => setMenuOpen(!menuOpen)} className="mobile-nav-item"><span aria-hidden="true">☰</span>{copy.more}</button></nav>
  </div>;
}
