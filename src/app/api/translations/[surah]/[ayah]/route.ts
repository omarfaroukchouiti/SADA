import { apiError, apiOk } from '@/lib/api';
import { getVerseDetails } from '@/lib/ummah';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah: rawSurah, ayah: rawAyah } = await params;
  const surah = Number(rawSurah);
  const ayah = Number(rawAyah);
  if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) {
    return apiError('مرجع الآية غير صالح', 400);
  }
  try {
    const result = await getVerseDetails(surah, ayah);
    return apiOk(result.data, result.provenance);
  } catch {
    return apiError('تعذّر تحميل الترجمة');
  }
}
