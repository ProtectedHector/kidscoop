"use client";

import { useEffect, useState } from 'react';
import { getFavorites, saveAccountFavorites, setFavorites, type FavoriteStory } from '../lib/favorites';
import { trackEvent } from '../lib/analytics';

export default function FavoriteButton({ story }: { story: Omit<FavoriteStory, 'savedAt'> }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getFavorites().some((item) => item.id === story.id && item.language === story.language));
  }, [story.id, story.language]);

  function toggle() {
    const current = getFavorites();
    const exists = current.some((item) => item.id === story.id && item.language === story.language);
    const next = exists
      ? current.filter((item) => !(item.id === story.id && item.language === story.language))
      : [{ ...story, savedAt: new Date().toISOString() }, ...current];
    setFavorites(next);
    setSaved(!exists);
    void saveAccountFavorites(next).then((accountFavorites) => {
      if (accountFavorites) setFavorites(accountFavorites);
    });
    trackEvent(exists ? 'favorite_removed' : 'favorite_added', {
      story_id: story.id,
      language: story.language,
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-purple-100 bg-white px-5 py-2.5 text-sm font-black text-[#581c87] shadow-sm transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
    >
      <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
      {saved ? 'Guardado' : 'Guardar'}
    </button>
  );
}
