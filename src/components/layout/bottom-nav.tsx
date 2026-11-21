'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookMarked, Headphones, Home, LibraryBig, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/quran', label: 'القرآن', icon: BookMarked },
  { href: '/audio', label: 'الاستماع', icon: Headphones },
  { href: '/search', label: 'البحث', icon: Search },
  { href: '/tafsir', label: 'التفسير', icon: LibraryBig },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-elevated/95 backdrop-blur md:hidden" aria-label="التنقل السفلي">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]',
              pathname === href ? 'text-primary' : 'text-ink-muted',
            )}
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
