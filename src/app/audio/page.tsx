import type { Metadata } from 'next';
import { AudioLibrary } from '@/components/audio/audio-library';
import { getSurahs } from '@/lib/quran-data';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'الاستماع — صدى' };

export default async function AudioPage() {
  const surahs = await getSurahs();
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-primary">الاستماع</h1>
        <p className="mt-2 text-sm text-ink-muted">تلاوات كاملة للسور من UmmahAPI، مع ذكر المصدر. بيانات الصوت مساعدة وليست بديلًا عن النص المعتمد.</p>
      </div>
      <AudioLibrary surahs={surahs.map((s) => ({ number: s.number, nameArabic: s.nameArabic, versesCount: s.versesCount }))} />
    </div>
  );
}
