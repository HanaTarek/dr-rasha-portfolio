import Link from "next/link";
import type { BookListItem } from "@/lib/books";
import BookCover from "./BookCover";

export default function BookCard({ book }: { book: BookListItem }) {
  const lead = book.authors?.[0];
  const hasMore = (book.authors?.length ?? 0) > 1;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex h-full flex-col rounded-xl border border-line bg-surface p-3.5 no-underline transition-colors hover:border-teal motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <BookCover
        image={book.cover}
        title={book.title}
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw"
      />

      <div className="flex-1">
        <h2 className="mt-3.5 text-[18px] font-extrabold leading-relaxed text-ink">
          {book.title}
        </h2>
        {lead && (
          <p className="mt-1 text-[14px] leading-relaxed text-muted">
            {lead}
            {hasMore && " وآخرون"}
          </p>
        )}
      </div>

      <span className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3 text-[15px] font-bold text-teal">
        <span>تفاصيل الكتاب</span>
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-full border border-line bg-bg transition-colors group-hover:bg-teal group-hover:text-white motion-reduce:transition-none"
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
            className="transition-transform motion-reduce:transition-none ltr:rotate-180 rtl:group-hover:-translate-x-0.5"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
