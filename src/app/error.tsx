'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-8 text-center">
      <h1 className="font-display text-2xl font-bold">حدث خطأ</h1>
      <p className="mt-2 text-sm text-ink-muted">تعذّر تحميل هذه الصفحة. لم نعرض أي محتوى بديل من عندنا حفاظًا على دقة المحتوى.</p>
      <button type="button" onClick={reset} className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary">إعادة المحاولة</button>
    </div>
  );
}
