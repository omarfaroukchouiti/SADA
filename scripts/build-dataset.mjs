/**
 * Build SADA's versioned local Quran dataset.
 *
 * Canonical Arabic text: Tanzil Uthmani v1.1 (verbatim, unmodified).
 * Metadata (surah names, revelation place, juz mapping): UmmahAPI snapshot.
 * Arabic text from UmmahAPI is NEVER copied into the dataset.
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const SOURCE = '../data/quran/quran-uthmani-tanzil-v1.1.txt';
const OUT = 'data/quran';
const UMMah = 'https://ummahapi.com/api';
const fetchedAt = new Date().toISOString();

await mkdir(OUT, { recursive: true });

// 1. Canonical text — copy verbatim, never rewrite.
const raw = await readFile(SOURCE);
await copyFile(SOURCE, `${OUT}/quran-uthmani-tanzil-v1.1.txt`);
const text = raw.toString('utf8');
const lines = text.split(/\r?\n/);
const verses = [];
for (const line of lines) {
  const m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
  if (!m) continue;
  verses.push({
    surah: Number(m[1]),
    ayah: Number(m[2]),
    text: m[3], // verbatim, no normalization
  });
}

// 2. Surah metadata from UmmahAPI (metadata only, not text).
const surahRes = await fetch(`${UMMah}/quran/surahs`);
if (!surahRes.ok) throw new Error(`surahs HTTP ${surahRes.status}`);
const surahJson = await surahRes.json();
const surahs = surahJson.data.surahs.map((s) => ({
  number: s.number,
  nameArabic: s.name_arabic,
  nameEnglish: s.name_english,
  nameTranslation: s.name_translation,
  revelationPlace: s.revelation_place,
  revelationOrder: s.revelation_order,
  bismillahPre: s.bismillah_pre,
  versesCount: s.verses_count,
  pages: s.pages,
}));

// 3. Juz mapping from UmmahAPI (verse_key -> juz).
const juzMap = {};
for (let juz = 1; juz <= 30; juz++) {
  const res = await fetch(`${UMMah}/quran/juz/${juz}`);
  if (!res.ok) throw new Error(`juz ${juz} HTTP ${res.status}`);
  const json = await res.json();
  for (const v of json.data.verses || []) {
    if (v.verse_key) juzMap[v.verse_key] = juz;
  }
  process.stdout.write(`juz ${juz} `);
}
console.log('');

for (const v of verses) {
  const juz = juzMap[`${v.surah}:${v.ayah}`];
  if (juz) v.juz = juz;
}

const manifest = {
  generatedAt: fetchedAt,
  text: {
    provider: 'Tanzil Project',
    edition: 'Uthmani',
    version: '1.1',
    sourceUrl: 'https://tanzil.net/download/',
    file: 'quran-uthmani-tanzil-v1.1.txt',
    sha256: createHash('sha256').update(raw).digest('hex'),
    bytes: raw.length,
    attribution: 'Quran text provided by Tanzil Project — https://tanzil.net',
    license: 'Verbatim copying permitted with visible attribution; text must not be altered.',
  },
  metadata: {
    provider: 'UmmahAPI',
    sourceUrl: `${UMMah}/quran/surahs, ${UMMah}/quran/juz/{1..30}`,
    usage: 'Surah names, revelation place, page ranges and juz mapping only. Arabic text is not taken from this provider.',
  },
  validation: {
    surahCount: new Set(verses.map((v) => v.surah)).size,
    ayahCount: verses.length,
    emptyTextCount: verses.filter((v) => !v.text.trim()).length,
    juzMappedCount: verses.filter((v) => v.juz).length,
  },
};

if (manifest.validation.surahCount !== 114 || manifest.validation.ayahCount !== 6236) {
  throw new Error(`Dataset validation failed: ${JSON.stringify(manifest.validation)}`);
}

await writeFile(`${OUT}/verses.json`, JSON.stringify(verses), 'utf8');
await writeFile(`${OUT}/surahs.json`, JSON.stringify(surahs), 'utf8');
await writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2), 'utf8');
console.log(JSON.stringify(manifest.validation, null, 2));
