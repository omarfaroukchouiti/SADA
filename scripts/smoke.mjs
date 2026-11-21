// Lightweight smoke test for the Phase 1 SADA app.
const base = process.env.SADA_BASE ?? 'http://localhost:3000';
const routes = [
  '/', '/quran', '/quran/1', '/quran/1/1', '/audio', '/tafsir', '/search',
  '/api/quran/surahs', '/api/quran/surahs/1', '/api/quran/verses/1/1',
  `/api/quran/search?q=${encodeURIComponent('الرحمن')}`,
  '/api/audio/surahs/1', '/api/tafsir/sources', '/api/tafsir/ibn_kathir_ar/1/1',
  '/api/translations/1/1',
];

for (const route of routes) {
  try {
    const res = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
    const text = await res.text();
    const checks = {
      rtl: text.includes('dir="rtl"'),
      basmala: text.includes('بِسْمِ'),
      tanzil: text.toLowerCase().includes('tanzil'),
    };
    console.log(`${res.status} ${route} bytes=${text.length} ${JSON.stringify(checks)}`);
  } catch (error) {
    console.log(`ERR ${route} ${String(error)}`);
  }
}
