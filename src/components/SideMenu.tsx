"use client";

import Link from "next/link";

export type SideMenuItem = {
  id: string;
  label: string;
  href: string;
};

type Props = {
  items: SideMenuItem[];
  /** index of the active item */
  current: number;
  /** heading shown on desktop */
  title: string;
  /** text of the mobile toggle button */
  toggleLabel: string;
  /** aria-label of the <nav> */
  navLabel: string;
  open: boolean;
  onToggle: () => void;
  /** called when an item is clicked (e.g. to scroll the content into view on mobile) */
  onItemClick?: (index: number) => void;
  /** true when items are real pages (uses next/link); false/omitted for #hash links */
  internal?: boolean;
};

export default function SideMenu({
  items,
  current,
  title,
  toggleLabel,
  navLabel,
  open,
  onToggle,
  onItemClick,
  internal = false,
}: Props) {
  return (
    <aside className="rounded-xl border border-line bg-surface p-3.5 lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-110px)] lg:flex-col lg:overflow-hidden lg:p-4">
      {" "}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="side-menu-list"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 text-[17px] font-extrabold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden"
      >
        <span>{toggleLabel}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <h2 className="mb-3.5 hidden shrink-0 text-[22px] font-extrabold text-ink lg:block">
        {title}
      </h2>
      <nav
        aria-label={navLabel}
        className="max-h-[60vh] overflow-y-auto lg:max-h-none lg:min-h-0 lg:flex-1 lg:-m-1 lg:p-1"
      >
        <ol
          id="side-menu-list"
          className={`mt-3 gap-2 lg:mt-0 lg:grid ${open ? "grid" : "hidden"}`}
        >
          {items.map((item, i) => {
            const active = i === current;
            const linkProps = {
              href: item.href,
              "aria-current": active
                ? internal
                  ? ("page" as const)
                  : ("true" as const)
                : undefined,
              onClick: () => onItemClick?.(i),
              className: `flex items-start gap-2.5 rounded-lg border bg-bg px-3 py-2.5 text-base leading-relaxed no-underline hover:border-teal focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                active
                  ? "border-line font-extrabold text-teal"
                  : "border-line font-semibold text-ink"
              }`,
            };
            const content = (
              <>
                <span className="mt-0.5 grid h-[26px] min-w-[26px] shrink-0 place-items-center rounded-full border border-line bg-surface text-[13px] font-extrabold text-teal">
                  {i + 1}
                </span>
                <span
                  className={
                    active
                      ? "underline decoration-2 underline-offset-[6px]"
                      : ""
                  }
                >
                  {item.label}
                </span>
              </>
            );
            return (
              <li key={item.id}>
                {internal ? (
                  <Link {...linkProps}>{content}</Link>
                ) : (
                  <a {...linkProps}>{content}</a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
