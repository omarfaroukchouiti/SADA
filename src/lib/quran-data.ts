import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Surah, Verse } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'quran');

let surahsCache: Surah[] | null = null;
let versesCache: Verse[] | null = null;
let indexCache: Map<string, Verse> | null = null;
let searchIndexCache: { key: string; original: Verse }[] | null = null;

async function loadJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(DATA_DIR, file), 'utf8');
  return JSON.parse(raw) as T;
}

export async function getSurahs(): Promise<Surah[]> {
  if (!surahsCache) surahsCache = await loadJson<Surah[]>('surahs.json');
  return surahsCache;
}

export async function getSurah(number: number): Promise<Surah | null> {
  const surahs = await getSurahs();
  return surahs.find((s) => s.number === number) ?? null;
}

export async function getVerses(): Promise<Verse[]> {
  if (!versesCache) versesCache = await loadJson<Verse[]>('verses.json');
  return versesCache;
}

async function getIndex(): Promise<Map<string, Verse>> {
  if (!indexCache) {
    const verses = await getVerses();
    indexCache = new Map(verses.map((v) => [`${v.surah}:${v.ayah}`, v]));
  }
  return indexCache;
}

export async function getSurahVerses(surah: number): Promise<Verse[]> {
  const verses = await getVerses();
  return verses.filter((v) => v.surah === surah);
}

export async function getVerse(surah: number, ayah: number): Promise<Verse | null> {
  const index = await getIndex();
  return index.get(`${surah}:${ayah}`) ?? null;
}

/**
 * Derive a comparison-only form for search. The canonical Tanzil text is never
 * modified or replaced — this index exists solely in memory for matching.
 */
function normalizeForSearch(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FF\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getSearchIndex(): Promise<{ key: string; original: Verse }[]> {
  if (!searchIndexCache) {
    const verses = await getVerses();
    searchIndexCache = verses.map((v) => ({ key: normalizeForSearch(v.text), original: v }));
  }
  return searchIndexCache;
}

export async function searchLocalVerses(query: string, limit = 30): Promise<Verse[]> {
  const q = normalizeForSearch(query.trim());
  if (!q) return [];
  const index = await getSearchIndex();
  const matched: Verse[] = [];
  for (const entry of index) {
    if (entry.key.includes(q)) {
      matched.push(entry.original);
      if (matched.length >= limit) break;
    }
  }
  return matched;
}

export async function getManifest() {
  return loadJson<Record<string, unknown>>('manifest.json');
}
