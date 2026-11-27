export default function Loading() {
  return (
    <main
      className="mx-auto w-[940px] max-w-full px-5 pb-14 pt-8"
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        جارٍ تحميل الرسائل…
      </span>

      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        {/* back link */}
        <div className="mb-4 flex h-[22px] items-center">
          <div className="h-4 w-52 rounded bg-line/60" />
        </div>

        {/* header */}
        <header className="mb-6 max-w-3xl">
          <div className="mb-2.5">
            <div className="flex h-[34px] items-center sm:h-[51px]">
              <div className="h-7 w-2/3 rounded-md bg-line/60 sm:h-9" />
            </div>
            <div className="mt-1.5 h-1 w-12 rounded-sm bg-gold/60" />
          </div>
          <div className="flex h-8 items-center">
            <div className="h-4 w-full rounded bg-line/60" />
          </div>
          <div className="flex h-8 items-center">
            <div className="h-4 w-3/4 rounded bg-line/60" />
          </div>
        </header>

        {/* filter tabs */}
        <div className="mb-5 flex gap-1.5 rounded-2xl border border-line bg-surface p-1.5 sm:inline-flex">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-12 flex-1 rounded-xl bg-bg sm:w-28 sm:flex-none"
            />
          ))}
        </div>
        {/* list */}
        <div className="w-[900px] ">
          <div className="mb-3 flex h-6 items-center">
            <div className="h-4 w-24 rounded bg-line/60" />
          </div>
          <ul className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <div className="flex items-start gap-3.5 rounded-xl border border-line bg-surface p-4">
                  <div className="h-11 w-11 shrink-0 rounded-full border border-line bg-bg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex h-6 items-center">
                      <div className="h-5 w-4/5 rounded bg-line/60" />
                    </div>
                    <div className="mt-1.5 flex gap-5">
                      <div className="h-4 w-28 rounded bg-line/60" />
                      <div className="h-4 w-12 rounded bg-line/60" />
                      <div className="h-4 w-20 rounded bg-line/60" />
                    </div>
                  </div>
                  <div className="mt-1.5 h-8 w-8 shrink-0 rounded-full border border-line bg-bg" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
