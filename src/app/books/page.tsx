import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import BookCard from "@/components/books/BookCard";
import { sanityFetch } from "@/lib/live";
import { BOOKS_LIST_QUERY, type BookListItem } from "@/lib/books";

export const metadata: Metadata = {
  title: "الكتب | أ.د. رشا محمد أشرف",
};

export default async function BooksPage() {
  const { data } = await sanityFetch({ query: BOOKS_LIST_QUERY });

  const books = ((data ?? []) as unknown as BookListItem[]).map((b) => ({
    ...b,
    slug: stegaClean(b.slug),
  }));

  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8">
      <header className="mb-7 max-w-3xl">
        <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
          الكتب
        </h1>
        <p className="leading-loose text-muted">
          اختر كتابًا لتتعرّف على محتواه وتقرأ ملخصًا تعريفيًا منه. الملخص لا يغني
          عن الكتاب؛ وستجد في صفحة كل كتاب بيانات الناشر للحصول على النسخة
          الكاملة.
        </p>
      </header>

      {books.length === 0 ? (
        <p className="rounded-lg border border-s-4 border-line border-s-teal bg-surface p-5 text-muted">
          لا توجد كتب بعد.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <li key={book._id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
