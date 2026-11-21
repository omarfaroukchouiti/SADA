import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReaderView } from '@/components/quran/reader-view';
import { getSurah, getSurahVerses } from '@/lib/quran-data';

export const runtime = 'nodejs';

function parseVerse(rawSurah: string, rawAyah: string): { number: number; ayah: number } | null {
  const number = Number(rawSurah);
  const ayah = Number(rawAyah);
  return Number.isInteger(number) && number >= 1 && number <= 114 && Number.isInteger(ayah) && ayah >= 1
    ? { number, ayah }
    : null;
}

export async function generateMetadata({ params }: { params: Promise<{ number: string; ayah: string }> }): Promise<Metadata> {
  const { number, ayah } = await params;
  const parsed = parseVerse(number, ayah);
  const surah = parsed ? await getSurah(parsed.number) : null;
  if (!surah || !parsed) notFound();
  return { title: `${surah.nameArabic} — آية ${parsed.ayah} — صدى` };
}

export default async function VersePage({ params }: { params: Promise<{ number: string; ayah: string }> }) {
  const { number: rawSurah, ayah: rawAyah } = await params;
  const parsed = parseVerse(rawSurah, rawAyah);
  if (!parsed) notFound();
  const [surah, verses] = await Promise.all([getSurah(parsed.number), getSurahVerses(parsed.number)]);
  if (!surah || !verses.length || !verses.some((v) => v.ayah === parsed.ayah)) notFound();
  return <ReaderView surah={surah} verses={verses} initialAyah={parsed.ayah} />;
}
