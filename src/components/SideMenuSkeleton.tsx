export default function SideMenuSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-line bg-surface p-3.5 lg:p-4"
    >
      <div className="mb-3.5 hidden h-7 w-28 rounded-md bg-line/60 lg:block" />
      <div className="h-6 w-40 rounded-md bg-line/60 lg:hidden" />
      <div className="mt-3 hidden gap-2 lg:grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-12 rounded-lg border border-line bg-bg" />
        ))}
      </div>
    </div>
  );
}
