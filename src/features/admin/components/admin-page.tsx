"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';

type AdminData = {
  articles: Array<{ externalArticleId: number; name: string; deleted: boolean; category: string }>;
  content: Array<{ externalArticleId: number; externalContentId: number; language: string; title: string; published: boolean; category: string }>;
  affiliateAds: Array<{ externalArticleId: number; productName: string; asin: string; affiliateUrl: string; position: number; active: boolean; imageUrl: string }>;
  newsletter: Array<{ email: string; subscribed: boolean; signedDate: string; language: string }>;
  newsletterTemplates: Array<{ language: string; template: string }>;
};

const emptyAffiliate = {
  externalArticleId: '',
  productName: '',
  asin: '',
  affiliateUrl: '',
  position: '1',
  active: true,
  imageUrl: '',
};

export default function AdminPageClient({ language }: { language: string }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [affiliate, setAffiliate] = useState(emptyAffiliate);
  const [tab, setTab] = useState<'content' | 'affiliates' | 'newsletter'>('content');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/content', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Admin data unavailable');
      }
      setData(json);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Admin data unavailable');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => ({
    articles: data?.articles.length || 0,
    content: data?.content.length || 0,
    affiliates: data?.affiliateAds.length || 0,
    newsletter: data?.newsletter.length || 0,
  }), [data]);

  async function saveAffiliate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsertAffiliate',
          affiliate: {
            ...affiliate,
            externalArticleId: Number(affiliate.externalArticleId),
            position: Number(affiliate.position),
          },
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Could not save affiliate');
      }
      setAffiliate(emptyAffiliate);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save affiliate');
    } finally {
      setSaving(false);
    }
  }

  return <main className="min-h-screen bg-[#fbf9ff] px-4 py-8 text-slate-950 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-[#581c87] p-7 text-white shadow-xl shadow-purple-950/15">
        <p className="text-sm font-black uppercase tracking-[.2em] text-yellow-300">KidZcoop admin</p>
        <h1 className="mt-2 text-4xl font-black">Contenido y afiliados</h1>
        <p className="mt-3 max-w-2xl text-purple-100">Acceso restringido a ba0344@gmail.com. Los cambios se escriben en Convex usando el token del servidor.</p>
      </div>

      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div>}

      {loading && <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">Cargando...</div>}

      {data && !loading && <>
        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          {Object.entries(totals).map(([label, value]) => <div key={label} className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"><p className="text-sm font-black uppercase text-purple-700">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
          {(['content', 'affiliates', 'newsletter'] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-5 py-2.5 text-sm font-black ${tab === item ? 'bg-[#581c87] text-white' : 'bg-white text-[#581c87]'}`}>{item}</button>)}
        </div>

        {tab === 'content' && <section className="mt-5 overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
          <div className="max-h-[34rem] overflow-auto">
            <table className="w-full min-w-[58rem] text-left text-sm">
              <thead className="sticky top-0 bg-purple-50 text-xs uppercase text-purple-900"><tr><th className="p-3">Article</th><th className="p-3">Content</th><th className="p-3">Lang</th><th className="p-3">Category</th><th className="p-3">Published</th><th className="p-3">Title</th></tr></thead>
              <tbody>{data.content.map((row) => <tr key={`${row.externalArticleId}-${row.language}`} className="border-t border-purple-50"><td className="p-3">{row.externalArticleId}</td><td className="p-3">{row.externalContentId}</td><td className="p-3">{row.language}</td><td className="p-3">{row.category}</td><td className="p-3">{row.published ? 'yes' : 'no'}</td><td className="p-3 font-semibold">{row.title}</td></tr>)}</tbody>
            </table>
          </div>
        </section>}

        {tab === 'affiliates' && <section className="mt-5 grid gap-5 lg:grid-cols-[24rem_1fr]">
          <form onSubmit={saveAffiliate} className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Crear o actualizar afiliado</h2>
            {[
              ['externalArticleId', 'Article ID'],
              ['productName', 'Producto'],
              ['asin', 'ASIN'],
              ['affiliateUrl', 'URL afiliado'],
              ['imageUrl', 'URL imagen'],
              ['position', 'Posición'],
            ].map(([key, label]) => <label key={key} className="mt-4 block text-sm font-bold text-slate-700">{label}<input value={(affiliate as any)[key]} onChange={(event) => setAffiliate((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-purple-100 px-3 py-2 outline-none focus:border-purple-500" /></label>)}
            <label className="mt-4 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={affiliate.active} onChange={(event) => setAffiliate((current) => ({ ...current, active: event.target.checked }))} /> Activo</label>
            <button disabled={saving} className="mt-5 w-full rounded-full bg-[#581c87] px-5 py-3 font-black text-white disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar afiliado'}</button>
          </form>
          <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
            <div className="max-h-[34rem] overflow-auto">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="sticky top-0 bg-purple-50 text-xs uppercase text-purple-900"><tr><th className="p-3">Article</th><th className="p-3">Position</th><th className="p-3">Active</th><th className="p-3">ASIN</th><th className="p-3">Product</th></tr></thead>
                <tbody>{data.affiliateAds.map((row) => <tr key={`${row.externalArticleId}-${row.asin}-${row.position}`} className="border-t border-purple-50"><td className="p-3">{row.externalArticleId}</td><td className="p-3">{row.position}</td><td className="p-3">{row.active ? 'yes' : 'no'}</td><td className="p-3">{row.asin}</td><td className="p-3 font-semibold">{row.productName}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>}

        {tab === 'newsletter' && <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm"><div className="max-h-[32rem] overflow-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-purple-50 text-xs uppercase text-purple-900"><tr><th className="p-3">Email</th><th className="p-3">Lang</th><th className="p-3">Subscribed</th></tr></thead><tbody>{data.newsletter.map((row) => <tr key={row.email} className="border-t border-purple-50"><td className="p-3 font-semibold">{row.email}</td><td className="p-3">{row.language}</td><td className="p-3">{row.subscribed ? 'yes' : 'no'}</td></tr>)}</tbody></table></div></div>
          <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Templates</h2><div className="mt-4 space-y-4">{data.newsletterTemplates.map((row) => <div key={row.language} className="rounded-2xl bg-purple-50 p-4"><p className="font-black uppercase text-purple-800">{row.language}</p><p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-slate-700">{row.template}</p></div>)}</div></div>
        </section>}
      </>}
    </div>
  </main>;
}
