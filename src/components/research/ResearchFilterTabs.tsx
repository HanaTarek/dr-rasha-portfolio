import Link from "next/link";
import {
  FILTERS,
  type ResearchFilter,
} from "@/lib/research";

/*
 * The filter is a real navigation (/research/all, /research/supervised, /research/discussed),
 * so every state has its own shareable URL and works without JavaScript. The active tab is
 * a filled teal pill, so the current filter is obvious at a glance.
 */
export default function ResearchFilterTabs({
  active,
  counts,
}: {
  active: ResearchFilter;
  counts: Record<ResearchFilter, number>;
}) {
  return (
    <nav aria-label="تصفية الرسائل حسب النوع" className="mb-5">
      <ul className="flex gap-1.5 rounded-2xl border border-line bg-surface p-1.5 sm:inline-flex">
        {FILTERS.map((f) => {
          const isActive = f.value === active;
          return (
            <li key={f.value} className="flex-1 sm:flex-none">
              <Link
                href={`/research/${f.value}`}
                replace
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-bold no-underline transition-colors motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  isActive ? "bg-teal text-white" : "text-ink hover:bg-bg"
                }`}
              >
                {f.label}
                <span
                  className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[13px] font-extrabold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "border border-line bg-bg text-teal"
                  }`}
                >
                  {counts[f.value]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
