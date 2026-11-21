import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-primary">صدى</p>
          <p className="mt-2 text-ink-muted">منصة مجانية للقرآن والتدبر والاستماع. لا اشتراكات ولا حواجز.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/quran" className="hover:text-primary">القرآن الكريم</Link>
          <Link href="/audio" className="hover:text-primary">الاستماع</Link>
          <Link href="/tafsir" className="hover:text-primary">التفسير وعلوم القرآن</Link>
        </div>
        <div className="flex flex-col gap-2 text-ink-muted">
          <p>نص القرآن الكريم:</p>
          <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            Tanzil Project — tanzil.net
          </a>
          <p className="text-xs">تُعرض بيانات التفسير والصوت مع اسم مصدرها؛ يُرجى التحقق من التراخيص قبل النشر.</p>
        </div>
      </div>
    </footer>
  );
}
