import { apiError, apiOk } from '@/lib/api';
import { getSurahAudio } from '@/lib/ummah';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ surah: string }> }) {
  const surah = Number((await params).surah);
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return apiError('رقم السورة غير صالح', 400);
  try {
    const result = await getSurahAudio(surah);
    return apiOk(result.data, result.provenance);
  } catch {
    return apiError('تعذّر تحميل التلاوات');
  }
}
