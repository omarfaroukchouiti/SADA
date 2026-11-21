'use client';

import Link from 'next/link';
import { Bookmark, Play } from 'lucide-react';
import { useAudio } from '@/components/providers/audio-provider';
import type { Surah } from '@/lib/types';
import { toArabicNumber } from '@/lib/utils';

type AudioResponse = { data: { reciterId: number; reciterNameArabic: string; audioUrl: string; style: string }[] };

export function SurahRow({ surah, bookmarked }: { surah: Surah; bookmarked: boolean }) {
  const { play } = useAudio();

  async function handlePlay() {
    try {
      const res = await fetch(`/api/audio/surahs/${surah.number}`);
      if (!res.ok) return;
      const json = (await res.json()) as AudioResponse;
      const track = json.data[0];
      if (track?.audioUrl) {
        play({ url: track.audioUrl, title: surah.nameArabic, subtitle: track.reciterNameArabic, reciterId: track.reciterId });
      }
    } catch {
      // Audio is supplementary; silence failure rather than fabricate a track.
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3 sm:px-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-line bg-canvas font-display text-sm text-primary">
        {toArabicNumber(surah.number)}
      </span>
      <Link href={`/quran/${surah.number}`} className="min-w-0 flex-1">
        <span className="block truncate font-display text-lg font-semibold">{surah.nameArabic}</span>
        <span className="block truncate text-xs text-ink-muted">
          {surah.revelationPlace === 'makkah' ? 'مكية' : 'مدنية'} · {toArabicNumber(surah.versesCount)} آية
        </span>
      </Link>
      {bookmarked && <Bookmark size={16} className="shrink-0 fill-gold text-gold" aria-label="محفوظة" />}
      <button
        type="button"
        onClick={handlePlay}
        aria-label={`استماع إلى سورة ${surah.nameArabic}`}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"
      >
        <Play size={16} />
      </button>
    </div>
  );
}
