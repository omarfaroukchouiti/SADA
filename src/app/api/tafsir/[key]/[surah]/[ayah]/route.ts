import { apiError, apiOk } from '@/lib/api';
import { getTafsir } from '@/lib/ummah';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ key: string; surah: string; ayah: string }> }) {
  const { key, surah: rawSurah, ayah: rawAyah } = await params;
  const surah = Number(rawSurah);
  const ayah = Number(rawAyah);
  const allowed = new Set(['ibn_kathir', 'maarif', 'muyassar', 'ibn_kathir_ar', 'all']);
  if (!allowed.has(key) || !Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) {
    return apiError('معاملات الطلب غير صالحة', 400);
  }
  try {
    const result = await getTafsir(key, surah, ayah);
    return apiOk(result.data, result.provenance);
  } catch {
    return apiError('تعذّر تحميل التفسير');
  }
}
