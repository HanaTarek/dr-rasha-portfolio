import SideMenuSkeleton from "@/components/SideMenuSkeleton";

export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-[1200px] px-5 pb-14 pt-8"
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        جارٍ التحميل…
      </span>
      <div className="grid items-start gap-5 animate-pulse motion-reduce:animate-none lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
        <SideMenuSkeleton />
        <div className="min-h-[85svh] min-w-0">
          <div className="mb-3 h-9 w-3/4 rounded-md bg-line/60" />
          <div className="mb-6 h-1 w-12 rounded-sm bg-gold/60" />
          <div className="mb-5 h-4 w-56 rounded bg-line/60" />
          <div className="mx-auto aspect-[4/3] w-full rounded-md border border-line bg-surface" />
        </div>
      </div>
    </main>
  );
}
