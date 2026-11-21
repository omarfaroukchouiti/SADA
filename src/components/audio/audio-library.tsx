'use client';

import { useEffect, useState } from 'react';
import { Headphones, LoaderCircle, Play, RefreshCw } from 'lucide-react';
import { useAudio } from '@/components/providers/audio-provider';
import type { Surah } from '@/lib/types';

type Track = { reciterId: number; reciterName: string; reciterNameArabic: string; style: string; audioUrl: string };
type Envelope = { data: Track[]; provenance: { provider: string; sourceUrl: string; attribution: string; licenseStatus: string } };

export function AudioLibrary({ surahs }: { surahs: Pick<Surah, 'number' | 'nameArabic' | 'versesCount'>[] }) {
  const { play, current } = useAudio();
  const [surah, setSurah] = useState(1);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [provenance, setProvenance] = useState<Envelope['provenance'] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle');

  async function load(n: number) {
    setStatus('loading');
    try {
      const res = await fetch(`/api/audio/surahs/${n}`);
      if (!res.ok) throw new Error('audio request failed');
      const json = (await res.json()) as Envelope;
      setTracks(json.data);
      setProvenance(json.provenance);
      setStatus(json.data.length ? 'idle' : 'empty');
    } catch {
      setTracks([]);
      setProvenance(null);
      setStatus('error');
    }
  }

  useEffect(() => { void load(surah); }, [surah]);

  const selected = surahs.find((s) => s.number === surah);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 font-display text-lg font-semibold">اختر السورة</h2>
        <label className="sr-only" htmlFor="surah-select">السورة</label>
        <select
          id="surah-select"
          value={surah}
          onChange={(e) => setSurah(Number(e.target.value))}
          className="h-11 w-full rounded-lg border border-line bg-elevated px-3 text-sm"
        >
          {surahs.map((s) => (
            <option key={s.number} value={s.number}>{s.number}. {s.nameArabic}</option>
          ))}
        </select>
        {selected && <p className="mt-3 text-xs text-ink-muted">{selected.versesCount} آية</p>}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{selected?.nameArabic} — التلاوات</h2>
          <button type="button" onClick={() => void load(surah)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary">
            <RefreshCw size={14} /> تحديث
          </button>
        </div>

        {status === 'loading' && (
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-6 text-sm text-ink-muted">
            <LoaderCircle size={16} className="animate-spin" /> جارٍ تحميل التلاوات…
          </div>
        )}
        {status === 'empty' && (
          <div className="rounded-xl border border-line bg-surface p-6 text-sm text-ink-muted">لا توجد تلاوات متاحة لهذه السورة حاليًا.</div>
        )}
        {status === 'error' && (
          <div className="rounded-xl border border-line bg-surface p-6 text-sm">
            <p className="text-ink">تعذّر تحميل التلاوات. تأكد من اتصالك بالإنترنت.</p>
            <button type="button" onClick={() => void load(surah)} className="mt-3 rounded-md bg-primary px-3 py-2 text-xs text-on-primary">إعادة المحاولة</button>
          </div>
        )}
        {status === 'idle' && (
          <div className="grid gap-2 sm:grid-cols-2">
            {tracks.map((t) => {
              const isCurrent = current?.url === t.audioUrl;
              return (
                <button
                  key={`${t.reciterId}-${t.audioUrl}`}
                  type="button"
                  onClick={() => play({ url: t.audioUrl, title: selected?.nameArabic ?? '', subtitle: t.reciterNameArabic, reciterId: t.reciterId })}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-right ${isCurrent ? 'border-primary bg-primary-container/10' : 'border-line bg-surface hover:border-primary/40'}`}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-container text-on-primary">
                    {isCurrent ? <Headphones size={16} /> : <Play size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{t.reciterNameArabic}</span>
                    <span className="block truncate text-xs text-ink-muted">{t.style}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {provenance && (
          <p className="verified-note mt-4">
            مصدر التلاوات: {provenance.provider} — {provenance.attribution}. الروابط خارجية؛ توافرها وترخيصها بحاجة تحقق.
          </p>
        )}
      </div>
    </div>
  );
}
