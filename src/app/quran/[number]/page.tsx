import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReaderView } from '@/components/quran/reader-view';
import { getSurah, getSurahVerses } from '@/lib/quran-data';

export const runtime = 'nodejs';

function parseSurahNumber(raw: string): number | null {
  const number = Number(raw);
  return Number.isInteger(number) && number >= 1 && number <= 114 ? number : null;
}

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const number = parseSurahNumber((await params).number);
  const surah = number ? await getSurah(number) : null;
  if (!surah) notFound();
  return { title: `${surah.nameArabic} — صدى` };
}

export default async function SurahPage({ params }: { params: Promise<{ number: string }> }) {
  const number = parseSurahNumber((await params).number);
  if (!number) notFound();
  const [surah, verses] = await Promise.all([getSurah(number), getSurahVerses(number)]);
  if (!surah || !verses.length) notFound();
  return <ReaderView surah={surah} verses={verses} />;
}
