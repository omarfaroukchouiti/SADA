import type { Metadata } from 'next';
import { TafsirBrowser } from '@/components/tafsir/tafsir-browser';
import { getSurahs } from '@/lib/quran-data';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'التفسير — صدى' };

export default async function TafsirPage() {
  const surahs = await getSurahs();
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-primary">التفسير</h1>
        <p className="mt-2 text-sm text-ink-muted">نصوص تفسيرية من UmmahAPI، تُعرض مع اسم العمل والمؤلف واللغة. ليست بديلًا عن الرجوع إلى أهل العلم.</p>
      </div>
      <TafsirBrowser surahs={surahs.map((s) => ({ number: s.number, nameArabic: s.nameArabic, versesCount: s.versesCount }))} />
    </div>
  );
}
