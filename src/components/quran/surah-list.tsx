'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { SurahRow } from './surah-row';
import type { Surah } from '@/lib/types';

export function SurahList({ surahs }: { surahs: Surah[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'makkah' | 'madani'>('all');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Bookmarks are read after hydration to avoid a server/client mismatch.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = JSON.parse(localStorage.getItem('sada-bookmarks') ?? '[]');
      if (Array.isArray(raw) && raw.length !== bookmarks.length) setBookmarks(raw);
    } catch { /* ignore malformed saved data */ }
  }, [bookmarks.length]);

  const results = surahs.filter((s) => {
    const matchFilter = filter === 'all' || s.revelationPlace === filter;
    const q = query.trim();
    const matchQuery = !q || s.nameArabic.includes(q) || s.nameEnglish.toLowerCase().includes(q.toLowerCase()) || String(s.number) === q;
    return matchFilter && matchQuery;
  });

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative block">
          <span className="sr-only">ابحث باسم السورة أو رقمها</span>
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها…"
            className="h-12 w-full rounded-lg border border-line bg-elevated pr-10 pl-4 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex gap-2" role="group" aria-label="تصفية السور">
          {([['all', 'الكل'], ['makkah', 'مكية'], ['madani', 'مدنية']] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-4 py-2 text-sm ${filter === key ? 'bg-primary text-on-primary' : 'border border-line bg-surface text-ink-soft'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs text-ink-muted">{results.length} سورة</p>

      {results.length ? (
        <div className="grid gap-2 md:grid-cols-2">
          {results.map((s) => (
            <SurahRow key={s.number} surah={s} bookmarked={bookmarks.some((k) => k.startsWith(`${s.number}:`))} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-muted">
          لا توجد سور مطابقة. جرّب اسمًا آخر أو رقم سورة.
        </div>
      )}
    </div>
  );
}
