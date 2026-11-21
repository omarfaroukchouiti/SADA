import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-8 text-center">
      <h1 className="font-display text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="mt-2 text-sm text-ink-muted">تأكد من رقم السورة أو الآية، أو ارجع إلى فهرس السور.</p>
      <Link href="/quran" className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary">فهرس السور</Link>
    </div>
  );
}
