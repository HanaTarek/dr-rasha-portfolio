export default function Loading() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8" aria-busy="true">
      <span role="status" className="sr-only">
        جارٍ التحميل…
      </span>
      <div
        aria-hidden="true"
        className="grid animate-pulse items-start gap-5 motion-reduce:animate-none lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7"
      >
        {/* side menu */}
        <div className="rounded-xl border border-line bg-surface p-3.5 lg:p-4">
          <div className="mb-3.5 hidden h-7 w-40 rounded-md bg-line/60 lg:block" />
          <div className="h-6 w-40 rounded-md bg-line/60 lg:hidden" />
          <div className="mt-3 hidden gap-2 lg:grid">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-lg border border-line bg-bg" />
            ))}
          </div>
        </div>

        {/* content */}
        <div className="min-w-0">
          <div className="mb-4 h-5 w-36 rounded bg-line/60" />
          <div className="mb-3 h-8 w-44 rounded-full border border-line bg-surface" />
          <div className="mb-2 h-9 w-3/4 rounded-md bg-line/60" />
          <div className="mb-5 h-1 w-12 rounded-sm bg-gold/60" />
          <div className="mb-5 flex flex-wrap gap-7">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-24 rounded bg-line/60" />
            ))}
          </div>
          <div className="mb-10 h-11 w-36 rounded-full bg-line/60" />
          <div className="rounded-xl border border-dashed border-line p-3 sm:p-4">
            <div className="mx-auto aspect-[4/3] w-full rounded-md border border-line bg-surface" />
          </div>
        </div>
      </div>
    </main>
  );
}
