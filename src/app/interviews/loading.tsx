export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-[1200px] px-5 pb-14 pt-8"
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        جارٍ تحميل اللقاءات…
      </span>

      {/* identical to the header in page.tsx */}
      <header className="mb-7 max-w-3xl">
        <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
          اللقاءات
        </h1>
        <p className="leading-loose text-muted">
          برامج وسلاسل لقاءات مرئية. اضغط على أي فيديو لمشاهدته مباشرة هنا في
          الصفحة.
        </p>
      </header>

      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        {/* program header: same spacing as <ProgramSection> header */}
        <div className="mb-6">
          {/* h2 = text-2xl (32px line box) */}
          <div className="flex h-8 items-center">
            <div className="h-6 w-48 rounded bg-line/60" />
          </div>
          {/* count = text-sm (20px line box) */}
          <div className="mt-1 flex h-5 items-center">
            <div className="h-3.5 w-20 rounded bg-line/60" />
          </div>
          {/* description = leading-8 (32px line box) */}
          <div className="mt-3 flex h-8 max-w-3xl items-center">
            <div className="h-4 w-full rounded bg-line/60" />
          </div>
        </div>

        {/* two episode rows: same grid as the "episodes" layout */}
        <ul className="space-y-8">
          {[0, 1].map((i) => (
            <li
              key={i}
              className="grid items-start gap-5 md:grid-cols-[3fr_2fr]"
            >
              {/* video frame: same as VideoEmbed */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-bg" />

              <div>
                {/* "الحلقة N" = text-sm */}
                <div className="flex h-5 items-center">
                  <div className="h-3.5 w-16 rounded bg-line/60" />
                </div>
                {/* h3 = text-xl (28px line box) */}
                <div className="mt-1 flex h-7 items-center">
                  <div className="h-5 w-4/5 rounded bg-line/60" />
                </div>
                {/* description lines = leading-8 */}
                <div className="mt-2 space-y-0">
                  <div className="flex h-8 items-center">
                    <div className="h-4 w-full rounded bg-line/60" />
                  </div>
                  <div className="flex h-8 items-center">
                    <div className="h-4 w-2/3 rounded bg-line/60" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
