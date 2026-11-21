export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="h-8 w-48 animate-pulse rounded bg-surface-mid" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl border border-line bg-surface" />
      ))}
    </div>
  );
}
