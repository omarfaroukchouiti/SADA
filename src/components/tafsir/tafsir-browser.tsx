'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import type { Surah, TafsirSource } from '@/lib/types';

type TafsirResult = {
  verseKey: string;
  source: { name: string; author: string; language: string };
  text: string;
};
type Envelope<T> = { data: T; provenance: { provider: string; sourceUrl: string; attribution: string; licenseStatus: string } };

export function TafsirBrowser({ surahs }: { surahs: Pick<Surah, 'number' | 'nameArabic' | 'versesCount'>[] }) {
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [sources, setSources] = useState<TafsirSource[]>([]);
  const [sourceKey, setSourceKey] = useState('ibn_kathir_ar');
  const [entry, setEntry] = useState<TafsirResult | null>(null);
  const [provenance, setProvenance] = useState<Envelope<TafsirResult>['provenance'] | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useEffect(() => {
    fetch('/api/tafsir/sources')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: Envelope<TafsirSource[]>) => setSources(json.data))
      .catch(() => setSources([]));
  }, []);

  async function load() {
    setStatus('loading');
    try {
      const res = await fetch(`/api/tafsir/${sourceKey}/${surah}/${ayah}`);
      if (!res.ok) throw new Error('tafsir request failed');
      const json = (await res.json()) as Envelope<TafsirResult | null>;
      setEntry(json.data);
      setProvenance(json.provenance);
      setStatus(json.data ? 'ready' : 'empty');
    } catch {
      setEntry(null);
      setProvenance(null);
      setStatus('error');
    }
  }

  useEffect(() => { void load(); }, [sourceKey, surah, ayah]);

  const activeSurah = surahs.find((s) => s.number === surah);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-4 font-display text-lg font-semibold">اختر الآية</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="tafsir-surah" className="mb-1 block text-xs text-ink-muted">السورة</label>
            <select id="tafsir-surah" value={surah} onChange={(e) => { setSurah(Number(e.target.value)); setAyah(1); }} className="h-11 w-full rounded-lg border border-line bg-elevated px-3 text-sm">
              {surahs.map((s) => <option key={s.number} value={s.number}>{s.number}. {s.nameArabic}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tafsir-ayah" className="mb-1 block text-xs text-ink-muted">الآية</label>
            <select id="tafsir-ayah" value={ayah} onChange={(e) => setAyah(Number(e.target.value))} className="h-11 w-full rounded-lg border border-line bg-elevated px-3 text-sm">
              {Array.from({ length: activeSurah?.versesCount ?? 1 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tafsir-source" className="mb-1 block text-xs text-ink-muted">التفسير</label>
            <select id="tafsir-source" value={sourceKey} onChange={(e) => setSourceKey(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-elevated px-3 text-sm">
              {sources.length ? sources.map((s) => <option key={s.key} value={s.key}>{s.name} — {s.language}</option>) : <option value="ibn_kathir_ar">تفسير ابن كثير</option>}
            </select>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-on-primary">
            <RefreshCw size={14} /> تحديث
          </button>
          {activeSurah && <Link href={`/quran/${surah}/${ayah}`} className="block text-center text-xs text-primary">افتح الآية في المصحف</Link>}
        </div>
      </div>

      <div className="min-h-64 rounded-xl border border-line bg-surface p-5">
        {status === 'loading' && <p className="flex items-center gap-2 text-sm text-ink-muted"><LoaderCircle size={16} className="animate-spin" /> جارٍ تحميل التفسير…</p>}
        {status === 'empty' && <p className="text-sm text-ink-muted">لا يوجد تفسير متاح لهذه الآية من هذا المصدر.</p>}
        {status === 'error' && (
          <div className="text-sm">
            <p>تعذّر تحميل التفسير. حاول مرة أخرى لاحقًا.</p>
            <button type="button" onClick={() => void load()} className="mt-3 rounded-md bg-primary px-3 py-2 text-xs text-on-primary">إعادة المحاولة</button>
          </div>
        )}
        {status === 'ready' && entry && (
          <article>
            <p className="mb-1 text-xs font-semibold text-primary">{entry.source.name} — {entry.source.author} ({entry.source.language})</p>
            <p className="mb-4 text-xs text-ink-muted">الآية {entry.verseKey}</p>
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-line text-sm leading-8" dir="auto">{entry.text}</div>
            {provenance && <p className="verified-note mt-5">{provenance.attribution}. نص تفسيري من مصدر خارجي؛ يُرجى التحقق من الترخيص قبل النشر.</p>}
          </article>
        )}
      </div>
    </div>
  );
}
