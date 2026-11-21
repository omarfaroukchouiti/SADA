'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Copy, Minus, Moon, Play, Plus, Share2, Sun } from 'lucide-react';
import { useAudio } from '@/components/providers/audio-provider';
import { useTheme } from '@/components/providers/theme-provider';
import type { Surah, Verse } from '@/lib/types';
import { cn, toArabicNumber } from '@/lib/utils';

type PanelKind = 'tafsir' | 'translation' | null;
type TafsirData = { verseKey: string; source: { name: string; author: string; language: string }; text: string } | null;
type TranslationData = { translations: Record<string, string>; transliteration: string };

const translationLabels: Record<string, string> = {
  sahih_international: 'Sahih International',
  pickthall: 'Pickthall',
  yusuf_ali: 'Yusuf Ali',
  urdu: 'اردو',
  turkish: 'Türkçe',
  indonesian: 'Indonesia',
  french: 'Français',
  german: 'Deutsch',
  bengali: 'বাংলা',
  spanish: 'Español',
  malay: 'Melayu',
  bosnian: 'Bosanski',
};

export function ReaderView({ surah, verses, initialAyah }: { surah: Surah; verses: Verse[]; initialAyah?: number }) {
  const { play } = useAudio();
  const { theme, toggle } = useTheme();
  const [fontSize, setFontSize] = useState(24);
  const [active, setActive] = useState(initialAyah ?? 1);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [panel, setPanel] = useState<PanelKind>(null);
  const [tafsir, setTafsir] = useState<TafsirData>(null);
  const [translation, setTranslation] = useState<TranslationData | null>(null);
  const [loadingPanel, setLoadingPanel] = useState(false);

  useEffect(() => {
    if (initialAyah) {
      document.getElementById(`ayah-${initialAyah}`)?.scrollIntoView({ block: 'center' });
    }
  }, [initialAyah]);

  useEffect(() => {
    const savedSize = Number(localStorage.getItem('sada-quran-font'));
    if (savedSize >= 18 && savedSize <= 40) setFontSize(savedSize);
    try {
      const raw = JSON.parse(localStorage.getItem('sada-bookmarks') ?? '[]');
      if (Array.isArray(raw)) setBookmarks(raw);
    } catch { /* ignore malformed saved data */ }
    const saved = Number(localStorage.getItem(`sada-last:${surah.number}`));
    if (saved >= 1 && !initialAyah) setActive(saved);
  }, [surah.number, initialAyah]);

  const changeFontSize = (delta: number) => {
    setFontSize((size) => {
      const next = Math.min(40, Math.max(18, size + delta));
      localStorage.setItem('sada-quran-font', String(next));
      return next;
    });
  };

  const toggleBookmark = useCallback((ayah: number) => {
    setBookmarks((prev) => {
      const key = `${surah.number}:${ayah}`;
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem('sada-bookmarks', JSON.stringify(next));
      return next;
    });
  }, [surah.number]);

  useEffect(() => {
    localStorage.setItem(`sada-last:${surah.number}`, String(active));
    localStorage.setItem(`sada-last-time:${surah.number}`, String(Date.now()));
  }, [active, surah.number]);

  async function openPanel(kind: Exclude<PanelKind, null>, ayah = active) {
    setPanel(kind);
    setLoadingPanel(true);
    try {
      if (kind === 'tafsir') {
        const res = await fetch(`/api/tafsir/ibn_kathir_ar/${surah.number}/${ayah}`);
        if (res.ok) {
          const json = (await res.json()) as { data: TafsirData };
          setTafsir(json.data);
        }
      } else {
        const res = await fetch(`/api/translations/${surah.number}/${ayah}`);
        if (res.ok) {
          const json = (await res.json()) as { data: TranslationData };
          setTranslation(json.data);
        }
      }
    } catch { /* provider failure: panel stays empty, no fabricated text */ }
    finally { setLoadingPanel(false); }
  }

  async function playAyah(ayah: number) {
    try {
      const res = await fetch(`/api/audio/verses/${surah.number}/${ayah}`);
      if (!res.ok) return;
      const json = (await res.json()) as {
        data: { reciterId: number; reciterNameArabic: string; audioUrl: string }[];
      };
      const track = json.data[0];
      if (track?.audioUrl) {
        play({ url: track.audioUrl, title: `${surah.nameArabic} — ${toArabicNumber(ayah)}`, subtitle: track.reciterNameArabic, reciterId: track.reciterId });
      }
    } catch { /* audio is supplementary */ }
  }

  async function copyAyah(ayah: number) {
    const verse = verses.find((v) => v.ayah === ayah);
    if (!verse) return;
    await navigator.clipboard.writeText(`${verse.text}\n[${surah.nameArabic}: ${toArabicNumber(ayah)}]`);
  }

  async function shareAyah(ayah: number) {
    const url = `${window.location.origin}/quran/${surah.number}/${ayah}`;
    if (navigator.share) await navigator.share({ title: 'صدى', url });
    else await navigator.clipboard.writeText(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="mb-6 rounded-xl border border-line bg-surface p-5">
          <p className="text-xs text-ink-muted">
            {surah.revelationPlace === 'makkah' ? 'مكية' : 'مدنية'} · {toArabicNumber(surah.versesCount)} آية · صفحة {toArabicNumber(surah.pages[0])}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-primary">{surah.nameArabic}</h1>
          <p className="mt-1 text-sm text-ink-soft">{surah.nameEnglish} — {surah.nameTranslation}</p>
          <p className="verified-note mt-3">النص القرآني: Tanzil Project — tanzil.net (نص حرفي غير معدّل)</p>
        </div>

        <div className="sticky top-16 z-20 mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-elevated/95 p-2 backdrop-blur">
          <button type="button" onClick={() => changeFontSize(-2)} aria-label="تصغير الخط" className="flex size-9 items-center justify-center rounded-md hover:bg-surface"><Minus size={16} /></button>
          <span className="min-w-10 text-center text-xs text-ink-muted">{toArabicNumber(fontSize)}</span>
          <button type="button" onClick={() => changeFontSize(2)} aria-label="تكبير الخط" className="flex size-9 items-center justify-center rounded-md hover:bg-surface"><Plus size={16} /></button>
          <span className="mx-1 h-5 w-px bg-line" />
          <button type="button" onClick={() => openPanel('translation')} className="rounded-md px-3 py-2 text-xs hover:bg-surface">الترجمة</button>
          <button type="button" onClick={() => openPanel('tafsir')} className="rounded-md px-3 py-2 text-xs hover:bg-surface">التفسير</button>
          <button type="button" onClick={toggle} aria-label="تبديل الثيم" className="flex size-9 items-center justify-center rounded-md hover:bg-surface">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="space-y-3" style={{ fontSize }}>
          {verses.map((v) => {
            const isActive = active === v.ayah;
            const isBookmarked = bookmarks.includes(`${surah.number}:${v.ayah}`);
            return (
              <article
                key={v.ayah}
                id={`ayah-${v.ayah}`}
                onClick={() => setActive(v.ayah)}
                className={cn(
                  'relative rounded-lg border px-4 py-4 transition-colors sm:px-6',
                  isActive ? 'border-primary/40 bg-surface' : 'border-transparent hover:bg-surface/60',
                )}
              >
                {isActive && <span className="absolute inset-y-3 right-0 w-0.5 rounded bg-primary" aria-hidden />}
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded border border-gold/50 font-display text-sm text-gold">
                    {toArabicNumber(v.ayah)}
                  </span>
                  <p dir="rtl" lang="ar" className="quran-text flex-1" style={{ fontSize }}>
                    {v.text}
                  </p>
                </div>
                {isActive && (
                  <div className="mt-3 flex flex-wrap gap-1 border-t border-line pt-3">
                    <button type="button" onClick={() => void playAyah(v.ayah)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs text-on-primary"><Play size={14} /> استماع</button>
                    <button type="button" onClick={() => void openPanel('tafsir', v.ayah)} className="rounded-md px-3 py-2 text-xs hover:bg-surface-mid">تفسير</button>
                    <button type="button" onClick={() => void openPanel('translation', v.ayah)} className="rounded-md px-3 py-2 text-xs hover:bg-surface-mid">ترجمة</button>
                    <button type="button" onClick={() => toggleBookmark(v.ayah)} aria-label="حفظ الآية" className={cn('rounded-md p-2 hover:bg-surface-mid', isBookmarked && 'text-gold')}><Bookmark size={16} className={isBookmarked ? 'fill-gold' : ''} /></button>
                    <button type="button" onClick={() => void copyAyah(v.ayah)} aria-label="نسخ الآية" className="rounded-md p-2 hover:bg-surface-mid"><Copy size={16} /></button>
                    <button type="button" onClick={() => void shareAyah(v.ayah)} aria-label="مشاركة الآية" className="rounded-md p-2 hover:bg-surface-mid"><Share2 size={16} /></button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-4 text-sm">
          {surah.number > 1 ? (
            <Link href={`/quran/${surah.number - 1}`} className="inline-flex items-center gap-1 text-primary"><ChevronRight size={16} /> السورة السابقة</Link>
          ) : <span />}
          {surah.number < 114 ? (
            <Link href={`/quran/${surah.number + 1}`} className="inline-flex items-center gap-1 text-primary">السورة التالية <ChevronLeft size={16} /></Link>
          ) : <span />}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-line bg-surface p-4">
          <h2 className="mb-3 font-display text-lg font-semibold">لوحة التدبر</h2>
          <div className="mb-3 flex gap-2">
            <button type="button" onClick={() => void openPanel('tafsir')} className={cn('rounded-md px-3 py-2 text-xs', panel === 'tafsir' ? 'bg-primary text-on-primary' : 'bg-canvas')}>التفسير</button>
            <button type="button" onClick={() => void openPanel('translation')} className={cn('rounded-md px-3 py-2 text-xs', panel === 'translation' ? 'bg-primary text-on-primary' : 'bg-canvas')}>الترجمة</button>
            {panel && <button type="button" onClick={() => setPanel(null)} className="mr-auto text-xs text-ink-muted">إغلاق</button>}
          </div>
          {loadingPanel && <p className="text-sm text-ink-muted">جارٍ التحميل…</p>}
          {!loadingPanel && panel === 'tafsir' && (
            tafsir ? (
              <div>
                <p className="mb-2 text-xs font-semibold text-primary">{tafsir.source.name} — {tafsir.source.author}</p>
                <p className="max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-7">{tafsir.text}</p>
                <p className="verified-note mt-3">مصدر خارجي: UmmahAPI · يُرجى تحقق الترخيص قبل النشر</p>
              </div>
            ) : <p className="text-sm text-ink-muted">لا يوجد تفسير متاح لهذه الآية.</p>
          )}
          {!loadingPanel && panel === 'translation' && (
            translation ? (
              <div className="space-y-3">
                {Object.entries(translation.translations).map(([key, text]) => (
                  <div key={key} className="border-b border-line pb-3">
                    <p className="mb-1 text-xs font-semibold text-primary">{translationLabels[key] ?? key}</p>
                    <p dir="auto" className="text-sm leading-7">{text}</p>
                  </div>
                ))}
                <p className="verified-note">ترجمات من UmmahAPI؛ ليست النص القرآني المعتمد، ويجب التحقق من حقوق كل ترجمة.</p>
              </div>
            ) : <p className="text-sm text-ink-muted">لا توجد ترجمات متاحة.</p>
          )}
          {!panel && <p className="text-sm text-ink-muted">اختر تفسيرًا أو ترجمة لعرضها هنا دون مغادرة المصحف.</p>}
        </div>
      </aside>
    </div>
  );
}
