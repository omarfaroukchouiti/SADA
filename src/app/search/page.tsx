import type { Metadata } from 'next';
import { SearchView } from '@/components/search/search-view';
import { getSurahs } from '@/lib/quran-data';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'البحث — صدى' };

export default async function SearchPage() {
  const surahs = await getSurahs();
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-primary">البحث</h1>
        <p className="mt-2 text-sm text-ink-muted">يبحث في النص القرآني المحلي من Tanzil، وفي الترجمات المتاحة من UmmahAPI كمصدر مساعد.</p>
      </div>
      <SearchView surahs={surahs.map((s) => ({ number: s.number, nameArabic: s.nameArabic }))} />
    </div>
  );
}
