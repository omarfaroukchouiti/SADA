import { apiError, apiOk, quranProvenance } from '@/lib/api';
import { getVerse } from '@/lib/quran-data';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah: rawSurah, ayah: rawAyah } = await params;
  const surah = Number(rawSurah);
  const ayah = Number(rawAyah);
  if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) {
    return apiError('مرجع الآية غير صالح', 400);
  }
  try {
    const verse = await getVerse(surah, ayah);
    if (!verse) return apiError('الآية غير موجودة', 404);
    return apiOk(verse, quranProvenance());
  } catch {
    return apiError('تعذّر تحميل الآية');
  }
}
