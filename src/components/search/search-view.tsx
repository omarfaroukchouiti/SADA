'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, Search } from 'lucide-react';
import type { Surah, Verse } from '@/lib/types';
import { toArabicNumber } from '@/lib/utils';

type TranslationResult = {
  verseKey: string;
  surahNumber: number;
  ayah: number;
  translation: string;
  translationSource: string;
  matchedIn: string;
};
type SearchResponse = { data: { local: Verse[]; translations: TranslationResult[] } };

export function SearchView({ surahs }: { surahs: Pick<Surah, 'number' | 'nameArabic'>[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['data'] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const nameOf = (n: number) => surahs.find((s) => s.number === n)?.nameArabic ?? `سورة ${n}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setStatus('loading');
    try {
      const res = await fetch(`/api/quran/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('search failed');
      const json = (await res.json()) as SearchResponse;
      setResults(json.data);
      setStatus('ready');
    } catch {
      setResults(null);
      setStatus('error');
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">كلمة البحث</span>
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في النص القرآني…"
            className="h-12 w-full rounded-lg border border-line bg-elevated pr-10 pl-4 text-sm outline-none focus:border-primary"
          />
        </label>
        <button type="submit" className="rounded-lg bg-primary px-6 text-sm font-semibold text-on-primary">بحث</button>
      </form>

      <div className="mt-6 space-y-6">
        {status === 'loading' && <p className="flex items-center gap-2 text-sm text-ink-muted"><LoaderCircle size={16} className="animate-spin" /> جارٍ البحث…</p>}
        {status === 'error' && (
          <div className="rounded-xl border border-line bg-surface p-6 text-sm">
            <p>تعذّر إجراء البحث. حاول مرة أخرى.</p>
            <button type="submit" className="mt-3 rounded-md bg-primary px-3 py-2 text-xs text-on-primary">إعادة المحاولة</button>
          </div>
        )}
        {status === 'idle' && <p className="text-sm text-ink-muted">أدخل كلمة للبحث في نص القرآن الكريم وفي الترجمات.</p>}
        {status === 'ready' && results && !results.local.length && !results.translations.length && (
          <p className="rounded-xl border border-line bg-surface p-6 text-sm text-ink-muted">لا توجد نتائج مطابقة. جرّب كلمة أخرى.</p>
        )}

        {status === 'ready' && results?.local.length ? (
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">نتائج النص القرآني <span className="text-xs font-normal text-ink-muted">(Tanzil)</span></h2>
            <div className="space-y-2">
              {results.local.map((v) => (
                <Link key={`${v.surah}:${v.ayah}`} href={`/quran/${v.surah}/${v.ayah}`} className="block rounded-lg border border-line bg-surface p-4 hover:border-primary/40">
                  <p dir="rtl" lang="ar" className="quran-text text-lg">{v.text}</p>
                  <p className="mt-2 text-xs text-ink-muted">{nameOf(v.surah)} — الآية {toArabicNumber(v.ayah)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {status === 'ready' && results?.translations.length ? (
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">نتائج الترجمات <span className="text-xs font-normal text-ink-muted">(UmmahAPI — ليست النص القرآني)</span></h2>
            <div className="space-y-2">
              {results.translations.map((r, i) => (
                <Link key={`${r.verseKey}-${i}`} href={`/quran/${r.surahNumber}/${r.ayah}`} className="block rounded-lg border border-line bg-surface p-4 hover:border-primary/40">
                  <p dir="auto" className="text-sm leading-7">{r.translation}</p>
                  <p className="mt-2 text-xs text-ink-muted">
                    {nameOf(r.surahNumber)} — الآية {toArabicNumber(r.ayah)} · {r.translationSource} · مطابقة في: {r.matchedIn}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
