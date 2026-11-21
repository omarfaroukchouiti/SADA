import { apiError, apiOk } from '@/lib/api';
import { getTafsirSources } from '@/lib/ummah';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getTafsirSources();
    return apiOk(result.data, result.provenance);
  } catch {
    return apiError('تعذّر تحميل مصادر التفسير');
  }
}
