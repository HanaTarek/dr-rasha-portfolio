import SideMenuSkeleton from "@/components/SideMenuSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8" aria-busy="true">
      <span role="status" className="sr-only">
        جارٍ التحميل…
      </span>
      <div className="grid items-start gap-5 animate-pulse motion-reduce:animate-none lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
        <SideMenuSkeleton />
        <div className="min-w-0">
          <div className="mb-4 h-4 w-40 rounded bg-line/60" />
          <div className="mb-6 aspect-[3/2] w-full max-w-[860px] rounded-md border border-line bg-surface" />
          <div className="mb-3 h-9 w-2/3 rounded-md bg-line/60" />
          <div className="mb-4 h-5 w-1/2 rounded bg-line/60" />
          <div className="mb-5 flex gap-7">
            <div className="h-10 w-24 rounded bg-line/60" />
            <div className="h-10 w-24 rounded bg-line/60" />
            <div className="h-10 w-24 rounded bg-line/60" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-32 rounded-full bg-line/60" />
            <div className="h-11 w-48 rounded-full bg-line/60" />
          </div>
        </div>
      </div>
    </main>
  );
}
