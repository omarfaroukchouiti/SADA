import { apiError, apiOk } from '@/lib/api';
import { getReciters } from '@/lib/ummah';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getReciters();
    return apiOk(result.data, result.provenance);
  } catch {
    return apiError('تعذّر تحميل قائمة القرّاء');
  }
}
