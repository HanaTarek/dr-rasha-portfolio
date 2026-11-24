import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { VisualEditing } from "next-sanity/visual-editing";
import PdfPages from "@/components/articles/PdfPages";
import BookCover from "@/components/books/BookCover";
import BooksSideMenu from "@/components/books/BooksSideMenu";
import PublisherCard from "@/components/books/PublisherCard";
import { sanityFetch, SanityLive } from "@/lib/live";
import {
  BOOK_PAGE_QUERY,
  BOOK_TITLE_QUERY,
  clean,
  cleanPublisher,
  type BookDetails,
  type BookMenuItem,
} from "@/lib/books";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: BOOK_TITLE_QUERY,
    params: { slug },
  });
  const title = (data as { title?: string } | null)?.title;
  return {
    title: title
      ? `${stegaClean(title)} | أ.د. رشا محمد أشرف`
      : "الكتب | أ.د. رشا محمد أشرف",
  };
}

const h2 = "mb-3 text-[22px] font-extrabold text-ink";
const btn =
  "inline-flex items-center rounded-full px-5 py-2.5 text-[15px] font-bold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: BOOK_PAGE_QUERY,
    params: { slug },
  });
  const { isEnabled: isDraftMode } = await draftMode();

  const { book, all } = (data ?? {}) as {
    book?: BookDetails | null;
    all?: BookMenuItem[];
  };
  if (!book) notFound();

  const menu = (all ?? []).map((b) => ({ ...b, slug: stegaClean(b.slug) }));
  const summaryPdfUrl = clean(book.summaryPdfUrl);
  const publisher = cleanPublisher(book.publisher);
  const chapters = book.chapters ?? [];

  const meta = [
    publisher && { label: "الناشر", value: publisher.name },
    book.edition && { label: "الطبعة", value: book.edition },
    book.year && { label: "سنة النشر", value: book.year },
    book.totalPages && {
      label: "عدد صفحات الكتاب",
      value: String(book.totalPages),
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8">
        <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
          <BooksSideMenu books={menu} currentSlug={stegaClean(book.slug)} />

          <article className="min-w-0">
            <p className="mb-4 text-[15px]">
              <Link href="/books" className="font-bold text-teal">
                العودة إلى كل الكتب
              </Link>
            </p>

            {/* Hero: wide image with the front and back of the book */}
            <header>
              <BookCover
                image={book.cover}
                title={book.title}
                sizes="(min-width: 1024px) 860px, 92vw"
                priority
                className="mb-6 max-w-[860px]"
              />

              <h1 className="mb-3 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
                {book.title}
              </h1>

              {book.authors && book.authors.length > 0 && (
                <p className="mb-4 max-w-3xl leading-loose text-ink">
                  <span className="text-muted">تأليف: </span>
                  <span className="font-semibold">
                    {book.authors.join("، ")}
                  </span>
                </p>
              )}

              {meta.length > 0 && (
                <dl className="mb-5 flex flex-wrap gap-x-7 gap-y-2 text-[15px]">
                  {meta.map((m) => (
                    <div key={m.label}>
                      <dt className="text-muted">{m.label}</dt>
                      <dd className="font-bold text-ink">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="flex flex-wrap gap-3">
                {summaryPdfUrl && (
                  <a href="#summary" className={`${btn} bg-teal text-white`}>
                    اقرأ الملخص
                  </a>
                )}
                {publisher && (
                  <a
                    href="#full-book"
                    className={`${btn} border border-teal text-teal`}
                  >
                    كيف أحصل على الكتاب كاملًا؟
                  </a>
                )}
              </div>
            </header>

            {/* About */}
            {book.description && (
              <section aria-labelledby="about-title" className="mt-10">
                <h2 id="about-title" className={h2}>
                  عن الكتاب
                </h2>
                <p className="max-w-3xl whitespace-pre-line text-[17px] leading-loose text-ink">
                  {book.description}
                </p>
              </section>
            )}

            {/* Chapters */}
            {chapters.length > 0 && (
              <section aria-labelledby="chapters-title" className="mt-10">
                <h2 id="chapters-title" className={h2}>
                  محتويات الكتاب
                </h2>
                <ol className="grid gap-2 sm:grid-cols-2">
                  {chapters.map((c, i) => (
                    <li
                      key={`${i}-${c}`}
                      className="flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 leading-relaxed text-ink"
                    >
                      <span className="mt-0.5 grid h-[26px] min-w-[26px] shrink-0 place-items-center rounded-full border border-line bg-bg text-[13px] font-extrabold text-teal">
                        {i + 1}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Summary: clearly framed as an excerpt */}
            {summaryPdfUrl && (
              <section
                id="summary"
                aria-labelledby="summary-title"
                className="mt-10 scroll-mt-24"
              >
                <h2 id="summary-title" className={h2}>
                  ملخص الكتاب
                </h2>

                <div
                  role="note"
                  className="mb-4 flex gap-3 rounded-lg border border-s-4 border-line border-s-gold bg-surface p-4"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-gold"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p className="leading-loose text-muted">
                    <b className="text-ink">هذا ملخص وليس الكتاب كاملًا.</b>{" "}
                    {book.totalPages
                      ? `يضم الكتاب ${book.totalPages} صفحة، وما تراه هنا مقتطفات تعريفية منه. `
                      : "ما تراه هنا مقتطفات تعريفية منه. "}
                    {publisher && (
                      <a href="#full-book" className="font-bold text-teal">
                        للحصول على النسخة الكاملة من {publisher.name}
                      </a>
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-dashed border-line p-3 sm:p-4">
                  <PdfPages key={book._id} url={summaryPdfUrl} />
                  <p className="mt-1 text-center text-[15px] font-bold text-muted">
                    نهاية الملخص
                  </p>
                </div>
              </section>
            )}

            {/* Where to get the whole book */}
            {publisher && (
              <div className="mt-8">
                <PublisherCard publisher={publisher} />
              </div>
            )}
          </article>
        </div>
      </main>
      <SanityLive />
      {isDraftMode && <VisualEditing />}
    </>
  );
}
