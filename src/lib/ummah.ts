import 'server-only';
import { cached, TTL } from './cache';
import type { ApiEnvelope, AudioTrack, Provenance, Reciter, TafsirEntry, TafsirSource } from './types';

const BASE = 'https://ummahapi.com/api';
const TIMEOUT_MS = 12_000;

type RawReciter = { id: number; name: string; name_arabic: string; style: string };
type RawSurahAudio = RawReciter & { full_surah_audio?: string };
type RawVerseAudio = RawReciter & { audio_url?: string };

const provenance = (route: string, note?: string): Provenance => ({
  provider: 'UmmahAPI',
  sourceUrl: `${BASE}${route}`,
  attribution: 'بيانات مساعدة من UmmahAPI — غير مصدر للنص القرآني المعتمد',
  licenseStatus: 'unknown',
  fetchedAt: new Date().toISOString(),
  ...(note ? { note } : {}),
});

async function getJson<T>(route: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${route}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SADA/1.0' },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`UmmahAPI ${route} -> HTTP ${res.status}`);
    const json = (await res.json()) as { success?: boolean; data?: T };
    if (json.success !== true || json.data === undefined) {
      throw new Error(`UmmahAPI ${route} -> unexpected response shape`);
    }
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}

export function getReciters(): Promise<ApiEnvelope<Reciter[]>> {
  const route = '/quran/reciters';
  return cached('ummah:reciters', TTL.long, async () => {
    const data = await getJson<{ reciters: RawReciter[] }>(route);
    if (!Array.isArray(data.reciters)) throw new Error('reciters missing');
    return {
      data: data.reciters.map((r) => ({
        id: r.id,
        name: r.name,
        nameArabic: r.name_arabic,
        style: r.style,
      })),
      provenance: provenance(route),
    };
  });
}

export function getSurahAudio(surah: number): Promise<ApiEnvelope<AudioTrack[]>> {
  const route = `/quran/audio/${surah}`;
  return cached(`ummah:audio:surah:${surah}`, TTL.medium, async () => {
    const data = await getJson<{ reciters?: RawSurahAudio[] }>(route);
    if (!Array.isArray(data.reciters)) return { data: [], provenance: provenance(route, 'لا توجد بيانات صوتية متاحة') };
    return {
      data: data.reciters.flatMap((a) =>
        typeof a.full_surah_audio === 'string'
          ? [{
              reciterId: a.id,
              reciterName: a.name,
              reciterNameArabic: a.name_arabic,
              style: a.style,
              audioUrl: a.full_surah_audio,
            }]
          : [],
      ),
      provenance: provenance(route, 'روابط صوتية خارجية؛ توافرها وترخيصها بحاجة تحقق'),
    };
  });
}

export function getVerseAudio(surah: number, ayah: number): Promise<ApiEnvelope<AudioTrack[]>> {
  const route = `/quran/audio/${surah}/${ayah}`;
  return cached(`ummah:audio:ayah:${surah}:${ayah}`, TTL.medium, async () => {
    const data = await getJson<{ reciters?: RawVerseAudio[] }>(route);
    if (!Array.isArray(data.reciters)) return { data: [], provenance: provenance(route) };
    return {
      data: data.reciters.flatMap((a) =>
        typeof a.audio_url === 'string'
          ? [{
              reciterId: a.id,
              reciterName: a.name,
              reciterNameArabic: a.name_arabic,
              style: a.style,
              audioUrl: a.audio_url,
            }]
          : [],
      ),
      provenance: provenance(route, 'روابط صوتية خارجية؛ توافرها وترخيصها بحاجة تحقق'),
    };
  });
}

export function getVerseDetails(surah: number, ayah: number): Promise<ApiEnvelope<{
  transliteration: string;
  translations: Record<string, string>;
}>> {
  const route = `/quran/surah/${surah}/ayah/${ayah}`;
  return cached(`ummah:verse:${surah}:${ayah}`, TTL.long, async () => {
    const data = await getJson<{ verse?: { transliteration?: string; translations?: Record<string, string> } }>(route);
    return {
      data: {
        transliteration: data.verse?.transliteration ?? '',
        translations: data.verse?.translations ?? {},
      },
      provenance: provenance(route, 'ترجمات ونقل صوتي من مصدر خارجي؛ ليست النص القرآني المعتمد'),
    };
  });
}

export function getTafsirSources(): Promise<ApiEnvelope<TafsirSource[]>> {
  const route = '/tafsir';
  return cached('ummah:tafsir:sources', TTL.long, async () => {
    const data = await getJson<{ tafasir: TafsirSource[] }>(route);
    if (!Array.isArray(data.tafasir)) throw new Error('tafasir missing');
    return { data: data.tafasir, provenance: provenance(route, 'المصدر والترخيص بحاجة تحقق قبل النشر') };
  });
}

export function getTafsir(key: string, surah: number, ayah: number): Promise<ApiEnvelope<TafsirEntry | null>> {
  const route = `/tafsir/${encodeURIComponent(key)}/surah/${surah}/ayah/${ayah}`;
  return cached(`ummah:tafsir:${key}:${surah}:${ayah}`, TTL.long, async () => {
    const data = await getJson<{
      verse_key?: string;
      tafsir?: { key?: string; name?: string; language?: string; author?: string; text?: string };
    }>(route);
    if (!data.tafsir || typeof data.tafsir.text !== 'string') {
      return { data: null, provenance: provenance(route, 'لا يوجد تفسير متاح لهذا المرجع') };
    }
    return {
      data: {
        verseKey: data.verse_key ?? `${surah}:${ayah}`,
        source: {
          key: data.tafsir.key ?? key,
          name: data.tafsir.name ?? key,
          language: data.tafsir.language ?? 'unknown',
          author: data.tafsir.author ?? 'unknown',
        },
        text: data.tafsir.text,
      },
      provenance: provenance(route, 'نص تفسيري من مصدر خارجي؛ يُعرض مع اسم المصدر والمؤلف'),
    };
  });
}

export function getExternalSearch(query: string, limit = 20): Promise<ApiEnvelope<{
  verseKey: string;
  surahNumber: number;
  ayah: number;
  translation: string;
  translationSource: string;
  matchedIn: string;
}[]>> {
  const route = `/quran/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  return cached(`ummah:search:${query}:${limit}`, TTL.medium, async () => {
    const data = await getJson<{ results?: {
      verse_key?: string;
      surah_number?: number;
      ayah?: number;
      translation?: string;
      translation_source?: string;
      matched_in?: string;
    }[] }>(route);
    return {
      data: (data.results ?? []).map((r) => ({
        verseKey: r.verse_key ?? '',
        surahNumber: Number(r.surah_number),
        ayah: Number(r.ayah),
        translation: r.translation ?? '',
        translationSource: r.translation_source ?? 'unknown',
        matchedIn: r.matched_in ?? 'unknown',
      })).filter((r) => r.verseKey),
      provenance: provenance(route, 'نتائج بحث في الترجمات؛ ليست نصًا قرآنيًا'),
    };
  });
}
