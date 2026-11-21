import { apiError, apiOk, quranProvenance } from '@/lib/api';
import { searchLocalVerses } from '@/lib/quran-data';
import { getExternalSearch } from '@/lib/ummah';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (!q) return apiOk({ local: [], translations: [] }, quranProvenance());
  try {
    const local = await searchLocalVerses(q);
    let translations: Awaited<ReturnType<typeof getExternalSearch>>['data'] = [];
    try {
      translations = (await getExternalSearch(q)).data;
    } catch {
      // Supplementary provider failure must not break local Quran search.
    }
    return apiOk({ local, translations }, {
      ...quranProvenance(),
      note: 'نتائج النص من Tanzil محليًا؛ نتائج الترجمات من UmmahAPI موسومة بالمصدر',
    });
  } catch {
    return apiError('تعذّر إجراء البحث');
  }
}
