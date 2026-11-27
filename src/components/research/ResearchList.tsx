"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import KindIcon from "./KindIcon";
import {
  DEGREE_LABEL,
  KIND_META,
  countLabel,
  normalizeAr,
  type ResearchListItem,
} from "@/lib/research";

const PAGE = 20; // rows rendered per chunk, so a long list never blocks the page
const SEARCH_FROM = 6; // a search box only helps once the list is long enough

export default function ResearchList({
  items,
  showKind,
}: {
  items: ResearchListItem[];
  /** show the "إشراف / مناقشة" badge on each row (only needed in the "all" view) */
  showKind: boolean;
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const deferred = useDeferredValue(query); // typing stays instant, filtering follows

  const index = useMemo(
    () =>
      items.map((item) => ({
        item,
        text: normalizeAr(
          [item.title, item.researcher, ...(item.keywords ?? [])]
            .filter(Boolean)
            .join(" "),
        ),
      })),
    [items],
  );

  const matches = useMemo(() => {
    const terms = normalizeAr(deferred).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return items;
    return index
      .filter((e) => terms.every((t) => e.text.includes(t)))
      .map((e) => e.item);
  }, [deferred, index, items]);

  const searching = deferred.trim() !== "";
  const visible = matches.slice(0, limit);
  const remaining = matches.length - visible.length;

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-s-4 border-line border-s-teal bg-surface p-5 text-muted">
        لا توجد رسائل بعد.
      </p>
    );
  }

  return (
    <section aria-label="قائمة الرسائل">
      {items.length >= SEARCH_FROM && (
        <div className="relative mb-3">
          <label htmlFor="research-search" className="sr-only">
            ابحث في الرسائل بالعنوان أو اسم الباحث
          </label>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="research-search"
            type="search"
            value={query}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="ابحث بعنوان الرسالة أو اسم الباحث…"
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            className="w-full rounded-xl border border-line bg-surface py-3 pe-4 ps-12 text-base text-ink placeholder:text-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
        </div>
      )}

      {/* always rendered, so the list below never jumps when a search starts */}
      <p
        role="status"
        aria-live="polite"
        className="mb-3 min-h-6 text-[14px] font-bold text-muted"
      >
        {searching ? `${matches.length} من ${items.length}` : countLabel(items.length)}
      </p>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-s-4 border-line border-s-gold bg-surface p-5 text-muted">
          <b className="text-ink">لا توجد رسائل مطابقة للبحث.</b>
          <br />
          جرّب كلمة أخرى، أو{" "}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLimit(PAGE);
            }}
            className="font-bold text-teal underline"
          >
            امسح البحث
          </button>
          .
        </div>
      ) : (
        <ul className="grid gap-3">
          {visible.map((item) => (
            <li key={item._id}>
              <Link
                href={`/research/${item.kind}/${item.slug}`}
                className="group flex items-start gap-3.5 rounded-xl border border-line bg-surface p-4 no-underline transition-colors hover:border-teal motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-bg text-teal"
                >
                  <KindIcon kind={item.kind} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-extrabold leading-relaxed text-ink">
                    {item.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[14px] leading-relaxed text-muted">
                    {showKind && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-2.5 py-0.5 text-[13px] font-bold text-ink">
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 rounded-full ${item.kind === "supervised" ? "bg-teal" : "bg-gold"}`}
                        />
                        {KIND_META[item.kind].label}
                      </span>
                    )}
                    {item.researcher && <span>{item.researcher}</span>}
                    {item.degree && <span>{DEGREE_LABEL[item.degree]}</span>}
                    {item.year && <span>{item.year}</span>}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-bg text-teal transition-colors group-hover:bg-teal group-hover:text-white motion-reduce:transition-none"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ltr:rotate-180"
                  >
                    <path d="M19 12H5M11 6l-6 6 6 6" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="inline-flex items-center rounded-full border border-teal px-6 py-2.5 text-[15px] font-bold text-teal hover:bg-teal hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            عرض المزيد ({remaining} متبقية)
          </button>
        </div>
      )}
    </section>
  );
}
