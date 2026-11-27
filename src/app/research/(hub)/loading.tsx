import ResearchHubHeader from "@/components/research/ResearchHubHeader";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8" aria-busy="true">
      <span role="status" className="sr-only">
        جارٍ التحميل…
      </span>
      <ResearchHubHeader />

      <div
        aria-hidden="true"
        className="mx-auto grid max-w-[920px] animate-pulse gap-6 motion-reduce:animate-none md:grid-cols-2"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="aspect-[9/5] w-full border-b border-line bg-bg" />
            <div className="p-5 sm:p-6">
              <div className="flex h-[36px] items-center">
                <div className="h-6 w-3/4 rounded-md bg-line/60" />
              </div>
              <div className="mt-1.5 space-y-2.5 py-1.5">
                <div className="h-4 w-full rounded bg-line/60" />
                <div className="h-4 w-2/3 rounded bg-line/60" />
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <div className="h-5 w-24 rounded bg-line/60" />
                <div className="h-11 w-32 rounded-full bg-line/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
