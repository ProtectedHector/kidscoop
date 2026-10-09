"use client";

import { useState } from 'react';
import { usePWA } from './PWAProvider';

export default function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const { installed, isIOS, isSafari, canPrompt, install } = usePWA();
  const [showIOS, setShowIOS] = useState(false);
  const [message, setMessage] = useState('');

  if (installed || (!canPrompt && !(isIOS && isSafari))) return null;

  async function handleInstall() {
    const result = await install();
    if (result === 'ios') setShowIOS(true);
    if (result === 'dismissed') setMessage('Puedes instalarla más adelante desde el menú.');
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className={compact
          ? 'inline-flex min-h-11 items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-900 hover:bg-purple-100'
          : 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#581c87] px-6 py-3 font-bold text-white shadow-lg shadow-purple-950/20 transition hover:bg-purple-800'}
      >
        <span aria-hidden="true">📱</span> Instalar KidZcoop
      </button>
      {message && <span className="sr-only" role="status">{message}</span>}
      {showIOS && (
        <div className="fixed inset-0 z-[90] flex items-end bg-slate-950/50 p-3 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="ios-install-title" onClick={() => setShowIOS(false)}>
          <div className="w-full rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:max-w-md" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="text-sm font-bold uppercase tracking-wider text-purple-700">Lleva KidZcoop contigo</p><h2 id="ios-install-title" className="mt-1 text-2xl font-black">Instala KidZcoop en tu iPhone</h2></div>
              <button type="button" className="h-11 w-11 rounded-full bg-slate-100 text-xl" onClick={() => setShowIOS(false)} aria-label="Cerrar">×</button>
            </div>
            <ol className="space-y-4 text-base leading-relaxed">
              <li><strong>1.</strong> Pulsa el botón <strong>Compartir</strong> de Safari.</li>
              <li><strong>2.</strong> Selecciona <strong>Añadir a pantalla de inicio</strong>.</li>
              <li><strong>3.</strong> Pulsa <strong>Añadir</strong>.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
