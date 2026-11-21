import { apiError, apiOk, quranProvenance } from '@/lib/api';
import { getSurahs } from '@/lib/quran-data';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return apiOk(await getSurahs(), quranProvenance());
  } catch {
    return apiError('تعذّر تحميل فهرس السور');
  }
}
