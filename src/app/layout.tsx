import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AudioProvider } from '@/components/providers/audio-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import SiteFooter from '@/components/layout/site-footer';

function siteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: 'SADA — صدى',
  description: 'منصة إسلامية مجانية للقرآن الكريم والتلاوات والتفسير',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="ar" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>
          <AudioProvider>
            <SiteHeader />
            <main className="mx-auto min-h-[70vh] max-w-6xl px-4 pb-32 pt-6 md:pb-24">{children}</main>
            <SiteFooter />
            <BottomNav />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
