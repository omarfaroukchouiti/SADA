import { apiError, apiOk, quranProvenance } from '@/lib/api';
import { getSurah, getSurahVerses } from '@/lib/quran-data';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number: raw } = await params;
  const number = Number(raw);
  if (!Number.isInteger(number) || number < 1 || number > 114) return apiError('رقم السورة غير صالح', 400);
  try {
    const surah = await getSurah(number);
    if (!surah) return apiError('السورة غير موجودة', 404);
    return apiOk({ surah, verses: await getSurahVerses(number) }, quranProvenance());
  } catch {
    return apiError('تعذّر تحميل السورة');
  }
}
