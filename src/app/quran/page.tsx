import type { Metadata } from 'next';
import { SurahList } from '@/components/quran/surah-list';
import { getSurahs } from '@/lib/quran-data';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'القرآن الكريم — صدى' };

export default async function QuranPage() {
  const surahs = await getSurahs();
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-primary">القرآن الكريم</h1>
        <p className="mt-2 text-sm text-ink-muted">فهرس السور — النص القرآني من Tanzil Project (عثماني v1.1، حرفي غير معدّل).</p>
      </div>
      <SurahList surahs={surahs} />
    </div>
  );
}
