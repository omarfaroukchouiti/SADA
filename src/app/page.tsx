import Link from 'next/link';
import { ArrowLeft, BookMarked, ChevronLeft, Headphones, LibraryBig, Search } from 'lucide-react';
import { LastRead } from '@/components/home/last-read';
import { getManifest, getSurahs } from '@/lib/quran-data';
import { toArabicNumber } from '@/lib/utils';

export const runtime = 'nodejs';

const featured = [1, 2, 36, 55, 67, 112];

const quickLinks = [
  { href: '/quran', label: 'اقرأ القرآن', desc: 'نص عثماني كامل مع تفسير وترجمة', icon: BookMarked },
  { href: '/audio', label: 'استمع', desc: 'تلاوات بصوت قرّاء متعددين', icon: Headphones },
  { href: '/tafsir', label: 'تدبّر', desc: 'تفسير الآيات مع ذكر المصدر', icon: LibraryBig },
  { href: '/search', label: 'ابحث', desc: 'بحث في النص القرآني والترجمات', icon: Search },
];

export default async function HomePage() {
  const [surahs, manifest] = await Promise.all([getSurahs(), getManifest()]);
  const selected = featured.map((n) => surahs.find((s) => s.number === n)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const validation = manifest.validation as { ayahCount?: number; surahCount?: number } | undefined;

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 sm:px-10 sm:py-16">
        <div className="absolute -left-20 -top-24 size-72 rounded-full bg-primary-container/10 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl">
          <p className="mb-3 text-sm font-semibold tracking-wide text-gold">SADA — صدى</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
            القرآن الكريم،<br />بصوتٍ واضحٍ ونصٍّ موثوق
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-ink-soft">
            اقرأ وتدبّر واستمع إلى القرآن الكريم بلا اشتراك ولا حواجز. النص القرآني المعتمد من Tanzil، والبيانات المساعدة موسومة بمصادرها.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/quran" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary">
              ابدأ القراءة
            </Link>
            <Link href="/audio" className="rounded-lg border border-line bg-elevated px-5 py-3 text-sm font-semibold text-primary">
              استمع إلى تلاوة
            </Link>
          </div>
          <p className="verified-note mt-6">
            {toArabicNumber(validation?.surahCount ?? 114)} سورة · {toArabicNumber(validation?.ayahCount ?? 6236)} آية · نص عثماني v1.1
          </p>
        </div>
      </section>

      <section>
        <LastRead surahs={surahs.map((s) => ({ number: s.number, nameArabic: s.nameArabic }))} />
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">ابدأ من هنا</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(({ href, label, desc, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-primary/40">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary-container/15 text-primary">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{label}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-muted">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                فتح <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">سور مختارة</h2>
          <Link href="/quran" className="text-sm text-primary">كل السور <ArrowLeft size={14} className="inline" /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((s) => (
            <Link key={s.number} href={`/quran/${s.number}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:border-primary/40">
              <span className="flex size-10 items-center justify-center rounded-lg border border-gold/40 font-display text-gold">
                {toArabicNumber(s.number)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg font-semibold">{s.nameArabic}</span>
                <span className="block text-xs text-ink-muted">
                  {s.revelationPlace === 'makkah' ? 'مكية' : 'مدنية'} · {toArabicNumber(s.versesCount)} آية
                </span>
              </span>
              <ChevronLeft size={16} className="text-ink-muted" />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 text-sm leading-7 text-ink-muted">
        <p className="font-semibold text-ink">مصادر المحتوى</p>
        <p>
          النص القرآني: <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer" className="text-primary underline">Tanzil Project</a> — نص حرفي غير معدّل.
          بيانات السور والتلاوات والتفسير مقدمة من UmmahAPI كمصدر مساعد، وتُعرض مع اسم مصدرها. التراخيص بحاجة تحقق قبل النشر.
        </p>
      </section>
    </div>
  );
}
