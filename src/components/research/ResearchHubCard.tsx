import Link from "next/link";
import type { ReactNode } from "react";
import { countLabel } from "@/lib/research";

type Props = {
  href: string;
  title: string;
  description: string;
  count: number;
  art: ReactNode;
};

/*
 * Hub card. Deliberately different from BookCard: a wide illustration panel on top, a count
 * and ONE clear button at the bottom. The button is a "stretched link" so the whole card is
 * clickable but there is only one tab stop for keyboard and screen-reader users.
 */
export default function ResearchHubCard({
  href,
  title,
  description,
  count,
  art,
}: Props) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-teal motion-reduce:transition-none has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold">
      <div className="aspect-[9/5] w-full border-b border-line bg-bg">{art}</div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="text-[22px] font-extrabold leading-relaxed text-ink">
          {title}
        </h2>
        <p className="mt-1.5 flex-1 leading-loose text-muted">{description}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-[15px] font-bold text-muted">
            {countLabel(count)}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-[15px] font-bold text-white no-underline outline-none after:absolute after:inset-0 after:content-['']"
          >
            عرض الكل
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform motion-reduce:transition-none ltr:rotate-180 rtl:group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
