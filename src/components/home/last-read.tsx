'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';
import type { Surah } from '@/lib/types';
import { toArabicNumber } from '@/lib/utils';

export function LastRead({ surahs }: { surahs: Pick<Surah, 'number' | 'nameArabic'>[] }) {
  const [last, setLast] = useState<{ number: number; ayah: number } | null>(null);

  useEffect(() => {
    type Entry = { number: number; ayah: number; time: number };
    const entries = surahs.flatMap<Entry>((s) => {
      const raw = localStorage.getItem(`sada-last:${s.number}`);
      if (!raw) return [];
      const saved = Number(raw);
      if (!Number.isInteger(saved) || saved < 1) return [];
      const time = Number(localStorage.getItem(`sada-last-time:${s.number}`) ?? 0);
      return [{ number: s.number, ayah: saved, time }];
    });
    if (!entries.length) return;
    entries.sort((a, b) => b.time - a.time);
    setLast({ number: entries[0].number, ayah: entries[0].ayah });
  }, [surahs]);

  const surah = last ? surahs.find((s) => s.number === last.number) : null;

  if (!surah || !last) return null;

  return (
    <Link
      href={`/quran/${last.number}/${last.ayah}`}
      className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-container/10 p-4 transition-colors hover:bg-primary-container/20"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-container text-on-primary">
        <BookOpen size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-ink-muted">آخر قراءة</span>
        <span className="block truncate font-display text-lg font-semibold">{surah.nameArabic}</span>
        <span className="block text-xs text-ink-muted">الآية {toArabicNumber(last.ayah)}</span>
      </span>
      <ChevronLeft size={18} className="text-primary" />
    </Link>
  );
}
