'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { cn, toArabicNumber } from '@/lib/utils';

const links = [
  { href: '/', label: 'الرئيسية' },
  { href: '/quran', label: 'القرآن الكريم' },
  { href: '/audio', label: 'الاستماع' },
  { href: '/tafsir', label: 'التفسير' },
  { href: '/search', label: 'البحث' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="font-display text-2xl font-bold text-primary">صدى</span>
          <span className="hidden text-xs tracking-widest text-ink-muted sm:inline">SADA</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface',
                pathname === l.href ? 'bg-surface font-semibold text-primary' : 'text-ink-soft',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-1 md:flex-none">
          <Link href="/search" aria-label="البحث" className="flex size-10 items-center justify-center rounded-md hover:bg-surface">
            <Search size={19} />
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            className="flex size-10 items-center justify-center rounded-md hover:bg-surface"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <span className="hidden rounded-md border border-line px-2 py-1 text-xs text-ink-muted lg:inline" aria-hidden>
            {toArabicNumber(114)} سورة
          </span>
        </div>
      </div>
    </header>
  );
}
